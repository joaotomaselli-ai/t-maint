import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useClients } from "@/hooks/use-data";
import { useClientRequirements, getSubmissionStatus } from "@/hooks/use-client-requirements";
import { ClientComplianceModal } from "@/components/ClientComplianceModal";
import { fmtCurrency, uploadClientContract, getAttachmentUrl, type Client } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useMoney } from "@/hooks/use-money-visibility";
import { Plus, Pencil, Trash2, Users, Loader2, Building2, FileText, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/clientes")({ component: Clientes });

type Editing = Omit<Client, "id"> & { id?: string; fileToUpload?: File | null };
const empty = (): Editing => ({ name: "", hourlyRate: 0, kmRate: 0, cnpj: "", phone: "", address: "", contact: "", hasPreventiveContract: false, preventiveContractValue: null, preventiveContractFile: null, fileToUpload: null });

function Clientes() {
  const { user } = useAuth();
  const money = useMoney();
  const { clients, addClient, updateClient, deleteClient, isLoading } = useClients();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>(empty());
  const [complianceClient, setComplianceClient] = useState<Client | null>(null);

  const startNew = () => { setEditing(empty()); setOpen(true); };
  const startEdit = (c: Client) => { setEditing(c); setOpen(true); };

  const save = async () => {
    if (!editing.name.trim()) { toast.error("Informe o nome do cliente"); return; }
    if (!editing.hourlyRate || editing.hourlyRate <= 0) { toast.error("Informe o valor por hora"); return; }
    if (!editing.kmRate || editing.kmRate <= 0) { toast.error("Informe o valor por km"); return; }
    if (editing.hasPreventiveContract && (!editing.preventiveContractValue || editing.preventiveContractValue <= 0)) {
        toast.error("Informe o valor do contrato de preventiva"); return;
    }
    try {
      let finalFile = editing.preventiveContractFile;

      if (editing.id) {
        if (editing.fileToUpload && user) {
          try {
            finalFile = await uploadClientContract(user.id, editing.id, editing.fileToUpload);
          } catch (e: any) {
            throw new Error(`Erro no upload (Storage): ${e?.message}`);
          }
        }
        try {
          await updateClient.mutateAsync({ ...editing, preventiveContractFile: finalFile } as Client);
        } catch (e: any) {
          throw new Error(`Erro no update do cliente (DB): ${e?.message}`);
        }
        toast.success("Cliente atualizado");
      } else {
        const { id: _drop, fileToUpload, ...rest } = editing;
        let newClient;
        try {
          newClient = await addClient.mutateAsync(rest);
        } catch (e: any) {
          throw new Error(`Erro ao criar cliente (DB INSERT): ${e?.message}`);
        }
        
        if (fileToUpload && user && newClient && newClient.id) {
           let path;
           try {
             path = await uploadClientContract(user.id, newClient.id, fileToUpload);
           } catch (e: any) {
             throw new Error(`Erro no upload (Storage): ${e?.message}`);
           }
           try {
             await updateClient.mutateAsync({ ...newClient, preventiveContractFile: path });
           } catch (e: any) {
             throw new Error(`Erro ao atualizar cliente com arquivo (DB UPDATE): ${e?.message}`);
           }
        }
        toast.success("Cliente cadastrado");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  };

  const viewPdf = async (path: string) => {
    if (path.startsWith("data:application/pdf;base64,")) {
      try {
        const base64Data = path.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } catch (e) {
        toast.error("Erro ao abrir PDF salvo no banco");
      }
      return;
    }
    try {
      const url = await getAttachmentUrl(path);
      window.open(url, "_blank");
    } catch (e) {
      toast.error("Erro ao abrir PDF");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este cliente? As atividades vinculadas também serão excluídas.")) return;
    try {
      await deleteClient.mutateAsync(id);
      toast.success("Cliente removido");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao remover");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie clientes, valores de hora/km e exigências de documentação industrial</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew} className="gap-2"><Plus className="h-4 w-4" /> Novo cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Nome / Razão social *</Label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: Meitech Indústria" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor por hora (R$) *</Label>
                  <Input type="number" step="0.01" value={editing.hourlyRate || ""} onChange={e => setEditing({ ...editing, hourlyRate: Number(e.target.value) })} placeholder="150,00" />
                </div>
                <div className="grid gap-2">
                  <Label>Valor por km (R$) *</Label>
                  <Input type="number" step="0.01" value={editing.kmRate || ""} onChange={e => setEditing({ ...editing, kmRate: Number(e.target.value) })} placeholder="2,50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>CNPJ</Label>
                  <Input value={editing.cnpj || ""} onChange={e => setEditing({ ...editing, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
                </div>
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input value={editing.phone || ""} onChange={e => setEditing({ ...editing, phone: e.target.value })} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Endereço</Label>
                <Input value={editing.address || ""} onChange={e => setEditing({ ...editing, address: e.target.value })} placeholder="Rua, número, cidade" />
              </div>

              <div className="border rounded-md p-4 mt-2 space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="hasPreventive" className="w-4 h-4 cursor-pointer" checked={editing.hasPreventiveContract} onChange={e => setEditing({ ...editing, hasPreventiveContract: e.target.checked })} />
                  <Label htmlFor="hasPreventive" className="cursor-pointer">Possui Contrato de Preventiva?</Label>
                </div>
                {editing.hasPreventiveContract && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Valor Mensal (R$)</Label>
                      <Input type="number" step="0.01" value={editing.preventiveContractValue || ""} onChange={e => setEditing({ ...editing, preventiveContractValue: Number(e.target.value) })} placeholder="500,00" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Contrato PDF</Label>
                      <div className="flex flex-col gap-2">
                         <Input key={editing.fileToUpload ? 'has-file' : 'no-file'} type="file" accept="application/pdf" className="text-xs" onChange={e => setEditing({ ...editing, fileToUpload: e.target.files?.[0] || null })} />
                         {editing.fileToUpload && (
                           <Button type="button" variant="link" className="px-0 h-auto self-start text-xs text-destructive" onClick={() => setEditing({ ...editing, fileToUpload: null })}>Remover arquivo selecionado</Button>
                         )}
                         {editing.preventiveContractFile && !editing.fileToUpload && (
                           <div className="flex items-center gap-4">
                             <Button type="button" variant="link" className="px-0 h-auto self-start text-xs" onClick={() => viewPdf(editing.preventiveContractFile!)}>Ver PDF atual</Button>
                             <Button type="button" variant="link" className="px-0 h-auto self-start text-xs text-destructive" onClick={() => setEditing({ ...editing, preventiveContractFile: null })}>Excluir PDF salvo</Button>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={addClient.isPending || updateClient.isPending}>
                {(addClient.isPending || updateClient.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {(addClient.isPending || updateClient.isPending) ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">Carregando...</CardContent></Card>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum cliente cadastrado</p>
            <p className="text-sm mt-1">Comece cadastrando seu primeiro cliente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map(c => (
            <ClientCardItem
              key={c.id}
              c={c}
              money={money}
              onEdit={startEdit}
              onRemove={remove}
              onViewPdf={viewPdf}
              onOpenCompliance={(clientObj) => setComplianceClient(clientObj)}
            />
          ))}
        </div>
      )}

      {complianceClient && (
        <ClientComplianceModal
          client={complianceClient}
          open={!!complianceClient}
          onOpenChange={(v) => { if (!v) setComplianceClient(null); }}
        />
      )}
    </div>
  );
}

function ClientCardItem({
  c,
  money,
  onEdit,
  onRemove,
  onViewPdf,
  onOpenCompliance,
}: {
  c: Client;
  money: (v: number) => string;
  onEdit: (c: Client) => void;
  onRemove: (id: string) => void;
  onViewPdf: (path: string) => void;
  onOpenCompliance: (c: Client) => void;
}) {
  const { clientReq } = useClientRequirements(c.id);
  const subStatus = getSubmissionStatus(clientReq?.nextSubmissionDate);

  return (
    <Card className={`hover:shadow-elegant transition-shadow flex flex-col justify-between ${
      subStatus.status === "vencido" ? "border-red-300 dark:border-red-900/60" : ""
    }`}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg truncate">{c.name}</h3>
              {c.phone && <p className="text-xs text-muted-foreground truncate">{c.phone}</p>}
              {c.cnpj && <p className="text-xs text-muted-foreground truncate">CNPJ: {c.cnpj}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => onEdit(c)} title="Editar dados do cliente"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onRemove(c.id)} title="Excluir cliente"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>

          {/* Submission Status Badge */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {subStatus.status === "vencido" ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-300">
                🔴 Reenvio Vencido (há {Math.abs(subStatus.daysLeft || 0)}d)
              </span>
            ) : subStatus.status === "vencendo" ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300">
                ⚠️ Reenvio em {subStatus.daysLeft} dias
              </span>
            ) : subStatus.status === "em_dia" ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                🟢 Reenvio em Dia ({subStatus.daysLeft}d)
              </span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                📋 Sem prazo de reenvio
              </span>
            )}

            {clientReq?.requiredDocs && clientReq.requiredDocs.length > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-300">
                {clientReq.requiredDocs.length} Exigências
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted rounded-md p-2">
              <div className="text-xs text-muted-foreground">Hora</div>
              <div className="font-semibold">{money(c.hourlyRate)}</div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-xs text-muted-foreground">Km</div>
              <div className="font-semibold">{money(c.kmRate)}</div>
            </div>
          </div>
          {c.address && <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{c.address}</p>}
          {c.hasPreventiveContract && (
            <div className="mt-3 p-2 bg-blue-50/50 text-blue-800 text-xs rounded border border-blue-100 flex items-center justify-between">
              <span>Contrato: <strong>{money(c.preventiveContractValue || 0)}/mês</strong></span>
              {c.preventiveContractFile && (
                <Button variant="link" className="p-0 h-auto text-xs text-blue-700" onClick={() => onViewPdf(c.preventiveContractFile!)}>Ver PDF</Button>
              )}
            </div>
          )}
        </div>

        {/* Industrial Integration Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 gap-1.5 text-xs font-semibold border-blue-300 dark:border-blue-800 hover:bg-blue-500/10 text-blue-700 dark:text-blue-400"
          onClick={() => onOpenCompliance(c)}
        >
          <Building2 className="h-4 w-4 text-blue-600" />
          Exigências & Integração
        </Button>
      </CardContent>
    </Card>
  );
}
