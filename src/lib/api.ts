import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "./image-compression";

export type Client = {
  id: string;
  name: string;
  hourlyRate: number;
  kmRate: number;
  cnpj?: string;
  phone?: string;
  address?: string;
  contact?: string;
  hasPreventiveContract: boolean;
  preventiveContractValue?: number | null;
  preventiveContractFile?: string | null;
};

export type Technician = {
  id: string;
  name: string;
  hourlyRate: number;
  kmRate: number;
  overtimeWeekdayRate: number;
  overtimeWeekendRate: number;
  isSalaried?: boolean;
  monthlyFixedHours?: number | null;
  userId?: string | null;
  hasLogin?: boolean;
  allowedFeatures?: string[];
};

export type ServiceType = "corretiva" | "preventiva";

export type ServiceReport = {
  id: string;
  orderNumber: string;
  clientId: string;
  date: string;
  machine: string;
  requester: string;
  type: ServiceType;
  description: string;
  summary: string;
  travelOutStart: string;
  travelOutEnd: string;
  serviceStart: string;
  serviceEnd: string;
  travelBackStart: string;
  travelBackEnd: string;
  km: number;
  observation?: string;
  technician: string;
  overtimeWeekdayHours: number;
  overtimeWeekendHours: number;
  futureReplacements?: string;
  discountHours: number;
  lunchHours?: number;
  deductLunchFromClient?: boolean;
  clientSignature?: string;
  technicianSignature?: string;
  isPackage?: boolean;
  packageValue?: number | null;
  packageContractFile?: string | null;
  createdAt: string;
};

export type AttachmentKind = "mechanical_before" | "mechanical_after" | "electrical_before" | "electrical_after" | "future_replacements";

export type ActivityAttachment = {
  id: string;
  activityId: string;
  kind: AttachmentKind;
  storagePath: string;
  caption?: string;
};

export type ActivityTechnician = {
  id?: string;
  activityId?: string;
  technicianId: string;
  position: number;
  overtimeWeekdayHours: number;
  overtimeWeekendHours: number;
};

export type Settings = {
  companyName: string;
  technicianName: string;
  email?: string;
  cnpj?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
};

export type AgendaEventType = "task" | "appointment";

export type AgendaEvent = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  eventType: AgendaEventType;
  startDate: string | null;
  endDate: string | null;
  isAllDay: boolean;
  recurrenceRule: string | null;
  createdBy: string;
  createdAt: string;
  participants: string[];
  completions: string[];
};

const fromClient = (r: any): Client => ({
  id: r.id, name: r.name,
  hourlyRate: Number(r.hourly_rate), kmRate: Number(r.km_rate),
  cnpj: r.cnpj ?? "", phone: r.phone ?? "",
  address: r.address ?? "", contact: r.contact ?? "",
  hasPreventiveContract: Boolean(r.has_preventive_contract),
  preventiveContractValue: r.preventive_contract_value == null ? null : Number(r.preventive_contract_value),
  preventiveContractFile: r.preventive_contract_file ?? null,
});

const toClientRow = (c: Omit<Client, "id">) => ({
  name: c.name,
  hourly_rate: c.hourlyRate ?? 0,
  km_rate: c.kmRate ?? 0,
  cnpj: c.cnpj || null,
  phone: c.phone || null,
  address: c.address || null,
  contact: c.contact || null,
  has_preventive_contract: c.hasPreventiveContract ?? false,
  preventive_contract_value: c.preventiveContractValue ?? null,
  preventive_contract_file: c.preventiveContractFile ?? null,
});

const fromTechnician = (r: any): Technician => ({
  id: r.id, name: r.name,
  hourlyRate: Number(r.hourly_rate), kmRate: Number(r.km_rate),
  overtimeWeekdayRate: Number(r.overtime_weekday_rate),
  overtimeWeekendRate: Number(r.overtime_weekend_rate),
  isSalaried: Boolean(r.is_salaried),
  monthlyFixedHours: r.monthly_fixed_hours ? Number(r.monthly_fixed_hours) : null,
  userId: r.user_id || null,
  hasLogin: Boolean(r.has_login),
});

const toTechnicianRow = (t: Omit<Technician, "id">) => ({
  name: t.name,
  hourly_rate: t.hourlyRate ?? 0,
  km_rate: t.kmRate ?? 0,
  overtime_weekday_rate: t.overtimeWeekdayRate ?? 0,
  overtime_weekend_rate: t.overtimeWeekendRate ?? 0,
  is_salaried: t.isSalaried ?? false,
  monthly_fixed_hours: t.monthlyFixedHours ?? null,
  user_id: t.userId ?? undefined,
  has_login: t.hasLogin ?? false,
});

export function cleanObservation(obs?: string): string {
  if (!obs) return "";
  return obs.replace(/\[LUNCH:[\d.]*:(true|false)\]/g, "").trim();
}

