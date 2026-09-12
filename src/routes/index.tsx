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
import { BorderBeam } from "@/components/ui/border-beam";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const { isLoading, isMaster, isClient } = useAccess();
  if (isLoading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00F5D4]" />
      </div>
    );
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
    <div className="space-y-8 font-sans">
      {/* COCKPIT HEADER & QUICK ACTIONS */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#1F293D]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5D4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F5D4]"></span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00F5D4]">
              COCKPIT OPERACIONAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Painel de Controle
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5 capitalize">
            Resumo consolidado • {monthLabel}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("pending_queue")}
            className="gap-2 bg-[#131A26] border-[#1F293D] hover:border-amber-500/50 text-slate-200 hover:text-white py-2 px-3.5 rounded-xl transition-all"
          >
            <Clock className="h-3.5 w-3.5 text-amber-400" />
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
              className="gap-1.5 bg-[#131A26] border-[#1F293D] hover:border-[#00F5D4]/50 text-slate-200 hover:text-white py-2 px-3.5 rounded-xl transition-all"
            >
              <Calculator className="h-3.5 w-3.5 text-cyan-400" /> + Orçamento
            </Button>
          </Link>

          <Link to="/atividades">
            <Button 
              size="sm" 
              className="gap-1.5 bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-[#0B0F17] font-bold py-2 px-4 rounded-xl shadow-[0_0_20px_rgba(0,245,212,0.3)] transition-all"
            >
              <Plus className="h-4 w-4 font-bold" /> + Nova O.S.
            </Button>
          </Link>
        </div>
      </header>

      {/* TELEMETRY KPI STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Atendimentos no Mês */}
        <div className="relative rounded-2xl bg-[#131A26] border border-[#1F293D] p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-[#00F5D4]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Atendimentos no Mês</span>
            <div className="p-2 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/20">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">{monthReports.length}</div>
            <div className="text-[11px] font-mono text-[#00F5D4] mt-1 flex items-center gap-1">
              <span>{pendingReports.length} em aberto / andamento</span>
            </div>
          </div>
        </div>

        {/* Clientes Atendidos */}
        <div className="relative rounded-2xl bg-[#131A26] border border-[#1F293D] p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">{isAdmin ? "Indústrias / Clientes" : "Técnico Responsável"}</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {isAdmin ? clients.length : "Ativo"}
            </div>
            <div className="text-[11px] font-mono text-cyan-400 mt-1">
              {isAdmin ? "Parque de Máquinas Cadastrado" : user?.email}
            </div>
          </div>
        </div>

        {/* Horas Técnicas no Mês */}
        <div className="relative rounded-2xl bg-[#131A26] border border-[#1F293D] p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Horas em Campo</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">{fmtHours(stats.hours)}</div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
              <span>Deslocamento: <strong className="text-white">{stats.km} km</strong></span>
            </div>
          </div>
        </div>

        {/* Faturamento / Ganhos do Mês */}
        <div className="relative rounded-2xl bg-[#131A26] border border-[#1F293D] p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">{!isAdmin ? "Ganhos do Mês" : "Faturamento Total"}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">{money(stats.value)}</div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Serviços + Peças + KM
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION (GRÁFICOS ANALÍTICOS) */}
      <CockpitAnalytics 
        totalHoursMonth={stats.hours} 
        totalOrdersMonth={monthReports.length} 
      />

      {/* AGENDA OU OS RECENTES */}
      {planType === "basic" ? (
        <Card className="rounded-2xl bg-[#131A26] border border-[#1F293D] overflow-hidden">
          <CardHeader className="border-b border-[#1F293D] pb-4">
            <CardTitle className="flex items-center gap-2 text-white font-mono text-sm">
              <TrendingUp className="h-4 w-4 text-[#00F5D4]" /> OS Recentes do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 font-mono text-xs">
            {recent.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma OS recente encontrada no mês.</p>
            ) : (
              <div className="space-y-3">
                {recent.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-[#0B0F17] border border-[#1F293D]">
                    <div>
                      <p className="font-bold text-white">OS #{r.orderNumber}</p>
                      <p className="text-[11px] text-slate-400">{clientMap.get(r.clientId)?.name ?? 'Desconhecido'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300">{format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F293D] pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2 text-xs bg-[#131A26] border-[#1F293D] text-slate-300">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
          </Button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Fila de Atendimento Pendente
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {pendingReports.length} {pendingReports.length === 1 ? "OS" : "OSs"}
              </span>
            </h1>
          </div>
        </div>

        {/* Priority Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 font-bold border border-red-500/30">
            🔴 Urgentes: {priorityCounts.urgente}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
            🟠 Altas: {priorityCounts.alta}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
            🔵 Normais: {priorityCounts.normal}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-500/15 text-slate-400 border border-slate-600/40">
            ⚪ Baixas: {priorityCounts.baixa}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por OS, cliente, máquina CNC..."
          className="pl-10 h-11 bg-[#131A26] border-[#1F293D] text-white placeholder:text-slate-500 rounded-xl text-xs"
        />
      </div>

      {/* Pending Reports List */}
      {pendingReports.length === 0 ? (
        <Card className="p-10 text-center bg-[#131A26] border-[#1F293D] rounded-2xl">
          <CheckCircle2 className="h-12 w-12 text-[#00F5D4] mx-auto mb-3" />
          <p className="font-bold text-white text-base">Nenhuma ordem de serviço pendente!</p>
          <p className="text-xs text-slate-400 mt-1">Todas as manutenções foram finalizadas e auditadas.</p>
        </Card>
      ) : (
        <div className="border border-[#1F293D] rounded-2xl overflow-hidden bg-[#131A26] divide-y divide-[#1F293D] shadow-xl">
          {pendingReports.map(r => {
            const client = clientMap.get(r.clientId);
            const status = getStatus(r.id);
            const priority = getPriority(r.id);

            const borderColors = {
              urgente: "border-l-red-500 bg-red-500/5 hover:bg-red-500/10",
              alta: "border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10",
              normal: "border-l-blue-500 hover:bg-[#182232]",
              baixa: "border-l-slate-400 hover:bg-[#182232]",
            }[priority];

            return (
              <div
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-xs cursor-pointer border-l-4 transition-colors ${borderColors}`}
              >
                <div className="flex flex-wrap items-center gap-2.5 min-w-0 flex-1">
                  <span className="font-mono text-xs font-extrabold bg-[#0B0F17] text-[#00F5D4] px-2.5 py-1 rounded-lg border border-[#1F293D] shrink-0">
                    OS #{r.orderNumber || "—"}
                  </span>

                  <span className="text-slate-400 shrink-0 font-medium">
                    {format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}
                  </span>

                  <span className="font-bold text-white truncate max-w-[220px]">
                    {client?.name || "Cliente não informado"}
                  </span>

                  <span className="text-slate-400 truncate max-w-[240px]">
                    • {r.machine} {r.requester && `(${r.requester})`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#0B0F17]"
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
