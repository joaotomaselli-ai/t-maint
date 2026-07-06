import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyAccess, listCompanies, listAdminPayments, registerAdminPayment } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useClients, useReports, useTechnicians, useAllSessions,
  useClientPayments, useTechnicianPayments, useAllActivityTechnicians,
  usePreventivePayments
} from "@/hooks/use-data";
import {
  reportTotalsWithSessions, technicianPayForReport, fmtCurrency, fmtHours,
} from "@/lib/api";
import { useMoney } from "@/hooks/use-money-visibility";
import { Search, Loader2, CheckCircle2, Users, HardHat, Circle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAccess } from "@/hooks/use-access";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/financeiro")({ component: Financeiro });

function Financeiro() {
  const accessFn = useServerFn(getMyAccess);
  const { data: access } = useQuery({ queryKey: ["my-access"], queryFn: () => accessFn() });
  const { isTechnician, isAdmin } = useAccess();

  if (access?.isMaster) {
    return <MasterFinanceiro />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground mt-1">Controle de pagamentos recebidos dos clientes e pagos aos técnicos</p>
      </header>

      <Tabs defaultValue={!isAdmin ? "tecnicos" : "clientes"} className="space-y-4">
        <TabsList>
          {isAdmin && <TabsTrigger value="clientes" className="gap-2"><Users className="h-4 w-4" /> Clientes</TabsTrigger>}
          <TabsTrigger value="tecnicos" className="gap-2"><HardHat className="h-4 w-4" /> Técnicos</TabsTrigger>
        </TabsList>
        {isAdmin && <TabsContent value="clientes"><ClientFinance /></TabsContent>}
        <TabsContent value="tecnicos"><TechnicianFinance /></TabsContent>
      </Tabs>
    </div>
  );
}

