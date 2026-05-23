import { useEffect, useState, useCallback } from "react";
import {
  getClients, saveClients, getReports, saveReports, getSettings, saveSettings,
  type Client, type ServiceReport, type Settings,
} from "@/lib/storage";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => setClients(getClients()), []);
  const update = useCallback((c: Client[]) => { saveClients(c); setClients(c); }, []);
  return [clients, update] as const;
}
export function useReports() {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  useEffect(() => setReports(getReports()), []);
  const update = useCallback((r: ServiceReport[]) => { saveReports(r); setReports(r); }, []);
  return [reports, update] as const;
}
export function useSettings() {
  const [settings, setSettings] = useState<Settings>({ companyName: "", technicianName: "" });
  useEffect(() => setSettings(getSettings()), []);
  const update = useCallback((s: Settings) => { saveSettings(s); setSettings(s); }, []);
  return [settings, update] as const;
}