const fromReport = (r: any): ServiceReport => {
  let lunchHours = 0;
  let deductLunchFromClient = false;
  const rawObs = r.observation ?? "";
  if (rawObs.includes("[LUNCH:")) {
    const match = rawObs.match(/\[LUNCH:([\d.]+):(true|false)\]/);
    if (match) {
      lunchHours = Number(match[1]) || 0;
      deductLunchFromClient = match[2] === "true";
    }
  }
  return {
    id: r.id,
    orderNumber: r.order_number ?? "",
    clientId: r.client_id,
    date: r.date,
    machine: r.machine ?? "",
    requester: r.requester ?? "",
    type: r.type,
    description: r.description ?? "",
    summary: r.summary ?? "",
    travelOutStart: r.travel_out_start ?? "",
    travelOutEnd: r.travel_out_end ?? "",
    serviceStart: r.service_start ?? "",
    serviceEnd: r.service_end ?? "",
    travelBackStart: r.travel_back_start ?? "",
    travelBackEnd: r.travel_back_end ?? "",
    km: Number(r.km ?? 0),
    observation: cleanObservation(rawObs),
    technician: r.technician ?? "",
    overtimeWeekdayHours: Number(r.overtime_weekday_hours ?? 0),
    overtimeWeekendHours: Number(r.overtime_weekend_hours ?? 0),
    futureReplacements: r.future_replacements ?? "",
    discountHours: Number(r.discount_hours ?? 0),
    lunchHours,
    deductLunchFromClient,
    clientSignature: r.client_signature ?? "",
    technicianSignature: r.technician_signature ?? "",
    isPackage: Boolean(r.is_package),
    packageValue: r.package_value == null ? null : Number(r.package_value),
    packageContractFile: r.package_contract_file ?? null,
    createdAt: r.created_at,
  };
};

const toReportRow = (r: Omit<ServiceReport, "id" | "createdAt">) => {
  let obs = cleanObservation(r.observation);
  if (r.lunchHours && r.lunchHours > 0) {
    const tag = `[LUNCH:${r.lunchHours}:${r.deductLunchFromClient ? "true" : "false"}]`;
    obs = obs ? `${obs} ${tag}` : tag;
  }
  return {
    order_number: r.orderNumber ?? "",
    client_id: r.clientId,
    date: r.date,
    machine: r.machine ?? "",
    requester: r.requester ?? "",
    type: r.type,
    description: r.description ?? "",
    summary: r.summary ?? "",
    travel_out_start: r.travelOutStart ?? "",
    travel_out_end: r.travelOutEnd ?? "",
    service_start: r.serviceStart ?? "",
    service_end: r.serviceEnd ?? "",
    travel_back_start: r.travelBackStart ?? "",
    travel_back_end: r.travelBackEnd ?? "",
    km: r.km ?? 0,
    observation: obs || null,
    technician: r.technician ?? "",
    overtime_weekday_hours: r.overtimeWeekdayHours ?? 0,
    overtime_weekend_hours: r.overtimeWeekendHours ?? 0,
    future_replacements: r.futureReplacements ?? "",
    discount_hours: r.discountHours ?? 0,
    client_signature: r.clientSignature ?? null,
    technician_signature: r.technicianSignature ?? null,
    is_package: r.isPackage ?? false,
    package_value: r.packageValue ?? null,
    package_contract_file: r.packageContractFile ?? null,
  };
};

const fromProfile = (r: any): Settings => ({
  companyName: r.company_name ?? "",
  technicianName: r.technician_name ?? "",
  email: r.email ?? "",
  cnpj: r.cnpj ?? "",
  phone: r.phone ?? "",
  address: r.address ?? "",
  logoUrl: r.logo_url ?? "",
});

export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabase.from("clients").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(fromClient);
}
export async function createClient(c: Omit<Client, "id">, userId: string): Promise<Client> {
  const { data, error } = await supabase.from("clients")
    .insert({ ...toClientRow(c), user_id: userId }).select().single();
  if (error) throw error;
  return fromClient(data);
}
export async function updateClient(c: Client): Promise<Client> {
  const { data, error } = await supabase.from("clients")
    .update(toClientRow(c)).eq("id", c.id).select().single();
  if (error) throw error;
  return fromClient(data);
}
export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}

export async function listTechnicians(): Promise<Technician[]> {
  const { data, error } = await supabase.from("technicians").select("*").order("name");
  if (error) throw error;
  
  const techs = (data ?? []).map(fromTechnician);
  const userIds = techs.filter(t => t.userId).map(t => t.userId);
  
  if (userIds.length > 0) {
    const { data: rolesData } = await supabase.from("user_roles").select("user_id, allowed_features").in("user_id", userIds);
    if (rolesData) {
      for (const t of techs) {
        if (t.userId) {
          const role = rolesData.find(r => r.user_id === t.userId);
          if (role && role.allowed_features) {
            t.allowedFeatures = role.allowed_features;
          }
        }
      }
    }
  }
  return techs;
}
export async function createTechnician(t: Omit<Technician, "id">, userId: string): Promise<Technician> {
  const { data, error } = await supabase.from("technicians")
    .insert({ ...toTechnicianRow(t), user_id: userId }).select().single();
  if (error) throw error;
  return fromTechnician(data);
}
export async function updateTechnician(t: Technician): Promise<Technician> {
  const { data, error } = await supabase.from("technicians")
    .update(toTechnicianRow(t)).eq("id", t.id).select().single();
  if (error) throw error;
  return fromTechnician(data);
}
export async function deleteTechnician(id: string): Promise<void> {
  const { error } = await supabase.from("technicians").delete().eq("id", id);
  if (error) throw error;
}

export async function listReports(): Promise<ServiceReport[]> {
  const { data, error } = await supabase.from("service_reports").select("*").order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromReport);
}
export async function createReport(r: Omit<ServiceReport, "id" | "createdAt">, userId: string): Promise<ServiceReport> {
  const { data, error } = await supabase.from("service_reports")
    .insert({ ...toReportRow(r), user_id: userId }).select().single();
  if (error) throw error;
  return fromReport(data);
}
export async function updateReport(r: ServiceReport): Promise<ServiceReport> {
  const { data, error } = await supabase.from("service_reports")
    .update(toReportRow(r)).eq("id", r.id).select().single();
  if (error) throw error;
  return fromReport(data);
}
export async function deleteReport(id: string): Promise<void> {
  // First, fetch and delete all attachments from storage
  const { data: attachments } = await supabase.from("activity_attachments").select("storage_path").eq("activity_id", id);
  if (attachments && attachments.length > 0) {
    const paths = attachments.map(a => a.storage_path);
    await supabase.storage.from("activity-attachments").remove(paths);
  }

  // Then delete the report
  const { error } = await supabase.from("service_reports").delete().eq("id", id);
  if (error) throw error;
}

