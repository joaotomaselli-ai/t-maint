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
  createdAt: string;
};

export type Settings = {
  companyName: string;
  technicianName: string;
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
});

const fromProfile = (r: any): Settings => ({
  companyName: r.company_name ?? "",
  technicianName: r.technician_name ?? "",
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
    cnpj: s.cnpj || null,
    phone: s.phone || null,
    address: s.address || null,
    logo_url: s.logoUrl || null,
  }).select().single();
  if (error) throw error;
  return fromProfile(data);
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

export function fmtCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function fmtHours(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
