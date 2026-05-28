import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClients, useReports } from "@/hooks/use-data";
import { reportTotals, fmtHours } from "@/lib/api";
import { useMoney } from "@/hooks/use-money-visibility";
import { useAccess } from "@/hooks/use-access";
import { MasterPanel } from "@/components/MasterPanel";
import { Wrench, Users, Clock, DollarSign, Plus, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const money = useMoney();

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
    const t = reportTotals(r, clientMap.get(r.clientId));
    acc.hours += t.totalHours;
    acc.value += t.total;
    acc.km += r.km || 0;
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
        <StatCard icon={Users} label="Clientes" value={String(clients.length)} accent="accent" />
        <StatCard icon={Clock} label="Horas no mês" value={fmtHours(stats.hours)} accent="warning" />
        <StatCard icon={DollarSign} label="Faturamento do mês" value={money(stats.value)} accent="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> OS recentes do mês</CardTitle>
          <Link to="/atividades"><Button variant="ghost" size="sm">Ver todas</Button></Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma OS registrada neste mês</p>
              <p className="text-sm mt-1">Cadastre seus clientes e comece a registrar atendimentos.</p>
              <div className="flex justify-center gap-2 mt-4">
                <Link to="/clientes"><Button variant="outline" size="sm">Cadastrar cliente</Button></Link>
                <Link to="/atividades"><Button size="sm">Ordem de Serviço</Button></Link>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {recent.map(r => {
                const c = clientMap.get(r.clientId);
                const t = reportTotals(r, c);
                return (
                  <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{c?.name || "Cliente removido"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.type === "corretiva" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                          {r.type === "corretiva" ? "Corretiva" : "Preventiva"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {r.machine} · {format(new Date(r.date + "T00:00:00"), "dd 'de' MMM", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{money(t.total)}</div>
                      <div className="text-xs text-muted-foreground">{fmtHours(t.totalHours)} · {r.km}km</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
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
