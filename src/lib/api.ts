import { supabase } from "@/integrations/supabase/client";

export type Client = {
  id: string;
  name: string;
  hourlyRate: number;
  kmRate: number;
  cnpj?: string;
  phone?: string;
  address?: string;
  contact?: string;
};

export type Technician = {
  id: string;
  name: string;
  hourlyRate: number;
  kmRate: number;
  overtimeWeekdayRate: number;
  overtimeWeekendRate: number;
  monthlyFixedHours?: number | null;
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
  createdAt: string;
};

export type AttachmentKind = "mechanical_before" | "mechanical_after" | "electrical_before" | "electrical_after";

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

const fromClient = (r: any): Client => ({
  id: r.id, name: r.name,
  hourlyRate: Number(r.hourly_rate), kmRate: Number(r.km_rate),
  cnpj: r.cnpj ?? "", phone: r.phone ?? "",
  address: r.address ?? "", contact: r.contact ?? "",
});

const toClientRow = (c: Omit<Client, "id">) => ({
  name: c.name,
  hourly_rate: c.hourlyRate ?? 0,
  km_rate: c.kmRate ?? 0,
  cnpj: c.cnpj || null,
  phone: c.phone || null,
  address: c.address || null,
  contact: c.contact || null,
});

const fromTechnician = (r: any): Technician => ({
  id: r.id,
  name: r.name,
  hourlyRate: Number(r.hourly_rate),
  kmRate: Number(r.km_rate),
  overtimeWeekdayRate: Number(r.overtime_weekday_rate),
  overtimeWeekendRate: Number(r.overtime_weekend_rate),
  monthlyFixedHours: r.monthly_fixed_hours == null ? null : Number(r.monthly_fixed_hours),
});

const toTechnicianRow = (t: Omit<Technician, "id">) => ({
  name: t.name,
  hourly_rate: t.hourlyRate ?? 0,
  km_rate: t.kmRate ?? 0,
  overtime_weekday_rate: t.overtimeWeekdayRate ?? 0,
  overtime_weekend_rate: t.overtimeWeekendRate ?? 0,
  monthly_fixed_hours: t.monthlyFixedHours == null || Number.isNaN(t.monthlyFixedHours as number) ? null : t.monthlyFixedHours,
});

const fromReport = (r: any): ServiceReport => ({
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
  observation: r.observation ?? "",
  technician: r.technician ?? "",
  overtimeWeekdayHours: Number(r.overtime_weekday_hours ?? 0),
  overtimeWeekendHours: Number(r.overtime_weekend_hours ?? 0),
  futureReplacements: r.future_replacements ?? "",
  discountHours: Number(r.discount_hours ?? 0),
  createdAt: r.created_at,
});

const toReportRow = (r: Omit<ServiceReport, "id" | "createdAt">) => ({
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
  observation: r.observation || null,
  technician: r.technician ?? "",
  overtime_weekday_hours: r.overtimeWeekdayHours ?? 0,
  overtime_weekend_hours: r.overtimeWeekendHours ?? 0,
  future_replacements: r.futureReplacements ?? "",
  discount_hours: r.discountHours ?? 0,
});

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
  return (data ?? []).map(fromTechnician);
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
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${activityId}/${kind}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("activity-attachments")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (up.error) throw up.error;
  const { data, error } = await supabase.from("activity_attachments")
    .insert({ user_id: userId, activity_id: activityId, kind, storage_path: path })
    .select().single();
  if (error) throw error;
  return fromAttachment(data);
}

export async function deleteAttachment(att: ActivityAttachment): Promise<void> {
  await supabase.storage.from("activity-attachments").remove([att.storagePath]);
  const { error } = await supabase.from("activity_attachments").delete().eq("id", att.id);
  if (error) throw error;
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
  position: number;
};

const fromSession = (r: any): ServiceSession => ({
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
  observation: r.observation ?? "",
  position: Number(r.position ?? 1),
});

const toSessionRow = (s: Omit<ServiceSession, "id">) => ({
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
  observation: s.observation || null,
  position: s.position ?? 1,
});

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

