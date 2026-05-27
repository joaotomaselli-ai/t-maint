import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ----------------------------------------------------------------------
// PUBLIC: resolve username -> email (used by login form)
// ----------------------------------------------------------------------
export const resolveUsernameToEmail = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ username: z.string().trim().min(1).max(64) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: role, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("username", data.username)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!role) return { email: null as string | null };
    const { data: u, error: uerr } = await supabaseAdmin.auth.admin.getUserById(role.user_id);
    if (uerr) throw new Error(uerr.message);
    return { email: u.user?.email ?? null };
  });

// ----------------------------------------------------------------------
// PUBLIC: check if an email is allowed to log in
// ----------------------------------------------------------------------
export const isEmailAllowed = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().trim().email() }).parse(d))
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const [allowed, existing] = await Promise.all([
      supabaseAdmin.from("allowed_emails").select("id").eq("email", email).maybeSingle(),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    if (allowed.data) return { allowed: true };
    if (existing.error) return { allowed: false };
    // If user already has a role assigned, allow (e.g. master created directly)
    const u = existing.data.users.find((x) => x.email?.toLowerCase() === email);
    if (!u) return { allowed: false };
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", u.id)
      .limit(1);
    return { allowed: !!(roles && roles.length > 0) };
  });

// ----------------------------------------------------------------------
// AUTHENTICATED: who am I? (role + company)
// ----------------------------------------------------------------------
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id, username")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r) => r.role);
    const isMaster = roles.includes("master");
    const isAdmin = roles.includes("admin");
    const companyId =
      data?.find((r) => r.role === "admin" && r.company_id)?.company_id ??
      data?.find((r) => r.company_id)?.company_id ??
      null;
    let companyName: string | null = null;
    if (companyId) {
      const { data: c } = await supabaseAdmin
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .maybeSingle();
      companyName = c?.name ?? null;
    }
    return {
      userId,
      isMaster,
      isAdmin,
      role: isMaster ? "master" : isAdmin ? "admin" : roles[0] ?? "user",
      companyId,
      companyName,
    };
  });

// ----------------------------------------------------------------------
// MASTER: create a company + initial admin user
// ----------------------------------------------------------------------
export const createCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        adminEmail: z.string().trim().email(),
        adminPassword: z.string().min(6).max(128),
        adminName: z.string().trim().max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: master } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "master")
      .maybeSingle();
    if (!master) throw new Error("Apenas o master pode criar empresas.");

    const adminEmail = data.adminEmail.toLowerCase();

    // Create the user (or find existing)
    let adminUserId: string;
    const created = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: data.adminPassword,
      email_confirm: true,
      user_metadata: {
        company_name: data.name,
        technician_name: data.adminName ?? "",
      },
    });
    if (created.error) {
      // try to find an existing user with this email
      const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list.data?.users.find((u) => u.email?.toLowerCase() === adminEmail);
      if (!found) throw new Error(created.error.message);
      adminUserId = found.id;
      await supabaseAdmin.auth.admin.updateUserById(found.id, { password: data.adminPassword });
    } else {
      adminUserId = created.data.user!.id;
    }

    const { data: company, error: ce } = await supabaseAdmin
      .from("companies")
      .insert({ name: data.name, owner_user_id: adminUserId })
      .select()
      .single();
    if (ce) throw new Error(ce.message);

    const { error: re } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: adminUserId, role: "admin", company_id: company.id });
    if (re) throw new Error(re.message);

    await supabaseAdmin.from("allowed_emails").upsert({
      email: adminEmail,
      role: "admin",
      company_id: company.id,
      invited_by: userId,
    }, { onConflict: "email" });

    return { companyId: company.id };
  });

// ----------------------------------------------------------------------
// MASTER: list all companies
// ----------------------------------------------------------------------
export const listCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: master } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "master")
      .maybeSingle();
    if (!master) throw new Error("Apenas o master pode listar empresas.");

    const { data: companies, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, owner_user_id, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const result = [];
    for (const c of companies ?? []) {
      const { data: owner } = await supabaseAdmin.auth.admin.getUserById(c.owner_user_id);
      const { count: usersCount } = await supabaseAdmin
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("company_id", c.id);
      result.push({
        id: c.id,
        name: c.name,
        ownerEmail: owner.user?.email ?? "",
        usersCount: usersCount ?? 0,
        createdAt: c.created_at,
      });
    }
    return { companies: result };
  });

// ----------------------------------------------------------------------
// MASTER: delete a company (and its users / data via cascade where set)
// ----------------------------------------------------------------------
export const deleteCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ companyId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: master } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "master")
      .maybeSingle();
    if (!master) throw new Error("Apenas o master pode excluir empresas.");

    // delete all data tied to this company first
    const tables = [
      "client_payments",
      "technician_payments",
      "activity_attachments",
      "activity_technicians",
      "service_sessions",
      "service_reports",
      "clients",
      "technicians",
      "allowed_emails",
      "user_roles",
    ] as const;
    for (const t of tables) {
      await supabaseAdmin.from(t).delete().eq("company_id", data.companyId);
    }
    const { error } = await supabaseAdmin.from("companies").delete().eq("id", data.companyId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----------------------------------------------------------------------
// ADMIN / MASTER: create a sub-user inside a company
// ----------------------------------------------------------------------
export const createSubUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().trim().email(),
        password: z.string().min(6).max(128),
        role: z.enum(["admin", "user"]).default("user"),
        companyId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id")
      .eq("user_id", userId);
    const isMaster = roles?.some((r) => r.role === "master");
    const adminEntry = roles?.find((r) => r.role === "admin");
    const targetCompany = data.companyId ?? adminEntry?.company_id ?? null;
    if (!isMaster && !adminEntry) throw new Error("Sem permissão.");
    if (!targetCompany) throw new Error("Empresa não definida.");

    const email = data.email.toLowerCase();
    let newUserId: string;
    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });
    if (created.error) {
      const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list.data?.users.find((u) => u.email?.toLowerCase() === email);
      if (!found) throw new Error(created.error.message);
      newUserId = found.id;
      await supabaseAdmin.auth.admin.updateUserById(found.id, { password: data.password });
    } else {
      newUserId = created.data.user!.id;
    }

    const { error: re } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUserId, role: data.role, company_id: targetCompany });
    if (re && !re.message.includes("duplicate")) throw new Error(re.message);

    await supabaseAdmin.from("allowed_emails").upsert({
      email,
      role: data.role,
      company_id: targetCompany,
      invited_by: userId,
    }, { onConflict: "email" });

    return { userId: newUserId };
  });

