import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useClients } from "@/hooks/use-data";
import { fmtCurrency, type Client } from "@/lib/api";
import { useMoney } from "@/hooks/use-money-visibility";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/clientes")({ component: Clientes });

type Editing = Omit<Client, "id"> & { id?: string };
const empty = (): Editing => ({ name: "", hourlyRate: 0, kmRate: 0, cnpj: "", phone: "", address: "" });

function Clientes() {
  const money = useMoney();
  const { clients, addClient, updateClient, deleteClient, isLoading } = useClients();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>(empty());

  const startNew = () => { setEditing(empty()); setOpen(true); };
  const startEdit = (c: Client) => { setEditing(c); setOpen(true); };

  const save = async () => {
    if (!editing.name.trim()) { toast.error("Informe o nome do cliente"); return; }
    if (!editing.hourlyRate || editing.hourlyRate <= 0) { toast.error("Informe o valor por hora"); return; }
    if (!editing.kmRate || editing.kmRate <= 0) { toast.error("Informe o valor por km"); return; }
    try {
      if (editing.id) {
        await updateClient.mutateAsync(editing as Client);
        toast.success("Cliente atualizado");
      } else {
        const { id: _drop, ...rest } = editing;
        await addClient.mutateAsync(rest);
        toast.success("Cliente cadastrado");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
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
          <p className="text-muted-foreground mt-1">Cadastre o valor/hora e valor/km de cada cliente</p>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={addClient.isPending || updateClient.isPending}>Salvar</Button>
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
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {clients.map(c => (
            <Card key={c.id} className="hover:shadow-elegant transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate">{c.name}</h3>
                    {c.phone && <p className="text-xs text-muted-foreground truncate">{c.phone}</p>}
                    {c.cnpj && <p className="text-xs text-muted-foreground truncate">CNPJ: {c.cnpj}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
