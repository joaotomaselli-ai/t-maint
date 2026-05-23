import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listClients, createClient, updateClient, deleteClient,
  listReports, createReport, updateReport, deleteReport,
  listTechnicians, createTechnician, updateTechnician, deleteTechnician,
  getProfile, upsertProfile,
  type Client, type ServiceReport, type Settings, type Technician,
} from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export function useClients() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const enabled = !!user;
  const q = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: listClients,
    enabled,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["clients", user?.id] });
  return {
    clients: q.data ?? [],
    isLoading: q.isLoading,
    addClient: useMutation({
      mutationFn: (c: Omit<Client, "id">) => createClient(c, user!.id),
      onSuccess: invalidate,
    }),
    updateClient: useMutation({
      mutationFn: (c: Client) => updateClient(c),
      onSuccess: invalidate,
    }),
    deleteClient: useMutation({
      mutationFn: (id: string) => deleteClient(id),
      onSuccess: invalidate,
    }),
  };
}

export function useReports() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const enabled = !!user;
  const q = useQuery({
    queryKey: ["reports", user?.id],
    queryFn: listReports,
    enabled,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["reports", user?.id] });
  return {
    reports: q.data ?? [],
    isLoading: q.isLoading,
    addReport: useMutation({
      mutationFn: (r: Omit<ServiceReport, "id" | "createdAt">) => createReport(r, user!.id),
      onSuccess: invalidate,
    }),
    updateReport: useMutation({
      mutationFn: (r: ServiceReport) => updateReport(r),
      onSuccess: invalidate,
    }),
    deleteReport: useMutation({
      mutationFn: (id: string) => deleteReport(id),
      onSuccess: invalidate,
    }),
  };
}

export function useSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const enabled = !!user;
  const q = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled,
  });
  const save = useMutation({
    mutationFn: (s: Settings) => upsertProfile(user!.id, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });
  const settings: Settings = q.data ?? { companyName: "", technicianName: "" };
  return { settings, isLoading: q.isLoading, saveSettings: save };
}
