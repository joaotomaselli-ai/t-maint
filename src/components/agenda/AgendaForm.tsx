import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useAgendaEvents, useAllActivityTechnicians, useTechnicians } from "@/hooks/use-data";
import { useAccess } from "@/hooks/use-access";
import { useAuth } from "@/hooks/use-auth";
import { format, addHours } from "date-fns";
import type { AgendaEvent } from "@/lib/api";
import { Trash2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { RRule, rrulestr } from "rrule";

export function AgendaForm({ 
  open, 
  onOpenChange, 
  event,
  defaultDate
}: { 
  open: boolean; 
  onOpenChange: (o: boolean) => void; 
  event: AgendaEvent | null;
  defaultDate: Date | null;
}) {
  const { addEvent, updateEvent, deleteEvent } = useAgendaEvents();
  const { technicians } = useTechnicians();
  const { user } = useAuth();
  const { isAdmin, isMaster } = useAccess();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"task"|"appointment">("task");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [recurrence, setRecurrence] = useState("none");
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form
  useEffect(() => {
    if (open) {
      if (event) {
        setTitle(event.title);
        setDescription(event.description);
        setEventType(event.eventType);
        setIsAllDay(event.isAllDay);
        
        if (event.startDate) {
          const d = new Date(event.startDate);
          setStartDate(format(d, "yyyy-MM-dd"));
          setStartTime(format(d, "HH:mm"));
        } else {
          setStartDate(""); setStartTime("");
        }

        if (event.endDate) {
          const d = new Date(event.endDate);
          setEndDate(format(d, "yyyy-MM-dd"));
          setEndTime(format(d, "HH:mm"));
        } else {
          setEndDate(""); setEndTime("");
        }

        if (event.recurrenceRule) {
          try {
            const rule = rrulestr(event.recurrenceRule);
            if (rule.options.freq === RRule.DAILY) setRecurrence("daily");
            else if (rule.options.freq === RRule.WEEKLY) {
              setRecurrence("weekly");
              if (rule.options.byweekday) {
                const map = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
                setWeekDays(rule.options.byweekday.map(n => typeof n === "number" ? map[n] : map[n.weekday]));
              }
            }
            else if (rule.options.freq === RRule.MONTHLY) setRecurrence("monthly");
            else setRecurrence("none");
          } catch {
            setRecurrence("none");
          }
        } else {
          setRecurrence("none");
        }

        setParticipants(event.participants);
      } else {
        setTitle("");
        setDescription("");
        setEventType("task");
        setIsAllDay(false);
        const d = defaultDate || new Date();
        setStartDate(format(d, "yyyy-MM-dd"));
        setStartTime(format(d, "HH:mm"));
        setEndDate(format(d, "yyyy-MM-dd"));
        setEndTime(format(addHours(d, 1), "HH:mm"));
        setRecurrence("none");
        if (user) setParticipants([user.id]);
      }
    }
  }, [open, event, defaultDate, user]);

  const toggleParticipant = (uid: string) => {
    setParticipants(p => p.includes(uid) ? p.filter(x => x !== uid) : [...p, uid]);
  };

  const handleSave = () => {
    if (!title) return toast.error("Preencha o título");
    setIsSaving(true);

    let startIso: string | null = null;
    let endIso: string | null = null;

    if (startDate) {
      startIso = isAllDay ? new Date(`${startDate}T00:00:00`).toISOString() : new Date(`${startDate}T${startTime || "00:00"}:00`).toISOString();
    }
    if (endDate && eventType === "appointment") {
      endIso = isAllDay ? new Date(`${endDate}T23:59:59`).toISOString() : new Date(`${endDate}T${endTime || "23:59"}:00`).toISOString();
    }

    let ruleStr: string | null = null;
    if (recurrence !== "none" && startDate) {
      const parts = startDate.split("-").map(Number);
      const timeParts = isAllDay ? [0, 0] : (startTime || "00:00").split(":").map(Number);
      const dtstartUtc = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], timeParts[0], timeParts[1]));

      const rule = new RRule({
        freq: recurrence === "daily" ? RRule.DAILY : recurrence === "weekly" ? RRule.WEEKLY : RRule.MONTHLY,
        dtstart: dtstartUtc,
        byweekday: recurrence === "weekly" && weekDays.length > 0 ? weekDays.map(w => (RRule as any)[w]) : undefined,
      });
      ruleStr = rule.toString();
    }

    const payload = {
      title,
      description,
      eventType,
      startDate: startIso,
      endDate: endIso,
      isAllDay,
      recurrenceRule: ruleStr,
      participants
    };

    if (event) {
      updateEvent.mutate(
        { id: event.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Evento atualizado!");
            onOpenChange(false);
            setIsSaving(false);
          },
          onError: (e) => {
            toast.error(e.message);
            setIsSaving(false);
          }
        }
      );
    } else {
      addEvent.mutate(
        payload,
        {
          onSuccess: () => {
            toast.success("Criado com sucesso!");
            onOpenChange(false);
            setIsSaving(false);
          },
          onError: (e) => {
            toast.error(e.message);
            setIsSaving(false);
          }
        }
      );
    }
  };

  const handleDelete = () => {
    if (!event) return;
    if (!confirm("Tem certeza que deseja excluir?")) return;
    deleteEvent.mutate(event.id, {
      onSuccess: () => {
        toast.success("Excluído!");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{event ? "Editar" : "Novo"} Evento</DialogTitle>
          <DialogDescription>Agende uma tarefa ou compromisso.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 overflow-y-auto px-1">
          <div className="flex gap-4">
            <div className="flex-1 grid gap-2">
              <Label>Título</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} autoFocus />
            </div>
            <div className="w-32 grid gap-2">
              <Label>Tipo</Label>
              <Select value={eventType} onValueChange={(v: "task"|"appointment") => setEventType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Tarefa</SelectItem>
                  <SelectItem value="appointment">Compromisso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="allday" checked={isAllDay} onCheckedChange={(c) => setIsAllDay(!!c)} />
            <Label htmlFor="allday" className="cursor-pointer">O dia todo</Label>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Início</Label>
              <div className="flex gap-2">
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1" />
                {!isAllDay && <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-24 shrink-0" />}
              </div>
            </div>
            {eventType === "appointment" && (
              <div className="grid gap-2">
                <Label>Fim</Label>
                <div className="flex gap-2">
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1" />
                  {!isAllDay && <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-24 shrink-0" />}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Recorrência</Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não se repete</SelectItem>
                <SelectItem value="daily">Diariamente</SelectItem>
                <SelectItem value="weekly">Semanalmente</SelectItem>
                <SelectItem value="monthly">Mensalmente</SelectItem>
              </SelectContent>
            </Select>
            {recurrence === "weekly" && (
              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  { id: "MO", label: "S" },
                  { id: "TU", label: "T" },
                  { id: "WE", label: "Q" },
                  { id: "TH", label: "Q" },
                  { id: "FR", label: "S" },
                  { id: "SA", label: "S" },
                  { id: "SU", label: "D" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setWeekDays(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id])}
                    className={`w-8 h-8 rounded-full text-xs font-medium border flex items-center justify-center transition-colors ${
                      weekDays.includes(d.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {(isAdmin || isMaster) && (
            <div className="grid gap-2 border-t pt-4 mt-2">
              <Label className="flex items-center gap-2"><Users className="h-4 w-4" /> Delegar para:</Label>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
                {technicians.filter(t => t.userId).map(t => (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded">
                    <Checkbox checked={participants.includes(t.userId!)} onCheckedChange={() => toggleParticipant(t.userId!)} />
                    <span className="text-sm font-medium">{t.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          {event ? (
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isSaving}>
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !title}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
