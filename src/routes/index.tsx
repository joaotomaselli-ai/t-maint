import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useClients, useReports, useTechnicians, useAllSessions, useAllActivityTechnicians } from "@/hooks/use-data";
import { reportTotalsWithSessions, technicianPayForReport, fmtHours, type ServiceReport } from "@/lib/api";
import { useOSStatus, type ServiceReportStatus, type ServiceReportPriority } from "@/hooks/use-os-status";
import { useMoney } from "@/hooks/use-money-visibility";
import { useAccess } from "@/hooks/use-access";
import { useAuth } from "@/hooks/use-auth";
import { MasterPanel } from "@/components/MasterPanel";
import { Wrench, Users, Clock, DollarSign, Plus, TrendingUp, Loader2, Search, ArrowLeft, Check, Eye, CheckCircle2 } from "lucide-react";
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
  const [selectedReport, setSelectedReport] = useState<ServiceReport | null>(null);

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

  const markClosed = (r: ServiceReport, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateStatus.mutate({ activityId: r.id, status: "fechada" });
    toast.success(`OS #${r.orderNumber || r.id} fechada!`);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Fila de Atendimento Pendente
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300">
                {pendingReports.length} {pendingReports.length === 1 ? "OS" : "OSs"}
              </span>
            </h1>
          </div>
        </div>

        {/* Priority Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="px-2 py-0.5 rounded-md bg-red-500/15 text-red-700 dark:text-red-400 font-bold border border-red-300">
            🔴 Urgentes: {priorityCounts.urgente}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-300">
            🟠 Altas: {priorityCounts.alta}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-400 font-bold border border-blue-300">
            🔵 Normais: {priorityCounts.normal}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-300">
            ⚪ Baixas: {priorityCounts.baixa}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por OS, cliente, máquina..."
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Ultra-compact Table / List */}
      {pendingReports.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-foreground">Nenhuma ordem de serviço pendente!</p>
          <p className="text-xs mt-0.5">Todas as OSs foram concluídas.</p>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card divide-y shadow-sm">
          {pendingReports.map(r => {
            const client = clientMap.get(r.clientId);
            const status = getStatus(r.id);
            const priority = getPriority(r.id);

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
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 py-2 text-sm cursor-pointer border-l-4 transition-colors ${borderColors}`}
              >
                {/* OS Number, Date, Priority dot, Client, Machine */}
                <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                  
                  {/* Priority Selector Pill */}
                  <div onClick={e => e.stopPropagation()}>
                    <Select
                      value={priority}
                      onValueChange={(val) => updateStatus.mutate({ activityId: r.id, priority: val as ServiceReportPriority })}
                    >
                      <SelectTrigger className="h-6 px-1.5 text-[11px] font-bold border-0 bg-transparent hover:bg-muted/60 rounded gap-0.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgente">🔴 Urgente</SelectItem>
                        <SelectItem value="alta">🟠 Alta</SelectItem>
                        <SelectItem value="normal">🔵 Normal</SelectItem>
                        <SelectItem value="baixa">⚪ Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded border shrink-0">
                    OS #{r.orderNumber || "—"}
                  </span>

                  <span className="text-xs text-muted-foreground shrink-0 font-medium">
                    {format(new Date(r.date + "T00:00:00"), "dd/MM")}
                  </span>

                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {client?.name || "Cliente indisponível"}
                  </span>

                  <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                    • {r.machine} {r.requester && `(${r.requester})`}
                  </span>
                </div>

                {/* Status Selector & Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                  {/* Status Dropdown */}
                  <Select
                    value={status}
                    onValueChange={(val) => updateStatus.mutate({ activityId: r.id, status: val as ServiceReportStatus })}
                  >
                    <SelectTrigger className={`h-6 text-[11px] px-2.5 border font-semibold rounded-full gap-1 ${
                      status === "aguardando"
                        ? "bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-400"
                        : "bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-400"
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aguardando">⏳ Aguardando</SelectItem>
                      <SelectItem value="iniciada">🚀 Iniciada</SelectItem>
                      <SelectItem value="fechada">✅ Fechada</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Eye / View Details Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Ver detalhes da OS"
                    onClick={() => setSelectedReport(r)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>

                  {/* Quick Concluir Button */}
                  <Button
                    size="sm"
                    className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1"
                    onClick={(e) => markClosed(r, e)}
                  >
                    <Check className="h-3.5 w-3.5" /> Fechar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OS Detail Modal */}
      {selectedReport && (
        <OSDetailModal
          report={selectedReport}
          clientName={clientMap.get(selectedReport.clientId)?.name}
          status={getStatus(selectedReport.id)}
          priority={getPriority(selectedReport.id)}
          onClose={() => setSelectedReport(null)}
          onCloseOS={() => {
            markClosed(selectedReport);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}

function OSDetailModal({
  report,
  clientName,
  status,
  priority,
  onClose,
  onCloseOS,
}: {
  report: ServiceReport;
  clientName?: string;
  status: ServiceReportStatus;
  priority: ServiceReportPriority;
  onClose: () => void;
  onCloseOS: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-xl">OS #{report.orderNumber}</DialogTitle>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                status === "aguardando"
                  ? "bg-amber-500/15 text-amber-700 border-amber-300"
                  : status === "iniciada"
                  ? "bg-blue-500/15 text-blue-700 border-blue-300"
                  : "bg-emerald-500/15 text-emerald-700 border-emerald-300"
              }`}>
                {status === "aguardando" ? "⏳ Aguardando" : status === "iniciada" ? "🚀 Iniciada" : "✅ Fechada"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-muted border">
                {priority === "urgente" ? "🔴 Urgente" : priority === "alta" ? "🟠 Alta" : priority === "normal" ? "🔵 Normal" : "⚪ Baixa"}
              </span>
            </div>
          </div>
          <DialogDescription>Detalhes da ordem de serviço pendente</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm py-2">
          <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Cliente</p>
              <p className="font-bold text-foreground text-base">{clientName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Data</p>
              <p className="font-bold text-foreground">{format(new Date(report.date + "T00:00:00"), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Máquina</p>
              <p className="font-medium text-foreground">{report.machine || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Solicitante</p>
              <p className="font-medium text-foreground">{report.requester || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Tipo</p>
              <p className="font-medium text-foreground capitalize">{report.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Técnico Responsável</p>
              <p className="font-medium text-foreground">{report.technician || "—"}</p>
            </div>
          </div>

          {report.description && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase">Descrição do Problema / Serviço</p>
              <div className="p-3 bg-background border rounded-lg whitespace-pre-wrap text-foreground/90">
                {report.description}
              </div>
            </div>
          )}

          {report.summary && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase">Resumo / Solução Executada</p>
              <div className="p-3 bg-background border rounded-lg whitespace-pre-wrap text-foreground/90">
                {report.summary}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t">
          <Link to="/atividades" onClick={onClose}>
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              Editar na Aba OS
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fechar Janela
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold" onClick={onCloseOS}>
              <Check className="h-4 w-4" /> Marcar como Fechada
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
