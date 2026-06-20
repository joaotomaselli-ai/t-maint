import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { ShoppingCart, FileText, Trash2, ExternalLink, Paperclip, Wrench } from "lucide-react";
import { toast } from "sonner";
import { uploadQuoteFile, getQuoteFileUrl, type Requisition, type RequisitionStatus } from "@/lib/api";
import { NumericFormat } from "react-number-format";

export const Route = createFileRoute("/requisicoes")({
  component: Requisicoes,
});

const STATUS_COLORS: Record<RequisitionStatus, string> = {
  "Aberta": "bg-slate-500",
  "Aguardando Cotação": "bg-amber-500",
  "Em Aprovação": "bg-blue-500",
  "Comprado": "bg-green-500",
  "Fechada": "bg-slate-800",
};

function Requisicoes() {
  const { isAdmin } = useAccess();
  const { requisitions, updateStatus } = useRequisitions();
  const { reports } = useReports();
  const { clients } = useClients();
  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);

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

  const RequisitionCard = ({ req }: { req: Requisition }) => {
    const report = reports.find(r => r.id === req.activityId);
    const client = clients.find(c => c.id === report?.clientId);

    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                OS {report?.orderNumber ?? "N/A"}
              </CardTitle>
              <CardDescription className="mt-1 font-medium text-foreground">
                {client?.name ?? "Cliente desconhecido"}
              </CardDescription>
              <div className="text-xs text-muted-foreground mt-1">
                Criada em {format(new Date(req.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
              </div>
            </div>
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
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Requisições</h1>
        <p className="text-muted-foreground mt-1">Controle de requisições de materiais e compras futuras.</p>
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
          onOpenChange={(v) => !v && setSelectedReq(null)} 
          report={reports.find(r => r.id === selectedReq.activityId)}
        />
      )}
    </div>
  );
}

function QuotesDialog({ req, open, onOpenChange, report }: { req: Requisition, open: boolean, onOpenChange: (v: boolean) => void, report?: any }) {
  const { quotes, isLoading, addQuote, deleteQuote } = useRequisitionQuotes(req.id);
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
