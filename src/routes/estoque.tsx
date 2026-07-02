import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useInventory } from "@/hooks/use-data";
import { useAccess } from "@/hooks/use-access";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export const Route = createFileRoute("/estoque")({
  component: EstoquePage,
});

function EstoquePage() {
  const { planType } = useAccess();
  const { items, isLoading, upsertItem } = useInventory();
  const navigate = useNavigate();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", sku: "", minQuantity: "", unit: "Un", location: "" });

  if (planType === "basic") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold">Acesso Restrito</h2>
        <p className="text-muted-foreground mt-2 max-w-md">O módulo de Estoque é exclusivo para planos Pro, Elite e Elite Pro.</p>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    upsertItem.mutate({
      name: newItem.name,
      sku: newItem.sku || null,
      unit: newItem.unit,
      location: newItem.location || null,
      minQuantity: newItem.minQuantity ? Number(newItem.minQuantity) : null,
      qrCodeValue: `EST-${Date.now()}` // Temporary, ideally would be the absolute URL for the scanner
    }, {
      onSuccess: (data) => {
        toast.success("Item criado!");
        setIsAddOpen(false);
        setNewItem({ name: "", sku: "", minQuantity: "", unit: "Un", location: "" });
        // Update qr code value to point to its own page
        const url = `${window.location.origin}/estoque/${data.id}`;
        upsertItem.mutate({ id: data.id, qrCodeValue: url });
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus materiais, rastreabilidade e histórico de compras.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Novo Material
        </Button>
      </header>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-100 rounded-lg border"></div>
          <div className="h-32 bg-slate-100 rounded-lg border"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 && (
            <p className="text-muted-foreground py-8 text-center col-span-full">Nenhum material cadastrado.</p>
          )}
          {items.map(item => {
            const isLow = item.minQuantity != null && item.currentQuantity <= item.minQuantity;
            return (
              <Card key={item.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate({ to: `/estoque/${item.id}` })}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        {isLow && <AlertTriangle className="h-4 w-4 text-destructive" title="Estoque Baixo" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.sku ? `SKU: ${item.sku}` : "Sem código"}</p>
                      <p className="text-sm text-muted-foreground">Local: {item.location || "Não informado"}</p>
                    </div>
                    {item.qrCodeValue && (
                      <div className="p-1 bg-white border rounded shrink-0">
                        <QRCodeSVG value={item.qrCodeValue} size={48} />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantidade</p>
                      <p className="font-medium text-lg" style={{ color: isLow ? "red" : "inherit" }}>
                        {item.currentQuantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Custo Médio</p>
                      <p className="font-medium">
                        {item.averageCost > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.averageCost) : "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Material</DialogTitle>
            <DialogDescription>Adicione um novo item ao controle de estoque.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label>Nome do Material *</Label>
              <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Código / SKU</Label>
                <Input value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Unidade de Medida *</Label>
                <Input value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Localização (Corredor, Prateleira)</Label>
              <Input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Estoque Mínimo (Opcional)</Label>
              <Input type="number" step="0.01" value={newItem.minQuantity} onChange={e => setNewItem({...newItem, minQuantity: e.target.value})} placeholder="Deixe em branco para ignorar" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={!newItem.name.trim() || upsertItem.isPending}>Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
