import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function checkUserLimit(companyId: string) {
  const { data: company } = await supabaseAdmin.from("companies").select("plan_type").eq("id", companyId).single();
  if (!company) throw new Error("Empresa não encontrada.");
  
  if (company.plan_type === "elite_pro") return;

  const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("company_id", companyId);
  const currentCount = count ?? 0;
  
  let limit = 2; // basic
  if (company.plan_type === "pro") limit = 5;
  if (company.plan_type === "elite") limit = 15;

  if (currentCount >= limit) {
    const planName = company.plan_type === "basic" ? "Básico" : company.plan_type === "pro" ? "Pro" : "Elite";
    throw new Error(`Limite de usuários atingido para o plano ${planName} (máx ${limit} usuários). Mude de plano para adicionar mais acessos.`);
  }
}

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
    const clientRoleEntry = data?.find((r) => r.role === "user" && (r.allowed_features?.includes("client_portal") || r.allowed_features?.some((f: string) => f.startsWith("client_id:"))));
    const isClient = Boolean(clientRoleEntry) || roles.includes("client");
    let clientId: string | null = null;
    let clientName: string | null = null;

    if (isClient && clientRoleEntry) {
      const feature = clientRoleEntry.allowed_features?.find((f: string) => f.startsWith("client_id:"));
      clientId = feature ? feature.split(":")[1] : null;
      if (clientId) {
        const { data: cl } = await supabaseAdmin
          .from("clients")
          .select("id, name, company_id")
          .eq("id", clientId)
          .maybeSingle();
        if (cl) {
          clientName = cl.name;
        }
      }
    }

    const companyId =
      data?.find((r) => r.role === "admin" && r.company_id)?.company_id ??
      data?.find((r) => r.company_id)?.company_id ??
      null;
    const allowedFeatures = (data?.[0]?.allowed_features as string[] | null) ?? null;
    let companyName: string | null = null;
    let planType = "basic";
    let isBlocked = false;
    let blockedReason: string | null = null;
    let subscription: CompanySubscription | null = null;

    if (companyId) {
      const { data: c } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();
      companyName = c?.name ?? null;
      planType = c?.plan_type ?? "basic";

      if (!isMaster && c) {
        // Find admin role for this company to get subscription tags
        const { data: adminRole } = await supabaseAdmin
          .from("user_roles")
          .select("allowed_features")
          .eq("company_id", companyId)
          .eq("role", "admin")
          .maybeSingle();

        const { data: ownerProf } = await supabaseAdmin
          .from("profiles")
          .select("phone, email")
          .eq("id", c.owner_user_id)
          .maybeSingle();

        subscription = parseCompanySubscription(c, adminRole, ownerProf, null);
        if (subscription.isBlocked) {
          isBlocked = true;
          blockedReason = subscription.blockedReason || "Acesso temporariamente suspenso pela administração.";
        } else if (subscription.autoBlockOnExpire && subscription.daysRemaining < 0) {
          isBlocked = true;
          const dtParts = subscription.endDate.split("-");
          const fmtEnd = dtParts.length === 3 ? `${dtParts[2]}/${dtParts[1]}/${dtParts[0]}` : subscription.endDate;
          blockedReason = `Assinatura do sistema expirada em ${fmtEnd}. Entre em contato para regularizar o acesso.`;
        }
      }
    }

    return {
      userId,
      isMaster,
      isAdmin,
      isClient,
      clientId,
      clientName,
      role: isMaster ? "master" : isAdmin ? "admin" : isClient ? "client" : roles[0] ?? "user",
      companyId,
      companyName,
      allowedFeatures,
      planType,
      isBlocked,
      blockedReason,
      subscription,
    };
  });

// ----------------------------------------------------------------------
// Types & Helpers for Subscriptions & Blocking
// ----------------------------------------------------------------------
export type SubscriptionCycle = "mensal" | "semestral" | "anual" | "personalizado";
export type SubscriptionStatus = "active" | "expiring_soon" | "expired" | "blocked";

export interface CompanySubscription {
  cycle: SubscriptionCycle;
  startDate: string;
  endDate: string;
  isBlocked: boolean;
  blockedReason: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  autoBlockOnExpire: boolean;
  daysRemaining: number;
  status: SubscriptionStatus;
}