function MasterFinanceiro() {
  const qc = useQueryClient();
  const listCoFn = useServerFn(listCompanies);
  const listPayFn = useServerFn(listAdminPayments);
  const regPayFn = useServerFn(registerAdminPayment);

  const { data: companiesData } = useQuery({ queryKey: ["master-companies"], queryFn: () => listCoFn() });
  const { data: paymentsData } = useQuery({ queryKey: ["master-payments"], queryFn: () => listPayFn() });

  const [payModal, setPayModal] = useState<{ companyId: string; amount: number; month: string } | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["master-companies"] });
    qc.invalidateQueries({ queryKey: ["master-payments"] });
  };

  const regPay = useMutation({
    mutationFn: () => regPayFn({ data: { companyId: payModal!.companyId, amount: payModal!.amount, referenceMonth: payModal!.month } }),
    onSuccess: () => { toast.success("Pagamento registrado!"); setPayModal(null); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const companies = companiesData?.companies ?? [];
  const payments = paymentsData?.payments ?? [];

  const paymentsByCompany = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const p of payments) {
      if (!map.has(p.company_id)) map.set(p.company_id, []);
      map.get(p.company_id)!.push(p);
    }
    return map;
  }, [payments]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro Master</h1>
        <p className="text-muted-foreground mt-1">Gestão de assinaturas dos administradores</p>
      </header>

      <div className="grid gap-4">
        {companies.map(c => {
          const pays = paymentsByCompany.get(c.id) ?? [];
          return (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{c.name}</CardTitle>
                <div className="text-sm text-muted-foreground">Assinatura: R$ {c.subscriptionFee?.toFixed(2) ?? "0.00"}</div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pagamentos registrados ({pays.length})</span>
                    <Button size="sm" onClick={() => setPayModal({ companyId: c.id, amount: c.subscriptionFee ?? 0, month: new Date().toISOString().slice(0, 7) })}>
                      <DollarSign className="w-4 h-4 mr-1" /> Registrar Pagamento
                    </Button>
                  </div>
                  {pays.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                      {pays.map(p => (
                        <div key={p.id} className="text-xs p-2 bg-muted rounded-md flex flex-col gap-1 border">
                          <span className="font-semibold text-muted-foreground">{p.reference_month}</span>
                          <span className="font-bold text-success">R$ {p.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border border-dashed text-center">Nenhum pagamento registrado.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!payModal} onOpenChange={(o) => { if (!o) setPayModal(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
          {payModal && (
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label>Mês de Referência (YYYY-MM)</Label>
                <Input type="month" value={payModal.month} onChange={(e) => setPayModal({ ...payModal, month: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label>Valor Pago (R$)</Label>
                <Input type="number" step="0.01" value={payModal.amount || ""} onChange={(e) => setPayModal({ ...payModal, amount: parseFloat(e.target.value) })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayModal(null)}>Cancelar</Button>
            <Button onClick={() => regPay.mutate()} disabled={regPay.isPending || !payModal?.month}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ALL = "__all__";

function ClientFinance() {
  const money = useMoney();
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
    <Tabs defaultValue="faturamento" className="space-y-6">
      <TabsList className="w-full justify-start border-b rounded-none px-0 bg-transparent h-auto p-0">
        <TabsTrigger value="faturamento" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-2 pt-2 px-4">Faturamento de OS</TabsTrigger>
        <TabsTrigger value="contratos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-2 pt-2 px-4">Contratos Mensais</TabsTrigger>
      </TabsList>
      
      <TabsContent value="faturamento" className="space-y-6 mt-4">
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
      </TabsContent>

      <TabsContent value="contratos" className="mt-4">
        <ContratosMensaisFinance clients={clients} />
      </TabsContent>
    </Tabs>
  );
}

function ContratosMensaisFinance({ clients }: { clients: any[] }) {
  const money = useMoney();
  const { payments, upsertPayment, deletePayment } = usePreventivePayments();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const preventiveClients = useMemo(() => clients.filter(c => c.hasPreventiveContract), [clients]);
  
  const paymentByClient = useMemo(() => {
    const map = new Map();
    for (const p of payments) {
      if (p.referenceMonth === month) {
        map.set(p.clientId, p);
      }
    }
    return map;
  }, [payments, month]);

  const togglePayment = async (clientId: string, amount: number) => {
    try {
      const existing = paymentByClient.get(clientId);
      if (existing) {
        await deletePayment.mutateAsync(existing.id);
        toast.success("Pagamento removido");
      } else {
        await upsertPayment.mutateAsync({ clientId, referenceMonth: month, amount });
        toast.success("Mensalidade recebida");
      }
    } catch (e) {
      toast.error("Erro ao atualizar");
    }
  };

  const totalExpected = preventiveClients.reduce((acc, c) => acc + (c.preventiveContractValue || 0), 0);
  const totalPaid = preventiveClients.reduce((acc, c) => acc + (paymentByClient.has(c.id) ? (c.preventiveContractValue || 0) : 0), 0);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Filtro de Mensalidades</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 max-w-sm">
            <Label>Mês de Referência</Label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Previsto Mensal</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{money(totalExpected)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Recebido</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-success">{money(totalPaid)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pendente</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{money(totalExpected - totalPaid)}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {preventiveClients.length === 0 ? (
          <div className="text-sm text-muted-foreground col-span-full">Nenhum cliente com contrato preventivo cadastrado.</div>
        ) : (
          preventiveClients.map(c => {
            const isPaid = paymentByClient.has(c.id);
            const value = c.preventiveContractValue || 0;
            return (
              <Card key={c.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xl font-bold">{money(value)}</div>
                  <div className="flex items-center gap-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => togglePayment(c.id, value)}>
                    <Checkbox checked={isPaid} onCheckedChange={() => togglePayment(c.id, value)} />
                    <Label className="cursor-pointer">{isPaid ? "Recebido neste mês" : "Marcar como recebido"}</Label>
                    {isPaid && <CheckCircle2 className="w-4 h-4 text-success ml-auto" />}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function TechnicianFinance() {
  const money = useMoney();
  const { clients } = useClients();
  const { reports } = useReports();
  const { technicians } = useTechnicians();
  const { sessions } = useAllSessions();
  const { activityTechnicians } = useAllActivityTechnicians();
  const { payments, markPaid, unmarkPaid } = useTechnicianPayments();
  const { isTechnician } = useAccess();
  const { user } = useAuth();
  
  const myTechId = useMemo(() => technicians.find(t => t.userId === user?.id)?.id, [technicians, user?.id]);

  const [technicianId, setTechnicianId] = useState<string>("");
  const [clientId, setClientId] = useState<string>(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [osFrom, setOsFrom] = useState("");
  const [osTo, setOsTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");

  const effectiveTechnicianId = isTechnician && myTechId ? myTechId : technicianId;
  const technician = technicians.find(t => t.id === effectiveTechnicianId);
  const clientById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);
  const payKey = (a: string, t: string) => `${a}::${t}`;
  const payByKey = useMemo(
    () => new Map(payments.map(p => [payKey(p.activityId, p.technicianId), p])),
    [payments]
  );

  const filtered = useMemo(() => {
    if (!technician) return [];
    const name = technician.name.trim().toLowerCase();
    const activityIdsWithSessionOrAct = new Set([
      ...sessions.filter(s => s.technicianId === technician.id).map(s => s.activityId),
      ...activityTechnicians.filter(at => at.technicianId === technician.id).map(at => at.activityId),
    ]);
    return reports
      .filter(r =>
        (r.technician || "").trim().toLowerCase() === name ||
        activityIdsWithSessionOrAct.has(r.id),
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
  }, [reports, technician, clientId, from, to, osFrom, osTo, statusFilter, sessions, activityTechnicians, payByKey]);

  const totals = useMemo(() => {
    let total = 0, paid = 0, pending = 0, hours = 0;
    if (!technician) return { total, paid, pending, hours };
    for (const r of filtered) {
      const t = technicianPayForReport(r, sessions, technician, activityTechnicians);
      total += t.total; hours += t.totalHours;
      if (payByKey.has(payKey(r.id, technician.id))) paid += t.total;
      else pending += t.total;
    }
    return { total, paid, pending, hours };
  }, [filtered, sessions, technician, activityTechnicians, payByKey]);

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
            <Select disabled={isTechnician} value={effectiveTechnicianId} onValueChange={setTechnicianId}>
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
                      const t = technicianPayForReport(r, sessions, technician, activityTechnicians);
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
