import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useClients, useReports, useSettings, useTechnicians, useAllSessions, useClientPayments, useTechnicianPayments } from "@/hooks/use-data";
import { reportTotalsWithSessions, technicianTotals, technicianPayForReport, fmtCurrency, fmtHours } from "@/lib/api";
// PDF lib is imported dynamically inside click handlers to avoid SSR issues
import { FileDown, FileText, HardHat, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({ component: Relatorios });

function Relatorios() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Gere relatórios consolidados em PDF</p>
      </header>

      <Tabs defaultValue="clientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clientes" className="gap-2"><Users className="h-4 w-4" /> Clientes</TabsTrigger>
          <TabsTrigger value="tecnicos" className="gap-2"><HardHat className="h-4 w-4" /> Técnicos</TabsTrigger>
        </TabsList>
        <TabsContent value="clientes"><ClientReport /></TabsContent>
        <TabsContent value="tecnicos"><TechnicianReport /></TabsContent>
      </Tabs>
    </div>
  );
}

function ClientReport() {
  const { clients } = useClients();
  const { reports } = useReports();
  const { settings } = useSettings();
  const { sessions } = useAllSessions();
  const { payments: clientPays } = useClientPayments();
  const paidSet = useMemo(() => new Set(clientPays.map(p => p.activityId)), [clientPays]);
  const [clientId, setClientId] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const client = clients.find(c => c.id === clientId);

  const filtered = useMemo(() => {
    if (!clientId) return [];
    return reports
      .filter(r => r.clientId === clientId)
      .filter(r => !from || r.date >= from)
      .filter(r => !to || r.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reports, clientId, from, to]);

  const totals = useMemo(() => filtered.reduce((acc, r) => {
    const t = reportTotalsWithSessions(r, sessions, client);
    acc.hours += t.totalHours; acc.km += t.km; acc.total += t.total;
    return acc;
  }, { hours: 0, km: 0, total: 0 }), [filtered, client, sessions]);

  const generate = async () => {
    if (!client) { toast.error("Selecione um cliente"); return; }
    if (filtered.length === 0) { toast.error("Nenhuma atividade no período"); return; }
    try {
      const { exportClientReport } = await import("@/lib/pdf");
      exportClientReport(client, filtered, settings, { from, to }, sessions);
      toast.success("Relatório gerado");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF");
    }
  };

  const generateWord = async () => {
    if (!client) { toast.error("Selecione um cliente"); return; }
    if (filtered.length === 0) { toast.error("Nenhuma atividade no período"); return; }
    try {
      const { exportClientReportDocx } = await import("@/lib/docx-reports");
      await exportClientReportDocx(client, filtered, settings, { from, to }, sessions);
      toast.success("Documento Word gerado");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar Word");
    }
  };



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Configurar relatório por cliente</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_180px_180px_auto]">
          <div className="grid gap-2">
            <Label>Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
              <SelectContent>
                {clients.length === 0 && <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum cliente cadastrado</div>}
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>De</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Até</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            <Button onClick={generate} className="gap-2" size="lg" disabled={!clientId || filtered.length === 0}>
              <FileDown className="h-4 w-4" /> Gerar PDF
            </Button>
            <Button onClick={generateWord} variant="outline" className="gap-2" size="lg" disabled={!clientId || filtered.length === 0}>
              <FileDown className="h-4 w-4" /> Gerar Word
            </Button>
          </div>
        </CardContent>
      </Card>

      {client && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Prévia — {client.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhuma atividade no período selecionado.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <Stat label="Atendimentos" value={String(filtered.length)} />
                  <Stat label="Horas totais" value={fmtHours(totals.hours)} />
                  <Stat label="Quilometragem" value={`${totals.km} km`} />
                  <Stat label="Total" value={money(totals.total)} highlight />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-left">
                      <tr>
                        <th className="p-2">OS</th><th className="p-2">Data</th>
                        <th className="p-2">Máquina</th><th className="p-2">Tipo</th>
                        <th className="p-2 text-right">Horas</th><th className="p-2 text-right">KM</th>
                        <th className="p-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map(r => {
                        const t = reportTotalsWithSessions(r, sessions, client);
                        return (
                          <tr key={r.id}>
                            <td className="p-2 font-mono text-xs">
                              {r.orderNumber}
                              {paidSet.has(r.id) && <span className="ml-1 text-success" title="Recebido">●</span>}
                            </td>
                            <td className="p-2">{r.date.split("-").reverse().join("/")}</td>
                            <td className="p-2">{r.machine}</td>
                            <td className="p-2 capitalize">{r.type}</td>
                            <td className="p-2 text-right">{fmtHours(t.totalHours)}</td>
                            <td className="p-2 text-right">{t.km}</td>
                            <td className="p-2 text-right font-semibold">{money(t.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted font-semibold">
                      <tr>
                        <td colSpan={4} className="p-2">TOTAL</td>
                        <td className="p-2 text-right">{fmtHours(totals.hours)}</td>
                        <td className="p-2 text-right">{totals.km}</td>
                        <td className="p-2 text-right text-primary">{money(totals.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const ALL_CLIENTS = "__all__";

function TechnicianReport() {
  const { clients } = useClients();
  const { technicians } = useTechnicians();
  const { reports } = useReports();
  const { settings } = useSettings();
  const { sessions } = useAllSessions();
  const { payments: techPays } = useTechnicianPayments();
  const [technicianId, setTechnicianId] = useState<string>("");
  const [clientId, setClientId] = useState<string>(ALL_CLIENTS);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const paidTechSet = useMemo(() => new Set(techPays.map(p => `${p.activityId}::${p.technicianId}`)), [techPays]);

  const technician = technicians.find(t => t.id === technicianId);
  const clientsById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);
  const filterClient = clientId !== ALL_CLIENTS ? clients.find(c => c.id === clientId) : undefined;

  // Match by technician name on the primary report OR by technicianId on any session of the report
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
      .filter(r => clientId === ALL_CLIENTS || r.clientId === clientId)
      .filter(r => !from || r.date >= from)
      .filter(r => !to || r.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reports, technician, clientId, from, to, sessions]);

  const totalsByReport = useMemo(() => {
    const map = new Map<string, ReturnType<typeof technicianPayForReport>>();
    if (!technician) return map;
    for (const r of filtered) {
      map.set(r.id, technicianPayForReport(r, sessions, technician));
    }
    return map;
  }, [filtered, sessions, technician]);

  const totals = useMemo(() => {
    let hours = 0, ovtWk = 0, ovtWe = 0, km = 0, total = 0;
    for (const r of filtered) {
      const t = totalsByReport.get(r.id);
      if (!t) continue;
      hours += t.totalHours; ovtWk += t.ovtWk; ovtWe += t.ovtWe;
      km += t.km; total += t.total;
    }
    return { hours, ovtWk, ovtWe, km, total };
  }, [filtered, totalsByReport]);

  const generate = async () => {
    if (!technician) { toast.error("Selecione um técnico"); return; }
    if (filtered.length === 0) { toast.error("Nenhuma atividade no período"); return; }
    try {
      const { exportTechnicianReport } = await import("@/lib/pdf");
      exportTechnicianReport(technician, filtered, clientsById, settings, { from, to }, filterClient, sessions);
      toast.success("Relatório gerado");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF");
    }
  };

  const generateWord = async () => {
    if (!technician) { toast.error("Selecione um técnico"); return; }
    if (filtered.length === 0) { toast.error("Nenhuma atividade no período"); return; }
    try {
      const { exportTechnicianReportDocx } = await import("@/lib/docx-reports");
      await exportTechnicianReportDocx(technician, filtered, clientsById, settings, { from, to }, filterClient, sessions);
      toast.success("Documento Word gerado");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar Word");
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Configurar relatório por técnico</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_160px_auto]">
          <div className="grid gap-2">
            <Label>Técnico *</Label>
            <Select value={technicianId} onValueChange={setTechnicianId}>
              <SelectTrigger><SelectValue placeholder="Selecione um técnico" /></SelectTrigger>
              <SelectContent>
                {technicians.length === 0 && <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum técnico cadastrado</div>}
                {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CLIENTS}>Todos os clientes (geral)</SelectItem>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>De</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Até</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch lg:items-end">
            <Button onClick={generate} className="gap-2" size="lg" disabled={!technicianId || filtered.length === 0}>
              <FileDown className="h-4 w-4" /> Gerar PDF
            </Button>
            <Button onClick={generateWord} variant="outline" className="gap-2" size="lg" disabled={!technicianId || filtered.length === 0}>
              <FileDown className="h-4 w-4" /> Gerar Word
            </Button>
          </div>
        </CardContent>
      </Card>

      {technician && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Prévia — {technician.name}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filterClient ? filterClient.name : "Todos os clientes"})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhuma atividade encontrada para este técnico.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                  <Stat label="Atendimentos" value={String(filtered.length)} />
                  <Stat label="Horas normais" value={fmtHours(Math.max(0, totals.hours - totals.ovtWk - totals.ovtWe))} />
                  <Stat label="HE semana" value={fmtHours(totals.ovtWk)} />
                  <Stat label="HE fim de semana" value={fmtHours(totals.ovtWe)} />
                  <Stat label="Total de horas" value={fmtHours(totals.hours)} />
                  <Stat label="A pagar" value={money(totals.total)} highlight />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-left">
                      <tr>
                        <th className="p-2">OS</th><th className="p-2">Data</th>
                        <th className="p-2">Cliente</th>
                        <th className="p-2 text-right">H. Normais</th>
                        <th className="p-2 text-right">HE Sem.</th>
                        <th className="p-2 text-right">HE F.S.</th>
                        <th className="p-2 text-right">Total H.</th>
                        <th className="p-2 text-right">KM</th>
                        <th className="p-2 text-right">A pagar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map(r => {
                        const t = totalsByReport.get(r.id) ?? technicianTotals(r, technician);
                        const regular = Math.max(0, t.totalHours - t.ovtWk - t.ovtWe);
                        return (
                          <tr key={r.id}>
                            <td className="p-2 font-mono text-xs">
                              {r.orderNumber}
                              {technician && paidTechSet.has(`${r.id}::${technician.id}`) && <span className="ml-1 text-success" title="Pago ao técnico">●</span>}
                            </td>
                            <td className="p-2">{r.date.split("-").reverse().join("/")}</td>
                            <td className="p-2">{clientsById[r.clientId]?.name ?? "—"}</td>
                            <td className="p-2 text-right">{fmtHours(regular)}</td>
                            <td className="p-2 text-right">{fmtHours(t.ovtWk)}</td>
                            <td className="p-2 text-right">{fmtHours(t.ovtWe)}</td>
                            <td className="p-2 text-right font-medium">{fmtHours(t.totalHours)}</td>
                            <td className="p-2 text-right">{("km" in t ? t.km : (r.km || 0))}</td>
                            <td className="p-2 text-right font-semibold">{money(t.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted font-semibold">
                      <tr>
                        <td colSpan={3} className="p-2">TOTAL</td>
                        <td className="p-2 text-right">{fmtHours(Math.max(0, totals.hours - totals.ovtWk - totals.ovtWe))}</td>
                        <td className="p-2 text-right">{fmtHours(totals.ovtWk)}</td>
                        <td className="p-2 text-right">{fmtHours(totals.ovtWe)}</td>
                        <td className="p-2 text-right">{fmtHours(totals.hours)}</td>
                        <td className="p-2 text-right">{totals.km}</td>
                        <td className="p-2 text-right text-primary">{money(totals.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
      <div className={`text-xs ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{label}</div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
    </div>
  );
}