function parseCompanySubscription(
  company: { id: string; created_at?: string; [key: string]: any },
  adminRole?: { allowed_features?: string[] | null } | null,
  ownerProfile?: { phone?: string | null; email?: string | null } | null,
  ownerUser?: { email?: string | null } | null
): CompanySubscription {
  const features: string[] = adminRole?.allowed_features || [];
  
  const getTag = (prefix: string) => {
    const f = features.find(item => item.startsWith(prefix));
    return f ? f.slice(prefix.length) : null;
  };

  const cycleTag = getTag("sub:cycle:");
  const startTag = getTag("sub:start:");
  const endTag = getTag("sub:end:");
  const blockedTag = getTag("sub:blocked:");
  const reasonTag = getTag("sub:reason:");
  const phoneTag = getTag("sub:phone:");
  const emailTag = getTag("sub:email:");
  const autoBlockTag = getTag("sub:autoblock:");

  const cycle: SubscriptionCycle = (cycleTag as any) || (company.subscription_cycle as any) || "mensal";
  
  const createdDate = company.created_at ? company.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const startDate = startTag || (company.subscription_start_date ? String(company.subscription_start_date).slice(0, 10) : createdDate);
  
  let defaultEnd = new Date(startDate + "T00:00:00");
  if (isNaN(defaultEnd.getTime())) defaultEnd = new Date();
  if (cycle === "anual") defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
  else if (cycle === "semestral") defaultEnd.setMonth(defaultEnd.getMonth() + 6);
  else defaultEnd.setDate(defaultEnd.getDate() + 30);
  const defaultEndStr = defaultEnd.toISOString().slice(0, 10);

  const endDate = endTag || (company.subscription_end_date ? String(company.subscription_end_date).slice(0, 10) : defaultEndStr);
  
  const isBlocked = blockedTag === "true" || company.is_blocked === true;
  const blockedReason = reasonTag || company.blocked_reason || null;
  const autoBlockOnExpire = autoBlockTag !== "false" && company.auto_block_on_expire !== false;

  const contactPhone = phoneTag || ownerProfile?.phone || null;
  const contactEmail = emailTag || ownerProfile?.email || ownerUser?.email || null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate + "T23:59:59");
  const diffTime = end.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: SubscriptionStatus = "active";
  if (isBlocked) {
    status = "blocked";
  } else if (daysRemaining < 0) {
    status = "expired";
  } else if (daysRemaining <= 5) {
    status = "expiring_soon";
  } else {
    status = "active";
  }

  return {
    cycle,
    startDate,
    endDate,
    isBlocked,
    blockedReason,
    contactPhone,
    contactEmail,
    autoBlockOnExpire,
    daysRemaining,
    status,
  };
}

