import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useClients, useReports, useTechnicians, useAllSessions,
  useClientPayments, useTechnicianPayments,
} from "@/hooks/use-data";
import {
  reportTotalsWithSessions, technicianPayForReport, fmtCurrency, fmtHours,
} from "@/lib/api";
import { Users, HardHat, CheckCircle2, Circle, DollarSign } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/financeiro")({ component: Financeiro });

function Financeiro() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground mt-1">Controle de pagamentos recebidos dos clientes e pagos aos técnicos</p>
      </header>

      <Tabs defaultValue="clientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clientes" className="gap-2"><Users className="h-4 w-4" /> Clientes</TabsTrigger>
          <TabsTrigger value="tecnicos" className="gap-2"><HardHat className="h-4 w-4" /> Técnicos</TabsTrigger>
        </TabsList>
        <TabsContent value="clientes"><ClientFinance /></TabsContent>
        <TabsContent value="tecnicos"><TechnicianFinance /></TabsContent>
      </Tabs>
    </div>
  );
}

const ALL = "__all__";

function ClientFinance() {
  const { clients } = useClients();
  const { reports } = useReports();
  const { sessions } = useAllSessions();
  const { payments, markPaid, unmarkPaid } = useClientPayments();

  const [clientId, setClientId] = useState<string>(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [osFrom, setOsFrom] = useState("");
  const [osTo, setOsTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");

  const clientById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);
  const payByActivity = useMemo(() => new Map(payments.map(p => [p.activityId, p])), [payments]);

  const filtered = useMemo(() => {
    return reports
      .filter(r => clientId === ALL || r.clientId === clientId)
      .filter(r => !from || r.date >= from)
      .filter(r => !to || r.date <= to)
      .filter(r => !osFrom || (r.orderNumber || "").localeCompare(osFrom) >= 0)
      .filter(r => !osTo || (r.orderNumber || "").localeCompare(osTo) <= 0)
      .filter(r => {
        if (statusFilter === "all") return true;
        const paid = payByActivity.has(r.id);
        return statusFilter === "paid" ? paid : !paid;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reports, clientId, from, to, osFrom, osTo, statusFilter, payByActivity]);

  const totals = useMemo(() => {
    let total = 0, paid = 0, pending = 0;
    for (const r of filtered) {
      const c = clientById[r.clientId];
      const t = reportTotalsWithSessions(r, sessions, c);
      total += t.total;
      if (payByActivity.has(r.id)) paid += t.total; else pending += t.total;
    }
    return { total, paid, pending };
  }, [filtered, sessions, clientById, payByActivity]);

  const togglePaid = async (activityId: string, amount: number) => {
    try {
      if (payByActivity.has(activityId)) {
        await unmarkPaid.mutateAsync(activityId);
        toast.success("Pagamento removido");
      } else {
        await markPaid.mutateAsync({ activityId, amount });
        toast.success("Marcado como recebido");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar pagamento");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="grid gap-2 lg:col-span-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os clientes</SelectItem>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>De</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Até</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div className="grid gap-2"><Label>OS de</Label><Input value={osFrom} onChange={e => setOsFrom(e.target.value)} placeholder="0001" /></div>
          <div className="grid gap-2"><Label>OS até</Label><Input value={osTo} onChange={e => setOsTo(e.target.value)} placeholder="9999" /></div>
          <div className="grid gap-2 lg:col-span-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagas</SelectItem>
                <SelectItem value="unpaid">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Stat label="Atendimentos" value={String(filtered.length)} />
        <Stat label="Total" value={money(totals.total)} />
        <Stat label="Recebido" value={money(totals.paid)} tone="success" />
        <Stat label="Pendente" value={money(totals.pending)} tone="warning" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-2 w-12"></th>
                  <th className="p-2">OS</th><th className="p-2">Data</th>
                  <th className="p-2">Cliente</th><th className="p-2">Máquina</th>
                  <th className="p-2 text-right">Horas</th>
                  <th className="p-2 text-right">KM</th>
                  <th className="p-2 text-right">Valor</th>
                  <th className="p-2 text-center">Recebido</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">Nenhuma OS encontrada</td></tr>
                )}
                {filtered.map(r => {
                  const c = clientById[r.clientId];
                  const t = reportTotalsWithSessions(r, sessions, c);
                  const pay = payByActivity.get(r.id);
                  const paid = !!pay;
                  return (
                    <tr key={r.id} className={paid ? "bg-success/5" : ""}>
                      <td className="p-2">
                        {paid
                          ? <CheckCircle2 className="h-4 w-4 text-success" />
                          : <Circle className="h-4 w-4 text-muted-foreground/50" />}
                      </td>
                      <td className="p-2 font-mono text-xs">{r.orderNumber}</td>
                      <td className="p-2">{r.date.split("-").reverse().join("/")}</td>
                      <td className="p-2">{c?.name ?? "—"}</td>
                      <td className="p-2">{r.machine}</td>
                      <td className="p-2 text-right">{fmtHours(t.totalHours)}</td>
                      <td className="p-2 text-right">{t.km}</td>
                      <td className="p-2 text-right font-semibold">{money(t.total)}</td>
                      <td className="p-2 text-center">
                        <Checkbox
                          checked={paid}
                          onCheckedChange={() => togglePaid(r.id, t.total)}
                          aria-label="Marcar como recebido"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TechnicianFinance() {
  const { clients } = useClients();
  const { technicians } = useTechnicians();
  const { reports } = useReports();
  const { sessions } = useAllSessions();
  const { payments, markPaid, unmarkPaid } = useTechnicianPayments();

  const [technicianId, setTechnicianId] = useState<string>("");
  const [clientId, setClientId] = useState<string>(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [osFrom, setOsFrom] = useState("");
  const [osTo, setOsTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");

  const technician = technicians.find(t => t.id === technicianId);
  const clientById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);
  const payKey = (a: string, t: string) => `${a}::${t}`;
  const payByKey = useMemo(
    () => new Map(payments.map(p => [payKey(p.activityId, p.technicianId), p])),
    [payments]
  );

  const filtered = useMemo(() => {
    if (!technician) return [];
    const name = technician.name.trim().toLowerCase();
    const activityIdsWithSession = new Set(
      sessions.filter(s => s.technicianId === technician.id).map(s => s.activityId),
    );
    return reports
      .filter(r =>
        (r.technician || "").trim().toLowerCase() === name ||
        activityIdsWithSession.has(r.id),
      )
      .filter(r => clientId === ALL || r.clientId === clientId)
      .filter(r => !from || r.date >= from)
      .filter(r => !to || r.date <= to)
      .filter(r => !osFrom || (r.orderNumber || "").localeCompare(osFrom) >= 0)
      .filter(r => !osTo || (r.orderNumber || "").localeCompare(osTo) <= 0)
      .filter(r => {
        if (statusFilter === "all") return true;
        const paid = payByKey.has(payKey(r.id, technician.id));
        return statusFilter === "paid" ? paid : !paid;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reports, technician, clientId, from, to, osFrom, osTo, statusFilter, sessions, payByKey]);

  const totals = useMemo(() => {
    let total = 0, paid = 0, pending = 0, hours = 0;
    if (!technician) return { total, paid, pending, hours };
    for (const r of filtered) {
      const t = technicianPayForReport(r, sessions, technician);
      total += t.total; hours += t.totalHours;
      if (payByKey.has(payKey(r.id, technician.id))) paid += t.total;
      else pending += t.total;
    }
    return { total, paid, pending, hours };
  }, [filtered, sessions, technician, payByKey]);

  const togglePaid = async (activityId: string, amount: number) => {
    if (!technician) return;
    try {
      if (payByKey.has(payKey(activityId, technician.id))) {
        await unmarkPaid.mutateAsync({ activityId, technicianId: technician.id });
        toast.success("Pagamento removido");
      } else {
        await markPaid.mutateAsync({ activityId, technicianId: technician.id, amount });
        toast.success("Marcado como pago");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar pagamento");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="grid gap-2 lg:col-span-2">
            <Label>Técnico *</Label>
            <Select value={technicianId} onValueChange={setTechnicianId}>
              <SelectTrigger><SelectValue placeholder="Selecione um técnico" /></SelectTrigger>
              <SelectContent>
                {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os clientes</SelectItem>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>De</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Até</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div className="grid gap-2"><Label>OS de</Label><Input value={osFrom} onChange={e => setOsFrom(e.target.value)} placeholder="0001" /></div>
          <div className="grid gap-2"><Label>OS até</Label><Input value={osTo} onChange={e => setOsTo(e.target.value)} placeholder="9999" /></div>
          <div className="grid gap-2 lg:col-span-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="unpaid">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!technician ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
          Selecione um técnico para visualizar
        </CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Atendimentos" value={String(filtered.length)} />
            <Stat label="Total a pagar" value={money(totals.total)} />
            <Stat label="Pago" value={money(totals.paid)} tone="success" />
            <Stat label="Pendente" value={money(totals.pending)} tone="warning" />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="p-2 w-12"></th>
                      <th className="p-2">OS</th><th className="p-2">Data</th>
                      <th className="p-2">Cliente</th>
                      <th className="p-2 text-right">Total H.</th>
                      <th className="p-2 text-right">HE Sem.</th>
                      <th className="p-2 text-right">HE F.S.</th>
                      <th className="p-2 text-right">KM</th>
                      <th className="p-2 text-right">A pagar</th>
                      <th className="p-2 text-center">Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.length === 0 && (
                      <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">Nenhuma OS encontrada</td></tr>
                    )}
                    {filtered.map(r => {
                      const t = technicianPayForReport(r, sessions, technician);
                      const paid = payByKey.has(payKey(r.id, technician.id));
                      return (
                        <tr key={r.id} className={paid ? "bg-success/5" : ""}>
                          <td className="p-2">
                            {paid
                              ? <CheckCircle2 className="h-4 w-4 text-success" />
                              : <Circle className="h-4 w-4 text-muted-foreground/50" />}
                          </td>
                          <td className="p-2 font-mono text-xs">{r.orderNumber}</td>
                          <td className="p-2">{r.date.split("-").reverse().join("/")}</td>
                          <td className="p-2">{clientById[r.clientId]?.name ?? "—"}</td>
                          <td className="p-2 text-right">{fmtHours(t.totalHours)}</td>
                          <td className="p-2 text-right">{fmtHours(t.ovtWk)}</td>
                          <td className="p-2 text-right">{fmtHours(t.ovtWe)}</td>
                          <td className="p-2 text-right">{t.km}</td>
                          <td className="p-2 text-right font-semibold">{money(t.total)}</td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={paid}
                              onCheckedChange={() => togglePaid(r.id, t.total)}
                              aria-label="Marcar como pago"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  const color =
    tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning" :
    "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className={`text-xl font-bold mt-1 ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
