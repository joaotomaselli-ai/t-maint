import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ----------------------------------------------------------------------
// PUBLIC: sign in using either username or email + password.
// Resolves username -> email server-side WITHOUT leaking the email,
// then performs the password sign-in and returns the session tokens.
// ----------------------------------------------------------------------
export const signInWithUsernameOrEmail = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        identifier: z.string().trim().min(1).max(255),
        password: z.string().min(1).max(128),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let email = data.identifier;
    if (!email.includes("@")) {
      const { data: role, error } = await supabaseAdmin
        .from("user_roles")
        .select("user_id")
        .eq("username", email)
        .maybeSingle();
      if (error) throw new Error("Falha ao autenticar.");
      if (!role) throw new Error("Credenciais inválidas.");
      const { data: u, error: uerr } = await supabaseAdmin.auth.admin.getUserById(role.user_id);
      if (uerr || !u.user?.email) throw new Error("Credenciais inválidas.");
      email = u.user.email;
    }
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: signIn, error: signErr } = await client.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: data.password,
    });
    if (signErr || !signIn.session) throw new Error("Credenciais inválidas.");
    return {
      accessToken: signIn.session.access_token,
      refreshToken: signIn.session.refresh_token,
    };
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
    const { userId, claims } = context;
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id, username, allowed_features")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r) => r.role);
    // Server-side allowlist enforcement: any signed-in user without a role
    // must have an entry in allowed_emails, otherwise access is denied.
    if (roles.length === 0) {
      const email = (claims as any)?.email as string | undefined;
      if (!email) throw new Error("Acesso não autorizado.");
      const { data: allowed } = await supabaseAdmin
        .from("allowed_emails")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();
      if (!allowed) throw new Error("Acesso não autorizado.");
    }
    const isMaster = roles.includes("master");
    const isAdmin = roles.includes("admin");
    const companyId =
      data?.find((r) => r.role === "admin" && r.company_id)?.company_id ??
      data?.find((r) => r.company_id)?.company_id ??
      null;
    const allowedFeatures = (data?.[0]?.allowed_features as string[] | null) ?? null;
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
      allowedFeatures,
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
        subscriptionFee: z.number().min(0).optional(),
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
      .insert({ name: data.name, owner_user_id: adminUserId, subscription_fee: data.subscriptionFee ?? 0 })
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
      .select("id, name, owner_user_id, created_at, subscription_fee")
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
        subscriptionFee: c.subscription_fee,
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
        allowedFeatures: z.array(z.string()).nullable().optional(),
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
      .insert({
        user_id: newUserId,
        role: data.role,
        company_id: targetCompany,
        allowed_features: data.allowedFeatures ?? null,
      });
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
// ADMIN / MASTER: create a technician login
// ----------------------------------------------------------------------
export const createTechnicianLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().trim().email(),
        password: z.string().min(6).max(128),
        technicianId: z.string().uuid(),
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
      .insert({
        user_id: newUserId,
        role: "technician",
        company_id: targetCompany,
      });
    if (re && !re.message.includes("duplicate")) throw new Error(re.message);

    await supabaseAdmin.from("allowed_emails").upsert({
      email,
      role: "technician",
      company_id: targetCompany,
      invited_by: userId,
    }, { onConflict: "email" });

    const { error: te } = await supabaseAdmin
      .from("technicians")
      .update({ user_id: newUserId, has_login: true })
      .eq("id", data.technicianId);
    if (te) throw new Error(te.message);

    return { userId: newUserId };
  });