function mergeSubscriptionFeatures(
  currentFeatures: string[] | null | undefined,
  sub: Partial<{
    cycle: SubscriptionCycle;
    startDate: string;
    endDate: string;
    isBlocked: boolean;
    blockedReason: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    autoBlockOnExpire: boolean;
  }>
): string[] {
  const existing = (currentFeatures || []).filter(f => !f.startsWith("sub:"));
  const next = [...existing];
  if (sub.cycle) next.push(`sub:cycle:${sub.cycle}`);
  if (sub.startDate) next.push(`sub:start:${sub.startDate}`);
  if (sub.endDate) next.push(`sub:end:${sub.endDate}`);
  if (sub.isBlocked !== undefined) next.push(`sub:blocked:${sub.isBlocked}`);
  if (sub.blockedReason !== undefined) {
    if (sub.blockedReason) next.push(`sub:reason:${sub.blockedReason}`);
  }
  if (sub.contactPhone) next.push(`sub:phone:${sub.contactPhone}`);
  if (sub.contactEmail) next.push(`sub:email:${sub.contactEmail}`);
  if (sub.autoBlockOnExpire !== undefined) next.push(`sub:autoblock:${sub.autoBlockOnExpire}`);
  return next;
}

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
        contactPhone: z.string().trim().max(30).optional(),
        subscriptionFee: z.number().min(0).optional(),
        planType: z.enum(["basic", "pro", "elite", "elite_pro"]).default("basic"),
        subscriptionCycle: z.enum(["mensal", "semestral", "anual", "personalizado"]).default("mensal"),
        subscriptionStartDate: z.string().optional(),
        subscriptionEndDate: z.string().optional(),
        autoBlockOnExpire: z.boolean().default(true),
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

    // Check if user already exists
    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUser = list.data?.users.find((u) => u.email?.toLowerCase() === adminEmail);
    if (existingUser) {
      throw new Error("Este e-mail já está sendo utilizado por um usuário no sistema. Por favor, informe um e-mail diferente.");
    }

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
      throw new Error(`Erro ao criar conta de administrador: ${created.error.message}`);
    }
    const adminUserId = created.data.user!.id;

    // Calculate start and end dates
    const startDate = data.subscriptionStartDate || new Date().toISOString().slice(0, 10);
    let endDate = data.subscriptionEndDate;
    if (!endDate) {
      const d = new Date(startDate + "T00:00:00");
      if (data.subscriptionCycle === "anual") d.setFullYear(d.getFullYear() + 1);
      else if (data.subscriptionCycle === "semestral") d.setMonth(d.getMonth() + 6);
      else d.setDate(d.getDate() + 30);
      endDate = d.toISOString().slice(0, 10);
    }

    const { data: company, error: ce } = await supabaseAdmin
      .from("companies")
      .insert({
        name: data.name,
        owner_user_id: adminUserId,
        subscription_fee: data.subscriptionFee ?? 0,
        plan_type: data.planType,
      })
      .select()
      .single();
    if (ce) throw new Error(ce.message);

    // Save profile for admin
    await supabaseAdmin.from("profiles").upsert({
      id: adminUserId,
      company_name: data.name,
      technician_name: data.adminName || "",
      email: adminEmail,
      phone: data.contactPhone || "",
    });

    const subFeatures = mergeSubscriptionFeatures([], {
      cycle: data.subscriptionCycle,
      startDate,
      endDate,
      isBlocked: false,
      contactPhone: data.contactPhone || null,
      contactEmail: adminEmail,
      autoBlockOnExpire: data.autoBlockOnExpire,
    });

    const { error: re } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: adminUserId,
        role: "admin",
        company_id: company.id,
        allowed_features: subFeatures,
      });
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
// MASTER: list all companies with subscription and contact details
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
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const result = [];
    for (const c of companies ?? []) {
      const { data: owner } = await supabaseAdmin.auth.admin.getUserById(c.owner_user_id);
      const { data: adminRole } = await supabaseAdmin
        .from("user_roles")
        .select("allowed_features")
        .eq("company_id", c.id)
        .eq("role", "admin")
        .maybeSingle();

      const { data: ownerRoles } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", c.owner_user_id);

      const isMasterAccount =
        ownerRoles?.some((r) => r.role === "master") ||
        c.name.trim().toLowerCase() === "t-maint";

      const { data: ownerProfile } = await supabaseAdmin
        .from("profiles")
        .select("technician_name, phone, email")
        .eq("id", c.owner_user_id)
        .maybeSingle();

      const { count: usersCount } = await supabaseAdmin
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("company_id", c.id);

      const sub = parseCompanySubscription(c, adminRole, ownerProfile, owner?.user);
      if (isMasterAccount) {
        sub.isBlocked = false;
        sub.status = "active";
        sub.daysRemaining = 999999;
      }

      result.push({
        id: c.id,
        name: c.name,
        adminName: ownerProfile?.technician_name || (owner?.user?.user_metadata as any)?.technician_name || "",
        ownerEmail: owner.user?.email ?? "",
        usersCount: usersCount ?? 0,
        createdAt: c.created_at,
        subscriptionFee: c.subscription_fee ?? 0,
        planType: isMasterAccount ? "master" : (c.plan_type ?? "basic"),
        subscription: sub,
        isMasterAccount,
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

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("owner_user_id, name")
      .eq("id", data.companyId)
      .single();
    if (!company) throw new Error("Empresa não encontrada.");

    const { data: ownerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", company.owner_user_id);
    if (ownerRoles?.some((r) => r.role === "master") || company.name.trim().toLowerCase() === "t-maint") {
      throw new Error("A conta Master do sistema é protegida e não pode ser excluída.");
    }

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
// MASTER: update a company and its subscription details
// ----------------------------------------------------------------------
export const updateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      companyId: z.string().uuid(),
      name: z.string().trim().min(1).max(120).optional(),
      adminName: z.string().trim().max(120).optional(),
      contactPhone: z.string().trim().max(30).optional(),
      contactEmail: z.string().trim().email().optional(),
      subscriptionFee: z.number().min(0).optional(),
      planType: z.enum(["basic", "pro", "elite", "elite_pro"]).optional(),
      subscriptionCycle: z.enum(["mensal", "semestral", "anual", "personalizado"]).optional(),
      subscriptionStartDate: z.string().optional(),
      subscriptionEndDate: z.string().optional(),
      isBlocked: z.boolean().optional(),
      blockedReason: z.string().nullable().optional(),
      autoBlockOnExpire: z.boolean().optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: master } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "master")
      .maybeSingle();
    if (!master) throw new Error("Apenas o master pode atualizar empresas.");

    const patch: any = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.subscriptionFee !== undefined) patch.subscription_fee = data.subscriptionFee;
    if (data.planType !== undefined) patch.plan_type = data.planType;

    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseAdmin
        .from("companies")
        .update(patch)
        .eq("id", data.companyId);
      if (error) throw new Error(error.message);
    }

    // Get company owner
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("owner_user_id, name")
      .eq("id", data.companyId)
      .single();

    if (company) {
      const { data: ownerRoles } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", company.owner_user_id);
      const isMasterComp = ownerRoles?.some((r) => r.role === "master") || company.name.trim().toLowerCase() === "t-maint";

      if (data.adminName !== undefined || data.contactPhone !== undefined || data.contactEmail !== undefined || data.name !== undefined) {
        const profPatch: any = {};
        if (data.adminName !== undefined) profPatch.technician_name = data.adminName;
        if (data.contactPhone !== undefined) profPatch.phone = data.contactPhone;
        if (data.contactEmail !== undefined) profPatch.email = data.contactEmail;
        if (data.name !== undefined) profPatch.company_name = data.name;
        await supabaseAdmin.from("profiles").upsert({
          id: company.owner_user_id,
          ...profPatch,
        });
      }

      // Update admin role features with subscription tags (if not master company)
      if (!isMasterComp) {
        const { data: adminRole } = await supabaseAdmin
          .from("user_roles")
          .select("id, allowed_features")
          .eq("company_id", data.companyId)
          .eq("role", "admin")
          .maybeSingle();

        if (adminRole) {
          const updatedFeatures = mergeSubscriptionFeatures(adminRole.allowed_features, {
            cycle: data.subscriptionCycle,
            startDate: data.subscriptionStartDate,
            endDate: data.subscriptionEndDate,
            isBlocked: data.isBlocked,
            blockedReason: data.blockedReason,
            contactPhone: data.contactPhone,
            contactEmail: data.contactEmail,
            autoBlockOnExpire: data.autoBlockOnExpire,
          });

          await supabaseAdmin
            .from("user_roles")
            .update({ allowed_features: updatedFeatures })
            .eq("id", adminRole.id);
        }
      }
    }

    return { ok: true };
  });

