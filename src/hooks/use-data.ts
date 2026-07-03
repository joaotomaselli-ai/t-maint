import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listClients, createClient, updateClient, deleteClient,
  listReports, createReport, updateReport, deleteReport,
  listTechnicians, createTechnician, updateTechnician, deleteTechnician,
  getProfile, upsertProfile,
  listAllSessions, listAllActivityTechnicians,
  listClientPayments, upsertClientPayment, deleteClientPayment,
  listTechnicianPayments, upsertTechnicianPayment, deleteTechnicianPayment,
  type Client, type ServiceReport, type Settings, type Technician, type ServiceSession,
  type ClientPayment, type TechnicianPayment, type ActivityTechnician,
  listRequisitions, updateRequisition, listQuotes, addQuote, deleteQuote, createAvulsaRequisition, deleteRequisition,
  listInventoryItems, upsertInventoryItem, deleteInventoryItem,
  listInventoryMovements, createInventoryMovement,
  type Requisition, type RequisitionQuote, type RequisitionStatus,
  type InventoryItem, type InventoryMovement,
} from "@/lib/api";
import { getCompanyProfileData } from "@/lib/admin.functions";
import { listAgendaEvents, createAgendaEvent, updateAgendaEvent, deleteAgendaEvent, toggleTaskCompletion } from "@/lib/agenda.functions";
import { useAuth } from "@/hooks/use-auth";
import { useAccess } from "@/hooks/use-access";
import { useServerFn } from "@tanstack/react-start";
import type { AgendaEvent } from "@/lib/api";

export function useAllActivityTechnicians() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["activity_technicians", user?.id],
    queryFn: listAllActivityTechnicians,
    enabled: !!user,
  });
  return { activityTechnicians: (q.data ?? []) as ActivityTechnician[], isLoading: q.isLoading };
}

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

export function useCompanySettings() {
  const { companyId } = useAccess();
  const fetchProfile = useServerFn(getCompanyProfileData);
  const q = useQuery({
    queryKey: ["profile", companyId],
    queryFn: () => companyId ? fetchProfile({ data: { companyId } }) : Promise.resolve({ companyName: "", technicianName: "" }),
    enabled: !!companyId,
  });
  const settings: Settings = q.data ?? { companyName: "", technicianName: "" };
  return { companySettings: settings, isLoading: q.isLoading };
}

export function useTechnicians() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const enabled = !!user;
  const q = useQuery({
    queryKey: ["technicians", user?.id],
    queryFn: listTechnicians,
    enabled,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["technicians", user?.id] });
  return {
    technicians: q.data ?? [],
    isLoading: q.isLoading,
    addTechnician: useMutation({
      mutationFn: (t: Omit<Technician, "id">) => createTechnician(t, user!.id),
      onSuccess: invalidate,
    }),
    updateTechnician: useMutation({
      mutationFn: (t: Technician) => updateTechnician(t),
      onSuccess: invalidate,
    }),
    deleteTechnician: useMutation({
      mutationFn: (id: string) => deleteTechnician(id),
      onSuccess: invalidate,
    }),
  };
}

export function useAllSessions() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["sessions", user?.id],
    queryFn: listAllSessions,
    enabled: !!user,
  });
  return { sessions: (q.data ?? []) as ServiceSession[], isLoading: q.isLoading };
}

export function useClientPayments() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["client_payments", user?.id],
    queryFn: listClientPayments,
    enabled: !!user,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["client_payments", user?.id] });
  return {
    payments: (q.data ?? []) as ClientPayment[],
    isLoading: q.isLoading,
    markPaid: useMutation({
      mutationFn: (v: { activityId: string; amount: number; note?: string }) =>
        upsertClientPayment(user!.id, v.activityId, v.amount, v.note),
      onSuccess: invalidate,
    }),
    unmarkPaid: useMutation({
      mutationFn: (activityId: string) => deleteClientPayment(activityId),
      onSuccess: invalidate,
    }),
  };
}

