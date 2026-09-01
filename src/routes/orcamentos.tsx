import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  listCommercialQuotes, saveCommercialQuote, updateCommercialQuoteStatus,
  deleteCommercialQuote, duplicateCommercialQuote, convertCommercialQuoteToOS,
  type CommercialQuote, type CommercialQuoteItem, type CommercialQuoteStatus
} from "@/lib/quotes.functions";
import { useClients, useSettings, useCompanySettings, useTechnicians, useReports, useInventory } from "@/hooks/use-data";
import { useAccess } from "@/hooks/use-access";
import { useMoney } from "@/hooks/use-money-visibility";
import { fmtCurrency } from "@/lib/api";
import { QuoteReportPrint } from "@/components/reports/QuoteReportPrint";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calculator, Plus, Search, FileDown, MessageCircle, CheckCircle2,
  Clock, AlertTriangle, XCircle, Trash2, Edit, Copy, ArrowRight,
  Wrench, Package, DollarSign, Building2, Calendar, Loader2, Send,
  FileText, TrendingUp, ShieldCheck, RefreshCw
} from "lucide-react";

export const Route = createFileRoute("/orcamentos")({ component: OrcamentosPage });

const STATUS_MAP: Record<CommercialQuoteStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "Rascunho", color: "bg-slate-100 text-slate-700 border-slate-300", icon: Clock },
  sent: { label: "Enviado", color: "bg-blue-50 text-blue-700 border-blue-300", icon: Send },
  negotiating: { label: "Em Negociação", color: "bg-amber-50 text-amber-700 border-amber-300", icon: AlertTriangle },
  approved: { label: "Aprovado", color: "bg-emerald-50 text-emerald-700 border-emerald-300", icon: CheckCircle2 },
  rejected: { label: "Recusado", color: "bg-rose-50 text-rose-700 border-rose-300", icon: XCircle },
  expired: { label: "Expirado", color: "bg-slate-200 text-slate-600 border-slate-400", icon: XCircle },
};

function OrcamentosPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const money = useMoney();
  const { isClient, isAdmin } = useAccess();
  const { clients } = useClients();
  const { technicians } = useTechnicians();
  const { reports } = useReports();
  const { items: inventoryItems } = useInventory();
  const { settings } = useSettings();
  const { companySettings } = useCompanySettings();

  // Server functions
  const listQuotesFn = useServerFn(listCommercialQuotes);
  const saveQuoteFn = useServerFn(saveCommercialQuote);
  const updateStatusFn = useServerFn(updateCommercialQuoteStatus);
  const deleteQuoteFn = useServerFn(deleteCommercialQuote);
  const duplicateQuoteFn = useServerFn(duplicateCommercialQuote);
  const convertToOSFn = useServerFn(convertCommercialQuoteToOS);

  // Queries
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["commercial_quotes"],
    queryFn: () => listQuotesFn(),
  });

  // State: Filter and Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // State: Create / Edit Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formClientId, setFormClientId] = useState("");
  const [formMachine, setFormMachine] = useState("");
  const [formTechnicianId, setFormTechnicianId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formValidDays, setFormValidDays] = useState(15);
  const [formStatus, setFormStatus] = useState<CommercialQuoteStatus>("draft");
  const [formItems, setFormItems] = useState<CommercialQuoteItem[]>([]);
  const [formTravelKm, setFormTravelKm] = useState(0);
  const [formTravelRate, setFormTravelRate] = useState(0);
  const [formDiscountAmount, setFormDiscountAmount] = useState(0);
  const [formPaymentTerms, setFormPaymentTerms] = useState("À vista / Pix");
  const [formExecutionDeadline, setFormExecutionDeadline] = useState("A combinar");
  const [formWarrantyTerms, setFormWarrantyTerms] = useState("90 dias para peças e serviços");
  const [formNotes, setFormNotes] = useState("");

  // New Item Temporary State
  const [newItemType, setNewItemType] = useState<"service" | "product">("service");
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState("Hora");
  const [newItemPrice, setNewItemPrice] = useState(0);

  // Print state
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<CommercialQuote | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedQuoteForPrint ? `Orcamento-${selectedQuoteForPrint.quoteNumber}-${selectedQuoteForPrint.clientName}` : "Orcamento",
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    `,
  });

  const triggerPrint = (quote: CommercialQuote) => {
    setSelectedQuoteForPrint(quote);
    setTimeout(() => {
      handlePrint();
    }, 150);
  };

  // Selected Client Details in Modal
  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === formClientId);
  }, [clients, formClientId]);

  // Client machine suggestions from previous reports
  const clientMachines = useMemo(() => {
    if (!formClientId) return [];
    const set = new Set<string>();
    reports.filter(r => r.clientId === formClientId && r.machine).forEach(r => set.add(r.machine.trim()));
    return Array.from(set);
  }, [reports, formClientId]);

  // Auto populate Km rate and hourly rate when client changes
  const handleClientChange = (clientId: string) => {
    setFormClientId(clientId);
    const cl = clients.find(c => c.id === clientId);
    if (cl) {
      if (cl.kmRate && formTravelRate === 0) setFormTravelRate(Number(cl.kmRate));
      if (newItemPrice === 0 && cl.hourlyRate && newItemType === "service") {
        setNewItemPrice(Number(cl.hourlyRate));
      }
    }
  };

  // Auto populate item price when selecting inventory item
  const handleSelectInventoryItem = (itemId: string) => {
    const inv = inventoryItems.find(i => i.id === itemId);
    if (inv) {
      setNewItemName(inv.name);
      setNewItemDesc(inv.description || `Código: ${inv.sku || "—"}`);
      setNewItemUnit(inv.unit || "Un");
      setNewItemPrice(Number(inv.averageCost || 0) * 1.3); // Sugere margem ou preço base
    }
  };

  // Add Item to List
  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.error("Informe o nome ou descrição do item.");
      return;
    }
    if (newItemQty <= 0) {
      toast.error("A quantidade deve ser maior que zero.");
      return;
    }

    const itemTotal = Number((newItemQty * newItemPrice).toFixed(2));
    const item: CommercialQuoteItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: newItemType,
      name: newItemName.trim(),
      description: newItemDesc.trim() || undefined,
      quantity: newItemQty,
      unit: newItemUnit,
      unitPrice: newItemPrice,
      total: itemTotal,
    };

    setFormItems([...formItems, item]);
    setNewItemName("");
    setNewItemDesc("");
    setNewItemQty(1);
    setNewItemPrice(newItemType === "service" && selectedClient?.hourlyRate ? Number(selectedClient.hourlyRate) : 0);
  };

  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  // Form Calculations
  const calculatedServicesTotal = useMemo(() => {
    return formItems.filter(i => i.type === "service").reduce((acc, i) => acc + i.total, 0);
  }, [formItems]);

  const calculatedProductsTotal = useMemo(() => {
    return formItems.filter(i => i.type === "product").reduce((acc, i) => acc + i.total, 0);
  }, [formItems]);

  const calculatedTravelTotal = useMemo(() => {
    return Number((formTravelKm * formTravelRate).toFixed(2));
  }, [formTravelKm, formTravelRate]);

  const calculatedGrandTotal = useMemo(() => {
    const sum = calculatedServicesTotal + calculatedProductsTotal + calculatedTravelTotal - formDiscountAmount;
    return Math.max(0, Number(sum.toFixed(2)));
  }, [calculatedServicesTotal, calculatedProductsTotal, calculatedTravelTotal, formDiscountAmount]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormClientId("");
    setFormMachine("");
    setFormTechnicianId(null);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormValidDays(15);
    setFormStatus("draft");
    setFormItems([]);
    setFormTravelKm(0);
    setFormTravelRate(0);
    setFormDiscountAmount(0);
    setFormPaymentTerms("À vista / Pix");
    setFormExecutionDeadline("A combinar");
    setFormWarrantyTerms("90 dias para peças e serviços");
    setFormNotes("");
    setNewItemType("service");
    setNewItemName("");
    setNewItemDesc("");
    setNewItemQty(1);
    setNewItemUnit("Hora");
    setNewItemPrice(0);
    setOpenModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (quote: CommercialQuote) => {
    setEditingId(quote.id);
    setFormClientId(quote.clientId);
    setFormMachine(quote.machine || "");
    setFormTechnicianId(quote.technicianId || null);
    setFormDate(quote.date || new Date().toISOString().slice(0, 10));
    
    const diff = Math.max(1, Math.round((new Date(quote.validUntil).getTime() - new Date(quote.date).getTime()) / (1000 * 60 * 60 * 24)));
    setFormValidDays(diff || 15);
    setFormStatus(quote.status);
    setFormItems(quote.items || []);
    setFormTravelKm(quote.travelKm || 0);
    setFormTravelRate(quote.travelRate || 0);
    setFormDiscountAmount(quote.discountAmount || 0);
    setFormPaymentTerms(quote.paymentTerms || "À vista / Pix");
    setFormExecutionDeadline(quote.executionDeadline || "A combinar");
    setFormWarrantyTerms(quote.warrantyTerms || "90 dias para peças e serviços");
    setFormNotes(quote.notes || "");
    setOpenModal(true);
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: () => {
      const validUntilDate = new Date(new Date(formDate).getTime() + formValidDays * 86400000)
        .toISOString()
        .slice(0, 10);
      
      const tech = technicians.find(t => t.id === formTechnicianId);

      return saveQuoteFn({
        data: {
          id: editingId || undefined,
          clientId: formClientId,
          machine: formMachine.trim(),
          technicianId: formTechnicianId,
          technicianName: tech?.name || settings.technicianName || "",
          status: formStatus,
          date: formDate,
          validUntil: validUntilDate,
          items: formItems,
          servicesTotal: calculatedServicesTotal,
          productsTotal: calculatedProductsTotal,
          travelKm: formTravelKm,
          travelRate: formTravelRate,
          travelTotal: calculatedTravelTotal,
          discountAmount: formDiscountAmount,
          totalAmount: calculatedGrandTotal,
          paymentTerms: formPaymentTerms,
          executionDeadline: formExecutionDeadline,
          warrantyTerms: formWarrantyTerms,
          notes: formNotes.trim(),
        }
      });
    },
    onSuccess: () => {
      toast.success(editingId ? "Orçamento atualizado!" : "Orçamento criado com sucesso!");
      qc.invalidateQueries({ queryKey: ["commercial_quotes"] });
      setOpenModal(false);
    },
    onError: (err: any) => toast.error(err?.message || "Erro ao salvar orçamento"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ quoteId, status }: { quoteId: string; status: CommercialQuoteStatus }) =>
      updateStatusFn({ data: { quoteId, status } }),
    onSuccess: () => {
      toast.success("Status atualizado!");
      qc.invalidateQueries({ queryKey: ["commercial_quotes"] });
    },
    onError: (err: any) => toast.error(err?.message || "Erro ao alterar status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (quoteId: string) => deleteQuoteFn({ data: { quoteId } }),
    onSuccess: () => {
      toast.success("Orçamento excluído com sucesso.");
      qc.invalidateQueries({ queryKey: ["commercial_quotes"] });
    },
    onError: (err: any) => toast.error(err?.message || "Erro ao excluir orçamento"),
  });

  const duplicateMutation = useMutation({
    mutationFn: (quoteId: string) => duplicateQuoteFn({ data: { quoteId } }),
    onSuccess: (newQuote) => {
      toast.success(`Orçamento duplicado como ${newQuote.quote_number}!`);
      qc.invalidateQueries({ queryKey: ["commercial_quotes"] });
    },
    onError: (err: any) => toast.error(err?.message || "Erro ao duplicar orçamento"),
  });

  const convertToOSMutation = useMutation({
    mutationFn: (quoteId: string) => convertToOSFn({ data: { quoteId } }),
    onSuccess: (res) => {
      toast.success(`Ordem de Serviço Nº ${res.orderNumber} gerada com sucesso!`);
      qc.invalidateQueries({ queryKey: ["commercial_quotes"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      navigate({ to: "/atividades" });
    },
    onError: (err: any) => toast.error(err?.message || "Erro ao converter em O.S."),
  });

  // WhatsApp Action
  const handleWhatsApp = (quote: CommercialQuote) => {
    const phone = quote.clientPhone?.replace(/\D/g, "");
    if (!phone) {
      toast.error("O cliente deste orçamento não possui telefone/WhatsApp cadastrado.");
      return;
    }

    const companyName = settings.companyName || "T-Maint";
    const itemsPreview = (quote.items || [])
      .map(it => `• ${it.name} (${it.quantity} ${it.unit})`)
      .join("\n");

    const validFormatted = quote.validUntil ? format(new Date(quote.validUntil + "T00:00:00"), "dd/MM/yyyy") : "";

    const msg = 
`Olá, *${quote.clientName}*! Tudo bem?

