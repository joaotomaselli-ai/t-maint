import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useClients, useReports, useSettings, useTechnicians } from "@/hooks/use-data";
import { reportTotals, technicianTotals, fmtCurrency, fmtHours, type Client, type ServiceReport, type ServiceType, type Technician } from "@/lib/api";
// pdf lib imported dynamically inside the handler to avoid SSR issues
import { Plus, Pencil, Trash2, FileDown, Wrench, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/atividades")({ component: Atividades });

type Editing = Omit<ServiceReport, "id" | "createdAt"> & { id?: string; createdAt?: string };

const empty = (technician = ""): Editing => ({
  orderNumber: "", clientId: "",
  date: new Date().toISOString().slice(0, 10),
  machine: "", requester: "", type: "corretiva" as ServiceType,
  description: "", summary: "",
  travelOutStart: "", travelOutEnd: "",
  serviceStart: "", serviceEnd: "",
  travelBackStart: "", travelBackEnd: "",
  km: 0, observation: "", technician,
  overtimeWeekdayHours: 0, overtimeWeekendHours: 0,
});

function Atividades() {
  const { clients } = useClients();
  const { technicians } = useTechnicians();
  const { reports, addReport, updateReport, deleteReport } = useReports();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>(empty());
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);

  const filtered = useMemo(() => {
    return [...reports]
      .filter(r => filterClient === "all" || r.clientId === filterClient)
      .filter(r => filterType === "all" || r.type === filterType)
      .filter(r => {
        if (!search) return true;
        const s = search.toLowerCase();
        const c = clientMap.get(r.clientId);
        return r.machine.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s) ||
          r.orderNumber.toLowerCase().includes(s) ||
          (c?.name.toLowerCase().includes(s) ?? false);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [reports, filterClient, filterType, search, clientMap]);

  const startNew = () => {
    if (clients.length === 0) { toast.error("Cadastre um cliente primeiro"); return; }
    if (technicians.length === 0) { toast.error("Cadastre um técnico primeiro"); return; }
    setEditing(empty(settings.technicianName));
    setOpen(true);
  };
  const startEdit = (r: ServiceReport) => { setEditing(r); setOpen(true); };

  const save = async () => {
    if (!editing.clientId) { toast.error("Selecione o cliente"); return; }
    if (!editing.machine.trim()) { toast.error("Informe a máquina"); return; }
    if (!editing.requester.trim()) { toast.error("Informe o solicitante"); return; }
    if (!editing.technician.trim()) { toast.error("Selecione o técnico"); return; }
    try {
      if (editing.id) {
        await updateReport.mutateAsync(editing as ServiceReport);
        toast.success("Atividade atualizada");
      } else {
        const nextNum = (Math.max(0, ...reports.map(r => parseInt(r.orderNumber) || 0)) + 1).toString().padStart(4, "0");
        const { id: _i, createdAt: _c, ...payload } = editing;
        await addReport.mutateAsync({ ...payload, orderNumber: editing.orderNumber || nextNum });
        toast.success("Atividade registrada");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta atividade?")) return;
    try {
      await deleteReport.mutateAsync(id);
      toast.success("Atividade excluída");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  const exportPdf = async (r: ServiceReport) => {
    try {
      const { exportSingleReport } = await import("@/lib/pdf");
      exportSingleReport(r, clientMap.get(r.clientId), settings);
    } catch (e) {
      console.error(e);
    }
  };


  const totals = useMemo(() => {
    return filtered.reduce((acc, r) => {
      const t = reportTotals(r, clientMap.get(r.clientId));
      acc.hours += t.totalHours; acc.value += t.total; acc.km += r.km || 0;
      return acc;
    }, { hours: 0, value: 0, km: 0 });
  }, [filtered, clientMap]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
          <p className="text-muted-foreground mt-1">Registre cada atendimento de manutenção</p>
        </div>
        <Button onClick={startNew} size="lg" className="gap-2"><Plus className="h-4 w-4" /> Nova atividade</Button>
      </header>

      <Card>
        <CardContent className="p-4 grid gap-3 sm:grid-cols-[1fr_200px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por OS, máquina, cliente..." className="pl-9" />
          </div>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="corretiva">Corretiva</SelectItem>
              <SelectItem value="preventiva">Preventiva</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Card><CardContent className="p-4"><div className="text-muted-foreground text-xs">Atendimentos filtrados</div><div className="text-xl font-bold mt-1">{filtered.length}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-muted-foreground text-xs">Horas totais</div><div className="text-xl font-bold mt-1">{fmtHours(totals.hours)}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-muted-foreground text-xs">Valor total</div><div className="text-xl font-bold mt-1 text-primary">{fmtCurrency(totals.value)}</div></CardContent></Card>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma atividade encontrada</p>
          <p className="text-sm mt-1">Clique em "Nova atividade" para começar.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const c = clientMap.get(r.clientId);
            const t = reportTotals(r, c);
            return (
              <Card key={r.id} className="hover:shadow-elegant transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">OS {r.orderNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.type === "corretiva" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                          {r.type === "corretiva" ? "Corretiva" : "Preventiva"}
                        </span>
                        <span className="text-xs text-muted-foreground">{format(new Date(r.date + "T00:00:00"), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                      </div>
                      <h3 className="font-semibold text-lg mt-2">{c?.name || "Cliente removido"}</h3>
                      <p className="text-sm text-muted-foreground">{r.machine} {r.requester && `· Sol.: ${r.requester}`}</p>
                      {r.description && <p className="text-sm mt-2 line-clamp-2">{r.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Serviço: <b className="text-foreground">{fmtHours(t.service)}</b></span>
                        <span>Deslocamento: <b className="text-foreground">{fmtHours(t.travelOut + t.travelBack)}</b></span>
                        <span>KM: <b className="text-foreground">{r.km}</b></span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{fmtCurrency(t.total)}</div>
                        <div className="text-xs text-muted-foreground">{fmtHours(t.totalHours)} totais</div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={() => exportPdf(r)} title="Exportar PDF"><FileDown className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(r)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ActivityDialog
        open={open} onOpenChange={setOpen}
        editing={editing} setEditing={setEditing}
        clients={clients} technicians={technicians} onSave={save}
      />
    </div>
  );
}

function ActivityDialog({ open, onOpenChange, editing, setEditing, clients, technicians, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  editing: Editing; setEditing: (e: Editing) => void;
  clients: Client[]; technicians: Technician[]; onSave: () => void;
}) {
  const client = clients.find((c) => c.id === editing.clientId);
  const technician = technicians.find((tc) => tc.name === editing.technician);
  const t = reportTotals(editing as ServiceReport, client);
  const tt = technicianTotals(editing as ServiceReport, technician);
  const profit = t.hoursValue - tt.hoursValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing.id ? "Editar atividade" : "Nova atividade"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <section className="grid gap-4 sm:grid-cols-[1fr_140px_140px]">
            <div className="grid gap-2">
              <Label>Cliente *</Label>
              <Select value={editing.clientId} onValueChange={(v) => setEditing({ ...editing, clientId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>OS</Label>
              <Input value={editing.orderNumber} onChange={e => setEditing({ ...editing, orderNumber: e.target.value })} placeholder="Auto" />
            </div>
            <div className="grid gap-2">
              <Label>Data *</Label>
              <Input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-[1fr_1fr_180px]">
            <div className="grid gap-2">
              <Label>Máquina *</Label>
              <Input value={editing.machine} onChange={e => setEditing({ ...editing, machine: e.target.value })} placeholder="Ex: Fresa CNC, Torno Convencional" />
            </div>
            <div className="grid gap-2">
              <Label>Solicitante *</Label>
              <Input value={editing.requester} onChange={e => setEditing({ ...editing, requester: e.target.value })} placeholder="Nome do responsável" />
            </div>
            <div className="grid gap-2">
              <Label>Tipo *</Label>
              <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as ServiceType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <div className="grid gap-2">
            <Label>Descrição do serviço solicitado / problema</Label>
            <Textarea rows={2} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
          </div>

          <div className="grid gap-2">
            <Label>Resumo dos serviços executados</Label>
            <Textarea rows={3} value={editing.summary} onChange={e => setEditing({ ...editing, summary: e.target.value })} />
          </div>

          <section className="grid gap-4 rounded-lg border p-4 bg-muted/30">
            <div className="text-sm font-semibold">Horários</div>
            <div className="grid gap-4 sm:grid-cols-3">
              <TimeRange label="Viagem de ida" startVal={editing.travelOutStart} endVal={editing.travelOutEnd}
                onStart={v => setEditing({ ...editing, travelOutStart: v })} onEnd={v => setEditing({ ...editing, travelOutEnd: v })} hours={t.travelOut} />
              <TimeRange label="Serviço" startVal={editing.serviceStart} endVal={editing.serviceEnd}
                onStart={v => setEditing({ ...editing, serviceStart: v })} onEnd={v => setEditing({ ...editing, serviceEnd: v })} hours={t.service} />
              <TimeRange label="Viagem de volta" startVal={editing.travelBackStart} endVal={editing.travelBackEnd}
                onStart={v => setEditing({ ...editing, travelBackStart: v })} onEnd={v => setEditing({ ...editing, travelBackEnd: v })} hours={t.travelBack} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Quilometragem total (km)</Label>
                <Input type="number" step="1" value={editing.km || ""} onChange={e => setEditing({ ...editing, km: Number(e.target.value) })} placeholder="50" />
              </div>
              <div className="grid gap-2">
                <Label>Técnico *</Label>
                <Select value={editing.technician} onValueChange={(v) => setEditing({ ...editing, technician: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {technicians.map((tc) => <SelectItem key={tc.id} value={tc.name}>{tc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Horas especiais durante a semana</Label>
                <Input type="number" step="0.5" min="0" value={editing.overtimeWeekdayHours || ""}
                  onChange={e => setEditing({ ...editing, overtimeWeekdayHours: Number(e.target.value) })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Horas especiais no final de semana</Label>
                <Input type="number" step="0.5" min="0" value={editing.overtimeWeekendHours || ""}
                  onChange={e => setEditing({ ...editing, overtimeWeekendHours: Number(e.target.value) })} placeholder="0" />
              </div>
            </div>
          </section>

          <div className="grid gap-2">
            <Label>Observação</Label>
            <Textarea rows={2} value={editing.observation || ""} onChange={e => setEditing({ ...editing, observation: e.target.value })} />
          </div>

          {(client || technician) && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2"><CardTitle className="text-base">Apuração</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                {client && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">A receber do cliente</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div><div className="text-muted-foreground text-xs">Horas totais</div><div className="font-semibold">{fmtHours(t.totalHours)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor horas</div><div className="font-semibold">{fmtCurrency(t.hoursValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor km</div><div className="font-semibold">{fmtCurrency(t.kmValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">TOTAL</div><div className="font-bold text-lg text-primary">{fmtCurrency(t.total)}</div></div>
                    </div>
                  </div>
                )}
                {technician && (
                  <div className="pt-3 border-t border-primary/20">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">A repassar para o técnico</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div><div className="text-muted-foreground text-xs">Horas totais</div><div className="font-semibold">{fmtHours(tt.totalHours)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor horas</div><div className="font-semibold">{fmtCurrency(tt.hoursValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor km</div><div className="font-semibold">{fmtCurrency(tt.kmValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">TOTAL</div><div className="font-bold text-lg">{fmtCurrency(tt.total)}</div></div>
                    </div>
                    {(tt.ovtWk > 0 || tt.ovtWe > 0) && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Regulares: {fmtHours(tt.regularHours)} · Especiais semana: {fmtHours(tt.ovtWk)} · Especiais fim de semana: {fmtHours(tt.ovtWe)}
                      </div>
                    )}
                  </div>
                )}
                {client && technician && (
                  <div className="pt-3 border-t border-primary/20 flex items-center justify-between">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">Lucro em horas (receber − pagar)</div>
                    <div className={`font-bold text-lg ${profit >= 0 ? "text-success" : "text-destructive"}`}>{fmtCurrency(profit)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>Salvar atividade</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TimeRange({ label, startVal, endVal, onStart, onEnd, hours }: { label: string; startVal: string; endVal: string; onStart: (v: string) => void; onEnd: (v: string) => void; hours: number }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-1 items-center">
        <Input type="time" value={startVal} onChange={e => onStart(e.target.value)} className="px-2" />
        <span className="text-muted-foreground text-xs">→</span>
        <Input type="time" value={endVal} onChange={e => onEnd(e.target.value)} className="px-2" />
      </div>
      <div className="text-xs text-muted-foreground">{fmtHours(hours)}</div>
    </div>
  );
}
