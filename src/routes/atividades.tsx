import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useClients, useReports, useSettings, useTechnicians, useAllSessions } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import {
  reportTotals, technicianTotals, fmtCurrency, fmtHours,
  listAttachments, uploadAttachment, deleteAttachment,
  listActivityTechnicians, replaceActivityTechnicians,
  listSessions, createSession, updateSession, deleteSession,
  reportTotalsWithSessions,
  type Client, type ServiceReport, type ServiceType, type Technician,
  type ActivityAttachment, type ActivityTechnician, type AttachmentKind,
  type ServiceSession,
} from "@/lib/api";
import { Plus, Pencil, Trash2, FileDown, Wrench, Search, Upload, X, CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  futureReplacements: "",
});

type PdfChoice = {
  open: boolean;
  report?: ServiceReport;
};

function Atividades() {
  const { clients } = useClients();
  const { technicians } = useTechnicians();
  const { reports, addReport, updateReport, deleteReport } = useReports();
  const { settings } = useSettings();
  const { sessions: allSessions } = useAllSessions();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>(empty());
  const [editingExtras, setEditingExtras] = useState<{
    existingAttachments: ActivityAttachment[];
    pendingAttachments: { kind: AttachmentKind; file: File; previewUrl: string }[];
    removedAttachmentIds: Set<string>;
    activityTechnicians: ActivityTechnician[];
    sessions: ServiceSession[];                    // existing (loaded)
    newSessions: Omit<ServiceSession, "id">[];     // to insert
    editedSessions: Map<string, ServiceSession>;   // id -> updated
    removedSessionIds: Set<string>;
  }>({
    existingAttachments: [], pendingAttachments: [], removedAttachmentIds: new Set(),
    activityTechnicians: [], sessions: [], newSessions: [], editedSessions: new Map(), removedSessionIds: new Set(),
  });
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [pdfChoice, setPdfChoice] = useState<PdfChoice>({ open: false });

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
  const techMap = useMemo(() => new Map(technicians.map(t => [t.id, t])), [technicians]);
  const sessionsByActivity = useMemo(() => {
    const m = new Map<string, ServiceSession[]>();
    for (const s of allSessions) {
      const arr = m.get(s.activityId) ?? [];
      arr.push(s);
      m.set(s.activityId, arr);
    }
    return m;
  }, [allSessions]);

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

  const emptyExtras = () => ({
    existingAttachments: [] as ActivityAttachment[],
    pendingAttachments: [] as { kind: AttachmentKind; file: File; previewUrl: string }[],
    removedAttachmentIds: new Set<string>(),
    activityTechnicians: [] as ActivityTechnician[],
    sessions: [] as ServiceSession[],
    newSessions: [] as Omit<ServiceSession, "id">[],
    editedSessions: new Map<string, ServiceSession>(),
    removedSessionIds: new Set<string>(),
  });

  const startNew = () => {
    if (clients.length === 0) { toast.error("Cadastre um cliente primeiro"); return; }
    if (technicians.length === 0) { toast.error("Cadastre um técnico primeiro"); return; }
    setEditing(empty(settings.technicianName));
    setEditingExtras(emptyExtras());
    setOpen(true);
  };

  const startEdit = async (r: ServiceReport) => {
    setEditing(r);
    setEditingExtras(emptyExtras());
    setOpen(true);
    try {
      const sess = await listSessions(r.id);
      setEditingExtras(prev => ({ ...prev, sessions: sess }));
    } catch (e) { console.error(e); }
    if (r.type === "preventiva") {
      try {
        const [att, ats] = await Promise.all([listAttachments(r.id), listActivityTechnicians(r.id)]);
        setEditingExtras(prev => ({ ...prev, existingAttachments: att, activityTechnicians: ats }));
      } catch (e: any) {
        toast.error(e?.message ?? "Erro ao carregar anexos");
      }
    }
  };

  const save = async () => {
    if (!editing.clientId) { toast.error("Selecione o cliente"); return; }
    if (!editing.machine.trim()) { toast.error("Informe a máquina"); return; }
    if (!editing.requester.trim()) { toast.error("Informe o solicitante"); return; }

    if (editing.type === "corretiva") {
      if (!editing.technician.trim()) { toast.error("Selecione o técnico"); return; }
    } else {
      const techs = editingExtras.activityTechnicians.filter(t => t.technicianId);
      if (techs.length === 0) { toast.error("Adicione ao menos um técnico"); return; }
      if (techs.length > 4) { toast.error("Máximo de 4 técnicos"); return; }
    }

    try {
      let activityId = editing.id;
      // For preventiva, mirror first technician name to legacy column for reports compat
      const firstTech = editingExtras.activityTechnicians[0];
      const techName = editing.type === "preventiva"
        ? (firstTech ? (techMap.get(firstTech.technicianId)?.name ?? "") : "")
        : editing.technician;

      if (editing.id) {
        const updated = await updateReport.mutateAsync({ ...(editing as ServiceReport), technician: techName });
        activityId = updated.id;
        toast.success("OS atualizada");
      } else {
        const nextNum = (Math.max(0, ...reports.map(r => parseInt(r.orderNumber) || 0)) + 1).toString().padStart(4, "0");
        const { id: _i, createdAt: _c, ...payload } = editing;
        const created = await addReport.mutateAsync({ ...payload, technician: techName, orderNumber: editing.orderNumber || nextNum });
        activityId = created.id;
        toast.success("OS registrada");
      }

      if (editing.type === "preventiva" && activityId && user) {
        // Replace technicians
        await replaceActivityTechnicians(user.id, activityId,
          editingExtras.activityTechnicians.filter(t => t.technicianId)
            .map((t, i) => ({ ...t, position: i + 1 })));

        // Delete removed attachments
        for (const att of editingExtras.existingAttachments) {
          if (editingExtras.removedAttachmentIds.has(att.id)) {
            try { await deleteAttachment(att); } catch (e) { console.error(e); }
          }
        }
        // Upload pending
        for (const p of editingExtras.pendingAttachments) {
          try { await uploadAttachment(user.id, activityId, p.kind, p.file); }
          catch (e) { console.error(e); toast.error("Falha ao enviar um anexo"); }
        }
      }

      // Persist sessions (add / update / remove)
      if (activityId && user) {
        try {
          for (const id of editingExtras.removedSessionIds) {
            try { await deleteSession(id); } catch (e) { console.error(e); }
          }
          for (const [, sess] of editingExtras.editedSessions) {
            try { await updateSession(sess); } catch (e) { console.error(e); }
          }
          for (const sess of editingExtras.newSessions) {
            try { await createSession({ ...sess, activityId }, user.id); } catch (e) { console.error(e); }
          }
          qc.invalidateQueries({ queryKey: ["sessions", user.id] });
        } catch (e) { console.error(e); }
      }

      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta OS?")) return;
    try {
      await deleteReport.mutateAsync(id);
      toast.success("OS excluída");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  const openPdfChoice = (r: ServiceReport) => setPdfChoice({ open: true, report: r });

  const totals = useMemo(() => {
    return filtered.reduce((acc, r) => {
      const sess = sessionsByActivity.get(r.id) ?? [];
      const t = reportTotalsWithSessions(r, sess, clientMap.get(r.clientId));
      acc.hours += t.totalHours; acc.value += t.total; acc.km += t.km;
      return acc;
    }, { hours: 0, value: 0, km: 0 });
  }, [filtered, clientMap, sessionsByActivity]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordem de Serviço</h1>
          <p className="text-muted-foreground mt-1">Registre cada atendimento de manutenção</p>
        </div>
        <Button onClick={startNew} size="lg" className="gap-2"><Plus className="h-4 w-4" /> Ordem de Serviço</Button>
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
          <p className="font-medium">Nenhuma OS encontrada</p>
          <p className="text-sm mt-1">Clique em "Ordem de Serviço" para começar.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const c = clientMap.get(r.clientId);
            const sess = sessionsByActivity.get(r.id) ?? [];
            const t = reportTotalsWithSessions(r, sess, c);
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
                        {sess.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            +{sess.length} sessão{sess.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mt-2">{c?.name || "Cliente removido"}</h3>
                      <p className="text-sm text-muted-foreground">{r.machine} {r.requester && `· Sol.: ${r.requester}`}</p>
                      {r.description && <p className="text-sm mt-2 line-clamp-2">{r.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Serviço: <b className="text-foreground">{fmtHours(t.service)}</b></span>
                        <span>Deslocamento: <b className="text-foreground">{fmtHours(t.travelOut + t.travelBack)}</b></span>
                        <span>KM: <b className="text-foreground">{t.km}</b></span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{fmtCurrency(t.total)}</div>
                        <div className="text-xs text-muted-foreground">{fmtHours(t.totalHours)} totais</div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={() => openPdfChoice(r)} title="Exportar PDF"><FileDown className="h-4 w-4" /></Button>
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
        extras={editingExtras} setExtras={setEditingExtras}
        clients={clients} technicians={technicians} onSave={save}
      />

      <PdfChoiceDialog
        state={pdfChoice} onClose={() => setPdfChoice({ open: false })}
        clientMap={clientMap} settings={settings}
      />
    </div>
  );
}

function PdfChoiceDialog({ state, onClose, clientMap, settings }: {
  state: PdfChoice;
  onClose: () => void;
  clientMap: Map<string, Client>;
  settings: any;
}) {
  if (!state.report) {
    return <Dialog open={state.open} onOpenChange={onClose}><DialogContent /></Dialog>;
  }
  const r = state.report;
  const client = clientMap.get(r.clientId);

  const exportInformative = async () => {
    try {
      const { exportPreventiveInformativeReport } = await import("@/lib/pdf");
      await exportPreventiveInformativeReport(r, client, settings);
      onClose();
    } catch (e: any) { console.error(e); toast.error(e?.message ?? "Erro ao gerar PDF"); }
  };
  const exportOperational = async (includeValues: boolean) => {
    try {
      const { exportSingleReport } = await import("@/lib/pdf");
      exportSingleReport(r, client, settings, { includeValues });
      onClose();
    } catch (e: any) { console.error(e); toast.error(e?.message ?? "Erro ao gerar PDF"); }
  };

  return (
    <Dialog open={state.open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar relatório em PDF</DialogTitle>
          <DialogDescription>OS {r.orderNumber} — {client?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {r.type === "preventiva" && (
            <Button onClick={exportInformative} className="w-full justify-start h-auto py-3" variant="outline">
              <div className="text-left">
                <div className="font-semibold">Informativo (cliente)</div>
                <div className="text-xs text-muted-foreground">Layout profissional com fotos antes/depois e requisições futuras — sem valores</div>
              </div>
            </Button>
          )}
          <Button onClick={() => exportOperational(true)} className="w-full justify-start h-auto py-3" variant="outline">
            <div className="text-left">
              <div className="font-semibold">{r.type === "preventiva" ? "Operacional — com valores" : "Completo — com valores"}</div>
              <div className="text-xs text-muted-foreground">Inclui apuração de valores cobrados do cliente e pagos ao técnico</div>
            </div>
          </Button>
          <Button onClick={() => exportOperational(false)} className="w-full justify-start h-auto py-3" variant="outline">
            <div className="text-left">
              <div className="font-semibold">{r.type === "preventiva" ? "Operacional — sem valores" : "Sem valores"}</div>
              <div className="text-xs text-muted-foreground">Apenas informações técnicas, horas e KM</div>
            </div>
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type Extras = {
  existingAttachments: ActivityAttachment[];
  pendingAttachments: { kind: AttachmentKind; file: File; previewUrl: string }[];
  removedAttachmentIds: Set<string>;
  activityTechnicians: ActivityTechnician[];
  sessions: ServiceSession[];
  newSessions: Omit<ServiceSession, "id">[];
  editedSessions: Map<string, ServiceSession>;
  removedSessionIds: Set<string>;
};

function ActivityDialog({ open, onOpenChange, editing, setEditing, extras, setExtras, clients, technicians, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  editing: Editing; setEditing: (e: Editing) => void;
  extras: Extras; setExtras: React.Dispatch<React.SetStateAction<Extras>>;
  clients: Client[]; technicians: Technician[]; onSave: () => void;
}) {
  const client = clients.find((c) => c.id === editing.clientId);
  const isPreventive = editing.type === "preventiva";

  // Corretive apuração uses single technician + per-report overtime
  const singleTechnician = technicians.find((tc) => tc.name === editing.technician);
  const t = reportTotals(editing as ServiceReport, client);
  const ttSingle = technicianTotals(editing as ServiceReport, singleTechnician);

  // Preventive apuração: sum across all attached technicians
  const preventiveTechTotals = useMemo(() => {
    if (!isPreventive) return null;
    return extras.activityTechnicians.reduce((acc, at) => {
      const tech = technicians.find(t => t.id === at.technicianId);
      if (!tech) return acc;
      const reportLike = {
        ...(editing as ServiceReport),
        overtimeWeekdayHours: at.overtimeWeekdayHours,
        overtimeWeekendHours: at.overtimeWeekendHours,
      } as ServiceReport;
      const tt = technicianTotals(reportLike, tech);
      acc.totalHours = tt.totalHours;
      acc.hoursValue += tt.hoursValue;
      acc.kmValue += tt.kmValue;
      acc.total += tt.total;
      acc.ovtWk += tt.ovtWk;
      acc.ovtWe += tt.ovtWe;
      return acc;
    }, { totalHours: 0, hoursValue: 0, kmValue: 0, total: 0, ovtWk: 0, ovtWe: 0 });
  }, [isPreventive, extras.activityTechnicians, technicians, editing]);

  const techTotalsForApur = isPreventive ? preventiveTechTotals! : ttSingle;
  const showApur = client || (isPreventive ? extras.activityTechnicians.length > 0 : singleTechnician);
  const profit = client && techTotalsForApur ? t.hoursValue - techTotalsForApur.hoursValue : 0;

  const addTechnician = () => {
    if (extras.activityTechnicians.length >= 4) { toast.error("Máximo de 4 técnicos"); return; }
    setExtras(prev => ({
      ...prev,
      activityTechnicians: [...prev.activityTechnicians, {
        technicianId: "", position: prev.activityTechnicians.length + 1,
        overtimeWeekdayHours: 0, overtimeWeekendHours: 0,
      }],
    }));
  };
  const updateAt = (idx: number, patch: Partial<ActivityTechnician>) => {
    setExtras(prev => ({
      ...prev,
      activityTechnicians: prev.activityTechnicians.map((a, i) => i === idx ? { ...a, ...patch } : a),
    }));
  };
  const removeAt = (idx: number) => {
    setExtras(prev => ({
      ...prev,
      activityTechnicians: prev.activityTechnicians.filter((_, i) => i !== idx),
    }));
  };

  // When switching to preventive, seed first technician from legacy field
  useEffect(() => {
    if (isPreventive && extras.activityTechnicians.length === 0 && !editing.id) {
      const t = technicians.find(t => t.name === editing.technician);
      if (t) {
        setExtras(prev => ({
          ...prev,
          activityTechnicians: [{
            technicianId: t.id, position: 1,
            overtimeWeekdayHours: editing.overtimeWeekdayHours || 0,
            overtimeWeekendHours: editing.overtimeWeekendHours || 0,
          }],
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreventive]);

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
            <Label>{isPreventive ? "Descrição de Atividades Mecânicas" : "Descrição do serviço solicitado / problema"}</Label>
            <Textarea rows={isPreventive ? 3 : 2} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            {isPreventive && (
              <AttachmentBlocks
                label="Atividades Mecânicas"
                extras={extras} setExtras={setExtras}
                kinds={[["mechanical_before", "Antes"], ["mechanical_after", "Depois"]]}
              />
            )}
          </div>

          <div className="grid gap-2">
            <Label>{isPreventive ? "Descrição das Atividades Elétricas" : "Resumo dos serviços executados"}</Label>
            <Textarea rows={3} value={editing.summary} onChange={e => setEditing({ ...editing, summary: e.target.value })} />
            {isPreventive && (
              <AttachmentBlocks
                label="Atividades Elétricas"
                extras={extras} setExtras={setExtras}
                kinds={[["electrical_before", "Antes"], ["electrical_after", "Depois"]]}
              />
            )}
          </div>

          {isPreventive && (
            <div className="grid gap-2">
              <Label>Requisições para troca futura</Label>
              <Textarea rows={2} value={editing.futureReplacements || ""}
                onChange={e => setEditing({ ...editing, futureReplacements: e.target.value })}
                placeholder="Itens / peças que precisarão ser substituídos no próximo atendimento" />
            </div>
          )}

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
              {!isPreventive && (
                <div className="grid gap-2">
                  <Label>Técnico *</Label>
                  <Select value={editing.technician} onValueChange={(v) => setEditing({ ...editing, technician: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {technicians.map((tc) => <SelectItem key={tc.id} value={tc.name}>{tc.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {!isPreventive && (
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
            )}
          </section>

          {isPreventive && (
            <section className="grid gap-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Técnicos da atividade (até 4) *</div>
                <Button type="button" size="sm" variant="outline" onClick={addTechnician}
                  disabled={extras.activityTechnicians.length >= 4}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar técnico
                </Button>
              </div>
              {extras.activityTechnicians.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum técnico adicionado.</p>
              )}
              {extras.activityTechnicians.map((at, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_140px_140px_auto] items-end p-3 rounded bg-muted/40">
                  <div className="grid gap-1">
                    <Label className="text-xs">Técnico #{idx + 1}</Label>
                    <Select value={at.technicianId} onValueChange={v => updateAt(idx, { technicianId: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {technicians.map(tc => <SelectItem key={tc.id} value={tc.id}>{tc.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">HE semana</Label>
                    <Input type="number" step="0.5" min="0" value={at.overtimeWeekdayHours || ""}
                      onChange={e => updateAt(idx, { overtimeWeekdayHours: Number(e.target.value) })} placeholder="0" />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">HE fim de semana</Label>
                    <Input type="number" step="0.5" min="0" value={at.overtimeWeekendHours || ""}
                      onChange={e => updateAt(idx, { overtimeWeekendHours: Number(e.target.value) })} placeholder="0" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeAt(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </section>
          )}

          <div className="grid gap-2">
            <Label>Observação</Label>
            <Textarea rows={2} value={editing.observation || ""} onChange={e => setEditing({ ...editing, observation: e.target.value })} />
          </div>

          {editing.id ? (
            <SessionsSection extras={extras} setExtras={setExtras} technicians={technicians} />
          ) : (
            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Após salvar a OS, você poderá adicionar sessões adicionais de trabalho (mais dias, outros técnicos, novas atividades) dentro desta mesma ordem.
            </div>
          )}


          {showApur && techTotalsForApur && (
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
                {(isPreventive ? extras.activityTechnicians.length > 0 : singleTechnician) && (
                  <div className="pt-3 border-t border-primary/20">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      A repassar para {isPreventive ? `${extras.activityTechnicians.length} técnico(s)` : "o técnico"}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div><div className="text-muted-foreground text-xs">Horas totais</div><div className="font-semibold">{fmtHours(techTotalsForApur.totalHours)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor horas</div><div className="font-semibold">{fmtCurrency(techTotalsForApur.hoursValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor km</div><div className="font-semibold">{fmtCurrency(techTotalsForApur.kmValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">TOTAL</div><div className="font-bold text-lg">{fmtCurrency(techTotalsForApur.total)}</div></div>
                    </div>
                  </div>
                )}
                {client && techTotalsForApur && (isPreventive ? extras.activityTechnicians.length > 0 : singleTechnician) && (
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

function AttachmentBlocks({ label, extras, setExtras, kinds }: {
  label: string;
  extras: Extras;
  setExtras: React.Dispatch<React.SetStateAction<Extras>>;
  kinds: [AttachmentKind, string][];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 mt-2">
      {kinds.map(([kind, lbl]) => (
        <AttachmentBlock key={kind} kind={kind} label={`${label} — ${lbl}`} extras={extras} setExtras={setExtras} />
      ))}
    </div>
  );
}

function AttachmentBlock({ kind, label, extras, setExtras }: {
  kind: AttachmentKind; label: string;
  extras: Extras; setExtras: React.Dispatch<React.SetStateAction<Extras>>;
}) {
  const existing = extras.existingAttachments.filter(a => a.kind === kind && !extras.removedAttachmentIds.has(a.id));
  const pending = extras.pendingAttachments.filter(p => p.kind === kind);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const items = Array.from(files).map(file => ({
      kind, file, previewUrl: URL.createObjectURL(file),
    }));
    setExtras(prev => ({ ...prev, pendingAttachments: [...prev.pendingAttachments, ...items] }));
  };
  const removeExisting = (id: string) => {
    setExtras(prev => {
      const next = new Set(prev.removedAttachmentIds);
      next.add(id);
      return { ...prev, removedAttachmentIds: next };
    });
  };
  const removePending = (idx: number) => {
    setExtras(prev => {
      const filtered = [...prev.pendingAttachments];
      let counter = -1;
      const out = filtered.filter(p => {
        if (p.kind !== kind) return true;
        counter++;
        return counter !== idx;
      });
      return { ...prev, pendingAttachments: out };
    });
  };

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">{label}</span>
        <label className="cursor-pointer text-xs inline-flex items-center gap-1 text-primary hover:underline">
          <Upload className="h-3 w-3" /> Anexar
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={e => { onFiles(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {existing.map(a => (
          <ExistingThumb key={a.id} att={a} onRemove={() => removeExisting(a.id)} />
        ))}
        {pending.map((p, i) => (
          <div key={i} className="relative w-16 h-16 rounded border overflow-hidden bg-muted">
            <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => removePending(i)}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {existing.length + pending.length === 0 && (
          <span className="text-xs text-muted-foreground">Nenhum anexo</span>
        )}
      </div>
    </div>
  );
}

function ExistingThumb({ att, onRemove }: { att: ActivityAttachment; onRemove: () => void }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    let mounted = true;
    import("@/lib/api").then(({ getAttachmentUrl }) => getAttachmentUrl(att.storagePath))
      .then(u => { if (mounted) setUrl(u); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [att.storagePath]);
  return (
    <div className="relative w-16 h-16 rounded border overflow-hidden bg-muted">
      {url && <img src={url} alt="" className="w-full h-full object-cover" />}
      <button type="button" onClick={onRemove}
        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
        <X className="h-3 w-3" />
      </button>
    </div>
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
