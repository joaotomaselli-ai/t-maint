import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isPast, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useAgendaEvents } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { useAccess } from "@/hooks/use-access";
import { RRule, rrulestr } from "rrule";
import type { AgendaEvent } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AgendaForm } from "./AgendaForm";

export function AgendaWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { events, isLoading, toggleCompletion } = useAgendaEvents();
  const { user } = useAuth();
  const { isAdmin, isMaster } = useAccess();

  // Expande eventos da agenda com suporte a recorrência para a visualização mensal e tarefas pendentes
  const { calendarDays, pendingTasks } = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const today = new Date();
    today.setHours(0,0,0,0);

    const calendarMap = new Map<string, { date: Date; events: AgendaEvent[]; isCurrentMonth: boolean }>();
    
    days.forEach(d => {
      calendarMap.set(format(d, "yyyy-MM-dd"), {
        date: d,
        events: [],
        isCurrentMonth: isSameMonth(d, currentDate),
      });
    });

    const pendingList: Array<{ event: AgendaEvent; instanceDate: Date; overdue: boolean }> = [];

    // Process events
    events.forEach(ev => {
      // Basic dates
      const evStart = ev.startDate ? new Date(ev.startDate) : null;
      
      let instances: Date[] = [];
      if (ev.recurrenceRule && evStart) {
        try {
          const rule = rrulestr(ev.recurrenceRule);
          
          if (ev.eventType === "task") {
            // Find instances from the beginning of the event until today + 30 days
            const ruleInstances = rule.between(new Date(Math.min(evStart.getTime(), new Date(2020,0,1).getTime())), new Date(today.getTime() + 30 * 86400000), true);
            instances = ruleInstances;
          } else {
             // Just for this calendar view
             instances = rule.between(startDate, endDate, true);
          }
        } catch (e) {
          console.error("Invalid rrule", ev.recurrenceRule);
          if (evStart) instances = [evStart];
        }
      } else if (evStart) {
        instances = [evStart];
      }

      // Distribute instances to calendar map
      instances.forEach(inst => {
        const dateStr = format(inst, "yyyy-MM-dd");
        if (calendarMap.has(dateStr)) {
          calendarMap.get(dateStr)!.events.push(ev);
        }

        // Check if it's a pending task
        if (ev.eventType === "task") {
          // If this instance date is not in completions, it's pending
          if (!ev.completions.includes(dateStr)) {
            const instDateZero = new Date(inst);
            instDateZero.setHours(0,0,0,0);
            
            const isOverdue = instDateZero < today;
            const isCurrentViewMonth = isSameMonth(instDateZero, currentDate);
            
            // Show overdue always. Show future only if they belong to the currently viewed month.
            if (isOverdue || isCurrentViewMonth) {
              pendingList.push({ event: ev, instanceDate: instDateZero, overdue: isOverdue });
            }
          }
        }
      });
    });

    // Sort pending list: overdue first, then by date
    pendingList.sort((a, b) => {
      if (a.overdue && !b.overdue) return -1;
      if (!a.overdue && b.overdue) return 1;
      return a.instanceDate.getTime() - b.instanceDate.getTime();
    });

    return { 
      calendarDays: Array.from(calendarMap.values()),
      pendingTasks: pendingList
    };
  }, [currentDate, events]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (ev: AgendaEvent) => {
    setEditingEvent(ev);
    setIsFormOpen(true);
  };

  const markTask = (eventId: string, dateStr: string, completed: boolean) => {
    toggleCompletion.mutate({ eventId, dateStr, completed });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Esquerda: Calendário (60% / 2 cols) */}
      <Card className="lg:col-span-2 shadow-sm border-muted">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-md">
              <CalendarIcon className="h-5 w-5 text-blue-700" />
            </div>
            <CardTitle>Agenda & Compromissos</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 font-medium capitalize bg-muted/50 rounded-lg p-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="w-32 text-center text-sm">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <Button size="sm" onClick={() => { setSelectedDate(new Date()); setEditingEvent(null); setIsFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Novo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {calendarDays.map((day, idx) => (
              <div 
                key={day.date.toISOString()} 
                className={cn(
                  "min-h-[110px] p-1.5 border-r border-b relative cursor-pointer hover:bg-muted/50 transition-colors",
                  !day.isCurrentMonth && "bg-muted/10 opacity-60",
                  isToday(day.date) && "bg-blue-50/40"
                )}
                onClick={() => handleDayClick(day.date)}
              >
                <div className="flex justify-end mb-1">
                  <span className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors", 
                    isToday(day.date) ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
                  )}>
                    {format(day.date, "d")}
                  </span>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[75px] no-scrollbar">
                  {day.events.slice(0, 4).map((ev, i) => {
                    const isTask = ev.eventType === "task";
                    const completed = isTask && ev.completions.includes(format(day.date, "yyyy-MM-dd"));
                    return (
                      <div 
                        key={`${ev.id}-${i}`} 
                        onClick={(e) => { e.stopPropagation(); handleEditEvent(ev); }}
                        className={cn(
                          "text-[10px] truncate px-1.5 py-0.5 rounded-sm border shadow-sm transition-all hover:brightness-95 cursor-pointer flex items-center gap-1",
                          isTask ? (completed ? "bg-green-50 border-green-200 text-green-700 line-through opacity-70" : "bg-orange-50 border-orange-200 text-orange-800 font-medium") 
                                 : "bg-blue-50 border-blue-200 text-blue-800 font-medium"
                        )}
                        title={ev.title}
                      >
                        {isTask && !completed && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />}
                        {isTask && completed && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                        <span className="truncate">{ev.title}</span>
                      </div>
                    );
                  })}
                  {day.events.length > 4 && (
                    <div className="text-[10px] text-muted-foreground px-1 font-medium hover:text-foreground">+{day.events.length - 4} mais</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Direita: Tarefas Pendentes (40% / 1 col) */}
      <Card className="flex flex-col h-full max-h-[650px] shadow-sm border-muted">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-md">
               <CheckCircle2 className="h-5 w-5 text-orange-700" />
            </div>
            Tarefas Pendentes
          </CardTitle>
          <CardDescription>
            {isAdmin || isMaster ? "Tarefas não concluídas da equipe" : "Suas tarefas a fazer"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto flex-1 no-scrollbar">
          {pendingTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 opacity-40" />
              </div>
              <p className="font-medium text-foreground">Tudo limpo!</p>
              <p className="text-sm">Nenhuma tarefa pendente no momento.</p>
            </div>
          ) : (
            <div className="divide-y">
              {pendingTasks.map((pt, i) => {
                const dateStr = format(pt.instanceDate, "yyyy-MM-dd");
                const todayZero = new Date();
                todayZero.setHours(0,0,0,0);
                const isFuture = pt.instanceDate > todayZero;

                return (
                  <div key={`${pt.event.id}-${dateStr}`} className={cn("p-4 flex gap-3 hover:bg-muted/30 transition-colors group", pt.overdue && "bg-red-50/40")}>
                    <button 
                      className={cn("mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
                        isFuture 
                          ? "border-muted-foreground/20 cursor-not-allowed bg-muted/50" 
                          : "border-muted-foreground/30 hover:border-green-500 hover:bg-green-50 hover:text-green-600"
                      )}
                      onClick={() => !isFuture && markTask(pt.event.id, dateStr, true)}
                      title={isFuture ? "Não é possível concluir tarefas futuras" : "Marcar como concluída"}
                      disabled={isFuture}
                    >
                      <CheckCircle2 className={cn("h-3.5 w-3.5", isFuture ? "text-muted-foreground/30" : "opacity-0 group-hover:opacity-100")} />
                    </button>
                    <div className="flex-1 min-w-0" onClick={() => handleEditEvent(pt.event)}>
                      <h4 className={cn("text-sm font-semibold truncate cursor-pointer hover:underline transition-colors", pt.overdue ? "text-red-700" : "text-foreground")}>
                        {pt.event.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        {pt.overdue ? (
                          <span className="flex items-center gap-1 text-red-600 font-medium bg-red-100/50 px-1.5 py-0.5 rounded-sm">
                            <AlertCircle className="h-3 w-3" /> Atrasada ({format(pt.instanceDate, "dd/MM")})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-medium bg-muted px-1.5 py-0.5 rounded-sm">
                            <Clock className="h-3 w-3" /> {format(pt.instanceDate, "dd/MM")}
                          </span>
                        )}
                        {pt.event.recurrenceRule && <span className="font-medium text-orange-600/80">• Recorrente</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <AgendaForm 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
          event={editingEvent} 
          defaultDate={selectedDate}
        />
      )}
    </div>
  );
}
