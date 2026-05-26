import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTechnicians } from "@/hooks/use-data";
import { fmtCurrency, type Technician } from "@/lib/api";
import { Plus, Pencil, Trash2, HardHat } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tecnicos")({ component: Tecnicos });

type Editing = Omit<Technician, "id"> & { id?: string; hasFixedHours?: boolean };
const empty = (): Editing => ({
  name: "", hourlyRate: 0, kmRate: 0,
  overtimeWeekdayRate: 0, overtimeWeekendRate: 0,
  monthlyFixedHours: null, hasFixedHours: false,
});

function Tecnicos() {
  const { technicians, addTechnician, updateTechnician, deleteTechnician, isLoading } = useTechnicians();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>(empty());

  const startNew = () => { setEditing(empty()); setOpen(true); };
  const startEdit = (t: Technician) => {
    setEditing({ ...t, hasFixedHours: t.monthlyFixedHours != null });
    setOpen(true);
  };

  const save = async () => {
    if (!editing.name.trim()) { toast.error("Informe o nome do técnico"); return; }
    if (!editing.hourlyRate || editing.hourlyRate <= 0) { toast.error("Informe o valor por hora"); return; }
    if (!editing.kmRate || editing.kmRate <= 0) { toast.error("Informe o valor por km"); return; }
    if (!editing.overtimeWeekdayRate || editing.overtimeWeekdayRate <= 0) { toast.error("Informe a hora extra de semana"); return; }
    if (!editing.overtimeWeekendRate || editing.overtimeWeekendRate <= 0) { toast.error("Informe a hora extra de fim de semana"); return; }
    if (editing.hasFixedHours && (!editing.monthlyFixedHours || editing.monthlyFixedHours <= 0)) { toast.error("Informe as horas fixas por mês"); return; }
    const payload: Omit<Technician, "id"> = {
      name: editing.name.trim(),
      hourlyRate: Number(editing.hourlyRate) || 0,
      kmRate: Number(editing.kmRate) || 0,
      overtimeWeekdayRate: Number(editing.overtimeWeekdayRate) || 0,
      overtimeWeekendRate: Number(editing.overtimeWeekendRate) || 0,
      monthlyFixedHours: editing.hasFixedHours ? (Number(editing.monthlyFixedHours) || 0) : null,
    };
    try {
      if (editing.id) {
        await updateTechnician.mutateAsync({ ...payload, id: editing.id });
        toast.success("Técnico atualizado");
      } else {
        await addTechnician.mutateAsync(payload);
        toast.success("Técnico cadastrado");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este técnico?")) return;
    try {
      await deleteTechnician.mutateAsync(id);
      toast.success("Técnico removido");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao remover");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Técnicos</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua equipe e os valores de cobrança de cada técnico</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew} className="gap-2"><Plus className="h-4 w-4" /> Novo técnico</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Editar técnico" : "Novo técnico"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Nome do técnico *</Label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: João Silva" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor por hora (R$)</Label>
                  <Input type="number" step="0.01" value={editing.hourlyRate || ""} onChange={e => setEditing({ ...editing, hourlyRate: Number(e.target.value) })} placeholder="80,00" />
                </div>
                <div className="grid gap-2">
                  <Label>Valor por km (R$)</Label>
                  <Input type="number" step="0.01" value={editing.kmRate || ""} onChange={e => setEditing({ ...editing, kmRate: Number(e.target.value) })} placeholder="1,50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Hora extra — semana (R$)</Label>
                  <Input type="number" step="0.01" value={editing.overtimeWeekdayRate || ""} onChange={e => setEditing({ ...editing, overtimeWeekdayRate: Number(e.target.value) })} placeholder="120,00" />
                </div>
                <div className="grid gap-2">
                  <Label>Hora extra — fim de semana (R$)</Label>
                  <Input type="number" step="0.01" value={editing.overtimeWeekendRate || ""} onChange={e => setEditing({ ...editing, overtimeWeekendRate: Number(e.target.value) })} placeholder="160,00" />
                </div>
              </div>
              <div className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Possui carga fixa mensal?</Label>
                    <p className="text-xs text-muted-foreground">Quantidade de horas contratadas por mês</p>
                  </div>
                  <Switch
                    checked={!!editing.hasFixedHours}
                    onCheckedChange={(v) => setEditing({ ...editing, hasFixedHours: v, monthlyFixedHours: v ? (editing.monthlyFixedHours ?? 0) : null })}
                  />
                </div>
                {editing.hasFixedHours && (
                  <div className="grid gap-2">
                    <Label>Horas fixas por mês</Label>
                    <Input type="number" step="1" value={editing.monthlyFixedHours ?? ""} onChange={e => setEditing({ ...editing, monthlyFixedHours: Number(e.target.value) })} placeholder="220" />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={addTechnician.isPending || updateTechnician.isPending}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">Carregando...</CardContent></Card>
      ) : technicians.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <HardHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum técnico cadastrado</p>
            <p className="text-sm mt-1">Cadastre os técnicos da sua equipe para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {technicians.map(t => (
            <Card key={t.id} className="hover:shadow-elegant transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate">{t.name}</h3>
                    {t.monthlyFixedHours != null && (
                      <p className="text-xs text-muted-foreground">Carga fixa: {t.monthlyFixedHours}h/mês</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted rounded-md p-2">
                    <div className="text-xs text-muted-foreground">Hora</div>
                    <div className="font-semibold">{fmtCurrency(t.hourlyRate)}</div>
                  </div>
                  <div className="bg-muted rounded-md p-2">
                    <div className="text-xs text-muted-foreground">Km</div>
                    <div className="font-semibold">{fmtCurrency(t.kmRate)}</div>
                  </div>
                  <div className="bg-muted rounded-md p-2">
                    <div className="text-xs text-muted-foreground">Hora extra semana</div>
                    <div className="font-semibold">{fmtCurrency(t.overtimeWeekdayRate)}</div>
                  </div>
                  <div className="bg-muted rounded-md p-2">
                    <div className="text-xs text-muted-foreground">Hora extra FDS</div>
                    <div className="font-semibold">{fmtCurrency(t.overtimeWeekendRate)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
