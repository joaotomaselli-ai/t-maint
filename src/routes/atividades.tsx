import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useClients, useReports, useSettings, useTechnicians, useAllSessions, useAllActivityTechnicians, useClientPayments, useTechnicianPayments } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { useAccess } from "@/hooks/use-access";
import {
  reportTotals, technicianTotals, fmtCurrency, fmtHours,
  listAttachments, uploadAttachment, deleteAttachment,
  listActivityTechnicians, replaceActivityTechnicians,
  listSessions, createSession, updateSession, deleteSession,
  reportTotalsWithSessions, sessionTechnicianTotals, technicianPayForReport,
  type Client, type ServiceReport, type ServiceType, type Technician,
  type ActivityAttachment, type ActivityTechnician, type AttachmentKind,
  type ServiceSession,
} from "@/lib/api";
import { useMoney } from "@/hooks/use-money-visibility";
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
  discountHours: 0,
});

type PdfChoice = {
  open: boolean;
  report?: ServiceReport;
};

function Atividades() {
  const money = useMoney();
  const { clients } = useClients();
  const { technicians } = useTechnicians();
  const { reports, addReport, updateReport, deleteReport } = useReports();
  const { settings } = useSettings();
  const { sessions: allSessions } = useAllSessions();
  const { activityTechnicians: allActivityTechnicians } = useAllActivityTechnicians();
  const { payments: clientPays } = useClientPayments();
  const { payments: techPays } = useTechnicianPayments();
  const paidByClient = useMemo(() => new Set(clientPays.map(p => p.activityId)), [clientPays]);
  const paidTechSet = useMemo(() => new Set(techPays.map(p => `${p.activityId}::${p.technicianId}`)), [techPays]);
  const { user } = useAuth();
  const { isTechnician } = useAccess();
  const myTechId = useMemo(() => technicians.find(t => t.userId === user?.id)?.id, [technicians, user?.id]);
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
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [pdfChoice, setPdfChoice] = useState<PdfChoice>({ open: false });

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
  const techMap = useMemo(() => new Map(technicians.map(t => [t.id, t])), [technicians]);
  const sessionsByActivity = useMemo(() => {
    const map = new Map<string, ServiceSession[]>();
    for (const s of allSessions) {
      if (!map.has(s.activityId)) map.set(s.activityId, []);
      map.get(s.activityId)!.push(s);
    }
    return map;
  }, [allSessions]);

  const actByActivity = useMemo(() => {
    const map = new Map<string, ActivityTechnician[]>();
    for (const a of allActivityTechnicians) {
      if (!map.has(a.activityId)) map.set(a.activityId, []);
      map.get(a.activityId)!.push(a);
    }
    return map;
  }, [allActivityTechnicians]);

  const filtered = useMemo(() => {
    return [...reports]
      .filter(r => filterClient === "all" || r.clientId === filterClient)
      .filter(r => filterType === "all" || r.type === filterType)
      .filter(r => !dateFrom || r.date >= dateFrom)
      .filter(r => !dateTo || r.date <= dateTo)
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
  }, [reports, filterClient, filterType, dateFrom, dateTo, search, clientMap]);

  useEffect(() => { setPage(1); }, [search, filterClient, filterType, dateFrom, dateTo, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

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
    
    let defaultTechName = settings.technicianName;
    let initialTechs: ActivityTechnician[] = [];
    if (isTechnician) {
      const myTech = technicians.find(t => t.userId === user?.id);
      if (myTech) {
        defaultTechName = myTech.name;
        initialTechs = [{
          technicianId: myTech.id, position: 1,
          overtimeWeekdayHours: 0, overtimeWeekendHours: 0,
        }];
      }
    }

    setEditing(empty(defaultTechName));
    const extras = emptyExtras();
    if (initialTechs.length > 0) extras.activityTechnicians = initialTechs;
    setEditingExtras(extras);
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
    if (!editing.date) { toast.error("Informe a data"); return; }
    if (!editing.machine.trim()) { toast.error("Informe a máquina"); return; }
    if (!editing.requester.trim()) { toast.error("Informe o solicitante"); return; }
    if (!editing.type) { toast.error("Selecione o tipo"); return; }

    if (editing.type === "corretiva") {
      if (!editing.technician.trim()) { toast.error("Selecione o técnico"); return; }
    } else {
      const techs = editingExtras.activityTechnicians.filter(t => t.technicianId);
      if (techs.length === 0) { toast.error("Adicione ao menos um técnico"); return; }
      if (techs.length > 4) { toast.error("Máximo de 4 técnicos"); return; }
    }

    const allSessions = [
      ...editingExtras.sessions
        .filter(s => !editingExtras.removedSessionIds.has(s.id))
        .map(s => editingExtras.editedSessions.get(s.id) ?? s),
      ...editingExtras.newSessions,
    ];
    for (let i = 0; i < allSessions.length; i++) {
      const s = allSessions[i];
      if (!s.date) { toast.error(`Seção adicional #${i + 1}: informe a data`); return; }
      if (!s.technicianId) { toast.error(`Seção adicional #${i + 1}: selecione o técnico`); return; }
    }

    try {
      let activityId = editing.id;
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
        await replaceActivityTechnicians(user.id, activityId,
          editingExtras.activityTechnicians.filter(t => t.technicianId)
            .map((t, i) => ({ ...t, position: i + 1 })));

        for (const att of editingExtras.existingAttachments) {
          if (editingExtras.removedAttachmentIds.has(att.id)) {
            try { await deleteAttachment(att); } catch (e) { console.error(e); }
          }
        }
        for (const p of editingExtras.pendingAttachments) {
          try { await uploadAttachment(user.id, activityId, p.kind, p.file); }
          catch (e: any) {
            console.error("Upload attachment failed:", e);
            const msg = e?.message || e?.error || JSON.stringify(e);
            toast.error(`Falha ao enviar "${p.file.name}": ${msg}`);
          }
        }
      }

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
      const acts = actByActivity.get(r.id) ?? [];
      const t = isTechnician && myTechId
        ? technicianPayForReport(r, sess, technicians.find(tc => tc.id === myTechId), acts)
        : reportTotalsWithSessions(r, sess, clientMap.get(r.clientId));
      acc.hours += t.totalHours; acc.value += t.total; acc.km += t.km;
      return acc;
    }, { hours: 0, value: 0, km: 0 });
  }, [filtered, clientMap, sessionsByActivity, actByActivity, isTechnician, myTechId, technicians]);

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
        <CardContent className="p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px_180px]">
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
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_180px] sm:items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Período — de</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Período — até</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <Button
              type="button" variant="ghost" size="sm"
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              disabled={!dateFrom && !dateTo}
            >Limpar período</Button>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Ordens por página</Label>
              <Select value={String(pageSize)} onValueChange={v => setPageSize(Math.min(100, Math.max(1, parseInt(v) || 20)))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Card><CardContent className="p-4"><div className="text-muted-foreground text-xs">Atendimentos filtrados</div><div className="text-xl font-bold mt-1">{filtered.length}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-muted-foreground text-xs">Horas totais</div><div className="text-xl font-bold mt-1">{fmtHours(totals.hours)}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-muted-foreground text-xs">Valor total</div><div className="text-xl font-bold mt-1 text-primary">{money(totals.value)}</div></CardContent></Card>
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
          {paginated.map(r => {
            const c = clientMap.get(r.clientId);
            const sess = sessionsByActivity.get(r.id) ?? [];
            const acts = actByActivity.get(r.id) ?? [];
            const baseT = reportTotalsWithSessions(r, sess, c);
            const t = isTechnician && myTechId
              ? technicianPayForReport(r, sess, technicians.find(tc => tc.id === myTechId), acts)
              : baseT;
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
                        {paidByClient.has(r.id) && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium" title="Recebido do cliente">● Recebido</span>
                        )}
                        {(() => {
                          const tech = technicians.find(tt => tt.name.trim().toLowerCase() === (r.technician || "").trim().toLowerCase());
                          if (tech && paidTechSet.has(`${r.id}::${tech.id}`)) {
                            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium" title="Técnico pago">● Téc. pago</span>;
                          }
                          return null;
                        })()}
                      </div>
                      <h3 className="font-semibold text-lg mt-2">{c?.name || "Cliente removido"}</h3>
                      <p className="text-sm text-muted-foreground">{r.machine} {r.requester && `· Sol.: ${r.requester}`}</p>
                      {r.description && <p className="text-sm mt-2 line-clamp-2">{r.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Serviço: <b className="text-foreground">{fmtHours(baseT.service)}</b></span>
                        <span>Deslocamento: <b className="text-foreground">{fmtHours(baseT.travelOut + baseT.travelBack)}</b></span>
                        <span>KM: <b className="text-foreground">{baseT.km}</b></span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{money(t.total)}</div>
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
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-muted-foreground">
                Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
                <span className="text-sm">Página {currentPage} de {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Próxima</Button>
              </div>
            </div>
          )}
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
        sessionsByActivity={sessionsByActivity} technicians={technicians}
      />

    </div>
  );
}

import { useReactToPrint } from "react-to-print";
import { OSReportPrint } from "@/components/reports/OSReportPrint";

function PdfChoiceDialog({ state, onClose, clientMap, settings, sessionsByActivity, technicians }: {
  state: PdfChoice;
  onClose: () => void;
  clientMap: Map<string, Client>;
  settings: any;
  sessionsByActivity: Map<string, ServiceSession[]>;
  technicians: Technician[];
}) {
  const [printProps, setPrintProps] = useState<{ includeValues: boolean; photos: { kind: string; url: string }[] } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `OS-${state.report?.orderNumber || state.report?.id}`,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print { 
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
      }
    `,
    onAfterPrint: () => {
      setPrintProps(null);
      onClose();
    }
  });

  useEffect(() => {
    if (printProps) {
      const timer = setTimeout(() => handlePrint(), 800);
      return () => clearTimeout(timer);
    }
  }, [printProps, handlePrint]);

  if (!state.report) {
    return <Dialog open={state.open} onOpenChange={onClose}><DialogContent /></Dialog>;
  }
  const r = state.report;
  const client = clientMap.get(r.clientId);
  const sessions = sessionsByActivity.get(r.id) ?? [];

  const exportInformative = async () => {
    try {
      toast.loading("Preparando relatório e fotos...", { id: "pdf-gen" });
      const { listAttachments, getAttachmentUrl } = await import("@/lib/api");
      const atts = await listAttachments(r.id);
      const photos = await Promise.all(atts.map(async a => ({ kind: a.kind, url: await getAttachmentUrl(a.storagePath) })));
      setPrintProps({ includeValues: false, photos });
      toast.success("Pronto para imprimir!", { id: "pdf-gen" });
    } catch (e: any) { console.error(e); toast.error(e?.message ?? "Erro ao gerar PDF", { id: "pdf-gen" }); }
  };
  const exportOperational = (includeValues: boolean) => {
    toast.loading("Preparando relatório...", { id: "pdf-gen" });
    setPrintProps({ includeValues, photos: [] });
    setTimeout(() => toast.success("Pronto para imprimir!", { id: "pdf-gen" }), 500);
  };

  return (
    <Dialog open={state.open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar relatório</DialogTitle>
          <DialogDescription>OS {r.orderNumber} — {client?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {r.type === "preventiva" && (
            <div className="rounded-md border p-3 space-y-2">
              <div className="font-semibold text-sm">Informativo (cliente)</div>
              <div className="text-xs text-muted-foreground">Layout profissional com fotos antes/depois e requisições futuras — sem valores</div>
              <div className="flex gap-2">
                <Button onClick={exportInformative} size="sm" variant="outline" className="flex-1 w-full">Exportar / Imprimir PDF</Button>
              </div>
            </div>
          )}
          <div className="rounded-md border p-3 space-y-2">
            <div className="font-semibold text-sm">{r.type === "preventiva" ? "Operacional — com valores" : "Completo — com valores"}</div>
            <div className="text-xs text-muted-foreground">Inclui apuração de valores cobrados do cliente e pagos ao técnico</div>
            <div className="flex gap-2">
              <Button onClick={() => exportOperational(true)} size="sm" variant="outline" className="flex-1 w-full">Exportar / Imprimir PDF</Button>
            </div>
          </div>
          <div className="rounded-md border p-3 space-y-2">
            <div className="font-semibold text-sm">{r.type === "preventiva" ? "Operacional — sem valores" : "Sem valores"}</div>
            <div className="text-xs text-muted-foreground">Apenas informações técnicas, horas e KM</div>
            <div className="flex gap-2">
              <Button onClick={() => exportOperational(false)} size="sm" variant="outline" className="flex-1 w-full">Exportar / Imprimir PDF</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
      <div className="hidden">
        {printProps && (
          <OSReportPrint 
            ref={printRef}
            report={r as ServiceReport}
            client={client}
            settings={settings}
            sessions={sessions}
            technicians={technicians}
            includeValues={printProps.includeValues}
            photos={printProps.photos}
          />
        )}
      </div>
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

function BulletedTextarea({ value, onChange, ...props }: React.ComponentProps<typeof Textarea> & { value: string, onChange: (val: string) => void }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;

      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const currentLine = val.substring(lineStart, start);

      if (currentLine.trim() === '•') {
          e.preventDefault();
          const newValue = val.substring(0, lineStart) + '\n' + val.substring(end);
          onChange(newValue);
          requestAnimationFrame(() => {
              target.selectionStart = target.selectionEnd = lineStart + 1;
          });
          return;
      }

      e.preventDefault();
      const newValue = val.substring(0, start) + "\n• " + val.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 3;
      });
    }
  };

  const handleFocus = () => {
    if (!value || value.trim() === "") {
      onChange("• ");
    }
  };

  const handleBlur = () => {
    if (value === "• " || value === "•") {
      onChange("");
    }
  };

  return <Textarea value={value} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} onFocus={handleFocus} onBlur={handleBlur} {...props} />;
}

function ActivityDialog({ open, onOpenChange, editing, setEditing, extras, setExtras, clients, technicians, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  editing: Editing; setEditing: (e: Editing) => void;
  extras: Extras; setExtras: React.Dispatch<React.SetStateAction<Extras>>;
  clients: Client[]; technicians: Technician[]; onSave: () => void;
}) {
  const money = useMoney();
  const { user } = useAuth();
  const { isTechnician } = useAccess();
  const { activityTechnicians: allActivityTechnicians } = useAllActivityTechnicians();
  const client = clients.find((c) => c.id === editing.clientId);
  const isPreventive = editing.type === "preventiva";
  const myTechId = useMemo(() => technicians.find(t => t.userId === user?.id)?.id, [technicians, user?.id]);

  const effectiveSessions = useMemo<ServiceSession[]>(() => {
    const out: ServiceSession[] = [];
    for (const s of extras.sessions) {
      if (extras.removedSessionIds.has(s.id)) continue;
      out.push(extras.editedSessions.get(s.id) ?? s);
    }
    for (let i = 0; i < extras.newSessions.length; i++) {
      out.push({ ...(extras.newSessions[i] as any), id: `__new_${i}` } as ServiceSession);
    }
    return out;
  }, [extras.sessions, extras.editedSessions, extras.removedSessionIds, extras.newSessions]);

  const actsForReport = useMemo(() => {
    if (editing.id) return allActivityTechnicians.filter(a => a.activityId === editing.id);
    return extras.activityTechnicians;
  }, [editing.id, allActivityTechnicians, extras.activityTechnicians]);

  const singleTechnician = technicians.find((tc) => tc.name === editing.technician);
  const t = reportTotalsWithSessions(editing as ServiceReport, effectiveSessions, client);
  const ttSingleBase = technicianTotals(editing as ServiceReport, singleTechnician);

  const sessionsTechTotal = useMemo(() => {
    return effectiveSessions.reduce((acc, s) => {
      if (isTechnician && myTechId && s.technicianId !== myTechId) return acc;
      const tech = technicians.find(tc => tc.id === s.technicianId);
      if (!tech) return acc;
      const tt = sessionTechnicianTotals(s, tech);
      acc.totalHours += tt.totalHours;
      acc.hoursValue += tt.hoursValue;
      acc.kmValue += tt.kmValue;
      acc.total += tt.total;
      acc.ovtWk += tt.ovtWk;
      acc.ovtWe += tt.ovtWe;
      return acc;
    }, { totalHours: 0, hoursValue: 0, kmValue: 0, total: 0, ovtWk: 0, ovtWe: 0 });
  }, [effectiveSessions, technicians, isTechnician, myTechId]);

  const ttSingle = {
    ...ttSingleBase,
    totalHours: ttSingleBase.totalHours + sessionsTechTotal.totalHours,
    hoursValue: ttSingleBase.hoursValue + sessionsTechTotal.hoursValue,
    kmValue: ttSingleBase.kmValue + sessionsTechTotal.kmValue,
    total: ttSingleBase.total + sessionsTechTotal.total,
    ovtWk: ttSingleBase.ovtWk + sessionsTechTotal.ovtWk,
    ovtWe: ttSingleBase.ovtWe + sessionsTechTotal.ovtWe,
  };

  const combinedTechTotals = useMemo(() => {
    const base = actsForReport.reduce((acc, at) => {
      if (isTechnician && myTechId && at.technicianId !== myTechId) return acc;
      const tech = technicians.find(t => t.id === at.technicianId);
      if (!tech) return acc;
      const reportLike = {
        ...(editing as ServiceReport),
        overtimeWeekdayHours: at.overtimeWeekdayHours,
        overtimeWeekendHours: at.overtimeWeekendHours,
      } as ServiceReport;
      const tt = technicianTotals(reportLike, tech);
      acc.totalHours += tt.totalHours;
      acc.hoursValue += tt.hoursValue;
      acc.kmValue += tt.kmValue;
      acc.total += tt.total;
      acc.ovtWk += tt.ovtWk;
      acc.ovtWe += tt.ovtWe;
      return acc;
    }, { totalHours: 0, hoursValue: 0, kmValue: 0, total: 0, ovtWk: 0, ovtWe: 0 });
    
    if (singleTechnician && (!isTechnician || !myTechId || singleTechnician.id === myTechId)) {
      base.totalHours += ttSingleBase.totalHours;
      base.hoursValue += ttSingleBase.hoursValue;
      base.kmValue += ttSingleBase.kmValue;
      base.total += ttSingleBase.total;
      base.ovtWk += ttSingleBase.ovtWk;
      base.ovtWe += ttSingleBase.ovtWe;
    }

    base.totalHours += sessionsTechTotal.totalHours;
    base.hoursValue += sessionsTechTotal.hoursValue;
    base.kmValue += sessionsTechTotal.kmValue;
    base.total += sessionsTechTotal.total;
    base.ovtWk += sessionsTechTotal.ovtWk;
    base.ovtWe += sessionsTechTotal.ovtWe;
    return base;
  }, [actsForReport, technicians, editing, sessionsTechTotal, isTechnician, myTechId, singleTechnician, ttSingleBase]);

  const techTotalsForApur = combinedTechTotals;
  const showApur = client || actsForReport.length > 0 || singleTechnician || effectiveSessions.length > 0;
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

  useEffect(() => {
    if (extras.activityTechnicians.length === 0 && !editing.id) {
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
      } else if (isTechnician && myTechId) {
        setExtras(prev => ({
          ...prev,
          activityTechnicians: [{
            technicianId: myTechId, position: 1,
            overtimeWeekdayHours: editing.overtimeWeekdayHours || 0,
            overtimeWeekendHours: editing.overtimeWeekendHours || 0,
          }],
        }));
      }
    }
  }, [isPreventive, isTechnician, myTechId]);

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
            <BulletedTextarea rows={isPreventive ? 3 : 2} value={editing.description} onChange={val => setEditing({ ...editing, description: val })} />
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
            <BulletedTextarea rows={3} value={editing.summary} onChange={val => setEditing({ ...editing, summary: val })} />
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
              <BulletedTextarea rows={2} value={editing.futureReplacements || ""}
                onChange={val => setEditing({ ...editing, futureReplacements: val })}
                placeholder="Itens / peças que precisarão ser substituídos no próximo atendimento" />
              <AttachmentBlocks
                label="Requisições para troca futura"
                extras={extras} setExtras={setExtras}
                kinds={[["future_replacements", "Anexos"]]}
              />
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Quilometragem total (km)</Label>
                <Input type="number" step="1" value={editing.km || ""} onChange={e => setEditing({ ...editing, km: Number(e.target.value) })} placeholder="50" />
              </div>
              <div className="grid gap-2">
                <Label>Desconto de horas</Label>
                <Input type="number" step="0.25" min="0" value={editing.discountHours || ""}
                  onChange={e => setEditing({ ...editing, discountHours: Number(e.target.value) })}
                  placeholder="Ex: 1.5 (intervalo sem atendimento)" />
              </div>
              {!isPreventive && (
                <div className="grid gap-2">
                  <Label>Técnico *</Label>
                  <Select disabled={isTechnician} value={editing.technician} onValueChange={(v) => setEditing({ ...editing, technician: v })}>
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
                    <Select disabled={isTechnician && idx === 0} value={at.technicianId} onValueChange={v => updateAt(idx, { technicianId: v })}>
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
                  <div className="w-10">
                    {!(isTechnician && idx === 0) && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAt(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          <div className="grid gap-2">
            <Label>Observação</Label>
            <BulletedTextarea rows={2} value={editing.observation || ""} onChange={val => setEditing({ ...editing, observation: val })} />
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
                {!isTechnician && client && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">A receber do cliente</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div><div className="text-muted-foreground text-xs">Horas totais</div><div className="font-semibold">{fmtHours(t.totalHours)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor horas</div><div className="font-semibold">{money(t.hoursValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor km</div><div className="font-semibold">{money(t.kmValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">TOTAL</div><div className="font-bold text-lg text-primary">{money(t.total)}</div></div>
                    </div>
                  </div>
                )}
                {(extras.activityTechnicians.length > 0 || singleTechnician) && (
                  <div className="pt-3 border-t border-primary/20">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      A repassar para {extras.activityTechnicians.length > 0 ? `${Math.max(extras.activityTechnicians.length, 1)} técnico(s)` : "o técnico"}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div><div className="text-muted-foreground text-xs">Horas totais</div><div className="font-semibold">{fmtHours(techTotalsForApur.totalHours)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor horas</div><div className="font-semibold">{money(techTotalsForApur.hoursValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">Valor km</div><div className="font-semibold">{money(techTotalsForApur.kmValue)}</div></div>
                      <div><div className="text-muted-foreground text-xs">TOTAL</div><div className="font-bold text-lg">{money(techTotalsForApur.total)}</div></div>
                    </div>
                  </div>
                )}
                {!isTechnician && client && techTotalsForApur && (extras.activityTechnicians.length > 0 || singleTechnician) && (
                  <div className="pt-3 border-t border-primary/20 flex items-center justify-between">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">Lucro em horas (receber − pagar)</div>
                    <div className={`font-bold text-lg ${profit >= 0 ? "text-success" : "text-destructive"}`}>{money(profit)}</div>
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
          <input type="file" multiple className="hidden"
            onChange={e => { onFiles(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {existing.map(a => (
          <ExistingThumb key={a.id} att={a} onRemove={() => removeExisting(a.id)} />
        ))}
        {pending.map((p, i) => {
          const isImage = p.file.type.startsWith("image/");
          return (
            <div key={i} className="relative w-16 h-16 rounded border overflow-hidden bg-muted flex items-center justify-center">
              {isImage ? (
                <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="text-[9px] text-center px-1 break-all line-clamp-3">{p.file.name}</div>
              )}
              <button type="button" onClick={() => removePending(i)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
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
  const ext = att.storagePath.split(".").pop()?.toLowerCase() || "";
  const isImage = ["jpg","jpeg","png","gif","webp","bmp","heic","heif","svg"].includes(ext);
  return (
    <div className="relative w-16 h-16 rounded border overflow-hidden bg-muted flex items-center justify-center">
      {isImage && url ? (
        <a href={url} target="_blank" rel="noreferrer" className="w-full h-full block">
          <img src={url} alt="" className="w-full h-full object-cover" />
        </a>
      ) : (
        <a href={url || "#"} target="_blank" rel="noreferrer"
          className="text-[9px] text-center px-1 break-all line-clamp-3 underline">
          {ext.toUpperCase() || "FILE"}
        </a>
      )}
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

function emptyDraftSession(): Omit<ServiceSession, "id"> {
  return {
    activityId: "",
    technicianId: null,
    date: new Date().toISOString().slice(0, 10),
    travelOutStart: "", travelOutEnd: "",
    serviceStart: "", serviceEnd: "",
    travelBackStart: "", travelBackEnd: "",
    km: 0,
    overtimeWeekdayHours: 0, overtimeWeekendHours: 0,
    activitiesDone: "", observation: "",
    discountHours: 0,
    position: 1,
  };
}

function SessionsSection({ extras, setExtras, technicians }: {
  extras: Extras;
  setExtras: React.Dispatch<React.SetStateAction<Extras>>;
  technicians: Technician[];
}) {
  const techMap = useMemo(() => new Map(technicians.map(t => [t.id, t])), [technicians]);

  const liveSessions = extras.sessions
    .filter(s => !extras.removedSessionIds.has(s.id))
    .map(s => extras.editedSessions.get(s.id) ?? s);

  const addSession = () => {
    setExtras(prev => ({
      ...prev,
      newSessions: [...prev.newSessions, emptyDraftSession()],
    }));
  };
  const updateExisting = (id: string, patch: Partial<ServiceSession>) => {
    setExtras(prev => {
      const current = prev.editedSessions.get(id) ?? prev.sessions.find(s => s.id === id)!;
      const next = new Map(prev.editedSessions);
      next.set(id, { ...current, ...patch });
      return { ...prev, editedSessions: next };
    });
  };
  const removeExisting = (id: string) => {
    if (!confirm("Excluir esta sessão?")) return;
    setExtras(prev => {
      const next = new Set(prev.removedSessionIds);
      next.add(id);
      return { ...prev, removedSessionIds: next };
    });
  };
  const updateDraft = (idx: number, patch: Partial<Omit<ServiceSession, "id">>) => {
    setExtras(prev => ({
      ...prev,
      newSessions: prev.newSessions.map((s, i) => i === idx ? { ...s, ...patch } : s),
    }));
  };
  const removeDraft = (idx: number) => {
    setExtras(prev => ({
      ...prev,
      newSessions: prev.newSessions.filter((_, i) => i !== idx),
    }));
  };

  return (
    <section className="grid gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Sessões adicionais de trabalho</div>
          <div className="text-xs text-muted-foreground">Acrescente outros dias, técnicos e atividades dentro desta mesma OS.</div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addSession}>
          <CalendarPlus className="h-4 w-4 mr-1" /> Adicionar sessão
        </Button>
      </div>

      {liveSessions.length === 0 && extras.newSessions.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma sessão adicional.</p>
      )}

      {liveSessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          technicians={technicians}
          techMap={techMap}
          onChange={(patch) => updateExisting(s.id, patch)}
          onRemove={() => removeExisting(s.id)}
        />
      ))}

      {extras.newSessions.map((s, idx) => (
        <SessionCard
          key={`new-${idx}`}
          session={s}
          technicians={technicians}
          techMap={techMap}
          isNew
          onChange={(patch) => updateDraft(idx, patch)}
          onRemove={() => removeDraft(idx)}
        />
      ))}
    </section>
  );
}

function SessionCard({ session, technicians, techMap, isNew, onChange, onRemove }: {
  session: ServiceSession | Omit<ServiceSession, "id">;
  technicians: Technician[];
  techMap: Map<string, Technician>;
  isNew?: boolean;
  onChange: (patch: Partial<ServiceSession>) => void;
  onRemove: () => void;
}) {
  const s = session;
  const tech = s.technicianId ? techMap.get(s.technicianId) : undefined;
  const travelOut = diffHoursLocal(s.travelOutStart, s.travelOutEnd);
  const service = diffHoursLocal(s.serviceStart, s.serviceEnd);
  const travelBack = diffHoursLocal(s.travelBackStart, s.travelBackEnd);
  const discount = Math.max(0, s.discountHours || 0);
  const totalHours = Math.max(0, travelOut + service + travelBack - discount);

  return (
    <div className="rounded-md border bg-muted/30 p-3 grid gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          {isNew ? "Nova sessão" : "Sessão registrada"}
          {tech && ` · ${tech.name}`}
        </span>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[140px_1fr_120px]">
        <div className="grid gap-1">
          <Label className="text-xs">Data</Label>
          <Input type="date" value={s.date} onChange={e => onChange({ date: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Técnico</Label>
          <Select value={s.technicianId ?? ""} onValueChange={v => onChange({ technicianId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">KM</Label>
          <Input type="number" step="1" value={s.km || ""} onChange={e => onChange({ km: Number(e.target.value) })} placeholder="0" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <TimeRange label="Viagem de ida" startVal={s.travelOutStart} endVal={s.travelOutEnd}
          onStart={v => onChange({ travelOutStart: v })} onEnd={v => onChange({ travelOutEnd: v })} hours={travelOut} />
        <TimeRange label="Serviço" startVal={s.serviceStart} endVal={s.serviceEnd}
          onStart={v => onChange({ serviceStart: v })} onEnd={v => onChange({ serviceEnd: v })} hours={service} />
        <TimeRange label="Viagem de volta" startVal={s.travelBackStart} endVal={s.travelBackEnd}
          onStart={v => onChange({ travelBackStart: v })} onEnd={v => onChange({ travelBackEnd: v })} hours={travelBack} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1">
          <Label className="text-xs">HE semana</Label>
          <Input type="number" step="0.5" min="0" value={s.overtimeWeekdayHours || ""}
            onChange={e => onChange({ overtimeWeekdayHours: Number(e.target.value) })} placeholder="0" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">HE fim de semana</Label>
          <Input type="number" step="0.5" min="0" value={s.overtimeWeekendHours || ""}
            onChange={e => onChange({ overtimeWeekendHours: Number(e.target.value) })} placeholder="0" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Desconto de horas</Label>
          <Input type="number" step="0.25" min="0" value={s.discountHours || ""}
            onChange={e => onChange({ discountHours: Number(e.target.value) })} placeholder="0" />
        </div>
      </div>
      <div className="grid gap-1">
        <Label className="text-xs">Atividades realizadas neste dia</Label>
        <BulletedTextarea rows={2} value={s.activitiesDone}
          onChange={val => onChange({ activitiesDone: val })}
          placeholder="O que foi executado nesta sessão" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs">Observação</Label>
        <Input value={s.observation ?? ""} onChange={e => onChange({ observation: e.target.value })} placeholder="opcional" />
      </div>
      <div className="text-xs text-muted-foreground">Total da sessão: <b>{fmtHours(totalHours)}</b></div>
    </div>
  );
}

function diffHoursLocal(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}