const fromAttachment = (r: any): ActivityAttachment => ({
  id: r.id,
  activityId: r.activity_id,
  kind: r.kind,
  storagePath: r.storage_path,
  caption: r.caption ?? "",
});

export async function listAttachments(activityId: string): Promise<ActivityAttachment[]> {
  const { data, error } = await supabase.from("activity_attachments")
    .select("*").eq("activity_id", activityId).order("created_at");
  if (error) throw error;
  return (data ?? []).map(fromAttachment);
}

export async function uploadAttachment(
  userId: string, activityId: string, kind: AttachmentKind, file: File
): Promise<ActivityAttachment> {
  const compressedFile = await compressImage(file);
  const nameParts = compressedFile.name.split(".");
  const ext = nameParts.length > 1 ? (nameParts.pop() || "bin").toLowerCase() : "bin";
  const safeExt = ext.replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const path = `${userId}/${activityId}/${kind}/${crypto.randomUUID()}.${safeExt}`;
  const up = await supabase.storage.from("activity-attachments")
    .upload(path, compressedFile, { contentType: compressedFile.type || "application/octet-stream", upsert: false });
  if (up.error) throw up.error;
  const { data, error } = await supabase.from("activity_attachments")
    .insert({ user_id: userId, activity_id: activityId, kind, storage_path: path })
    .select().single();
  if (error) {
    // rollback storage object if DB insert fails
    await supabase.storage.from("activity-attachments").remove([path]).catch(() => {});
    throw error;
  }
  return fromAttachment(data);
}

export async function deleteAttachment(att: ActivityAttachment): Promise<void> {
  await supabase.storage.from("activity-attachments").remove([att.storagePath]);
  const { error } = await supabase.from("activity_attachments").delete().eq("id", att.id);
  if (error) throw error;
}

export async function uploadClientContract(userId: string, clientId: string | number, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = (error) => {
      reject(new Error("Failed to read file as base64: " + error));
    };
    reader.readAsDataURL(file);
  });
}