export function sessionClientTotals(s: ServiceSession, client?: Client) {
  const travelOut = diffHours(s.travelOutStart, s.travelOutEnd);
  const service = diffHours(s.serviceStart, s.serviceEnd);
  const travelBack = diffHours(s.travelBackStart, s.travelBackEnd);
  const totalHours = travelOut + service + travelBack;
  const hoursValue = totalHours * (client?.hourlyRate ?? 0);
  const kmValue = (s.km || 0) * (client?.kmRate ?? 0);
  return { travelOut, service, travelBack, totalHours, hoursValue, kmValue, total: hoursValue + kmValue };
}

export function sessionTechnicianTotals(s: ServiceSession, technician?: Technician) {
  const travelOut = diffHours(s.travelOutStart, s.travelOutEnd);
  const service = diffHours(s.serviceStart, s.serviceEnd);
  const travelBack = diffHours(s.travelBackStart, s.travelBackEnd);
  const totalHours = travelOut + service + travelBack;
  const ovtWk = Math.max(0, s.overtimeWeekdayHours || 0);
  const ovtWe = Math.max(0, s.overtimeWeekendHours || 0);
  const specialTotal = Math.min(totalHours, ovtWk + ovtWe);
  const regularHours = Math.max(0, totalHours - specialTotal);
  const hourlyRate = technician?.hourlyRate ?? 0;
  const kmRate = technician?.kmRate ?? 0;
  const ovtWkRate = technician?.overtimeWeekdayRate ?? 0;
  const ovtWeRate = technician?.overtimeWeekendRate ?? 0;
  const hoursValue = regularHours * hourlyRate + ovtWk * ovtWkRate + ovtWe * ovtWeRate;
  const kmValue = (s.km || 0) * kmRate;
  return { totalHours, regularHours, ovtWk, ovtWe, hoursValue, kmValue, total: hoursValue + kmValue };
}

/** Sum the primary report row + all its sessions, from the client billing side */
export function reportTotalsWithSessions(r: ServiceReport, sessions: ServiceSession[], client?: Client) {
  const base = reportTotals(r, client);
  const extras = sessions.filter(s => s.activityId === r.id);
  let totalHours = base.totalHours;
  let service = base.service;
  let travelOut = base.travelOut;
  let travelBack = base.travelBack;
  let hoursValue = base.hoursValue;
  let kmValue = base.kmValue;
  let km = r.km || 0;
  for (const s of extras) {
    const t = sessionClientTotals(s, client);
    totalHours += t.totalHours; service += t.service;
    travelOut += t.travelOut; travelBack += t.travelBack;
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
  const totalHours = travelOut + service + travelBack;
  const hourlyRate = client?.hourlyRate ?? 0;
  const kmRate = client?.kmRate ?? 0;
  const hoursValue = totalHours * hourlyRate;
  const kmValue = (r.km || 0) * kmRate;
  return { travelOut, service, travelBack, totalHours, hoursValue, kmValue, total: hoursValue + kmValue };
}

export function technicianTotals(r: ServiceReport, technician?: Technician) {
  const travelOut = diffHours(r.travelOutStart, r.travelOutEnd);
  const service = diffHours(r.serviceStart, r.serviceEnd);
  const travelBack = diffHours(r.travelBackStart, r.travelBackEnd);
  const totalHours = travelOut + service + travelBack;
  const ovtWk = Math.max(0, r.overtimeWeekdayHours || 0);
  const ovtWe = Math.max(0, r.overtimeWeekendHours || 0);
  const specialTotal = Math.min(totalHours, ovtWk + ovtWe);
  const regularHours = Math.max(0, totalHours - specialTotal);
  const hourlyRate = technician?.hourlyRate ?? 0;
  const kmRate = technician?.kmRate ?? 0;
  const ovtWkRate = technician?.overtimeWeekdayRate ?? 0;
  const ovtWeRate = technician?.overtimeWeekendRate ?? 0;
  const hoursValue = regularHours * hourlyRate + ovtWk * ovtWkRate + ovtWe * ovtWeRate;
  const kmValue = (r.km || 0) * kmRate;
  return { totalHours, regularHours, ovtWk, ovtWe, hoursValue, kmValue, total: hoursValue + kmValue };
}

export function fmtCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function fmtHours(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
