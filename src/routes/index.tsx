import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients, useReports, useTechnicians, useAllSessions, useAllActivityTechnicians } from "@/hooks/use-data";
import { reportTotalsWithSessions, technicianPayForReport, fmtHours, type ServiceReport } from "@/lib/api";
import { useOSStatus, type ServiceReportStatus, type ServiceReportPriority } from "@/hooks/use-os-status";
import { useMoney } from "@/hooks/use-money-visibility";
import { useAccess } from "@/hooks/use-access";
import { useAuth } from "@/hooks/use-auth";
import { MasterPanel } from "@/components/MasterPanel";
import { Wrench, Users, Clock, DollarSign, Plus, TrendingUp, Loader2, Search, ArrowLeft, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AgendaWidget } from "@/components/agenda/AgendaWidget";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const { isLoading, isMaster } = useAccess();
  if (isLoading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (isMaster) return <MasterPanel />;
  return <CompanyDashboard />;
}

function CompanyDashboard() {
  const { clients } = useClients();
  const { reports } = useReports();
  const { technicians } = useTechnicians();
  const { sessions } = useAllSessions();
  const { activityTechnicians } = useAllActivityTechnicians();
  const { getStatus, getPriority, updateStatus } = useOSStatus();
  const money = useMoney();
  const { isTechnician, isAdmin, planType } = useAccess();
  const { user } = useAuth();
  
  const [viewMode, setViewMode] = useState<"standard" | "pending_queue">("standard");

  const myTechId = useMemo(() => technicians.find(t => t.userId === user?.id)?.id, [technicians, user?.id]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = format(now, "MMMM 'de' yyyy", { locale: ptBR });

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
  const monthReports = reports.filter(r => {
    const d = new Date(r.date + "T00:00:00");
    return d >= monthStart && d < monthEnd;
  });

  const pendingReports = useMemo(() => {
    return reports.filter(r => getStatus(r.id) !== "fechada");
  }, [reports, getStatus]);

  const stats = monthReports.reduce((acc, r) => {
    const sess = sessions.filter(s => s.activityId === r.id);
    const acts = activityTechnicians.filter(a => a.activityId === r.id);
    const c = clientMap.get(r.clientId);
    const t = !isAdmin
      ? technicianPayForReport(r, sess, technicians.find(tc => tc.id === myTechId), acts)
      : reportTotalsWithSessions(r, sess, c);
    acc.hours += t.totalHours;
    acc.value += t.total;
    acc.km += "km" in t ? (t as any).km : (r.km || 0);
    return acc;
  }, { hours: 0, value: 0, km: 0 });

  const recent = [...monthReports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  if (viewMode === "pending_queue") {
    return <PendingQueueView onBack={() => setViewMode("standard")} />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
          <p className="text-muted-foreground mt-1 capitalize">Resumo de {monthLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={pendingReports.length > 0 ? "default" : "outline"}
            size="lg"
            className="gap-2 font-semibold shadow-sm"
            onClick={() => setViewMode("pending_queue")}
          >
            <Clock className="h-4 w-4" /> Fila de Ordens Pendentes
            {pendingReports.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-black bg-amber-500 text-slate-950 rounded-full">
                {pendingReports.length}
              </span>
            )}
          </Button>

          <Link to="/atividades">
            <Button size="lg" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Nova OS
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wrench} label="Atendimentos no mês" value={String(monthReports.length)} accent="primary" />
        {isAdmin && <StatCard icon={Users} label="Clientes" value={String(clients.length)} accent="accent" />}
        <StatCard icon={Clock} label="Horas no mês" value={fmtHours(stats.hours)} accent="warning" />
        <StatCard icon={DollarSign} label={!isAdmin ? "Ganhos do mês" : "Faturamento do mês"} value={money(stats.value)} accent="success" />
      </div>

      {planType === "basic" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> OS Recentes do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma OS recente encontrada no mês.</p> : (
              <div className="space-y-4">
                {recent.map(r => (
                  <div key={r.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">OS #{r.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{clientMap.get(r.clientId)?.name ?? 'Desconhecido'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <AgendaWidget />
      )}
    </div>
  );
}

function PendingQueueView({ onBack }: { onBack: () => void }) {
  const { clients } = useClients();
  const { reports } = useReports();
  const { getStatus, getPriority, updateStatus } = useOSStatus();
  const [search, setSearch] = useState("");

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);

  // Filter open & pending orders (excluding "fechada")
  const pendingReports = useMemo(() => {
    return reports
      .filter(r => getStatus(r.id) !== "fechada")
      .filter(r => {
        if (!search) return true;
        const s = search.toLowerCase();
        const c = clientMap.get(r.clientId);
        return (
          r.orderNumber.toLowerCase().includes(s) ||
          r.machine.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s) ||
          (r.requester && r.requester.toLowerCase().includes(s)) ||
          (c && c.name.toLowerCase().includes(s))
        );
      })
      // Organized chronologically from OLDEST to NEWEST (mais velhas primeiro)
      .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  }, [reports, getStatus, search, clientMap]);

  const priorityCounts = useMemo(() => {
    const counts = { urgente: 0, alta: 0, normal: 0, baixa: 0 };
    for (const r of reports.filter(r => getStatus(r.id) !== "fechada")) {
      const p = getPriority(r.id);
      counts[p] = (counts[p] || 0) + 1;
    }
    return counts;
  }, [reports, getStatus, getPriority]);

  const markClosed = (r: ServiceReport) => {
    updateStatus.mutate({ activityId: r.id, status: "fechada" });
    toast.success(`OS #${r.orderNumber || r.id} marcada como fechada!`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao Painel Geral
            </Button>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Fila de Atendimentos Pendentes
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-3">Ordens de Serviço Pendentes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organizadas das mais antigas para as mais recentes. Alertas visuais por prioridade.
          </p>
        </div>
      </header>

      {/* Priority Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-l-4 border-l-slate-500">
          <CardContent className="p-3.5">
            <p className="text-xs text-muted-foreground font-semibold">Total Pendentes</p>
            <p className="text-2xl font-black mt-0.5">{pendingReports.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 bg-red-500/10 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardContent className="p-3.5">
            <p className="text-xs text-red-700 dark:text-red-400 font-bold">🔴 Urgentes</p>
            <p className="text-2xl font-black text-red-700 dark:text-red-300 mt-0.5">{priorityCounts.urgente}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
          <CardContent className="p-3.5">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">🟠 Alta Prioridade</p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-0.5">{priorityCounts.alta}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 bg-blue-500/10 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-3.5">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-bold">🔵 Normais</p>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-0.5">{priorityCounts.normal}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-400 bg-slate-500/10 dark:bg-slate-900/20">
          <CardContent className="p-3.5">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">⚪ Baixas</p>
            <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-0.5">{priorityCounts.baixa}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por número de OS, cliente, máquina ou solicitante..."
          className="pl-10 h-11"
        />
      </div>

      {/* Pending OS Cards List */}
      {pendingReports.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-foreground">Nenhuma ordem de serviço pendente!</h3>
          <p className="text-sm mt-1">Todas as ordens de serviço estão concluídas e fechadas.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingReports.map(r => {
            const client = clientMap.get(r.clientId);
            const status = getStatus(r.id);
            const priority = getPriority(r.id);

            const priorityStyles = {
              urgente: "border-l-[10px] border-l-red-500 bg-gradient-to-r from-red-50/80 to-background dark:from-red-950/30 dark:to-background border-red-200 dark:border-red-900 shadow-md",
              alta: "border-l-[10px] border-l-amber-500 bg-gradient-to-r from-amber-50/80 to-background dark:from-amber-950/30 dark:to-background border-amber-200 dark:border-amber-900 shadow-sm",
              normal: "border-l-[8px] border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-background dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-900",
              baixa: "border-l-[6px] border-l-slate-400 bg-gradient-to-r from-slate-50/50 to-background dark:from-slate-900/20 dark:to-background border-slate-200 dark:border-slate-800",
            }[priority];

            return (
              <Card key={r.id} className={`transition-all duration-200 ${priorityStyles}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* OS Information */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-muted px-2.5 py-1 rounded-md border">
                          OS #{r.orderNumber || "—"}
                        </span>
                        
                        {/* Status Dropdown */}
                        <Select
                          value={status}
                          onValueChange={(val) => updateStatus.mutate({ activityId: r.id, status: val as ServiceReportStatus })}
                        >
                          <SelectTrigger className={`h-7 text-xs px-3 font-semibold rounded-full border gap-1.5 ${
                            status === "aguardando"
                              ? "bg-amber-500 text-white border-amber-600"
                              : "bg-blue-600 text-white border-blue-700"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aguardando">⏳ Aguardando atendimento</SelectItem>
                            <SelectItem value="iniciada">🚀 Iniciada / Em Atendimento</SelectItem>
                            <SelectItem value="fechada">✅ Fechada (Concluir)</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Priority Selector (Visual Alert Color) */}
                        <Select
                          value={priority}
                          onValueChange={(val) => updateStatus.mutate({ activityId: r.id, priority: val as ServiceReportPriority })}
                        >
                          <SelectTrigger className={`h-7 text-xs px-3 font-bold rounded-full border gap-1.5 ${
                            priority === "urgente"
                              ? "bg-red-600 text-white border-red-700"
                              : priority === "alta"
                              ? "bg-amber-600 text-white border-amber-700"
                              : priority === "normal"
                              ? "bg-blue-600/90 text-white border-blue-700"
                              : "bg-slate-500 text-white border-slate-600"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgente">🔴 Prioridade Urgente</SelectItem>
                            <SelectItem value="alta">🟠 Prioridade Alta</SelectItem>
                            <SelectItem value="normal">🔵 Prioridade Normal</SelectItem>
                            <SelectItem value="baixa">⚪ Prioridade Baixa</SelectItem>
                          </SelectContent>
                        </Select>

                        <span className="text-xs text-muted-foreground ml-auto md:ml-0 font-medium">
                          Data da OS: {format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}
                        </span>
                      </div>

                      <div className="pt-1">
                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                          {client?.name || "Cliente não identificado"}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">
                          <b className="text-foreground">Máquina:</b> {r.machine} {r.requester && `· Solicitante: ${r.requester}`}
                        </p>
                        {r.description && (
                          <p className="text-sm mt-2 text-foreground/90 bg-background/80 p-2.5 rounded-md border line-clamp-3">
                            {r.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-5 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 w-full sm:w-auto"
                        onClick={() => markClosed(r)}
                      >
                        <Check className="h-4 w-4" /> Concluir & Fechar OS
                      </Button>

                      <Link to="/atividades" className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                          Ver na Aba OS
                        </Button>
                      </Link>
                    </div>

                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent: "primary" | "accent" | "warning" | "success" }) {
  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent text-accent-foreground",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/10 text-success",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`h-10 w-10 rounded-lg grid place-items-center mb-3 ${colors[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}