export async function getAttachmentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from("activity-attachments")
    .createSignedUrl(storagePath, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

const fromActTech = (r: any): ActivityTechnician => ({
  id: r.id,
  activityId: r.activity_id,
  technicianId: r.technician_id,
  position: Number(r.position),
  overtimeWeekdayHours: Number(r.overtime_weekday_hours ?? 0),
  overtimeWeekendHours: Number(r.overtime_weekend_hours ?? 0),
});

export async function listActivityTechnicians(activityId: string): Promise<ActivityTechnician[]> {
  const { data, error } = await supabase.from("activity_technicians")
    .select("*").eq("activity_id", activityId).order("position");
  if (error) throw error;
  return (data ?? []).map(fromActTech);
}

export async function listAllActivityTechnicians(): Promise<ActivityTechnician[]> {
  const { data, error } = await supabase.from("activity_technicians").select("*");
  if (error) throw error;
  return (data ?? []).map(fromActTech);
}

export async function replaceActivityTechnicians(
  userId: string, activityId: string, rows: ActivityTechnician[]
): Promise<void> {
  const del = await supabase.from("activity_technicians").delete().eq("activity_id", activityId);
  if (del.error) throw del.error;
  if (rows.length === 0) return;
  const payload = rows.map(r => ({
    user_id: userId, activity_id: activityId,
    technician_id: r.technicianId, position: r.position,
    overtime_weekday_hours: r.overtimeWeekdayHours ?? 0,
    overtime_weekend_hours: r.overtimeWeekendHours ?? 0,
  }));
  const { error } = await supabase.from("activity_technicians").insert(payload);
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<Settings> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  if (!data) return { companyName: "", technicianName: "" };
  return fromProfile(data);
}
export async function upsertProfile(userId: string, s: Settings): Promise<Settings> {
  const { data, error } = await supabase.from("profiles").upsert({
    id: userId,
    company_name: s.companyName,
    technician_name: s.technicianName,
    email: s.email || null,
    cnpj: s.cnpj || null,
    phone: s.phone || null,
    address: s.address || null,
    logo_url: s.logoUrl || null,
  }).select().single();
  if (error) throw error;
  return fromProfile(data);
}

// ===== Service Sessions (additional work entries per OS) =====

export type ServiceSession = {
  id: string;
  activityId: string;
  technicianId?: string | null;
  date: string;
  travelOutStart: string;
  travelOutEnd: string;
  serviceStart: string;
  serviceEnd: string;
  travelBackStart: string;
  travelBackEnd: string;
  km: number;
  overtimeWeekdayHours: number;
  overtimeWeekendHours: number;
  activitiesDone: string;
  observation?: string;
  discountHours: number;
  lunchHours?: number;
  deductLunchFromClient?: boolean;
  position: number;
};

const fromSession = (r: any): ServiceSession => {
  let lunchHours = 0;
  let deductLunchFromClient = false;
  const rawObs = r.observation ?? "";
  if (rawObs.includes("[LUNCH:")) {
    const match = rawObs.match(/\[LUNCH:([\d.]+):(true|false)\]/);
    if (match) {
      lunchHours = Number(match[1]) || 0;
      deductLunchFromClient = match[2] === "true";
    }
  }
  return {
    id: r.id,
    activityId: r.activity_id,
    technicianId: r.technician_id ?? null,
    date: r.date,
    travelOutStart: r.travel_out_start ?? "",
    travelOutEnd: r.travel_out_end ?? "",
    serviceStart: r.service_start ?? "",
    serviceEnd: r.service_end ?? "",
    travelBackStart: r.travel_back_start ?? "",
    travelBackEnd: r.travel_back_end ?? "",
    km: Number(r.km ?? 0),
    overtimeWeekdayHours: Number(r.overtime_weekday_hours ?? 0),
    overtimeWeekendHours: Number(r.overtime_weekend_hours ?? 0),
    activitiesDone: r.activities_done ?? "",
    observation: cleanObservation(rawObs),
    discountHours: Number(r.discount_hours ?? 0),
    lunchHours,
    deductLunchFromClient,
    position: Number(r.position ?? 1),
  };
};

const toSessionRow = (s: Omit<ServiceSession, "id">) => {
  let obs = cleanObservation(s.observation);
  if (s.lunchHours && s.lunchHours > 0) {
    const tag = `[LUNCH:${s.lunchHours}:${s.deductLunchFromClient ? "true" : "false"}]`;
    obs = obs ? `${obs} ${tag}` : tag;
  }
  return {
    activity_id: s.activityId,
    technician_id: s.technicianId || null,
    date: s.date,
    travel_out_start: s.travelOutStart ?? "",
    travel_out_end: s.travelOutEnd ?? "",
    service_start: s.serviceStart ?? "",
    service_end: s.serviceEnd ?? "",
    travel_back_start: s.travelBackStart ?? "",
    travel_back_end: s.travelBackEnd ?? "",
    km: s.km ?? 0,
    overtime_weekday_hours: s.overtimeWeekdayHours ?? 0,
    overtime_weekend_hours: s.overtimeWeekendHours ?? 0,
    activities_done: s.activitiesDone ?? "",
    observation: obs || null,
    discount_hours: s.discountHours ?? 0,
    position: s.position ?? 1,
  };
};

export async function listAllSessions(): Promise<ServiceSession[]> {
  const { data, error } = await supabase.from("service_sessions").select("*").order("date");
  if (error) throw error;
  return (data ?? []).map(fromSession);
}
export async function listSessions(activityId: string): Promise<ServiceSession[]> {
  const { data, error } = await supabase.from("service_sessions")
    .select("*").eq("activity_id", activityId).order("date").order("position");
  if (error) throw error;
  return (data ?? []).map(fromSession);
}
export async function createSession(s: Omit<ServiceSession, "id">, userId: string): Promise<ServiceSession> {
  const { data, error } = await supabase.from("service_sessions")
    .insert({ ...toSessionRow(s), user_id: userId }).select().single();
  if (error) throw error;
  return fromSession(data);
}
export async function updateSession(s: ServiceSession): Promise<ServiceSession> {
  const { data, error } = await supabase.from("service_sessions")
    .update(toSessionRow(s)).eq("id", s.id).select().single();
  if (error) throw error;
  return fromSession(data);
}
export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from("service_sessions").delete().eq("id", id);
  if (error) throw error;
}

export type TechnicianMonthlyClosure = {
  id: string;
  companyId: string;
  technicianId: string;
  referenceMonth: string;
  hoursAmount: number;
  kmAmount: number;
  extraAmount: number;
  complementAmount: number;
  totalAmount: number;
  paidAt: string;
  note?: string;
};

const fromTechClosure = (r: any): TechnicianMonthlyClosure => ({
  id: r.id,
  companyId: r.company_id,
  technicianId: r.technician_id,
  referenceMonth: r.reference_month,
  hoursAmount: Number(r.hours_amount),
  kmAmount: Number(r.km_amount),
  extraAmount: Number(r.extra_amount),
  complementAmount: Number(r.complement_amount),
  totalAmount: Number(r.total_amount),
  paidAt: r.paid_at,
  note: r.note || "",
});

export async function listTechnicianMonthlyClosures(): Promise<TechnicianMonthlyClosure[]> {
  const { data, error } = await supabase.from("technician_monthly_closures").select("*");
  if (error) throw error;
  return (data ?? []).map(fromTechClosure);
}

export async function upsertTechnicianMonthlyClosure(
  companyId: string, 
  technicianId: string, 
  referenceMonth: string, 
  hoursAmount: number,
  kmAmount: number,
  extraAmount: number,
  complementAmount: number,
  totalAmount: number,
  note?: string
): Promise<TechnicianMonthlyClosure> {
  const { data, error } = await supabase.from("technician_monthly_closures")
    .upsert(
      { 
        company_id: companyId, 
        technician_id: technicianId, 
        reference_month: referenceMonth, 
        hours_amount: hoursAmount,
        km_amount: kmAmount,
        extra_amount: extraAmount,
        complement_amount: complementAmount,
        total_amount: totalAmount,
        note: note || null, 
        paid_at: new Date().toISOString() 
      },
      { onConflict: "company_id,technician_id,reference_month" }
    ).select().single();
  if (error) throw error;
  return fromTechClosure(data);
}

export async function deleteTechnicianMonthlyClosure(id: string): Promise<void> {
  const { error } = await supabase.from("technician_monthly_closures").delete().eq("id", id);
  if (error) throw error;
}

