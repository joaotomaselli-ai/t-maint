import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useInventory, useReports, useAuth } from "@/hooks/use-data";
import { useAccess } from "@/hooks/use-access";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Printer, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/estoque/$itemId")({
  component: EstoqueItemPage,
});

function EstoqueItemPage() {
  const { itemId } = Route.useParams();
  const navigate = useNavigate();
  const { planType, isAdmin } = useAccess();
  const { items, upsertItem, deleteItem, createMovement } = useInventory();
  const { reports } = useReports();
  
  const item = useMemo(() => items.find(i => i.id === itemId), [items, itemId]);
  
  // Fake query for now, since we need a hook to fetch movements by item ID. 
  // Let's implement that in useInventory, but for now we'll assume we have it or we fetch it.
  // Actually, we added listInventoryMovements to api.ts, so let's import it via useQuery here.
  const { useQuery } = require("@tanstack/react-query");
  const { listInventoryMovements } = require("@/lib/api");
  
  const movQuery = useQuery({
    queryKey: ["inventory_movements", itemId],
    queryFn: () => listInventoryMovements(itemId),
    enabled: !!itemId,
  });
  
  const movements = movQuery.data ?? [];

  const [isMoveOpen, setIsMoveOpen] = useState<"IN" | "OUT" | null>(null);
  const [moveData, setMoveData] = useState({ quantity: "", unitCost: "", reason: "", activityId: "none" });

  if (planType === "basic" || !item) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{!item ? "Item não encontrado." : "Acesso restrito."}</p>
        <Button variant="link" onClick={() => navigate({ to: "/estoque" })}>Voltar ao Estoque</Button>
      </div>
    );
  }

  const isLow = item.minQuantity != null && item.currentQuantity <= item.minQuantity;

  const handleMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(moveData.quantity);
    if (qty <= 0) {
      toast.error("Quantidade inválida");
      return;
    }
    if (isMoveOpen === "OUT" && qty > item.currentQuantity) {
      toast.error("Quantidade insuficiente no estoque!");
      return;
    }

    createMovement.mutate({
      itemId: item.id,
      type: isMoveOpen!,
      quantity: qty,
      unitCost: isMoveOpen === "IN" ? Number(moveData.unitCost || 0) : item.averageCost,
      activityId: moveData.activityId !== "none" ? moveData.activityId : null,
      reason: moveData.reason || (isMoveOpen === "IN" ? "Entrada Manual" : "Saída Manual")
    }, {
      onSuccess: () => {
        toast.success("Movimentação registrada!");
        setIsMoveOpen(null);
        setMoveData({ quantity: "", unitCost: "", reason: "", activityId: "none" });
        movQuery.refetch();
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  const printQrCode = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>QR Code - ${item.name}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;">
          <h2>${item.name}</h2>
          <p>${item.sku ? 'SKU: ' + item.sku : ''}</p>
          <div id="qr-placeholder"></div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"><\/script>
          <script>
            var typeNumber = 0;
            var errorCorrectionLevel = 'M';
            var qr = qrcode(typeNumber, errorCorrectionLevel);
            qr.addData("${item.qrCodeValue}");
            qr.make();
            document.getElementById('qr-placeholder').innerHTML = qr.createImgTag(5);
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/estoque" })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {item.name}
            {isLow && <AlertTriangle className="h-5 w-5 text-destructive" title="Estoque Baixo" />}
          </h1>
          <p className="text-muted-foreground">{item.sku ? `SKU: ${item.sku}` : "Sem código"} • {item.location || "Sem local"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="flex gap-4">
            <Card className="flex-1">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Quantidade em Estoque</p>
                <p className="text-4xl font-bold" style={{ color: isLow ? "red" : "inherit" }}>
                  {item.currentQuantity} <span className="text-lg font-normal text-muted-foreground">{item.unit}</span>
                </p>
                {item.minQuantity != null && (
                  <p className="text-xs text-muted-foreground mt-2">Mínimo: {item.minQuantity} {item.unit}</p>
                )}
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Custo Médio Unitário</p>
                <p className="text-3xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.averageCost)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Total investido: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.averageCost * item.currentQuantity)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Histórico de Movimentações</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" onClick={() => setIsMoveOpen("IN")}>
                  <ArrowDownToLine className="h-4 w-4 mr-2" /> Entrada
                </Button>
                <Button size="sm" variant="outline" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200" onClick={() => setIsMoveOpen("OUT")}>
                  <ArrowUpFromLine className="h-4 w-4 mr-2" /> Saída
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {movQuery.isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
                <div className="space-y-4 mt-4">
                  {movements.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma movimentação registrada.</p>}
                  {movements.map((m: any) => (
                    <div key={m.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${m.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {m.type === 'IN' ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{m.reason || (m.type === 'IN' ? 'Entrada' : 'Saída')}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(m.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${m.type === 'IN' ? 'text-green-600' : 'text-amber-600'}`}>
                          {m.type === 'IN' ? '+' : '-'}{m.quantity} {item.unit}
                        </p>
                        {m.type === 'IN' && m.unitCost > 0 && (
                          <p className="text-xs text-muted-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.unitCost)} / un</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code do Item</CardTitle>
              <CardDescription>Cole na prateleira para acesso rápido via celular.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white border rounded-lg">
                <QRCodeSVG value={item.qrCodeValue || ""} size={180} />
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={printQrCode}>
                <Printer className="h-4 w-4" /> Imprimir Etiqueta
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive text-base">Zona de Perigo</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full gap-2" onClick={() => {
                  if (confirm("Tem certeza que deseja excluir este item e todo o seu histórico de movimentações?")) {
                    deleteItem.mutate(item.id, {
                      onSuccess: () => navigate({ to: "/estoque" })
                    });
                  }
                }}>
                  <Trash2 className="h-4 w-4" /> Excluir Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!isMoveOpen} onOpenChange={(op) => !op && setIsMoveOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar {isMoveOpen === "IN" ? "Entrada" : "Saída"} de Estoque</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMovement} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label>Quantidade ({item.unit}) *</Label>
              <Input type="number" step="0.01" min="0.01" value={moveData.quantity} onChange={e => setMoveData({...moveData, quantity: e.target.value})} required />
            </div>
            
            {isMoveOpen === "IN" && (
              <div className="grid gap-2">
                <Label>Custo Unitário (R$) *</Label>
                <Input type="number" step="0.01" min="0" value={moveData.unitCost} onChange={e => setMoveData({...moveData, unitCost: e.target.value})} required />
              </div>
            )}

            {isMoveOpen === "OUT" && (
              <div className="grid gap-2">
                <Label>Vincular a Ordem de Serviço (Opcional)</Label>
                <Select value={moveData.activityId} onValueChange={v => setMoveData({...moveData, activityId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma OS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (Uso Interno)</SelectItem>
                    {reports.map(r => (
                      <SelectItem key={r.id} value={r.id}>OS #{r.orderNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Motivo / Observação</Label>
              <Input value={moveData.reason} onChange={e => setMoveData({...moveData, reason: e.target.value})} placeholder={isMoveOpen === "IN" ? "Ex: Compra NF 1234" : "Ex: Troca da peça X"} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsMoveOpen(null)}>Cancelar</Button>
              <Button type="submit" disabled={createMovement.isPending}>
                Registrar {isMoveOpen === "IN" ? "Entrada" : "Saída"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
