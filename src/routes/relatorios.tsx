import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients, useReports, useSettings } from "@/hooks/use-data";
import { reportTotals, fmtCurrency, fmtHours } from "@/lib/api";
import { exportClientReport } from "@/lib/pdf";
import { FileDown, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({ component: Relatorios });

function Relatorios() {
  const { clients } = useClients();
  const { reports } = useReports();
  const { settings } = useSettings();
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
    const t = reportTotals(r, client);
    acc.hours += t.totalHours; acc.service += t.service; acc.travel += t.travelOut + t.travelBack;
    acc.km += r.km || 0; acc.hoursValue += t.hoursValue; acc.kmValue += t.kmValue; acc.total += t.total;
    return acc;
  }, { hours: 0, service: 0, travel: 0, km: 0, hoursValue: 0, kmValue: 0, total: 0 }), [filtered, client]);

  const generate = () => {
    if (!client) { toast.error("Selecione um cliente"); return; }
    if (filtered.length === 0) { toast.error("Nenhuma atividade no período"); return; }
    exportClientReport(client, filtered, settings, { from, to });
    toast.success("Relatório gerado");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Gere relatórios consolidados por cliente em PDF</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Configurar relatório</CardTitle></CardHeader>
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
          <div className="flex items-end">
            <Button onClick={generate} className="gap-2 w-full sm:w-auto" size="lg" disabled={!clientId || filtered.length === 0}>
              <FileDown className="h-4 w-4" /> Gerar PDF
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
                  <Stat label="Total" value={fmtCurrency(totals.total)} highlight />
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
                        const t = reportTotals(r, client);
                        return (
                          <tr key={r.id}>
                            <td className="p-2 font-mono text-xs">{r.orderNumber}</td>
                            <td className="p-2">{r.date.split("-").reverse().join("/")}</td>
                            <td className="p-2">{r.machine}</td>
                            <td className="p-2 capitalize">{r.type}</td>
                            <td className="p-2 text-right">{fmtHours(t.totalHours)}</td>
                            <td className="p-2 text-right">{r.km}</td>
                            <td className="p-2 text-right font-semibold">{fmtCurrency(t.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted font-semibold">
                      <tr>
                        <td colSpan={4} className="p-2">TOTAL</td>
                        <td className="p-2 text-right">{fmtHours(totals.hours)}</td>
                        <td className="p-2 text-right">{totals.km}</td>
                        <td className="p-2 text-right text-primary">{fmtCurrency(totals.total)}</td>
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
