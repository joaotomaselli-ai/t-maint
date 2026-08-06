import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/hooks/use-access";
import { useMemo } from "react";

export type ServiceReportStatus = "aguardando" | "iniciada" | "fechada";
export type ServiceReportPriority = "baixa" | "normal" | "alta" | "urgente";

export interface OSStatusMeta {
  activityId: string;
  status: ServiceReportStatus;
  priority: ServiceReportPriority;
  id?: string;
}

export function useOSStatus() {
  const { companyId } = useAccess();
  const qc = useQueryClient();

  const queryKey = ["os_status_events", companyId];

  const q = useQuery({
    queryKey,
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("agenda_events")
        .select("*")
        .eq("company_id", companyId)
        .eq("event_type", "os_status");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const osStatusMap = useMemo(() => {
    const map = new Map<string, OSStatusMeta>();
    for (const evt of q.data ?? []) {
      if (!evt.title) continue;
      map.set(evt.title, {
        activityId: evt.title,
        status: (evt.description as ServiceReportStatus) || "aguardando",
        priority: (evt.recurrence_rule as ServiceReportPriority) || "normal",
        id: evt.id,
      });
    }
    return map;
  }, [q.data]);

  const updateStatus = useMutation({
    mutationFn: async ({
      activityId,
      status,
      priority,
    }: {
      activityId: string;
      status?: ServiceReportStatus;
      priority?: ServiceReportPriority;
    }) => {
      if (!companyId) return;
      const existing = osStatusMap.get(activityId);
      const newStatus = status ?? existing?.status ?? "aguardando";
      const newPriority = priority ?? existing?.priority ?? "normal";

      if (existing?.id) {
        const { error } = await supabase
          .from("agenda_events")
          .update({
            description: newStatus,
            recurrence_rule: newPriority,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("agenda_events").insert({
          company_id: companyId,
          title: activityId,
          description: newStatus,
          recurrence_rule: newPriority,
          event_type: "os_status",
          is_all_day: false,
          created_by: "system",
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  const getStatus = (activityId: string): ServiceReportStatus => {
    // Default to "aguardando" if status is not explicitly set
    return osStatusMap.get(activityId)?.status ?? "aguardando";
  };

  const getPriority = (activityId: string): ServiceReportPriority => {
    return osStatusMap.get(activityId)?.priority ?? "normal";
  };

  return {
    osStatusMap,
    getStatus,
    getPriority,
    updateStatus,
    isLoading: q.isLoading,
  };
}