// ----------------------------------------------------------------------
// ADMIN / MASTER: update a sub-user (email, password, role, features)
// ----------------------------------------------------------------------
export const updateSubUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        targetUserId: z.string().uuid(),
        companyId: z.string().uuid().optional(),
        email: z.string().trim().email().optional(),
        password: z.string().min(6).max(128).optional(),
        role: z.enum(["admin", "user"]).optional(),
        allowedFeatures: z.array(z.string()).nullable().optional(),
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
    if (!isMaster && !adminEntry) throw new Error("Sem permissão.");

    // discover the company of the target if not provided
    let targetCompany = data.companyId ?? null;
    if (!targetCompany) {
      const { data: tr } = await supabaseAdmin
        .from("user_roles")
        .select("company_id")
        .eq("user_id", data.targetUserId)
        .maybeSingle();
      targetCompany = tr?.company_id ?? adminEntry?.company_id ?? null;
    }
    if (!isMaster && targetCompany !== adminEntry?.company_id) {
      throw new Error("Sem permissão para editar este usuário.");
    }
    if (!targetCompany) throw new Error("Empresa não definida.");

    if (data.email || data.password) {
      const upd: any = {};
      if (data.email) upd.email = data.email.toLowerCase();
      if (data.password) upd.password = data.password;
      const { error: ue } = await supabaseAdmin.auth.admin.updateUserById(data.targetUserId, upd);
      if (ue) throw new Error(ue.message);
    }

    const patch: any = {};
    if (data.role) patch.role = data.role;
    if (data.allowedFeatures !== undefined) patch.allowed_features = data.allowedFeatures;
    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .update(patch)
        .eq("user_id", data.targetUserId)
        .eq("company_id", targetCompany);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
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
      .select("id, user_id, role, allowed_features, created_at")
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
        lastSignInAt: u.user?.last_sign_in_at ?? null,
        createdAt: m.created_at,
        allowedFeatures: (m.allowed_features as string[] | null) ?? null,
      });
    }
    return { users: out };
  });

// ----------------------------------------------------------------------
// MASTER: list ALL users across all companies (grouped)
// ----------------------------------------------------------------------
export const listAllUsersGrouped = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: master } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "master")
      .maybeSingle();
    if (!master) throw new Error("Apenas o master pode listar todos os usuários.");

    const { data: companies } = await supabaseAdmin
      .from("companies")
      .select("id, name, owner_user_id, created_at, subscription_fee")
      .order("created_at", { ascending: false });

    const { data: allRoles } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, role, company_id, allowed_features, created_at");

    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const userMap = new Map(list.data?.users.map((u) => [u.id, u]) ?? []);

    const groups = (companies ?? []).map((c) => {
      const members = (allRoles ?? [])
        .filter((r) => r.company_id === c.id)
        .map((r) => {
          const u = userMap.get(r.user_id);
          return {
            id: r.id,
            userId: r.user_id,
            role: r.role,
            email: u?.email ?? "",
            lastSignInAt: u?.last_sign_in_at ?? null,
            createdAt: r.created_at,
            allowedFeatures: (r.allowed_features as string[] | null) ?? null,
          };
        });
      const owner = userMap.get(c.owner_user_id);
      return {
        id: c.id,
        name: c.name,
        ownerEmail: userMap.get(c.owner_user_id)?.email ?? "Desconhecido",
        createdAt: c.created_at,
        subscriptionFee: c.subscription_fee,
        members,
      };
    });

    return { groups };
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

    let filter = supabaseAdmin.from("allowed_emails").delete().eq("id", data.id);
    if (!isMaster && adminEntry?.company_id) {
      filter = filter.eq("company_id", adminEntry.company_id);
    }
    const { error } = await filter;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----------------------------------------------------------------------
// MASTER: register admin payment
// ----------------------------------------------------------------------
export const registerAdminPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        companyId: z.string().uuid(),
        amount: z.number().min(0),
        referenceMonth: z.string().regex(/^\d{4}-\d{2}$/),
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
    if (!master) throw new Error("Apenas o master pode registrar pagamentos.");

    const { error } = await supabaseAdmin
      .from("admin_payments")
      .insert({
        company_id: data.companyId,
        amount: data.amount,
        reference_month: data.referenceMonth,
        paid_at: new Date().toISOString()
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----------------------------------------------------------------------
// MASTER: list admin payments
// ----------------------------------------------------------------------
export const listAdminPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: master } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "master")
      .maybeSingle();
    if (!master) throw new Error("Apenas o master pode listar pagamentos.");

    const { data: payments, error } = await supabaseAdmin
      .from("admin_payments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { payments };
  });

