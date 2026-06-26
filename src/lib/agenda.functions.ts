import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AgendaEvent, AgendaEventType } from "./api";

// ----------------------------------------------------------------------
// listAgendaEvents
// ----------------------------------------------------------------------
export const listAgendaEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        companyId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id")
      .eq("user_id", userId);
    const isMaster = roles?.some((r) => r.role === "master");
    const adminEntry = roles?.find((r) => r.role === "admin");
    const userRole = roles?.[0]?.role;
    
    // For non-master, determine company
    const targetCompany = data.companyId ?? roles?.[0]?.company_id ?? null;
    
    if (!targetCompany && !isMaster) return { events: [] };

    // If master is querying a specific company
    let query = supabaseAdmin.from("agenda_events").select(`
      id, company_id, title, description, event_type, start_date, end_date, is_all_day, recurrence_rule, created_by, created_at,
      agenda_event_participants ( user_id ),
      agenda_task_completions ( completed_date )
    `);

    if (targetCompany) {
      query = query.eq("company_id", targetCompany);
    }

    const { data: events, error } = await query;
    if (error) throw new Error(error.message);

    // If the user is a technician or standard user, they can only see events where they are a participant or they created it.
    // Admins see all events in their company.
    const filteredEvents = events.filter((e) => {
      if (isMaster || userRole === "admin") return true;
      if (e.created_by === userId) return true;
      if (e.agenda_event_participants.some((p: any) => p.user_id === userId)) return true;
      return false;
    });

    const out: AgendaEvent[] = filteredEvents.map((e) => ({
      id: e.id,
      companyId: e.company_id,
      title: e.title,
      description: e.description ?? "",
      eventType: e.event_type as AgendaEventType,
      startDate: e.start_date,
      endDate: e.end_date,
      isAllDay: e.is_all_day ?? false,
      recurrenceRule: e.recurrence_rule ?? null,
      createdBy: e.created_by,
      createdAt: e.created_at,
      participants: e.agenda_event_participants.map((p: any) => p.user_id),
      completions: e.agenda_task_completions.map((c: any) => c.completed_date),
    }));

    return { events: out };
  });

// ----------------------------------------------------------------------
// createAgendaEvent
// ----------------------------------------------------------------------
export const createAgendaEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        companyId: z.string().uuid().optional(),
        title: z.string().trim().min(1),
        description: z.string().optional(),
        eventType: z.enum(["task", "appointment"]),
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
        isAllDay: z.boolean(),
        recurrenceRule: z.string().nullable(),
        participants: z.array(z.string().uuid()),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role, company_id")
      .eq("user_id", userId);
    
    const isMaster = roles?.some((r) => r.role === "master");
    const userRole = roles?.[0]?.role;
    const targetCompany = data.companyId ?? roles?.[0]?.company_id ?? null;

    if (!targetCompany) throw new Error("Empresa não definida.");

    // Validate participants
    let finalParticipants = data.participants;
    if (!isMaster && userRole !== "admin") {
      // Techs/Users can only assign tasks to themselves
      finalParticipants = [userId];
    }

    const { data: newEvent, error } = await supabaseAdmin
      .from("agenda_events")
      .insert({
        company_id: targetCompany,
        title: data.title,
        description: data.description ?? "",
        event_type: data.eventType,
        start_date: data.startDate,
        end_date: data.endDate,
        is_all_day: data.isAllDay,
        recurrence_rule: data.recurrenceRule,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (finalParticipants.length > 0) {
      const parts = finalParticipants.map((uid) => ({
        event_id: newEvent.id,
        user_id: uid,
      }));
      await supabaseAdmin.from("agenda_event_participants").insert(parts);
    }

    return { id: newEvent.id };
  });