// ===== Payments =====
export type ClientPayment = {
  id: string;
  activityId: string;
  amount: number;
  paidAt: string;
  note?: string;
};
export type TechnicianPayment = {
  id: string;
  activityId: string;
  technicianId: string;
  amount: number;
  paidAt: string;
  note?: string;
};

const fromClientPay = (r: any): ClientPayment => ({
  id: r.id, activityId: r.activity_id,
  amount: Number(r.amount ?? 0), paidAt: r.paid_at, note: r.note ?? "",
});
const fromTechPay = (r: any): TechnicianPayment => ({
  id: r.id, activityId: r.activity_id, technicianId: r.technician_id,
  amount: Number(r.amount ?? 0), paidAt: r.paid_at, note: r.note ?? "",
});

export async function listClientPayments(): Promise<ClientPayment[]> {
  const { data, error } = await supabase.from("client_payments").select("*");
  if (error) throw error;
  return (data ?? []).map(fromClientPay);
}
export async function upsertClientPayment(
  companyId: string, userId: string, activityId: string, amount: number, note?: string
): Promise<ClientPayment> {
  const { data, error } = await supabase.from("client_payments")
    .upsert(
      { company_id: companyId, user_id: userId, activity_id: activityId, amount, note: note || null, paid_at: new Date().toISOString() },
      { onConflict: "company_id,activity_id" }
    ).select().single();
  if (error) throw error;
  return fromClientPay(data);
}
export async function deleteClientPayment(activityId: string): Promise<void> {
  const { error } = await supabase.from("client_payments").delete().eq("activity_id", activityId);
  if (error) throw error;
}

export async function listTechnicianPayments(): Promise<TechnicianPayment[]> {
  const { data, error } = await supabase.from("technician_payments").select("*");
  if (error) throw error;
  return (data ?? []).map(fromTechPay);
}
export async function upsertTechnicianPayment(
  companyId: string, userId: string, activityId: string, technicianId: string, amount: number, note?: string
): Promise<TechnicianPayment> {
  const { data, error } = await supabase.from("technician_payments")
    .upsert(
      { company_id: companyId, user_id: userId, activity_id: activityId, technician_id: technicianId, amount, note: note || null, paid_at: new Date().toISOString() },
      { onConflict: "company_id,activity_id,technician_id" }
    ).select().single();
  if (error) throw error;
  return fromTechPay(data);
}
export async function deleteTechnicianPayment(activityId: string, technicianId: string): Promise<void> {
  const { error } = await supabase.from("technician_payments").delete()
    .eq("activity_id", activityId).eq("technician_id", technicianId);
  if (error) throw error;
}

export type PreventivePayment = {
  id: string;
  clientId: string;
  referenceMonth: string;
  amount: number;
  paidAt: string;
  note?: string;
};

const fromPreventivePay = (r: any): PreventivePayment => ({
  id: r.id,
  clientId: r.client_id,
  referenceMonth: r.reference_month,
  amount: Number(r.amount),
  paidAt: r.paid_at,
  note: r.note || "",
});

export async function listPreventivePayments(): Promise<PreventivePayment[]> {
  const { data, error } = await supabase.from("preventive_payments").select("*");
  if (error) throw error;
  return (data ?? []).map(fromPreventivePay);
}

export async function upsertPreventivePayment(
  companyId: string, clientId: string, referenceMonth: string, amount: number, note?: string
): Promise<PreventivePayment> {
  const { data, error } = await supabase.from("preventive_payments")
    .upsert(
      { company_id: companyId, client_id: clientId, reference_month: referenceMonth, amount, note: note || null, paid_at: new Date().toISOString() },
      { onConflict: "company_id,client_id,reference_month" }
    ).select().single();
  if (error) throw error;
  return fromPreventivePay(data);
}

export async function deletePreventivePayment(id: string): Promise<void> {
  const { error } = await supabase.from("preventive_payments").delete().eq("id", id);
  if (error) throw error;
}

export function sessionClientTotals(s: ServiceSession, client?: Client, isPreventive?: boolean, isPackage?: boolean) {
  const travelOut = diffHours(s.travelOutStart, s.travelOutEnd);
  const service = diffHours(s.serviceStart, s.serviceEnd);
  const travelBack = diffHours(s.travelBackStart, s.travelBackEnd);
  const discount = Math.max(0, s.discountHours || 0);
  const lunchDeduction = s.deductLunchFromClient ? Math.max(0, s.lunchHours || 0) : 0;
  const totalHours = Math.max(0, travelOut + service + travelBack - discount - lunchDeduction);
  const hoursValue = (isPreventive || isPackage) ? 0 : totalHours * (client?.hourlyRate ?? 0);
  const kmValue = (isPreventive || isPackage) ? 0 : (s.km || 0) * (client?.kmRate ?? 0);
  return { travelOut, service, travelBack, discount, lunchDeduction, totalHours, hoursValue, kmValue, total: hoursValue + kmValue };
}

