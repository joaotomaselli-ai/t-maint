import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReports, useSettings, useClients, useAllSessions } from "@/hooks/use-data";
import { useAccess } from "@/hooks/use-access";
import { type ServiceReport, reportTotalsWithSessions, fmtHours, cleanObservation } from "@/lib/api";
import { exportSingleReport, exportMachineHistoryReport } from "@/lib/pdf";
import {
  Wrench,
  Cpu,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  History,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function ClientPortalDashboard() {
  const { clientId, clientName } = useAccess();
  const { reports = [], isLoading: loadingReports } = useReports();
  const { settings } = useSettings();
  const { clients = [] } = useClients();
  const { sessions = [] } = useAllSessions();

  const [selectedMachine, setSelectedMachine] = useState<string>("todas");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedOsForView, setSelectedOsForView] = useState<ServiceReport | null>(null);

  // Filter client's own reports strictly
  const myReports = useMemo(() => {
    if (!clientId) return [];
    return reports.filter((r) => r.clientId === clientId);
  }, [reports, clientId]);

  // Extract unique machines for dropdown
  const uniqueMachines = useMemo(() => {
    const set = new Set<string>();
    myReports.forEach((r) => {
      if (r.machine && r.machine.trim()) {
        set.add(r.machine.trim());
      }
    });
    return Array.from(set).sort();
  }, [myReports]);

  // Apply UI filters
  const filteredReports = useMemo(() => {
    return myReports.filter((r) => {
      if (selectedMachine !== "todas" && r.machine?.trim() !== selectedMachine) {
        return false;
      }
      if (selectedType !== "todos" && r.type !== selectedType) {
        return false;
      }
      if (startDate && r.date < startDate) {
        return false;
      }
      if (endDate && r.date > endDate) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNumber = (r.orderNumber || "").toLowerCase().includes(term);
        const matchMachine = (r.machine || "").toLowerCase().includes(term);
        const matchDesc = (r.description || "").toLowerCase().includes(term);
        const matchSummary = (r.summary || "").toLowerCase().includes(term);
        const matchTech = (r.technician || "").toLowerCase().includes(term);
        if (!matchNumber && !matchMachine && !matchDesc && !matchSummary && !matchTech) {
          return false;
        }
      }
      return true;
    });
  }, [myReports, selectedMachine, selectedType, startDate, endDate, searchTerm]);

  // Operational metrics (Zero financial data)
  const totalHours = useMemo(() => {
    return myReports.reduce((acc, r) => acc + reportTotalsWithSessions(r, sessions).hours, 0);
  }, [myReports, sessions]);

  const currentMonthReports = useMemo(() => {
    const currentYearMonth = format(new Date(), "yyyy-MM");
    return myReports.filter((r) => r.date.startsWith(currentYearMonth));
  }, [myReports]);

  const handleExportSinglePdf = async (report: ServiceReport) => {
    try {
      const clientObj = clients.find((c) => c.id === report.clientId) || {
        id: clientId || "",
        name: clientName || "Cliente",
        hourlyRate: 0,
        kmRate: 0,
        hasPreventiveContract: false,
      };
      await exportSingleReport(report, clientObj as any, settings, sessions, false);
      toast.success("Relatório em PDF gerado com sucesso!");
    } catch (e: any) {
      toast.error("Erro ao gerar PDF da OS.");
    }
  };

  const handleExportHistoryPdf = async () => {
    try {
      if (filteredReports.length === 0) {
        toast.error("Nenhuma ordem encontrada com os filtros atuais.");
        return;
      }
      const machineTitle = selectedMachine !== "todas" ? selectedMachine : "";
      const period = (startDate || endDate) ? { from: startDate, to: endDate } : undefined;
      await exportMachineHistoryReport(
        clientName || "Minha Empresa",
        machineTitle,
        filteredReports,
        settings,
        period,
        sessions,
      );
      toast.success("Histórico consolidado em PDF gerado com sucesso!");
    } catch (e: any) {
      toast.error("Erro ao gerar histórico em PDF.");
    }
  };

  const resetFilters = () => {
    setSelectedMachine("todas");
    setSelectedType("todos");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      {/* HEADER / WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Building2 className="h-3.5 w-3.5" /> Portal de Acompanhamento Técnico
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {clientName || "Portal do Cliente"}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Consulte o histórico digital de manutenções, paradas de máquinas e emita relatórios técnicos completos em PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleExportHistoryPdf}
              className="gap-2 font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30"
            >
              <Download className="h-4 w-4" />
              {selectedMachine !== "todas" ? "PDF do Equipamento" : "PDF do Histórico Geral"}
            </Button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS (OPERATIONAL ONLY - ZERO R$) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Máquinas Atendidas</p>
              <h3 className="text-2xl font-bold mt-0.5">{uniqueMachines.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total de Atendimentos</p>
              <h3 className="text-2xl font-bold mt-0.5">{myReports.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Horas Técnicas Prestadas</p>
              <h3 className="text-2xl font-bold mt-0.5">{fmtHours(totalHours)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Atendimentos este Mês</p>
              <h3 className="text-2xl font-bold mt-0.5">{currentMonthReports.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-cyan-600" />
              <CardTitle className="text-base font-semibold">Filtros de Pesquisa & Histórico</CardTitle>
            </div>
            {(selectedMachine !== "todas" || selectedType !== "todos" || searchTerm || startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Limpar Filtros
              </Button>
            )}
          </div>
          <CardDescription className="text-xs">
            Filtre por máquina para obter o prontuário técnico completo do equipamento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Máquina */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Equipamento / Máquina</Label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todas as máquinas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as máquinas ({uniqueMachines.length})</SelectItem>
                  {uniqueMachines.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tipo de Manutenção</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Inicial */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data Inicial</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Data Final */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data Final</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Busca textual */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Busca Textual</Label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                <Input
                  placeholder="Problema, OS, técnico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OS LIST / HISTORY CARDS */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-cyan-600" />
              Histórico de Ordens de Serviço ({filteredReports.length})
            </CardTitle>
            {selectedMachine !== "todas" && (
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">
                Exibindo apenas manutenções do equipamento: <strong>{selectedMachine}</strong>
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingReports ? (
            <div className="py-16 text-center text-muted-foreground text-sm">Carregando histórico...</div>
          ) : filteredReports.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-2">
              <FileText className="h-10 w-10 mx-auto opacity-30" />
              <p className="font-semibold text-sm">Nenhuma ordem de serviço encontrada.</p>
              <p className="text-xs">Tente ajustar os filtros acima para buscar outros períodos ou máquinas.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredReports.map((report) => {
                const totals = reportTotalsWithSessions(report, sessions);
                return (
                  <div
                    key={report.id}
                    className="p-4 sm:p-5 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          OS #{report.orderNumber || report.id.slice(0, 8)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {format(new Date(report.date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            report.type === "preventiva"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300"
                          }`}
                        >
                          {report.type === "preventiva" ? "Preventiva" : "Corretiva"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <Cpu className="h-3.5 w-3.5 text-cyan-600" /> {report.machine || "Equipamento não informado"}
                        </span>
                        {report.requester && <span>Solicitante: {report.requester}</span>}
                        {report.technician && <span>Técnico: {report.technician}</span>}
                        <span>Tempo: <strong>{fmtHours(totals.hours)}</strong></span>
                      </div>

                      <p className="text-xs text-foreground/80 line-clamp-2 mt-1">
                        {report.summary || report.description || "Sem resumo informado."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOsForView(report)}
                        className="gap-1.5 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detalhes
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleExportSinglePdf(report)}
                        className="gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DETALHES DA OS (READ-ONLY / ZERO FINANCIAL) */}
      {selectedOsForView && (
        <Dialog open={!!selectedOsForView} onOpenChange={(v) => { if (!v) setSelectedOsForView(null); }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <DialogTitle className="text-lg font-bold">
                  Ordem de Serviço #{selectedOsForView.orderNumber || selectedOsForView.id.slice(0, 8)}
                </DialogTitle>
                <span
                  className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    selectedOsForView.type === "preventiva"
                      ? "bg-blue-500/10 text-blue-700 border border-blue-300"
                      : "bg-amber-500/10 text-amber-700 border border-amber-300"
                  }`}
                >
                  {selectedOsForView.type === "preventiva" ? "Preventiva" : "Corretiva"}
                </span>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="grid sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Equipamento</span>
                  <p className="font-semibold text-foreground">{selectedOsForView.machine || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Data do Atendimento</span>
                  <p className="font-semibold text-foreground">
                    {format(new Date(selectedOsForView.date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Solicitante</span>
                  <p className="font-semibold text-foreground">{selectedOsForView.requester || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Técnico Responsável</span>
                  <p className="font-semibold text-foreground">{selectedOsForView.technician || "—"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase text-muted-foreground">Descrição do Problema / Solicitação</h4>
                <p className="p-3 bg-muted/20 rounded-md border text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedOsForView.description || "Nenhuma descrição informada."}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase text-muted-foreground">Serviços Executados & Resumo Técnico</h4>
                <p className="p-3 bg-muted/20 rounded-md border text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedOsForView.summary || "Nenhum resumo técnico informado."}
                </p>
              </div>

              {selectedOsForView.futureReplacements && (
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase text-amber-600">Peças Recomendadas para Troca Futura</h4>
                  <p className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-xs text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-wrap">
                    {selectedOsForView.futureReplacements}
                  </p>
                </div>
              )}

              {selectedOsForView.observation && (
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase text-muted-foreground">Observações Técnicas</h4>
                  <p className="p-3 bg-muted/20 rounded-md border text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {cleanObservation(selectedOsForView.observation)}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setSelectedOsForView(null)}>
                  Fechar
                </Button>
                <Button
                  onClick={() => handleExportSinglePdf(selectedOsForView)}
                  className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  <Download className="h-4 w-4" /> Emitir PDF da OS
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
