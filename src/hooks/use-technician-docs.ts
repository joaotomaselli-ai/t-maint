import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/hooks/use-access";
import { useAuth } from "@/hooks/use-auth";
import { useMemo } from "react";
import { toast } from "sonner";

export type TechDocType = "aso" | "nr" | "matriz" | "contrato" | "outro";

export interface TechDocument {
  id: string;
  technicianId: string;
  docType: TechDocType;
  docName: string;
  issueDate?: string;
  expiryDate?: string;
  nrCategory?: string;
  caNumber?: string;
  fileUrl?: string;
  fileName?: string;
  notes?: string;
  createdAt: string;
}

export type EPIStatus = "entregue" | "troca_pendente" | "devolvido";
export type EPICategory = "epi" | "uniforme" | "ferramental" | "outro";

export interface TechEPIItem {
  id: string;
  technicianId: string;
  category: EPICategory;
  itemName: string;
  caNumber?: string;
  deliveryDate: string;
  replacementDate?: string;
  quantity?: number;
  size?: string;
  status: EPIStatus;
  notes?: string;
  receiptFileUrl?: string;
  createdAt: string;
}

export function getDocStatus(expiryDate?: string): { status: "valido" | "vencendo" | "vencido" | "sem_validade"; daysLeft?: number } {
  if (!expiryDate) return { status: "sem_validade" };
  const today = new Date();
  today.setHours(0,0,0,0);
  const exp = new Date(expiryDate + "T00:00:00");
  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: "vencido", daysLeft: diffDays };
  } else if (diffDays <= 30) {
    return { status: "vencendo", daysLeft: diffDays };
  } else {
    return { status: "valido", daysLeft: diffDays };
  }
}

export function useTechnicianDocs(technicianId?: string) {
  const { companyId } = useAccess();
  const { user } = useAuth();
  const qc = useQueryClient();

  const docsQueryKey = ["tech_docs", companyId];
  const episQueryKey = ["tech_epis", companyId];

  // Fetch documents
  const qDocs = useQuery({
    queryKey: docsQueryKey,
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("agenda_events")
        .select("*")
        .eq("company_id", companyId)
        .eq("event_type", "tech_doc");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });

  // Fetch EPIs
  const qEPIs = useQuery({
    queryKey: episQueryKey,
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("agenda_events")
        .select("*")
        .eq("company_id", companyId)
        .eq("event_type", "tech_epi");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });

  // Parsed documents
  const allDocs = useMemo<TechDocument[]>(() => {
    const list: TechDocument[] = [];
    for (const evt of qDocs.data ?? []) {
      if (!evt.title || !evt.description) continue;
      try {
        const payload = JSON.parse(evt.description);
        list.push({
          id: evt.id,
          technicianId: evt.title,
          docType: (evt.recurrence_rule as TechDocType) || payload.docType || "outro",
          docName: payload.docName || "Documento sem nome",
          issueDate: payload.issueDate,
          expiryDate: payload.expiryDate,
          nrCategory: payload.nrCategory,
          caNumber: payload.caNumber,
          fileUrl: payload.fileUrl,
          fileName: payload.fileName,
          notes: payload.notes,
          createdAt: evt.created_at,
        });
      } catch (err) {
        console.error("Erro ao ler JSON de documento do técnico:", err);
      }
    }
    return list;
  }, [qDocs.data]);

  // Parsed EPI items
  const allEPIs = useMemo<TechEPIItem[]>(() => {
    const list: TechEPIItem[] = [];
    for (const evt of qEPIs.data ?? []) {
      if (!evt.title || !evt.description) continue;
      try {
        const payload = JSON.parse(evt.description);
        list.push({
          id: evt.id,
          technicianId: evt.title,
          category: (evt.recurrence_rule as EPICategory) || payload.category || "epi",
          itemName: payload.itemName || "Item sem nome",
          caNumber: payload.caNumber,
          deliveryDate: payload.deliveryDate || new Date().toISOString().split("T")[0],
          replacementDate: payload.replacementDate,
          quantity: payload.quantity ?? 1,
          size: payload.size,
          status: payload.status || "entregue",
          notes: payload.notes,
          receiptFileUrl: payload.receiptFileUrl,
          createdAt: evt.created_at,
        });
      } catch (err) {
        console.error("Erro ao ler JSON de EPI do técnico:", err);
      }
    }
    return list;
  }, [qEPIs.data]);

  // Filter for specific technician if ID is passed
  const techDocs = useMemo(() => {
    if (!technicianId) return allDocs;
    return allDocs.filter(d => d.technicianId === technicianId);
  }, [allDocs, technicianId]);

  const techEPIs = useMemo(() => {
    if (!technicianId) return allEPIs;
    return allEPIs.filter(e => e.technicianId === technicianId);
  }, [allEPIs, technicianId]);

  // Document Mutations
  const addDocument = useMutation({
    mutationFn: async (doc: Omit<TechDocument, "id" | "createdAt">) => {
      if (!companyId || !user?.id) throw new Error("Usuário ou empresa não identificados.");
      const { data, error } = await supabase.from("agenda_events").insert({
        company_id: companyId,
        title: doc.technicianId,
        description: JSON.stringify(doc),
        recurrence_rule: doc.docType,
        event_type: "tech_doc",
        is_all_day: false,
        created_by: user.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docsQueryKey });
      toast.success("Documento adicionado com sucesso!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao salvar documento.");
    },
  });

  const updateDocument = useMutation({
    mutationFn: async (doc: Partial<TechDocument> & { id: string }) => {
      const { data, error } = await supabase
        .from("agenda_events")
        .update({
          description: JSON.stringify(doc),
          recurrence_rule: doc.docType,
        })
        .eq("id", doc.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docsQueryKey });
      toast.success("Documento atualizado com sucesso!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao atualizar documento.");
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docsQueryKey });
      toast.success("Documento removido.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao remover documento.");
    },
  });

  // EPI Mutations
  const addEPI = useMutation({
    mutationFn: async (epi: Omit<TechEPIItem, "id" | "createdAt">) => {
      if (!companyId || !user?.id) throw new Error("Usuário ou empresa não identificados.");
      const { data, error } = await supabase.from("agenda_events").insert({
        company_id: companyId,
        title: epi.technicianId,
        description: JSON.stringify(epi),
        recurrence_rule: epi.category,
        event_type: "tech_epi",
        is_all_day: false,
        created_by: user.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: episQueryKey });
      toast.success("EPI/Uniforme registrado com sucesso!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao registrar EPI.");
    },
  });

  const updateEPI = useMutation({
    mutationFn: async (epi: Partial<TechEPIItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("agenda_events")
        .update({
          description: JSON.stringify(epi),
          recurrence_rule: epi.category,
        })
        .eq("id", epi.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: episQueryKey });
      toast.success("Registro de EPI atualizado com sucesso!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao atualizar EPI.");
    },
  });

  const deleteEPI = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: episQueryKey });
      toast.success("Registro de EPI removido.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao remover EPI.");
    },
  });

  return {
    allDocs,
    allEPIs,
    techDocs,
    techEPIs,
    isLoading: qDocs.isLoading || qEPIs.isLoading,
    addDocument,
    updateDocument,
    deleteDocument,
    addEPI,
    updateEPI,
    deleteEPI,
  };
}