export function sessionTechnicianTotals(s: ServiceSession, technician?: Technician) {
  const travelOut = diffHours(s.travelOutStart, s.travelOutEnd);
  const service = diffHours(s.serviceStart, s.serviceEnd);
  const travelBack = diffHours(s.travelBackStart, s.travelBackEnd);
  const discount = Math.max(0, s.discountHours || 0);
  // Technician payroll ALWAYS pays lunch normally!
  const totalHours = Math.max(0, travelOut + service + travelBack - discount);
  const ovtWk = Math.max(0, s.overtimeWeekdayHours || 0);
  const ovtWe = Math.max(0, s.overtimeWeekendHours || 0);
  const specialTotal = Math.min(totalHours, ovtWk + ovtWe);
  const regularHours = Math.max(0, totalHours - specialTotal);
  const hourlyRate = technician?.isSalaried ? 0 : (technician?.hourlyRate ?? 0);
  const kmRate = technician?.kmRate ?? 0;
  const ovtWkRate = technician?.isSalaried ? 0 : (technician?.overtimeWeekdayRate ?? 0);
  const ovtWeRate = technician?.isSalaried ? 0 : (technician?.overtimeWeekendRate ?? 0);
  const hoursValue = regularHours * hourlyRate + ovtWk * ovtWkRate + ovtWe * ovtWeRate;
  const kmValue = (s.km || 0) * kmRate;
  return { totalHours, regularHours, discount, ovtWk, ovtWe, hoursValue, kmValue, total: hoursValue + kmValue };
}

/** Sum the primary report row + all its sessions, from the client billing side */
export function reportTotalsWithSessions(r: ServiceReport, sessions: ServiceSession[], client?: Client) {
  const base = reportTotals(r, client);
  const extras = sessions.filter(s => s.activityId === r.id);
  let totalHours = base.totalHours;
  let service = base.service;
  let travelOut = base.travelOut;
  let travelBack = base.travelBack;
  let hoursValue = base.hoursValue; // For packages, base already sets this to packageValue
  let kmValue = base.kmValue;
  let km = r.km || 0;
  for (const s of extras) {
    const t = sessionClientTotals(s, client, r.type === "preventiva", r.isPackage);
    totalHours += t.totalHours; service += t.service;
    travelOut += t.travelOut; travelBack += t.travelBack;
    // We only add session money if it's NOT a package and NOT a preventive
    hoursValue += t.hoursValue; kmValue += t.kmValue;
    km += s.km || 0;
  }
  return { travelOut, service, travelBack, totalHours, hoursValue, kmValue, km, total: hoursValue + kmValue };
}

export function diffHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

export function reportTotals(r: ServiceReport, client?: Client) {
  const travelOut = diffHours(r.travelOutStart, r.travelOutEnd);
  const service = diffHours(r.serviceStart, r.serviceEnd);
  const travelBack = diffHours(r.travelBackStart, r.travelBackEnd);
  const discount = Math.max(0, r.discountHours || 0);
  const lunchDeduction = r.deductLunchFromClient ? Math.max(0, r.lunchHours || 0) : 0;
  const totalHours = Math.max(0, travelOut + service + travelBack - discount - lunchDeduction);
  const hourlyRate = client?.hourlyRate ?? 0;
  const kmRate = client?.kmRate ?? 0;
  const isPreventive = r.type === "preventiva";
  const isPackage = r.isPackage;
  
  let hoursValue = 0;
  let kmValue = 0;
  
  if (isPackage) {
    hoursValue = r.packageValue ?? 0;
    kmValue = 0; // KM is included in the package
  } else if (!isPreventive) {
    hoursValue = totalHours * hourlyRate;
    kmValue = (r.km || 0) * kmRate;
  }

  return { travelOut, service, travelBack, discount, lunchDeduction, totalHours, hoursValue, kmValue, km: r.km || 0, total: hoursValue + kmValue };
}

export function technicianTotals(r: ServiceReport, technician?: Technician) {
  const travelOut = diffHours(r.travelOutStart, r.travelOutEnd);
  const service = diffHours(r.serviceStart, r.serviceEnd);
  const travelBack = diffHours(r.travelBackStart, r.travelBackEnd);
  const discount = Math.max(0, r.discountHours || 0);
  const totalHours = Math.max(0, travelOut + service + travelBack - discount);
  const ovtWk = Math.max(0, r.overtimeWeekdayHours || 0);
  const ovtWe = Math.max(0, r.overtimeWeekendHours || 0);
  const specialTotal = Math.min(totalHours, ovtWk + ovtWe);
  const regularHours = Math.max(0, totalHours - specialTotal);
  const hourlyRate = technician?.isSalaried ? 0 : (technician?.hourlyRate ?? 0);
  const kmRate = technician?.kmRate ?? 0;
  const ovtWkRate = technician?.isSalaried ? 0 : (technician?.overtimeWeekdayRate ?? 0);
  const ovtWeRate = technician?.isSalaried ? 0 : (technician?.overtimeWeekendRate ?? 0);
  const hoursValue = regularHours * hourlyRate + ovtWk * ovtWkRate + ovtWe * ovtWeRate;
  const kmValue = (r.km || 0) * kmRate;
  return { totalHours, regularHours, discount, ovtWk, ovtWe, hoursValue, kmValue, total: hoursValue + kmValue };
}

/** Sum the primary report row + all sessions belonging to a specific technician. */
export function technicianTotalsWithSessions(
  r: ServiceReport,
  sessions: ServiceSession[],
  technician?: Technician,
) {
  const base = technicianTotals(r, technician);
  let totalHours = base.totalHours;
  let regularHours = base.regularHours;
  let ovtWk = base.ovtWk;
  let ovtWe = base.ovtWe;
  let hoursValue = base.hoursValue;
  let kmValue = base.kmValue;
  let km = r.km || 0;
  const extras = sessions.filter(
    (s) => s.activityId === r.id && technician && s.technicianId === technician.id,
  );
  for (const s of extras) {
    const t = sessionTechnicianTotals(s, technician);
    totalHours += t.totalHours;
    regularHours += t.regularHours;
    ovtWk += t.ovtWk;
    ovtWe += t.ovtWe;
    hoursValue += t.hoursValue;
    kmValue += t.kmValue;
    km += s.km || 0;
  }
  return { totalHours, regularHours, ovtWk, ovtWe, hoursValue, kmValue, km, total: hoursValue + kmValue };
}