export function useTechnicianPayments() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["technician_payments", user?.id],
    queryFn: listTechnicianPayments,
    enabled: !!user,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["technician_payments", user?.id] });
  return {
    payments: (q.data ?? []) as TechnicianPayment[],
    isLoading: q.isLoading,
    markPaid: useMutation({
      mutationFn: (v: { activityId: string; technicianId: string; amount: number; note?: string }) =>
        upsertTechnicianPayment(user!.id, v.activityId, v.technicianId, v.amount, v.note),
      onSuccess: invalidate,
    }),
    unmarkPaid: useMutation({
      mutationFn: (v: { activityId: string; technicianId: string }) =>
        deleteTechnicianPayment(v.activityId, v.technicianId),
      onSuccess: invalidate,
    }),
  };
}

// --- Requisitions Hooks ---

export function useRequisitions() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const enabled = !!user;
  const { companyId } = useAccess();

  const q = useQuery({
    queryKey: ["requisitions", user?.id],
    queryFn: () => listRequisitions(),
    enabled,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["requisitions", user?.id] });

  return {
    requisitions: q.data ?? [],
    isLoading: q.isLoading,
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: RequisitionStatus }) => updateRequisition(id, status),
      onSuccess: invalidate,
    }),
    createAvulsa: useMutation({
      mutationFn: (description: string) => {
        if (!companyId) throw new Error("Empresa não encontrada");
        return createAvulsaRequisition(description, companyId);
      },
      onSuccess: invalidate,
    }),
    deleteReq: useMutation({
      mutationFn: (id: string) => deleteRequisition(id),
      onSuccess: invalidate,
    }),
  };
}

export function useRequisitionQuotes(requisitionId?: string) {
  const qc = useQueryClient();
  
  const q = useQuery({
    queryKey: ["requisition_quotes", requisitionId],
    queryFn: () => listQuotes(requisitionId!),
    enabled: !!requisitionId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["requisition_quotes", requisitionId] });

  return {
    quotes: q.data ?? [],
    isLoading: q.isLoading,
    addQuote: useMutation({
      mutationFn: (quote: Omit<RequisitionQuote, "id" | "createdAt">) => addQuote(quote),
      onSuccess: invalidate,
    }),
    deleteQuote: useMutation({
      mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) => deleteQuote(id, storagePath),
      onSuccess: invalidate,
    }),
  };
}

export function useAgendaEvents() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const enabled = !!user;
  
  const listEventsFn = useServerFn(listAgendaEvents);
  const createFn = useServerFn(createAgendaEvent);
  const updateFn = useServerFn(updateAgendaEvent);
  const deleteFn = useServerFn(deleteAgendaEvent);
  const toggleTaskFn = useServerFn(toggleTaskCompletion);

  const q = useQuery({
    queryKey: ["agenda_events", user?.id],
    queryFn: () => listEventsFn({ data: {} }),
    enabled,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["agenda_events", user?.id] });

  return {
    events: (q.data?.events ?? []) as AgendaEvent[],
    isLoading: q.isLoading,
    addEvent: useMutation({
      mutationFn: (data: any) => createFn({ data }),
      onSuccess: invalidate,
    }),
    updateEvent: useMutation({
      mutationFn: (data: any) => updateFn({ data }),
      onSuccess: invalidate,
    }),
    deleteEvent: useMutation({
      mutationFn: (id: string) => deleteFn({ data: { id } }),
      onSuccess: invalidate,
    }),
    toggleCompletion: useMutation({
      mutationFn: (data: { eventId: string; dateStr: string; completed: boolean }) => toggleTaskFn({ data }),
      onSuccess: invalidate,
    }),
  };
}

export function useInventory() {
  const { user } = useAuth();
  const { companyId } = useAccess();
  const qc = useQueryClient();
  const enabled = !!user && !!companyId;

  const itemsQuery = useQuery({
    queryKey: ["inventory_items", companyId],
    queryFn: () => listInventoryItems(companyId!),
    enabled,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["inventory_items", companyId] });
  };

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    upsertItem: useMutation({
      mutationFn: (item: Partial<InventoryItem>) => upsertInventoryItem({ ...item, companyId: companyId! }),
      onSuccess: invalidate,
    }),
    deleteItem: useMutation({
      mutationFn: (id: string) => deleteInventoryItem(id),
      onSuccess: invalidate,
    }),
    createMovement: useMutation({
      mutationFn: (movement: Omit<InventoryMovement, "id" | "createdAt" | "totalCost" | "companyId" | "userId">) => 
        createInventoryMovement({ ...movement, companyId: companyId!, userId: user!.id }),
      onSuccess: invalidate,
    })
  };
}
