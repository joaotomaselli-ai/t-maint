import { Skeleton } from "@/components/ui/skeleton";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients, useReports, useTechnicians, useAllSessions, useAllActivityTechnicians, useClientPayments } from "@/hooks/use-data";
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
  Compass,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientPortalDashboard } from "@/components/ClientPortalDashboard";
import { AgendaWidget } from "@/components/agenda/AgendaWidget";
import { CockpitAnalytics } from "@/components/dashboard/CockpitAnalytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const { payments: clientPayments } = useClientPayments();
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

  const sumStats = useCallback(
    (list: ServiceReport[]) =>
      list.reduce(
        (acc, r) => {
          const sess = sessions.filter((s) => s.activityId === r.id);
          const acts = activityTechnicians.filter((a) => a.activityId === r.id);
          const c = clientMap.get(r.clientId);
          const t = !isAdmin
            ? technicianPayForReport(r, sess, technicians.find((tc) => tc.id === myTechId), acts)
            : reportTotalsWithSessions(r, sess, c);
          acc.hours += t.totalHours;
          acc.value += t.total;
          acc.km += "km" in t ? (t as { km: number }).km : r.km || 0;
          return acc;
        },
        { hours: 0, value: 0, km: 0 },
      ),
    [sessions, activityTechnicians, clientMap, isAdmin, myTechId, technicians],
  );

  const prevMonthReports = useMemo(() => {
    const prevStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
    return reports.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date + "T00:00:00");
      return d >= prevStart && d < monthStart;
    });
  }, [reports, monthStart]);

  const stats = useMemo(() => sumStats(monthReports), [sumStats, monthReports]);
  const prevStats = useMemo(() => sumStats(prevMonthReports), [sumStats, prevMonthReports]);

  // Itens que exigem ação do gestor (todos derivados de dados reais).
  const actions = useMemo(() => {
    const open = reports.filter((r) => getStatus(r.id) !== "fechada");
    const critical = open
      .filter((r) => {
        const p = getPriority(r.id);
        return p === "urgente" || p === "alta";
      })
      .sort((x, y) => (getPriority(x.id) === "urgente" ? -1 : 0) - (getPriority(y.id) === "urgente" ? -1 : 0));
    const aging = open
      .filter((r) => r.date && daysSince(r.date) > 7)
      .sort((x, y) => x.date.localeCompare(y.date));
    const unsigned = reports.filter((r) => !r.clientSignature);
    const paid = new Set(clientPayments.map((p) => p.activityId));
    const receivable = reports.filter((r) => getStatus(r.id) === "fechada" && !paid.has(r.id));
    const receivableValue = receivable.reduce((sum, r) => {
      const sess = sessions.filter((s) => s.activityId === r.id);
      return sum + reportTotalsWithSessions(r, sess, clientMap.get(r.clientId)).total;
    }, 0);
    return { critical, aging, unsigned, receivable, receivableValue };
  }, [reports, getStatus, getPriority, clientPayments, sessions, clientMap]);

  const actionTotal =
    actions.critical.length + actions.aging.length + actions.unsigned.length + (isAdmin ? actions.receivable.length : 0);

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
    const toItem = ([name, count]: [string, number]) => ({
      name,
      count,
      percent: Math.round((count / totalCount) * 100),
    });

    if (sorted.length <= 5) return sorted.map(toItem);

    const result = sorted.slice(0, 4).map(toItem);
    const othersCount = sorted.slice(4).reduce((sum, [, c]) => sum + c, 0);
    if (othersCount > 0) result.push(toItem(["Outras máquinas", othersCount]));
    return result;
  }, [reports]);

  const recent = useMemo(() => {
    return [...monthReports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  }, [monthReports]);

  if (viewMode === "pending_queue") {
    return <PendingQueueView onBack={() => setViewMode("standard")} />;
  }

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">Painel</h1>
          <p className="mt-1 text-sm text-muted-foreground first-letter:uppercase">{monthLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setViewMode("pending_queue")} className="gap-2">
            <Clock aria-hidden="true" className="text-muted-foreground" />
            Fila pendente
            {pendingReports.length > 0 && (
              <span className="rounded bg-muted px-1.5 font-mono text-xs text-foreground">{pendingReports.length}</span>
            )}
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/orcamentos">
              <Calculator aria-hidden="true" className="text-muted-foreground" /> Novo orçamento
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/atividades">
              <Plus aria-hidden="true" /> Nova OS
            </Link>
          </Button>
        </div>
      </header>

      {/* PRECISA DE AÇÃO — o que o gestor resolve hoje */}
      <section aria-labelledby="acao-titulo" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="acao-titulo" className="text-sm font-medium text-foreground">
            Precisa de ação
          </h2>
          {actionTotal === 0 && <span className="text-sm text-success">Tudo em dia</span>}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ActionTile
            tone="critical"
            count={actions.critical.length}
            label="Urgentes ou alta prioridade"
            hint={actions.critical[0] ? `${clientMap.get(actions.critical[0].clientId)?.name ?? "Cliente"} · ${actions.critical[0].machine || "máquina não informada"}` : "Nenhuma OS crítica aberta"}
            onClick={() => setViewMode("pending_queue")}
          />
          <ActionTile
            tone="warning"
            count={actions.aging.length}
            label="Abertas há mais de 7 dias"
            hint={actions.aging[0] ? `Mais antiga: OS #${actions.aging[0].orderNumber} · ${daysSince(actions.aging[0].date)} dias` : "Nenhuma OS parada na fila"}
            onClick={() => setViewMode("pending_queue")}
          />
          <ActionTile
            tone="info"
            count={actions.unsigned.length}
            label="Sem assinatura do cliente"
            hint={actions.unsigned.length > 0 ? "Laudo sem aceite formal do cliente" : "Todos os laudos assinados"}
            to="/atividades"
          />
          {isAdmin && (
            <ActionTile
              tone="neutral"
              count={actions.receivable.length}
              label="Fechadas, a receber"
              hint={actions.receivable.length > 0 ? `${money(actions.receivableValue)} em aberto` : "Nada pendente de recebimento"}
              to="/financeiro"
            />
          )}
        </div>
      </section>

      {/* INDICADORES DO MÊS */}
      <section aria-labelledby="kpi-titulo" className="space-y-3">
        <h2 id="kpi-titulo" className="text-sm font-medium text-foreground">
          Indicadores do mês
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Atendimentos"
            value={String(monthReports.length)}
            delta={monthReports.length - prevMonthReports.length}
            deltaLabel={`${prevMonthReports.length} no mês anterior`}
          />
          <KpiCard
            label="Horas em campo"
            value={fmtHours(stats.hours)}
            delta={stats.hours - prevStats.hours}
            deltaFormat={(d) => fmtHours(Math.abs(d))}
            deltaLabel={`${fmtHours(prevStats.hours)} no mês anterior`}
          />
          <KpiCard
            label="Deslocamento"
            value={`${Math.round(stats.km)} km`}
            delta={stats.km - prevStats.km}
            deltaFormat={(d) => `${Math.round(Math.abs(d))} km`}
            deltaLabel={`${Math.round(prevStats.km)} km no mês anterior`}
            neutralDelta
          />
          <KpiCard
            label={isAdmin ? "Faturamento" : "Ganhos"}
            value={money(stats.value)}
            delta={stats.value - prevStats.value}
            deltaFormat={(d) => money(Math.abs(d))}
            deltaLabel={`${money(prevStats.value)} no mês anterior`}
          />
        </div>
      </section>

      {/* GRÁFICOS */}
      <CockpitAnalytics
        monthlyHistory={monthlyHistory}
        categoryBreakdown={categoryBreakdown}
        totalHoursMonth={stats.hours}
        totalOrdersMonth={monthReports.length}
      />

      {/* AGENDA OU OS RECENTES */}
      {planType === "basic" ? (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp aria-hidden="true" className="h-4 w-4 text-muted-foreground" /> OS recentes do mês
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Nenhuma OS registrada neste mês ainda.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted-foreground">OS #{r.orderNumber}</p>
                      <p className="truncate font-medium text-foreground">{clientMap.get(r.clientId)?.name ?? "Cliente não informado"}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : (
        <AgendaWidget />
      )}
    </div>
  );
}