export function activityTechnicianTotals(r: ServiceReport, at: ActivityTechnician, technician?: Technician) {
  const travelOut = diffHours(r.travelOutStart, r.travelOutEnd);
  const service = diffHours(r.serviceStart, r.serviceEnd);
  const travelBack = diffHours(r.travelBackStart, r.travelBackEnd);
  const discount = Math.max(0, r.discountHours || 0);
  const totalHours = Math.max(0, travelOut + service + travelBack - discount);
  const ovtWk = Math.max(0, at.overtimeWeekdayHours || 0);
  const ovtWe = Math.max(0, at.overtimeWeekendHours || 0);
  const specialTotal = Math.min(totalHours, ovtWk + ovtWe);
  const regularHours = Math.max(0, totalHours - specialTotal);
  const hourlyRate = technician?.isSalaried ? 0 : (technician?.hourlyRate ?? 0);
  const kmRate = technician?.kmRate ?? 0;
  const ovtWkRate = technician?.isSalaried ? 0 : (technician?.overtimeWeekdayRate ?? 0);
  const ovtWeRate = technician?.isSalaried ? 0 : (technician?.overtimeWeekendRate ?? 0);
  const hoursValue = regularHours * hourlyRate + ovtWk * ovtWkRate + ovtWe * ovtWeRate;
  const kmValue = (r.km || 0) * kmRate;
  return { totalHours, regularHours, discount, ovtWk, ovtWe, hoursValue, kmValue, total: hoursValue + kmValue };
}

/** Pay-per-report for a technician: includes base row only if primary technician matches, plus any sessions or activity-technicians assigned to them. */
export function technicianPayForReport(
  r: ServiceReport,
  sessions: ServiceSession[],
  technician?: Technician,
  activityTechnicians: ActivityTechnician[] = [],
) {
  if (!technician) {
    return { totalHours: 0, regularHours: 0, ovtWk: 0, ovtWe: 0, hoursValue: 0, kmValue: 0, km: 0, total: 0 };
  }
  const primaryMatches = (r.technician || "").trim().toLowerCase() === technician.name.trim().toLowerCase();
  const acts = activityTechnicians.filter(at => at.activityId === r.id && at.technicianId === technician.id);
  
  let totalHours = 0, regularHours = 0, ovtWk = 0, ovtWe = 0, hoursValue = 0, kmValue = 0, km = 0;
  if (primaryMatches && acts.length === 0) {
    const base = technicianTotals(r, technician);
    totalHours += base.totalHours; regularHours += base.regularHours;
    ovtWk += base.ovtWk; ovtWe += base.ovtWe;
    hoursValue += base.hoursValue; kmValue += base.kmValue;
    km += r.km || 0;
  }
  
  for (const at of acts) {
    const t = activityTechnicianTotals(r, at, technician);
    totalHours += t.totalHours; regularHours += t.regularHours;
    ovtWk += t.ovtWk; ovtWe += t.ovtWe;
    hoursValue += t.hoursValue; kmValue += t.kmValue;
    km += r.km || 0;
  }

  const extras = sessions.filter(s => s.activityId === r.id && s.technicianId === technician.id);
  for (const s of extras) {
    const t = sessionTechnicianTotals(s, technician);
    totalHours += t.totalHours; regularHours += t.regularHours;
    ovtWk += t.ovtWk; ovtWe += t.ovtWe;
    hoursValue += t.hoursValue; kmValue += t.kmValue;
    km += s.km || 0;
  }
  return { totalHours, regularHours, ovtWk, ovtWe, hoursValue, kmValue, km, total: hoursValue + kmValue };
}

export function fmtCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function fmtHours(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

// --- Requisitions API ---

export type RequisitionStatus = "Aberta" | "Aguardando Cotação" | "Em Aprovação" | "Comprado" | "Fechada";

export type Requisition = {
  id: string;
  activityId?: string; // Optional agora para permitir avulsas
  companyId: string;
  status: RequisitionStatus;
  description: string;
  createdAt: string;
};

export type RequisitionQuote = {
  id: string;
  requisitionId: string;
  supplier: string;
  value: number;
  storagePath: string;
  createdAt: string;
};

export async function listRequisitions(): Promise<Requisition[]> {
  const { data, error } = await (supabase as any).from("requisitions").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id, 
    activityId: r.activity_id, 
    companyId: r.company_id,
    status: r.status, 
    description: r.description, 
    createdAt: r.created_at
  }));
}

export async function createAvulsaRequisition(description: string, companyId: string): Promise<void> {
  const { error } = await (supabase as any).from("requisitions").insert({
    company_id: companyId,
    description,
    status: "Aberta"
  });
  if (error) throw error;
}

