import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClients, useReports, useTechnicians, useAllSessions, useAllActivityTechnicians } from "@/hooks/use-data";
import { reportTotalsWithSessions, technicianPayForReport, fmtHours } from "@/lib/api";
import { useMoney } from "@/hooks/use-money-visibility";
import { useAccess } from "@/hooks/use-access";
import { useAuth } from "@/hooks/use-auth";
import { MasterPanel } from "@/components/MasterPanel";
import { Wrench, Users, Clock, DollarSign, Plus, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AgendaWidget } from "@/components/agenda/AgendaWidget";

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
  const money = useMoney();
  const { isTechnician, isAdmin, planType } = useAccess();
  const { user } = useAuth();
  
  const myTechId = useMemo(() => technicians.find(t => t.userId === user?.id)?.id, [technicians, user?.id]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = format(now, "MMMM 'de' yyyy", { locale: ptBR });

  const clientMap = new Map(clients.map(c => [c.id, c]));
  const monthReports = reports.filter(r => {
    const d = new Date(r.date + "T00:00:00");
    return d >= monthStart && d < monthEnd;
  });

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

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
          <p className="text-muted-foreground mt-1 capitalize">Resumo de {monthLabel}</p>
        </div>
        <Link to="/atividades">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" /> Ordem de Serviço
          </Button>
        </Link>
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
                      <p className="font-medium text-sm">OS #{r.activityNumber}</p>
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