Aqui é da *${companyName}*.
Seguem os dados da proposta comercial / orçamento:

📌 *Orçamento:* ${quote.quoteNumber}
⚙️ *Equipamento:* ${quote.machine || "Manutenção Especializada"}
💰 *Valor Total:* ${fmtCurrency(quote.totalAmount)}
📅 *Validade:* até ${validFormatted}

*Itens / Serviços Previstos:*
${itemsPreview}

💳 *Condição:* ${quote.paymentTerms}
⏱️ *Prazo:* ${quote.executionDeadline}
🛡️ *Garantia:* ${quote.warrantyTerms}

Ficamos à disposição para esclarecer qualquer dúvida ou agendar a execução do serviço!`;

    const url = `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // KPIs
  const totalOpen = useMemo(() => {
    return quotes.filter(q => q.status === "draft" || q.status === "sent" || q.status === "negotiating")
      .reduce((acc, q) => acc + q.totalAmount, 0);
  }, [quotes]);

  const totalApproved = useMemo(() => {
    return quotes.filter(q => q.status === "approved")
      .reduce((acc, q) => acc + q.totalAmount, 0);
  }, [quotes]);

  const conversionRate = useMemo(() => {
    if (quotes.length === 0) return 0;
    const approvedCount = quotes.filter(q => q.status === "approved").length;
    return Math.round((approvedCount / quotes.length) * 100);
  }, [quotes]);

  // Filtered Quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNumber = q.quoteNumber.toLowerCase().includes(term);
        const matchClient = (q.clientName || "").toLowerCase().includes(term);
        const matchMachine = (q.machine || "").toLowerCase().includes(term);
        if (!matchNumber && !matchClient && !matchMachine) return false;
      }
      return true;
    });
  }, [quotes, statusFilter, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
            <Calculator className="h-4 w-4" /> Propostas Comerciais & Orçamentos
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orçamentos de Serviços</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gere propostas ágeis, envie via WhatsApp, imprima PDFs profissionais e converta em Ordens de Serviço em 1 clique.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shadow-sm font-semibold">
          <Plus className="h-4 w-4" /> Novo Orçamento
        </Button>
      </header>

      {/* KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/60 backdrop-blur shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total em Aberto</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{money(fmtCurrency(totalOpen))}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Aguardando aprovação</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Aprovado</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{money(fmtCurrency(totalApproved))}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Fechados & Em execução</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Taxa de Conversão</p>
              <p className="text-2xl font-black text-primary mt-1">{conversionRate}%</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Aprovados / Total</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total de Propostas</p>
              <p className="text-2xl font-black text-foreground mt-1">{quotes.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Cadastradas no sistema</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER & SEARCH BAR */}
      <Card className="shadow-sm border">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, nº do orçamento ou máquina..."
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "Todos" },
              { id: "draft", label: "Rascunhos" },
              { id: "sent", label: "Enviados" },
              { id: "negotiating", label: "Em Negociação" },
              { id: "approved", label: "Aprovados" },
              { id: "rejected", label: "Recusados" },
            ].map(tab => (
              <Button
                key={tab.id}
                variant={statusFilter === tab.id ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs whitespace-nowrap"
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QUOTES LIST TABLE */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Orçamentos Registrados ({filteredQuotes.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredQuotes.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Calculator className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-base font-semibold">Nenhum orçamento encontrado</p>
              <p className="text-xs mt-1">Crie uma nova proposta comercial clicando no botão acima.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-28">Nº Orçamento</TableHead>
                    <TableHead>Cliente & Equipamento</TableHead>
                    <TableHead>Itens / Escopo</TableHead>
                    <TableHead>Datas & Validade</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map(quote => {
                    const st = STATUS_MAP[quote.status] || STATUS_MAP.draft;
                    const StatusIcon = st.icon;
                    const isApproved = quote.status === "approved";
                    const hasOS = Boolean(quote.convertedActivityId);

                    return (
                      <TableRow key={quote.id} className={isApproved ? "bg-emerald-50/20 dark:bg-emerald-950/10" : undefined}>
                        {/* Quote Number */}
                        <TableCell>
                          <div className="font-mono font-bold text-xs text-primary">{quote.quoteNumber}</div>
                          {hasOS && (
                            <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 mt-1">
                              <CheckCircle2 className="h-2.5 w-2.5" /> O.S. Gerada
                            </Badge>
                          )}
                        </TableCell>

                        {/* Client & Machine */}
                        <TableCell>
                          <div className="font-bold text-sm text-foreground">{quote.clientName || "Cliente"}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <Wrench className="h-3 w-3 text-slate-500" />
                            <span>{quote.machine || "Sem máquina definida"}</span>
                          </div>
                        </TableCell>

                        {/* Items preview */}
                        <TableCell>
                          <div className="text-xs text-foreground font-medium">
                            {(quote.items || []).length} item(ns) na proposta
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                            {(quote.items || []).map(i => i.name).join(", ") || "Sem itens"}
                          </div>
                        </TableCell>

                        {/* Dates */}
                        <TableCell>
                          <div className="text-xs text-foreground">
                            Emissão: <b>{quote.date ? format(new Date(quote.date + "T00:00:00"), "dd/MM/yyyy") : "—"}</b>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Válido até: {quote.validUntil ? format(new Date(quote.validUntil + "T00:00:00"), "dd/MM/yyyy") : "—"}
                          </div>
                        </TableCell>

                        {/* Total Amount */}
                        <TableCell>
                          <div className="font-black text-sm text-foreground">
                            {money(fmtCurrency(quote.totalAmount))}
                          </div>
                          {quote.discountAmount > 0 && (
                            <div className="text-[10px] text-emerald-600 font-medium">
                              Desc: {fmtCurrency(quote.discountAmount)}
                            </div>
                          )}
                        </TableCell>

                        {/* Status Select */}
                        <TableCell className="text-center">
                          <Select
                            value={quote.status}
                            onValueChange={(val: CommercialQuoteStatus) =>
                              updateStatusMutation.mutate({ quoteId: quote.id, status: val })
                            }
                          >
                            <SelectTrigger className="h-7 text-[11px] font-semibold w-32 mx-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Rascunho</SelectItem>
                              <SelectItem value="sent">Enviado</SelectItem>
                              <SelectItem value="negotiating">Em Negociação</SelectItem>
                              <SelectItem value="approved">Aprovado</SelectItem>
                              <SelectItem value="rejected">Recusado</SelectItem>
                              <SelectItem value="expired">Expirado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Convert to O.S. (1-Click) */}
                            {!hasOS && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300 dark:border-emerald-800 font-semibold gap-1"
                                onClick={() => {
                                  if (confirm(`Deseja aprovar o orçamento "${quote.quoteNumber}" e gerar automaticamente a Ordem de Serviço?`)) {
                                    convertToOSMutation.mutate(quote.id);
                                  }
                                }}
                                title="Aprovar e Gerar Ordem de Serviço (O.S.)"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline text-xs">Gerar O.S.</span>
                              </Button>
                            )}

                            {/* WhatsApp Direct */}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              onClick={() => handleWhatsApp(quote)}
                              title="Enviar Proposta via WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>

                            {/* Print / PDF */}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              onClick={() => triggerPrint(quote)}
                              title="Visualizar / Imprimir Proposta em PDF"
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>

                            {/* Duplicate */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => duplicateMutation.mutate(quote.id)}
                              title="Duplicar Orçamento"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            {/* Edit */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEdit(quote)}
                              title="Editar Orçamento"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (confirm(`Deseja excluir o orçamento "${quote.quoteNumber}"?`)) {
                                  deleteMutation.mutate(quote.id);
                                }
                              }}
                              title="Excluir Orçamento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT QUOTE MODAL */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Calculator className="h-6 w-6 text-primary" />
              {editingId ? "Editar Proposta Comercial" : "Novo Orçamento de Serviço"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* ETAPA 1: CLIENTE E MÁQUINA */}
            <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
              <div className="font-bold text-sm text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> 1. Dados do Cliente & Equipamento
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Cliente *</Label>
                  <Select value={formClientId} onValueChange={handleClientChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione o cliente..." /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} {c.cnpj ? `(${c.cnpj})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label>Máquina / Equipamento</Label>
                  <Input
                    placeholder="Ex: Torno CNC Mazak Quick Turn 250"
                    value={formMachine}
                    onChange={e => setFormMachine(e.target.value)}
                    list="client-machines-list"
                  />
                  <datalist id="client-machines-list">
                    {clientMachines.map((m, idx) => (
                      <option key={idx} value={m} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-1">
                <div className="grid gap-1.5">
                  <Label>Data de Emissão</Label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Validade da Proposta</Label>
                  <Select
                    value={String(formValidDays)}
                    onValueChange={v => setFormValidDays(Number(v))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="10">10 dias</SelectItem>
                      <SelectItem value="15">15 dias (Padrão)</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Técnico / Elaborador</Label>
                  <Select
                    value={formTechnicianId || "default"}
                    onValueChange={v => setFormTechnicianId(v === "default" ? null : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Responsável..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Empresa / Padrão</SelectItem>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ETAPA 2: ADIÇÃO DE ITENS (SERVIÇOS E PEÇAS) */}
            <div className="bg-muted/30 p-4 rounded-xl border space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" /> 2. Itens & Serviços da Proposta
                </div>
                <div className="flex items-center gap-1 bg-background p-1 rounded-lg border">
                  <Button
                    type="button"
                    variant={newItemType === "service" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setNewItemType("service");
                      setNewItemUnit("Hora");
                      if (selectedClient?.hourlyRate) setNewItemPrice(Number(selectedClient.hourlyRate));
                    }}
                  >
                    Mão de Obra
                  </Button>
                  <Button
                    type="button"
                    variant={newItemType === "product" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setNewItemType("product");
                      setNewItemUnit("Un");
                      setNewItemPrice(0);
                    }}
                  >
                    Peça / Material
                  </Button>
                </div>
              </div>

              {/* Quick Select from Inventory if Product */}
              {newItemType === "product" && inventoryItems.length > 0 && (
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Puxar item cadastrado no Estoque (opcional)</Label>
                  <Select onValueChange={handleSelectInventoryItem}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione uma peça do catálogo..." /></SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map(inv => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.name} (Qtd em estoque: {inv.currentQuantity} {inv.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Item inputs line */}
              <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_80px_90px_100px_auto] gap-2 items-end bg-background p-3 rounded-lg border">
                <div className="grid gap-1">
                  <Label className="text-xs">Descrição do {newItemType === "service" ? "Serviço" : "Item"} *</Label>
                  <Input
                    placeholder={newItemType === "service" ? "Ex: Alinhamento de Fuso e Guias" : "Ex: Rolamento 6204 DDU"}
                    className="h-8 text-xs"
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Qtd *</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="any"
                    className="h-8 text-xs"
                    value={newItemQty}
                    onChange={e => setNewItemQty(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Unidade</Label>
                  <Input
                    placeholder="Hora, Un"
                    className="h-8 text-xs"
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Valor Unit. (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-8 text-xs"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(Number(e.target.value))}
                  />
                </div>
                <Button type="button" size="sm" className="h-8 text-xs gap-1 font-semibold" onClick={handleAddItem}>
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </div>

              {/* Items List Table */}
              {formItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  Nenhum item adicionado ainda. Preencha acima para compor a proposta.
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/60 border-b">
                      <tr>
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-left">Item / Descrição</th>
                        <th className="p-2 text-center">Qtd</th>
                        <th className="p-2 text-right">Unitário</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formItems.map((it, idx) => (
                        <tr key={it.id || idx} className="hover:bg-muted/30">
                          <td className="p-2">
                            <Badge variant="outline" className={it.type === "service" ? "bg-blue-50 text-blue-700 text-[10px]" : "bg-emerald-50 text-emerald-700 text-[10px]"}>
                              {it.type === "service" ? "Serviço" : "Peça"}
                            </Badge>
                          </td>
                          <td className="p-2 font-medium">{it.name}</td>
                          <td className="p-2 text-center">{it.quantity} {it.unit}</td>
                          <td className="p-2 text-right">{fmtCurrency(it.unitPrice)}</td>
                          <td className="p-2 text-right font-bold">{fmtCurrency(it.total)}</td>
                          <td className="p-2 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ETAPA 3: DESLOCAMENTO, DESCONTOS & TOTAL */}
            <div className="bg-muted/30 p-4 rounded-xl border grid sm:grid-cols-3 gap-3 items-end">
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Deslocamento (Km)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formTravelKm}
                  onChange={e => setFormTravelKm(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Taxa por Km (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formTravelRate}
                  onChange={e => setFormTravelRate(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Desconto Especial (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formDiscountAmount}
                  onChange={e => setFormDiscountAmount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* RESUMO TOTAL DA PROPOSTA */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>Serviços: <b>{fmtCurrency(calculatedServicesTotal)}</b> · Peças: <b>{fmtCurrency(calculatedProductsTotal)}</b></div>
                <div>Deslocamento: <b>{fmtCurrency(calculatedTravelTotal)}</b> · Desconto: <b>{fmtCurrency(formDiscountAmount)}</b></div>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold text-muted-foreground mr-2">Valor Total:</span>
                <span className="text-2xl font-black text-primary">{fmtCurrency(calculatedGrandTotal)}</span>
              </div>
            </div>

            {/* ETAPA 4: CONDIÇÕES COMERCIAIS & OBSERVAÇÕES */}
            <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
              <div className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> 3. Condições Comerciais & Garantia
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label>Forma de Pagamento</Label>
                  <Input
                    placeholder="Ex: À vista Pix / 30 dias"
                    value={formPaymentTerms}
                    onChange={e => setFormPaymentTerms(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Prazo de Execução</Label>
                  <Input
                    placeholder="Ex: Em até 3 dias úteis"
                    value={formExecutionDeadline}
                    onChange={e => setFormExecutionDeadline(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Garantia Técnica</Label>
                  <Input
                    placeholder="Ex: 90 dias peças e serviços"
                    value={formWarrantyTerms}
                    onChange={e => setFormWarrantyTerms(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1.5 pt-1">
                <Label>Observações Técnicas / Escopo do Atendimento</Label>
                <Textarea
                  rows={3}
                  placeholder="Instruções de segurança, itens inclusos/exclusos ou detalhes adicionais..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !formClientId || formItems.length === 0}
              className="font-semibold gap-1"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Salvar Alterações" : "Emitir Orçamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HIDDEN PRINT VIEW CONTAINER FOR REACT-TO-PRINT */}
      <div className="hidden">
        {selectedQuoteForPrint && (
          <QuoteReportPrint
            ref={printRef}
            quote={selectedQuoteForPrint}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
}