export async function updateRequisition(id: string, status: RequisitionStatus): Promise<void> {
  const { error } = await (supabase as any).from("requisitions").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteRequisition(id: string): Promise<void> {
  const { error } = await (supabase as any).from("requisitions").delete().eq("id", id);
  if (error) throw error;
}

export async function listQuotes(requisitionId: string): Promise<RequisitionQuote[]> {
  const { data, error } = await (supabase as any).from("requisition_quotes").select("*").eq("requisition_id", requisitionId).order("value", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((q: any) => ({
    id: q.id, requisitionId: q.requisition_id, supplier: q.supplier, value: Number(q.value), storagePath: q.storage_path, createdAt: q.created_at
  }));
}

export async function addQuote(q: Omit<RequisitionQuote, "id" | "createdAt">): Promise<RequisitionQuote> {
  const { data, error } = await (supabase as any).from("requisition_quotes").insert({
    requisition_id: q.requisitionId, supplier: q.supplier, value: q.value, storage_path: q.storagePath
  }).select().single();
  if (error) throw error;
  return { id: data.id, requisitionId: data.requisition_id, supplier: data.supplier, value: Number(data.value), storagePath: data.storage_path, createdAt: data.created_at };
}

export async function deleteQuote(id: string, storagePath: string): Promise<void> {
  await supabase.storage.from("quotes").remove([storagePath]);
  const { error } = await (supabase as any).from("requisition_quotes").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadQuoteFile(file: File, requisitionId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${requisitionId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("quotes").upload(path, file);
  if (error) throw error;
  return path;
}

export async function getQuoteFileUrl(path: string): Promise<string> {
  const { data } = await supabase.storage.from("quotes").createSignedUrl(path, 60 * 60);
  if (!data) throw new Error("Could not get signed url");
  return data.signedUrl;
}

// --- Inventory API ---

export type InventoryItem = {
  id: string;
  companyId: string;
  name: string;
  sku: string | null;
  description: string | null;
  location: string | null;
  unit: string;
  minQuantity: number | null;
  currentQuantity: number;
  averageCost: number;
  qrCodeValue: string | null;
  createdAt: string;
};

export type InventoryMovement = {
  id: string;
  companyId: string;
  itemId: string;
  type: "IN" | "OUT";
  quantity: number;
  unitCost: number;
  totalCost: number;
  activityId: string | null;
  userId: string;
  reason: string | null;
  createdAt: string;
};

export async function listInventoryItems(companyId: string): Promise<InventoryItem[]> {
  const { data, error } = await (supabase as any).from("inventory_items").select("*").eq("company_id", companyId).order("name");
  if (error) throw error;
  return (data ?? []).map((i: any) => ({
    id: i.id, companyId: i.company_id, name: i.name, sku: i.sku, description: i.description,
    location: i.location, unit: i.unit, minQuantity: i.min_quantity != null ? Number(i.min_quantity) : null,
    currentQuantity: Number(i.current_quantity), averageCost: Number(i.average_cost),
    qrCodeValue: i.qr_code_value, createdAt: i.created_at
  }));
}

export async function upsertInventoryItem(item: Partial<InventoryItem> & { companyId: string }): Promise<InventoryItem> {
  const payload = {
    ...(item.id ? { id: item.id } : {}),
    company_id: item.companyId,
    name: item.name,
    sku: item.sku,
    description: item.description,
    location: item.location,
    unit: item.unit || "Un",
    min_quantity: item.minQuantity,
    current_quantity: item.currentQuantity || 0,
    average_cost: item.averageCost || 0,
    qr_code_value: item.qrCodeValue
  };
  const { data, error } = await (supabase as any).from("inventory_items").upsert(payload).select().single();
  if (error) throw error;
  return {
    id: data.id, companyId: data.company_id, name: data.name, sku: data.sku, description: data.description,
    location: data.location, unit: data.unit, minQuantity: data.min_quantity != null ? Number(data.min_quantity) : null,
    currentQuantity: Number(data.current_quantity), averageCost: Number(data.average_cost),
    qrCodeValue: data.qr_code_value, createdAt: data.created_at
  };
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await (supabase as any).from("inventory_items").delete().eq("id", id);
  if (error) throw error;
}

export async function listInventoryMovements(itemId: string): Promise<InventoryMovement[]> {
  const { data, error } = await (supabase as any).from("inventory_movements").select("*").eq("item_id", itemId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((m: any) => ({
    id: m.id, companyId: m.company_id, itemId: m.item_id, type: m.type, quantity: Number(m.quantity),
    unitCost: Number(m.unit_cost), totalCost: Number(m.total_cost), activityId: m.activity_id,
    userId: m.user_id, reason: m.reason, createdAt: m.created_at
  }));
}

export async function createInventoryMovement(movement: Omit<InventoryMovement, "id" | "createdAt" | "totalCost">, skipItemUpdate = false): Promise<void> {
  const total_cost = movement.quantity * movement.unitCost;
  
  // 1. Insert Movement
  const { error: moveError } = await (supabase as any).from("inventory_movements").insert({
    company_id: movement.companyId,
    item_id: movement.itemId,
    type: movement.type,
    quantity: movement.quantity,
    unit_cost: movement.unitCost,
    total_cost,
    activity_id: movement.activityId,
    user_id: movement.userId,
    reason: movement.reason
  });
  if (moveError) throw moveError;

  if (skipItemUpdate) return;

  // 2. Update Item Quantity & Average Cost
  const { data: item } = await (supabase as any).from("inventory_items").select("current_quantity, average_cost").eq("id", movement.itemId).single();
  if (item) {
    let newQty = Number(item.current_quantity);
    let newCost = Number(item.average_cost);
    
    if (movement.type === "IN") {
      const currentTotalVal = newQty * newCost;
      const incomingVal = movement.quantity * movement.unitCost;
      newQty += movement.quantity;
      if (newQty > 0) {
        newCost = (currentTotalVal + incomingVal) / newQty;
      }
    } else {
      newQty = Math.max(0, newQty - movement.quantity);
      // OUT doesn't change average cost
    }
    
    await (supabase as any).from("inventory_items").update({
      current_quantity: newQty,
      average_cost: newCost
    }).eq("id", movement.itemId);
  }
}
