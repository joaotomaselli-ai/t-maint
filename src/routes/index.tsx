import { Skeleton } from "@/components/ui/skeleton";
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
import { 
  Wrench, 
  Users, 
  Clock, 
  DollarSign, 
  Plus, 
  TrendingUp, 
  Loader2, 
  Search, 
  ArrowLeft, 
  Check, 
  Eye, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Share2, 
  FileText, 
  Calculator,
  Compass
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientPortalDashboard } from "@/components/ClientPortalDashboard";
import { AgendaWidget } from "@/components/agenda/AgendaWidget";
import { CockpitAnalytics } from "@/components/dashboard/CockpitAnalytics";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const { isLoading, isMaster, isClient } = useAccess();
  if (isLoading) {
    return <CockpitDashboardSkeleton />;
  }
  if (isMaster) return <MasterPanel />;
  if (isClient) return <ClientPortalDashboard />;
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

  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const monthEnd = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }, []);

  const monthLabel = useMemo(() => {
    return format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });
  }, []);

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
  
  const monthReports = useMemo(() => {
    return reports.filter(r => {
      if (!r.date) return false;
      const d = new Date(r.date + "T00:00:00");
      return d >= monthStart && d < monthEnd;
    });
  }, [reports, monthStart, monthEnd]);

  const pendingReports = useMemo(() => {
    return reports.filter(r => getStatus(r.id) !== "fechada");
  }, [reports, getStatus]);

  const stats = useMemo(() => {
    return monthReports.reduce((acc, r) => {
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
  }, [monthReports, sessions, activityTechnicians, clientMap, isAdmin, myTechId, technicians]);

  // 6-month historical calculations for productivity graph (Real DB aggregation)
  const monthlyHistory = useMemo(() => {
    const result: { month: string; hours: number; orders: number }[] = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const rawMonth = format(d, "MMM", { locale: ptBR }).replace(".", "");
      const formattedMonth = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

      const inMonthReports = reports.filter((r) => {
        if (!r.date) return false;
        const rDate = new Date(r.date + "T00:00:00");
        return rDate >= mStart && rDate < mEnd;
      });

      let totalMonthHours = 0;
      for (const r of inMonthReports) {
        const sess = sessions.filter((s) => s.activityId === r.id);
        const acts = activityTechnicians.filter((a) => a.activityId === r.id);
        const c = clientMap.get(r.clientId);
        const t = !isAdmin
          ? technicianPayForReport(r, sess, technicians.find((tc) => tc.id === myTechId), acts)
          : reportTotalsWithSessions(r, sess, c);
        totalMonthHours += t.totalHours;
      }

      result.push({
        month: formattedMonth,
        hours: Math.round(totalMonthHours * 10) / 10,
        orders: inMonthReports.length,
      });
    }

    return result;
  }, [reports, sessions, activityTechnicians, clientMap, isAdmin, myTechId, technicians]);

  // Machine / Demand distribution calculated directly from real database records
  const categoryBreakdown = useMemo(() => {
    if (reports.length === 0) return [];

    const counts: Record<string, number> = {};
    for (const r of reports) {
      const rawMachine = (r.machine || "").trim();
      const machineName = rawMachine || (r.type === "preventiva" ? "Preventiva Periódica" : "Manutenção Mecânica / Elétrica");
      counts[machineName] = (counts[machineName] || 0) + 1;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const totalCount = reports.length;
    const colors = ["#06b6d4", "#38bdf8", "#f59e0b", "#a855f7", "#10b981", "#ec4899"];

    if (sorted.length <= 4) {
      return sorted.map(([name, count], idx) => ({
        name,
        count: Math.round((count / totalCount) * 100),
        color: colors[idx % colors.length],
      }));
    }

    const top4 = sorted.slice(0, 4);
    const othersCount = sorted.slice(4).reduce((sum, [, c]) => sum + c, 0);

    const result = top4.map(([name, count], idx) => ({
      name,
      count: Math.round((count / totalCount) * 100),
      color: colors[idx % colors.length],
    }));

    if (othersCount > 0) {
      result.push({
        name: "Outras Máquinas",
        count: Math.round((othersCount / totalCount) * 100),
        color: "#94a3b8",
      });
    }

    return result;
  }, [reports]);

  const recent = useMemo(() => {
    return [...monthReports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  }, [monthReports]);

  if (viewMode === "pending_queue") {
    return <PendingQueueView onBack={() => setViewMode("standard")} />;
  }

  return (
    <div className="space-y-8 font-sans">
      {/* COCKPIT HEADER & QUICK ACTIONS */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              COCKPIT OPERACIONAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Painel de Controle
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 capitalize">
            Resumo consolidado • {monthLabel}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("pending_queue")}
            className="gap-2 bg-card hover:bg-accent border-border hover:border-amber-500/50 text-foreground py-2 px-3.5 rounded-xl transition-all shadow-sm"
          >
            <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>Fila Pendente</span>
            {pendingReports.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-md">
                {pendingReports.length}
              </span>
            )}
          </Button>

          <Link to="/orcamentos">
            <Button 
              size="sm" 
              variant="outline"
              className="gap-1.5 bg-card hover:bg-accent border-border hover:border-cyan-500/50 text-foreground py-2 px-3.5 rounded-xl transition-all shadow-sm"
            >
              <Calculator className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> + Orçamento
            </Button>
          </Link>

          <Link to="/atividades">
            <Button 
              size="sm" 
              className="gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 px-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
            >
              <Plus className="h-4 w-4 font-bold" /> + Nova O.S.
            </Button>
          </Link>
        </div>
      </header>

      {/* TELEMETRY KPI STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Atendimentos no Mês */}
        <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm dark:shadow-md flex flex-col justify-between hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Atendimentos no Mês</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono">{monthReports.length}</div>
            <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-1 flex items-center gap-1">
              <span>{pendingReports.length} em aberto / andamento</span>
            </div>
          </div>
        </div>

        {/* Clientes Atendidos */}
        <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm dark:shadow-md flex flex-col justify-between hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">{isAdmin ? "Indústrias / Clientes" : "Técnico Responsável"}</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground font-mono">
              {isAdmin ? clients.length : "Ativo"}
            </div>
            <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-1 truncate">
              {isAdmin ? "Parque de Máquinas Cadastrado" : user?.email}
            </div>
          </div>
        </div>

        {/* Horas Técnicas no Mês */}
        <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm dark:shadow-md flex flex-col justify-between hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Horas em Campo</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{fmtHours(stats.hours)}</div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1 flex items-center gap-2">
              <span>Deslocamento: <strong className="text-foreground">{stats.km} km</strong></span>
            </div>
          </div>
        </div>

        {/* Faturamento / Ganhos do Mês */}
        <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm dark:shadow-md flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">{!isAdmin ? "Ganhos do Mês" : "Faturamento Total"}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{money(stats.value)}</div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Serviços + Peças + KM
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION (GRÁFICOS ANALÍTICOS ADAPTATIVOS AO TEMA) */}
      <CockpitAnalytics 
        monthlyHistory={monthlyHistory}
        categoryBreakdown={categoryBreakdown}
        totalHoursMonth={stats.hours} 
        totalOrdersMonth={monthReports.length} 
      />

      {/* AGENDA OU OS RECENTES */}
      {planType === "basic" ? (
        <Card className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground font-mono text-sm">
              <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> OS Recentes do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 font-mono text-xs">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma OS recente encontrada no mês.</p>
            ) : (
              <div className="space-y-3">
                {recent.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="font-bold text-foreground">OS #{r.orderNumber}</p>
                      <p className="text-[11px] text-muted-foreground">{clientMap.get(r.clientId)?.name ?? 'Desconhecido'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground/80">{format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}</p>
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
  const { isAdmin, isMaster } = useAccess();
  const canManagePriority = isAdmin || isMaster;
  const canCloseOS = isAdmin || isMaster;
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<ServiceReport | null>(null);

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);

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

  const markClosed = (r: ServiceReport, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!canCloseOS) {
      toast.error("Somente administradores podem fechar a Ordem de Serviço.");
      return;
    }
    updateStatus.mutate({ activityId: r.id, status: "fechada" });
    toast.success(`OS #${r.orderNumber || r.id} fechada com sucesso!`);
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2 text-xs bg-card border-border text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
          </Button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Fila de Atendimento Pendente
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                {pendingReports.length} {pendingReports.length === 1 ? "OS" : "OSs"}
              </span>
            </h1>
          </div>
        </div>

        {/* Priority Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/30">
            🔴 Urgentes: {priorityCounts.urgente}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
            🟠 Altas: {priorityCounts.alta}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30">
            🔵 Normais: {priorityCounts.normal}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            ⚪ Baixas: {priorityCounts.baixa}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Buscar por número da OS, cliente, máquina ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border text-foreground font-sans text-xs h-10 rounded-xl"
        />
      </div>

      {/* Pending List */}
      {pendingReports.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <p className="font-bold text-foreground">Tudo em dia!</p>
          <p className="text-xs mt-1">Nenhuma Ordem de Serviço pendente encontrada no momento.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {pendingReports.map((r) => {
            const priority = getPriority(r.id);
            const client = clientMap.get(r.clientId);

            const borderColors = {
              urgente: "border-l-red-500 bg-red-500/5 hover:bg-red-500/10",
              alta: "border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10",
              normal: "border-l-blue-500 hover:bg-muted/40",
              baixa: "border-l-slate-400 hover:bg-muted/40",
            }[priority];

            return (
              <div
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-xs cursor-pointer border-l-4 transition-colors ${borderColors}`}
              >
                <div className="flex flex-wrap items-center gap-2.5 min-w-0 flex-1">
                  <span className="font-mono text-xs font-extrabold bg-muted text-cyan-600 dark:text-cyan-400 px-2.5 py-1 rounded-lg border border-border shrink-0">
                    OS #{r.orderNumber || "—"}
                  </span>

                  <span className="text-muted-foreground shrink-0 font-medium">
                    {format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}
                  </span>

                  <span className="font-bold text-foreground truncate max-w-[220px]">
                    {client?.name || "Cliente não informado"}
                  </span>

                  <span className="text-muted-foreground truncate max-w-[240px]">
                    • {r.machine} {r.requester && `(${r.requester})`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Ver detalhes da OS"
                    onClick={() => setSelectedReport(r)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {canCloseOS && (
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg gap-1"
                      onClick={(e) => markClosed(r, e)}
                    >
                      <Check className="h-3.5 w-3.5" /> Fechar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CockpitDashboardSkeleton() {
  return (
    <div className="space-y-8 font-sans animate-fade-in-up">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-card border border-border p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="h-44 flex items-end justify-between gap-4 pt-4 px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className={`w-full max-w-[38px] rounded-lg ${['h-20', 'h-28', 'h-32', 'h-24', 'h-36', 'h-40'][i - 1]}`} />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