// ----------------------------------------------------------------------
// ADMIN / MASTER: list users in a company
// ----------------------------------------------------------------------
export const listCompanyUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ companyId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id")
      .eq("user_id", userId);
    const isMaster = roles?.some((r) => r.role === "master");
    const adminEntry = roles?.find((r) => r.role === "admin");
    const targetCompany = data.companyId ?? adminEntry?.company_id ?? null;
    if (!isMaster && !adminEntry) throw new Error("Sem permissão.");
    if (!targetCompany) return { users: [] };

    const { data: members, error } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, role")
      .eq("company_id", targetCompany);
    if (error) throw new Error(error.message);

    const out = [];
    for (const m of members ?? []) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(m.user_id);
      out.push({
        id: m.id,
        userId: m.user_id,
        role: m.role,
        email: u.user?.email ?? "",
      });
    }
    return { users: out };
  });

// ----------------------------------------------------------------------
// ADMIN / MASTER: remove a user from a company (and delete account)
// ----------------------------------------------------------------------
export const removeCompanyUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        targetUserId: z.string().uuid(),
        companyId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (data.targetUserId === userId) throw new Error("Não é possível remover sua própria conta.");
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id")
      .eq("user_id", userId);
    const isMaster = roles?.some((r) => r.role === "master");
    const adminEntry = roles?.find((r) => r.role === "admin");
    const targetCompany = data.companyId ?? adminEntry?.company_id ?? null;
    if (!isMaster && !adminEntry) throw new Error("Sem permissão.");
    if (!targetCompany) throw new Error("Empresa não definida.");

    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.targetUserId)
      .eq("company_id", targetCompany);

    // remove from allowed_emails for this company
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(data.targetUserId);
    if (u.user?.email) {
      await supabaseAdmin
        .from("allowed_emails")
        .delete()
        .eq("email", u.user.email.toLowerCase())
        .eq("company_id", targetCompany);
    }

    // Only delete the account if they have no other roles left
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("user_id", data.targetUserId);
    if ((count ?? 0) === 0) {
      await supabaseAdmin.auth.admin.deleteUser(data.targetUserId);
    }
    return { ok: true };
  });

// ----------------------------------------------------------------------
// ADMIN / MASTER: authorize an email for Google login
// ----------------------------------------------------------------------
export const authorizeEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().trim().email(),
        role: z.enum(["admin", "user"]).default("user"),
        companyId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id")
      .eq("user_id", userId);
    const isMaster = roles?.some((r) => r.role === "master");
    const adminEntry = roles?.find((r) => r.role === "admin");
    const targetCompany = data.companyId ?? adminEntry?.company_id ?? null;
    if (!isMaster && !adminEntry) throw new Error("Sem permissão.");
    if (!targetCompany) throw new Error("Empresa não definida.");

    const email = data.email.toLowerCase();
    const { error } = await supabaseAdmin.from("allowed_emails").upsert(
      { email, role: data.role, company_id: targetCompany, invited_by: userId },
      { onConflict: "email" },
    );
    if (error) throw new Error(error.message);

    // If the user already exists, attach them to the company now
    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list.data?.users.find((u) => u.email?.toLowerCase() === email);
    if (existing) {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: existing.id, role: data.role, company_id: targetCompany },
        { onConflict: "user_id,role" },
      );
    }
    return { ok: true };
  });

// ----------------------------------------------------------------------
// ADMIN / MASTER: list authorized emails for a company
// ----------------------------------------------------------------------
export const listAuthorizedEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ companyId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id")
      .eq("user_id", userId);
    const isMaster = roles?.some((r) => r.role === "master");
    const adminEntry = roles?.find((r) => r.role === "admin");
    const targetCompany = data.companyId ?? adminEntry?.company_id ?? null;
    if (!isMaster && !adminEntry) return { emails: [] };
    if (!targetCompany) return { emails: [] };

    const { data: emails, error } = await supabaseAdmin
      .from("allowed_emails")
      .select("id, email, role, created_at")
      .eq("company_id", targetCompany)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { emails: emails ?? [] };
  });

// ----------------------------------------------------------------------
// ADMIN / MASTER: revoke an authorized email
// ----------------------------------------------------------------------
export const revokeAuthorizedEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id")
      .eq("user_id", userId);
    const isMaster = roles?.some((r) => r.role === "master");
    const adminEntry = roles?.find((r) => r.role === "admin");
    if (!isMaster && !adminEntry) throw new Error("Sem permissão.");

    const filter = supabaseAdmin.from("allowed_emails").delete().eq("id", data.id);
    if (!isMaster && adminEntry?.company_id) {
      filter.eq("company_id", adminEntry.company_id);
    }
    const { error } = await filter;
    if (error) throw new Error(error.message);
    return { ok: true };
  });
