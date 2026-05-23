export type Client = {
  id: string;
  name: string;
  hourlyRate: number;
  kmRate: number;
  address?: string;
  contact?: string;
};

export type ServiceType = "corretiva" | "preventiva";

export type ServiceReport = {
  id: string;
  orderNumber: string;
  clientId: string;
  date: string; // ISO yyyy-mm-dd
  machine: string;
  requester: string;
  type: ServiceType;
  description: string;
  summary: string;
  travelOutStart: string; // HH:mm
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

const CLIENTS_KEY = "tcc.clients";
const REPORTS_KEY = "tcc.reports";
const SETTINGS_KEY = "tcc.settings";

export type Settings = {
  companyName: string;
  technicianName: string;
  cnpj?: string;
  phone?: string;
  address?: string;
};

const isBrowser = () => typeof window !== "undefined";

export function getClients(): Client[] {
  if (!isBrowser()) return [];
  try { return JSON.parse(localStorage.getItem(CLIENTS_KEY) || "[]"); } catch { return []; }
}
export function saveClients(c: Client[]) {
  if (!isBrowser()) return;
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(c));
}
export function getReports(): ServiceReport[] {
  if (!isBrowser()) return [];
  try { return JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]"); } catch { return []; }
}
export function saveReports(r: ServiceReport[]) {
  if (!isBrowser()) return;
  localStorage.setItem(REPORTS_KEY, JSON.stringify(r));
}
export function getSettings(): Settings {
  if (!isBrowser()) return { companyName: "", technicianName: "" };
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null") ||
      { companyName: "Tech CNC Manutenção", technicianName: "" };
  } catch { return { companyName: "Tech CNC Manutenção", technicianName: "" }; }
}
export function saveSettings(s: Settings) {
  if (!isBrowser()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// Compute hours between HH:mm strings
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
  return {
    travelOut, service, travelBack, totalHours,
    hoursValue, kmValue, total: hoursValue + kmValue,
  };
}

export function fmtCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function fmtHours(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