// ----------------------------------------------------------------------
// MASTER: toggle blocking an administrator / company
// ----------------------------------------------------------------------
export const toggleCompanyBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      companyId: z.string().uuid(),
      isBlocked: z.boolean(),
      blockedReason: z.string().nullable().optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: master } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "master")
      .maybeSingle();
    if (!master) throw new Error("Apenas o master pode bloquear ou desbloquear empresas.");

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("owner_user_id, name")
      .eq("id", data.companyId)
      .single();
    if (company) {
      const { data: ownerRoles } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", company.owner_user_id);
      if (ownerRoles?.some((r) => r.role === "master") || company.name.trim().toLowerCase() === "t-maint") {
        throw new Error("A conta Master do sistema é protegida e não pode ser bloqueada.");
      }
    }

    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("id, allowed_features")
      .eq("company_id", data.companyId)
      .eq("role", "admin")
      .maybeSingle();

    if (adminRole) {
      const updated = mergeSubscriptionFeatures(adminRole.allowed_features, {
        isBlocked: data.isBlocked,
        blockedReason: data.blockedReason ?? (data.isBlocked ? "Bloqueado pelo Administrador Master" : null),
      });
      await supabaseAdmin
        .from("user_roles")
        .update({ allowed_features: updated })
        .eq("id", adminRole.id);
    }

    return { ok: true };
  });