// ----------------------------------------------------------------------
// updateAgendaEvent
// ----------------------------------------------------------------------
export const updateAgendaEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().trim().min(1).optional(),
        description: z.string().optional(),
        eventType: z.enum(["task", "appointment"]).optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        isAllDay: z.boolean().optional(),
        recurrenceRule: z.string().nullable().optional(),
        participants: z.array(z.string().uuid()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    
    // Authorization check
    const { data: event } = await supabaseAdmin
      .from("agenda_events")
      .select("created_by, company_id")
      .eq("id", data.id)
      .maybeSingle();

    if (!event) throw new Error("Evento não encontrado.");

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("company_id", event.company_id);
    
    const isMaster = (await supabaseAdmin.from("user_roles").select("id").eq("user_id", userId).eq("role", "master").maybeSingle()).data !== null;
    const isAdmin = roles?.some((r) => r.role === "admin");
    const userRole = roles?.[0]?.role;

    if (!isMaster && !isAdmin && event.created_by !== userId) {
      throw new Error("Sem permissão para editar este evento.");
    }

    const patch: any = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description;
    if (data.eventType !== undefined) patch.event_type = data.eventType;
    if (data.startDate !== undefined) patch.start_date = data.startDate;
    if (data.endDate !== undefined) patch.end_date = data.endDate;
    if (data.isAllDay !== undefined) patch.is_all_day = data.isAllDay;
    if (data.recurrenceRule !== undefined) patch.recurrence_rule = data.recurrenceRule;

    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseAdmin
        .from("agenda_events")
        .update(patch)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    }

    if (data.participants !== undefined) {
      let finalParticipants = data.participants;
      if (!isMaster && userRole !== "admin") {
        finalParticipants = [userId];
      }

      await supabaseAdmin.from("agenda_event_participants").delete().eq("event_id", data.id);
      if (finalParticipants.length > 0) {
        const parts = finalParticipants.map((uid) => ({
          event_id: data.id,
          user_id: uid,
        }));
        await supabaseAdmin.from("agenda_event_participants").insert(parts);
      }
    }

    return { ok: true };
  });

// ----------------------------------------------------------------------
// deleteAgendaEvent
// ----------------------------------------------------------------------
export const deleteAgendaEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    
    const { data: event } = await supabaseAdmin
      .from("agenda_events")
      .select("created_by, company_id")
      .eq("id", data.id)
      .maybeSingle();

    if (!event) return { ok: true };

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("company_id", event.company_id);
    
    const isMaster = (await supabaseAdmin.from("user_roles").select("id").eq("user_id", userId).eq("role", "master").maybeSingle()).data !== null;
    const isAdmin = roles?.some((r) => r.role === "admin");

    if (!isMaster && !isAdmin && event.created_by !== userId) {
      throw new Error("Sem permissão para excluir este evento.");
    }

    const { error } = await supabaseAdmin.from("agenda_events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    return { ok: true };
  });

// ----------------------------------------------------------------------
// toggleTaskCompletion
// ----------------------------------------------------------------------
export const toggleTaskCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        eventId: z.string().uuid(),
        dateStr: z.string(), // e.g. "2026-06-25"
        completed: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    
    // Check if user has access to this event
    const { data: parts } = await supabaseAdmin
      .from("agenda_event_participants")
      .select("id")
      .eq("event_id", data.eventId)
      .eq("user_id", userId)
      .maybeSingle();

    const { data: ev } = await supabaseAdmin
      .from("agenda_events")
      .select("created_by, company_id")
      .eq("id", data.eventId)
      .maybeSingle();
      
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("company_id", ev?.company_id);

    const isMaster = (await supabaseAdmin.from("user_roles").select("id").eq("user_id", userId).eq("role", "master").maybeSingle()).data !== null;
    const isAdmin = roles?.some((r) => r.role === "admin");

    if (!parts && ev?.created_by !== userId && !isAdmin && !isMaster) {
      throw new Error("Sem permissão para alterar o status desta tarefa.");
    }

    if (data.completed) {
      await supabaseAdmin.from("agenda_task_completions").upsert({
        event_id: data.eventId,
        completed_date: data.dateStr,
        completed_by: userId,
      }, { onConflict: "event_id, completed_date" });
    } else {
      await supabaseAdmin
        .from("agenda_task_completions")
        .delete()
        .eq("event_id", data.eventId)
        .eq("completed_date", data.dateStr);
    }

    return { ok: true };
  });
