import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/hooks/use-access";
import { useAuth } from "@/hooks/use-auth";
import { useMemo } from "react";
import { toast } from "sonner";

export interface ClientRequirement {
  id: string;
  clientId: string;
  requiredDocs: string[]; // e.g. ["aso", "NR-10", "NR-35", "NR-33", "NR-12", "epi"]
  customDocs?: string[];
  renewalFrequencyDays?: number;
  nextSubmissionDate?: string;
  ssmaEmail?: string;
  notes?: string;
  createdAt: string;
}

export function getSubmissionStatus(nextSubmissionDate?: string): { status: "em_dia" | "vencendo" | "vencido" | "sem_data"; daysLeft?: number } {
  if (!nextSubmissionDate) return { status: "sem_data" };
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(nextSubmissionDate + "T00:00:00");
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: "vencido", daysLeft: diffDays };
  } else if (diffDays <= 30) {
    return { status: "vencendo", daysLeft: diffDays };
  } else {
    return { status: "em_dia", daysLeft: diffDays };
  }
}

export function useClientRequirements(clientId?: string) {
  const { companyId } = useAccess();
  const { user } = useAuth();
  const qc = useQueryClient();

  const queryKey = ["client_requirements", companyId];

  const q = useQuery({
    queryKey,
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("agenda_events")
        .select("*")
        .eq("company_id", companyId)
        .eq("event_type", "client_req");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const allReqs = useMemo<ClientRequirement[]>(() => {
    const list: ClientRequirement[] = [];
    for (const evt of q.data ?? []) {
      if (!evt.title || !evt.description) continue;
      try {
        const payload = JSON.parse(evt.description);
        list.push({
          id: evt.id,
          clientId: evt.title,
          requiredDocs: payload.requiredDocs || [],
          customDocs: payload.customDocs || [],
          renewalFrequencyDays: payload.renewalFrequencyDays,
          nextSubmissionDate: payload.nextSubmissionDate,
          ssmaEmail: payload.ssmaEmail,
          notes: payload.notes,
          createdAt: evt.created_at,
        });
      } catch (e) {
        console.error("Erro ao ler requisitos do cliente:", e);
      }
    }
    return list;
  }, [q.data]);

  const clientReq = useMemo(() => {
    if (!clientId) return null;
    return allReqs.find(r => r.clientId === clientId) || null;
  }, [allReqs, clientId]);

  const saveRequirement = useMutation({
    mutationFn: async (req: Omit<ClientRequirement, "id" | "createdAt"> & { id?: string }) => {
      if (!companyId || !user?.id) throw new Error("Usuário ou empresa não identificados.");

      const payload = {
        requiredDocs: req.requiredDocs,
        customDocs: req.customDocs || [],
        renewalFrequencyDays: req.renewalFrequencyDays,
        nextSubmissionDate: req.nextSubmissionDate,
        ssmaEmail: req.ssmaEmail,
        notes: req.notes,
      };

      if (req.id) {
        const { data, error } = await supabase
          .from("agenda_events")
          .update({
            description: JSON.stringify(payload),
          })
          .eq("id", req.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from("agenda_events").insert({
          company_id: companyId,
          title: req.clientId,
          description: JSON.stringify(payload),
          event_type: "client_req",
          is_all_day: false,
          created_by: user.id,
        }).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Exigências e regras do cliente salvas!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao salvar regras do cliente.");
    },
  });

  const deleteRequirement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Exigências do cliente removidas.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao remover exigências.");
    },
  });

  return {
    allReqs,
    clientReq,
    isLoading: q.isLoading,
    saveRequirement,
    deleteRequirement,
  };
}