// ----------------------------------------------------------------------
// MASTER: renew subscription for a company
// ----------------------------------------------------------------------
export const renewCompanySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      companyId: z.string().uuid(),
      cycle: z.enum(["mensal", "semestral", "anual", "personalizado"]).optional(),
      monthsToAdd: z.number().min(1).max(36).default(1),
      amount: z.number().min(0).optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: master } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "master")
      .maybeSingle();
    if (!master) throw new Error("Apenas o master pode renovar assinaturas.");

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", data.companyId)
      .single();
    if (!company) throw new Error("Empresa não encontrada.");

    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("id, allowed_features")
      .eq("company_id", data.companyId)
      .eq("role", "admin")
      .maybeSingle();

    const currentSub = parseCompanySubscription(company, adminRole);
    
    // Determine base date: if current endDate is in the future, add from it; otherwise add from today
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const currEnd = new Date(currentSub.endDate + "T00:00:00");
    const baseDate = (!isNaN(currEnd.getTime()) && currEnd > now) ? currEnd : now;

    const newEnd = new Date(baseDate);
    newEnd.setMonth(newEnd.getMonth() + data.monthsToAdd);
    const newEndDateStr = newEnd.toISOString().slice(0, 10);
    const cycle = data.cycle || (data.monthsToAdd === 12 ? "anual" : data.monthsToAdd === 6 ? "semestral" : "mensal");

    if (adminRole) {
      const updated = mergeSubscriptionFeatures(adminRole.allowed_features, {
        cycle,
        endDate: newEndDateStr,
        isBlocked: false,
        blockedReason: null,
      });
      await supabaseAdmin
        .from("user_roles")
        .update({ allowed_features: updated })
        .eq("id", adminRole.id);
    }

    // Record renewal in admin_payments if amount provided
    const fee = data.amount !== undefined ? data.amount : company.subscription_fee;
    if (fee > 0) {
      await supabaseAdmin.from("admin_payments").insert({
        company_id: data.companyId,
        amount: fee,
        reference_month: newEndDateStr.slice(0, 7),
        paid_at: new Date().toISOString(),
      });
    }

    return { ok: true, newEndDate: newEndDateStr };
  });

