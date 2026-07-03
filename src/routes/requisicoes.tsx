import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAccess } from "@/hooks/use-access";
import { useRequisitions, useRequisitionQuotes, useReports, useClients } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShoppingCart, FileText, Trash2, ExternalLink, Paperclip, Wrench, Download, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { uploadQuoteFile, getQuoteFileUrl, listAttachments, getAttachmentUrl, type Requisition, type RequisitionStatus } from "@/lib/api";
import { NumericFormat } from "react-number-format";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/requisicoes")({
  component: Requisicoes,
});

function AttachmentPreview({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getAttachmentUrl(path).then(setUrl).catch(console.error);
  }, [path]);

  if (!url) return <div className="w-24 h-24 bg-slate-100 animate-pulse rounded-md border flex-shrink-0" />;

  return (
    <div className="relative group w-24 h-24 rounded-md border overflow-hidden flex-shrink-0 bg-slate-50">
      <img src={url} alt="Anexo" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <a href={url} target="_blank" rel="noreferrer" title="Abrir imagem" className="text-white hover:text-primary">
          <ExternalLink className="h-5 w-5" />
        </a>
        <a href={url} download title="Baixar imagem" className="text-white hover:text-primary">
          <Download className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<RequisitionStatus, string> = {
  "Aberta": "bg-slate-500",
  "Aguardando Cotação": "bg-amber-500",
  "Em Aprovação": "bg-blue-500",
  "Comprado": "bg-green-500",
  "Fechada": "bg-slate-800",
};

function Requisicoes() {
  const { isAdmin } = useAccess();
  const { requisitions, updateStatus, createAvulsa, deleteReq } = useRequisitions();
  const { reports } = useReports();
  const { clients } = useClients();
  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);
  const [isAvulsaOpen, setIsAvulsaOpen] = useState(false);
  const [avulsaDesc, setAvulsaDesc] = useState("");

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold">Acesso Restrito</h2>
        <p className="text-muted-foreground mt-2 max-w-md">Esta página é restrita para administradores.</p>
      </div>
    );
  }

  const pendentes = requisitions.filter(r => !["Comprado", "Fechada"].includes(r.status));
  const concluidas = requisitions.filter(r => ["Comprado", "Fechada"].includes(r.status));

  const handleStatusChange = (id: string, status: RequisitionStatus) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast.success("Status atualizado")
    });
  };

  const handleCreateAvulsa = (e: React.FormEvent) => {
    e.preventDefault();
    createAvulsa.mutate(avulsaDesc, {
      onSuccess: () => {
        toast.success("Requisição avulsa criada com sucesso!");
        setIsAvulsaOpen(false);
        setAvulsaDesc("");
      },
      onError: (err: any) => toast.error(err?.message || "Erro ao criar")
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta requisição?")) {
      deleteReq.mutate(id, {
        onSuccess: () => toast.success("Requisição excluída!"),
        onError: (err: any) => toast.error(err?.message || "Erro ao excluir"),
      });
    }
  };

  const RequisitionCard = ({ req }: { req: Requisition }) => {
    const report = reports.find(r => r.id === req.activityId);
    const client = clients.find(c => c.id === report?.clientId);

    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {req.activityId ? (
                  <>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    OS {report?.orderNumber ?? "N/A"}
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 text-primary" />
                    Uso Interno/Avulsa
                  </>
                )}
              </CardTitle>
              <CardDescription className="mt-1 font-medium text-foreground">
                {req.activityId ? (client?.name ?? "Cliente desconhecido") : "Estoque da Empresa"}
              </CardDescription>
              <div className="text-xs text-muted-foreground mt-1">
                Criada em {format(new Date(req.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={req.status} 
                onValueChange={(val) => handleStatusChange(req.id, val as RequisitionStatus)}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[req.status]}`} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(STATUS_COLORS).map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(req.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="bg-slate-50 p-3 rounded-md text-sm whitespace-pre-wrap flex-1 border">
            {req.description}
          </div>
          <Button variant="outline" className="w-full gap-2" onClick={() => setSelectedReq(req)}>
            <Paperclip className="h-4 w-4" />
            Gerenciar Orçamentos
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requisições</h1>
          <p className="text-muted-foreground mt-1">Controle de requisições de materiais e compras futuras.</p>
        </div>
        <Button onClick={() => setIsAvulsaOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Nova Requisição Avulsa
        </Button>
      </header>

      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes">
            Pendentes
            <Badge variant="secondary" className="ml-2 bg-slate-200">{pendentes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="concluidas">
            Concluídas
            <Badge variant="secondary" className="ml-2 bg-slate-200">{concluidas.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pendentes" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendentes.length === 0 && <p className="text-muted-foreground py-8 text-center col-span-full">Nenhuma requisição pendente.</p>}
          {pendentes.map(req => <RequisitionCard key={req.id} req={req} />)}
        </TabsContent>
        <TabsContent value="concluidas" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {concluidas.length === 0 && <p className="text-muted-foreground py-8 text-center col-span-full">Nenhuma requisição concluída.</p>}
          {concluidas.map(req => <RequisitionCard key={req.id} req={req} />)}
        </TabsContent>
      </Tabs>

      {selectedReq && (
        <QuotesDialog 
          req={selectedReq} 
          open={!!selectedReq} 
          onOpenChange={(op) => !op && setSelectedReq(null)} 
          report={reports.find(r => r.id === selectedReq.activityId)}
        />
      )}

      <Dialog open={isAvulsaOpen} onOpenChange={setIsAvulsaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Requisição Avulsa</DialogTitle>
            <DialogDescription>
              Crie uma requisição sem vinculá-la a uma Ordem de Serviço, ideal para materiais de uso interno ou estoque.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAvulsa} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Descrição / Lista de Materiais</Label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ex: 5 caixas de papel A4, 2 toners pretos, materiais de limpeza..."
                value={avulsaDesc}
                onChange={e => setAvulsaDesc(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAvulsaOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={!avulsaDesc.trim() || createAvulsa.isPending}>
                {createAvulsa.isPending ? "Criando..." : "Criar Requisição"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuotesDialog({ req, open, onOpenChange, report }: { req: Requisition, open: boolean, onOpenChange: (v: boolean) => void, report?: any }) {
  const { quotes, isLoading, addQuote, deleteQuote } = useRequisitionQuotes(req.id);
  const { data: attachments = [], isLoading: loadingAtts } = useQuery({
    queryKey: ["attachments", req.activityId],
    queryFn: () => listAttachments(req.activityId),
    enabled: !!req.activityId,
  });
  const requisitionImages = attachments.filter(a => a.kind === "future_replacements");

  const [supplier, setSupplier] = useState("");
  const [value, setValue] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || value === null || !file) return;
    
    try {
      setUploading(true);
      toast.loading("Enviando orçamento...", { id: "upload-quote" });
      const storagePath = await uploadQuoteFile(file, req.id);
      addQuote.mutate({ requisitionId: req.id, supplier, value, storagePath }, {
        onSuccess: () => {
          toast.success("Orçamento adicionado!", { id: "upload-quote" });
          setSupplier("");
          setValue(null);
          setFile(null);
        },
        onError: (err: any) => {
          toast.error(err.message ?? "Erro ao salvar", { id: "upload-quote" });
        }
      });
    } catch (err: any) {
      toast.error(err.message ?? "Erro no upload", { id: "upload-quote" });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenPdf = async (path: string) => {
    try {
      const url = await getQuoteFileUrl(path);
      window.open(url, '_blank');
    } catch (e) {
      toast.error("Não foi possível abrir o arquivo");
    }
  };

  const handleDelete = (id: string, path: string) => {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      deleteQuote.mutate({ id, storagePath: path });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Orçamentos da Requisição</DialogTitle>
          <DialogDescription>
            OS {report?.orderNumber ?? "N/A"} — Adicione e compare orçamentos
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 p-3 rounded-md text-sm whitespace-pre-wrap border my-2">
          {req.description}
        </div>

        {requisitionImages.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2 text-muted-foreground flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> Fotos Anexadas na OS
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {requisitionImages.map(att => (
                <AttachmentPreview key={att.id} path={att.storagePath} />
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Formulário de adição */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Adicionar Novo Orçamento</h3>
            <form onSubmit={handleAdd} className="space-y-4 p-4 border rounded-lg bg-card">
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input required value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Nome da empresa" />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <NumericFormat
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  value={value ?? ""}
                  onValueChange={(vals) => setValue(vals.floatValue ?? null)}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Arquivo (PDF ou Imagem)</Label>
                <Input 
                  type="file" 
                  accept=".pdf,image/*" 
                  required 
                  onChange={e => setFile(e.target.files?.[0] ?? null)} 
                />
              </div>
              <Button type="submit" className="w-full" disabled={uploading || !supplier || value === null || !file}>
                {uploading ? "Enviando..." : "Salvar Orçamento"}
              </Button>
            </form>
          </div>

          {/* Lista de orçamentos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Orçamentos Recebidos</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : quotes.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-lg">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum orçamento anexado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((q, i) => (
                  <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{q.supplier}</span>
                        {i === 0 && <Badge className="bg-green-500 hover:bg-green-600 text-[10px] h-4">Mais barato</Badge>}
                      </div>
                      <div className="text-lg font-bold text-primary mt-1">
                        {q.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenPdf(q.storagePath)} title="Visualizar arquivo">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(q.id, q.storagePath)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