function daysSince(date: string) {
  const d = new Date(date + "T00:00:00").getTime();
  return Math.max(0, Math.floor((Date.now() - d) / 86_400_000));
}

const TONES = {
  critical: { bar: "bg-destructive", text: "text-destructive" },
  warning: { bar: "bg-warning", text: "text-warning" },
  info: { bar: "bg-info", text: "text-info" },
  neutral: { bar: "bg-primary", text: "text-foreground" },
} as const;

function ActionTile({
  tone,
  count,
  label,
  hint,
  to,
  onClick,
}: {
  tone: keyof typeof TONES;
  count: number;
  label: string;
  hint: string;
  to?: string;
  onClick?: () => void;
}) {
  const active = count > 0;
  const t = TONES[tone];
  const body = (
    <>
      {/* Cor só aparece quando há algo a resolver (princípio ISA-101). */}
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1 rounded-l-lg", active ? t.bar : "bg-transparent")} />
      <div className="flex items-baseline gap-2">
        <span className={cn("font-mono text-2xl font-semibold", active ? t.text : "text-muted-foreground")}>{count}</span>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
    </>
  );
  const cls =
    "relative block w-full rounded-lg border border-border bg-card py-3.5 pl-5 pr-4 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  if (to) {
    return (
      <Link to={to} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  deltaFormat,
  neutralDelta,
}: {
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  deltaFormat?: (d: number) => string;
  neutralDelta?: boolean;
}) {
  const rounded = Math.round(delta * 100) / 100;
  const dir = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  const fmt = deltaFormat ?? ((d: number) => String(Math.abs(d)));
  const color = neutralDelta || dir === "flat" ? "text-muted-foreground" : dir === "up" ? "text-success" : "text-destructive";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1.5 truncate font-mono text-2xl font-semibold text-foreground sm:text-[28px]">{value}</div>
      <div className="mt-1 flex items-center gap-1 text-xs" title={deltaLabel}>
        {dir === "up" && <ArrowUpRight aria-hidden="true" className={cn("h-3.5 w-3.5", color)} />}
        {dir === "down" && <ArrowDownRight aria-hidden="true" className={cn("h-3.5 w-3.5", color)} />}
        <span className={color}>{dir === "flat" ? "Igual ao" : fmt(rounded)}</span>
        <span className="truncate text-muted-foreground">{dir === "flat" ? "mês anterior" : "vs. mês anterior"}</span>
      </div>
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
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2 text-xs bg-card border-border text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar ao painel
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              Fila pendente
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                {pendingReports.length} {pendingReports.length === 1 ? "OS" : "OSs"}
              </span>
            </h1>
          </div>
        </div>

        {/* Priority Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/30">
            Urgentes: {priorityCounts.urgente}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
            Altas: {priorityCounts.alta}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30">
            Normais: {priorityCounts.normal}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            Baixas: {priorityCounts.baixa}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Buscar por OS, cliente, máquina ou descrição…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border text-foreground text-sm h-10"
        />
      </div>

      {/* Pending List */}
      {pendingReports.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-lg border border-border">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <p className="font-bold text-foreground">Tudo em dia!</p>
          <p className="text-xs mt-1">Nenhuma Ordem de Serviço pendente encontrada no momento.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden divide-y divide-border">
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
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg bg-card border border-border p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg bg-card border border-border p-6 space-y-6 shadow-sm">
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

        <div className="rounded-lg bg-card border border-border p-6 space-y-6 shadow-sm">
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