// ----------------------------------------------------------------------
// MASTER: generate / send renewal reminder
// ----------------------------------------------------------------------
export const getSubscriptionReminderMessage = createServerFn({ method: "POST" })
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
    if (!master) throw new Error("Acesso não autorizado.");

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", data.companyId)
      .single();
    if (!company) throw new Error("Empresa não encontrada.");

    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("allowed_features")
      .eq("company_id", data.companyId)
      .eq("role", "admin")
      .maybeSingle();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", company.owner_user_id)
      .maybeSingle();

    const sub = parseCompanySubscription(company, adminRole, profile);
    const adminName = profile?.technician_name || "Administrador";
    const dtParts = sub.endDate.split("-");
    const formattedDate = dtParts.length === 3 ? `${dtParts[2]}/${dtParts[1]}/${dtParts[0]}` : sub.endDate;
    
    let daysText = `vence em ${sub.daysRemaining} dia(s)`;
    if (sub.daysRemaining === 0) daysText = "vence hoje";
    if (sub.daysRemaining < 0) daysText = `venceu há ${Math.abs(sub.daysRemaining)} dia(s)`;

    const phoneClean = (sub.contactPhone || "").replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/55${phoneClean}?text=` + encodeURIComponent(
      `Olá ${adminName}! Passando para lembrar que a assinatura do T-Maint da empresa *${company.name}* ${daysText} (${formattedDate}).\n\n` +
      `Para renovar o plano e continuar utilizando o sistema sem interrupções, estamos à disposição!\n\n` +
      `Chave Pix / Contato: (47) 98848-5668 (João Tomaselli)`
    );

    return {
      adminName,
      companyName: company.name,
      daysRemaining: sub.daysRemaining,
      endDate: formattedDate,
      phone: sub.contactPhone,
      email: sub.contactEmail,
      whatsappUrl,
    };
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
        username: z.string().trim().min(3).max(50),
        password: z.string().min(6).max(128),
        role: z.enum(["admin", "user", "technician"]).default("user"),
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

    await checkUserLimit(targetCompany);

    const email = data.email.toLowerCase();
    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUser = list.data?.users.find((u) => u.email?.toLowerCase() === email);
    if (existingUser) {
      throw new Error("Este e-mail já está sendo utilizado por outro usuário no sistema.");
    }

    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });
    if (created.error) throw new Error(created.error.message);
    const newUserId = created.data.user!.id;

    const { error: re } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUserId,
        username: data.username,
        role: data.role,
        company_id: targetCompany,
        allowed_features: data.allowedFeatures ?? null,
      });
    if (re) {
      if (re.message.includes("unique") || re.message.includes("duplicate")) {
        throw new Error("Este nome de usuário já está em uso.");
      }
      throw new Error(re.message);
    }

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

    await checkUserLimit(targetCompany);

    const email = data.email.toLowerCase();
    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUser = list.data?.users.find((u) => u.email?.toLowerCase() === email);
    if (existingUser) {
      throw new Error("Este e-mail já está sendo utilizado por outro usuário no sistema.");
    }

    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });
    if (created.error) throw new Error(created.error.message);
    const newUserId = created.data.user!.id;

    const { error: re } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUserId,
        role: "technician",
        company_id: targetCompany,
        allowed_features: data.allowedFeatures ?? null,
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
// ADMIN / MASTER: create a login for a client
// ----------------------------------------------------------------------
export const createClientLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().trim().email(),
        password: z.string().min(6).max(128),
        clientId: z.string().uuid(),
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
    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUser = list.data?.users.find((u) => u.email?.toLowerCase() === email);
    if (existingUser) {
      throw new Error("Este e-mail já está sendo utilizado por outro usuário no sistema.");
    }

    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });
    if (created.error) throw new Error(created.error.message);
    const newUserId = created.data.user!.id;

    // Delete any old role for this client_id just in case
    const { data: oldRoles } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, allowed_features")
      .eq("role", "user");
    for (const r of oldRoles || []) {
      if (r.allowed_features?.includes(`client_id:${data.clientId}`)) {
        await supabaseAdmin.from("user_roles").delete().eq("id", r.id);
        await supabaseAdmin.auth.admin.deleteUser(r.user_id).catch(() => {});
      }
    }

    const { error: re } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUserId,
        role: "user",
        company_id: targetCompany,
        allowed_features: ["client_portal", `client_id:${data.clientId}`],
      });
    if (re && !re.message.includes("duplicate")) throw new Error(re.message);

    await supabaseAdmin.from("allowed_emails").upsert({
      email,
      role: "user",
      company_id: targetCompany,
      invited_by: userId,
    }, { onConflict: "email" });

    return { userId: newUserId };
  });

// ----------------------------------------------------------------------
// ADMIN / MASTER: disable/revoke a client's portal access
// ----------------------------------------------------------------------
export const disableClientLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        clientId: z.string().uuid(),
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

    const { data: userRoles } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, allowed_features")
      .eq("role", "user");

    const targetRole = (userRoles || []).find((r) =>
      r.allowed_features?.includes(`client_id:${data.clientId}`)
    );
    if (targetRole) {
      await supabaseAdmin.from("user_roles").delete().eq("id", targetRole.id);
      await supabaseAdmin.auth.admin.deleteUser(targetRole.user_id).catch(() => {});
    }

    return { ok: true };
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
        username: z.string().trim().min(3).max(50).optional(),
        password: z.string().min(6).max(128).optional(),
        role: z.enum(["admin", "user", "technician", "client"]).optional(),
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

    // Protect Master account from being edited via sub-user updates
    const { data: targetMasterRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", data.targetUserId)
      .eq("role", "master")
      .maybeSingle();
    if (targetMasterRole) {
      throw new Error("A conta de Master não pode ser editada nesta tela.");
    }

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

    const { data: companyData } = await supabaseAdmin
      .from("companies")
      .select("owner_user_id")
      .eq("id", targetCompany)
      .single();
    
    if (companyData && companyData.owner_user_id === data.targetUserId && !isMaster && userId !== data.targetUserId) {
      throw new Error("Apenas o master ou o próprio titular podem alterar o seu acesso.");
    }

    if (data.email) {
      const newEmail = data.email.toLowerCase();
      const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const taken = list.data?.users.find((u) => u.email?.toLowerCase() === newEmail && u.id !== data.targetUserId);
      if (taken) {
        throw new Error("Este e-mail já pertence a outra conta no sistema.");
      }
    }

    if (data.email || data.password) {
      const upd: any = {};
      if (data.email) upd.email = data.email.toLowerCase();
      if (data.password) upd.password = data.password;
      const { error: ue } = await supabaseAdmin.auth.admin.updateUserById(data.targetUserId, upd);
      if (ue) throw new Error(ue.message);
    }

    const patch: any = {};
    if (data.role) patch.role = data.role;
    if (data.username) patch.username = data.username;
    if (data.allowedFeatures !== undefined) patch.allowed_features = data.allowedFeatures;
    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .update(patch)
        .eq("user_id", data.targetUserId)
        .eq("company_id", targetCompany);
      if (error) {
        if (error.message.includes("unique") || error.message.includes("duplicate")) {
          throw new Error("Este nome de usuário já está em uso.");
        }
        throw new Error(error.message);
      }
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
      .select("id, user_id, role, username, allowed_features, created_at")
      .eq("company_id", targetCompany);
    if (error) throw new Error(error.message);

    const out = [];
    for (const m of members ?? []) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(m.user_id);
      out.push({
        id: m.id,
        userId: m.user_id,
        role: m.role,
        username: m.username,
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
      .select("id, name, owner_user_id, created_at, subscription_fee, plan_type")
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
        planType: c.plan_type,
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
    let targetCompany = data.companyId ?? adminEntry?.company_id ?? null;
    if (!targetCompany) {
      const { data: tr } = await supabaseAdmin.from("user_roles").select("company_id").eq("user_id", data.targetUserId).maybeSingle();
      targetCompany = tr?.company_id ?? null;
    }
    if (!isMaster && !adminEntry) throw new Error("Sem permissão.");
    if (!targetCompany) throw new Error("Empresa não definida.");

    const { data: companyData } = await supabaseAdmin
      .from("companies")
      .select("owner_user_id")
      .eq("id", targetCompany)
      .single();

    if (companyData && companyData.owner_user_id === data.targetUserId && !isMaster) {
      throw new Error("Não é possível remover o titular da empresa.");
    }

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

// ----------------------------------------------------------------------
// ANYONE AUTHENTICATED: Get profile data for a specific company
// ----------------------------------------------------------------------
export const getCompanyProfileData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ companyId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    // 1. Get the owner of the company
    const { data: company, error: companyErr } = await supabaseAdmin
      .from("companies")
      .select("owner_user_id")
      .eq("id", data.companyId)
      .maybeSingle();
      
    if (companyErr) throw new Error(companyErr.message);
    if (!company) return { companyName: "", technicianName: "" };

    // 2. Get the profile of the owner to bypass RLS for technicians
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", company.owner_user_id)
      .maybeSingle();
      
    if (error) throw new Error(error.message);
    if (!profile) return { companyName: "", technicianName: "" };
    
    return {
      companyName: profile.company_name,
      technicianName: profile.technician_name,
      email: profile.email || "",
      cnpj: profile.cnpj || "",
      phone: profile.phone || "",
      address: profile.address || "",
      logoUrl: profile.logo_url || "",
    };
  });

