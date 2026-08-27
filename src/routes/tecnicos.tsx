import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTechnicians } from "@/hooks/use-data";
import { useTechnicianDocs, getDocStatus } from "@/hooks/use-technician-docs";
import { TechnicianComplianceModal } from "@/components/TechnicianComplianceModal";
import { fmtCurrency, type Technician } from "@/lib/api";
import { useServerFn } from "@tanstack/react-start";
import { createTechnicianLogin, updateSubUser } from "@/lib/admin.functions";
import { useMoney } from "@/hooks/use-money-visibility";
import { Plus, Pencil, Trash2, HardHat, Loader2, FileText, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tecnicos")({ component: Tecnicos });

type Editing = Omit<Technician, "id"> & { id?: string; hasFixedHours?: boolean; loginEmail?: string; loginPassword?: string; allowedFeatures?: string[] };
const empty = (): Editing => ({
  name: "", hourlyRate: 0, kmRate: 0,
  overtimeWeekdayRate: 0, overtimeWeekendRate: 0,
  monthlyFixedHours: null, hasFixedHours: false, isSalaried: false,
  hasLogin: false, loginEmail: "", loginPassword: "", allowedFeatures: [],
});

function Tecnicos() {
  const money = useMoney();
  const { technicians, addTechnician, updateTechnician, deleteTechnician, isLoading } = useTechnicians();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<Editing>(empty());
  const [complianceTech, setComplianceTech] = useState<Technician | null>(null);

  const createLogin = useServerFn(createTechnicianLogin);
  const updateFeatures = useServerFn(updateSubUser);

  const startNew = () => { setEditing(empty()); setOpen(true); };
  const startEdit = (t: Technician) => {
    setEditing({ ...t, hasFixedHours: t.monthlyFixedHours != null, allowedFeatures: t.allowedFeatures || [] });
    setOpen(true);
  };

  const save = async () => {
    if (!editing.name.trim()) { toast.error("Informe o nome do técnico"); return; }
    if (!editing.isSalaried) {
      if (!editing.hourlyRate || editing.hourlyRate <= 0) { toast.error("Informe o valor por hora"); return; }
      if (!editing.overtimeWeekdayRate || editing.overtimeWeekdayRate <= 0) { toast.error("Informe a hora extra de semana"); return; }
      if (!editing.overtimeWeekendRate || editing.overtimeWeekendRate <= 0) { toast.error("Informe a hora extra de fim de semana"); return; }
    }
    if (editing.hasFixedHours && (!editing.monthlyFixedHours || editing.monthlyFixedHours <= 0)) { toast.error("Informe as horas fixas por mês"); return; }
    const payload: Omit<Technician, "id"> = {
      name: editing.name.trim(),
      hourlyRate: Number(editing.hourlyRate) || 0,
      kmRate: Number(editing.kmRate) || 0,
      overtimeWeekdayRate: editing.isSalaried ? 0 : (Number(editing.overtimeWeekdayRate) || 0),
      overtimeWeekendRate: editing.isSalaried ? 0 : (Number(editing.overtimeWeekendRate) || 0),
      monthlyFixedHours: editing.hasFixedHours ? (Number(editing.monthlyFixedHours) || 0) : null,
      isSalaried: !!editing.isSalaried,
      userId: editing.userId,
      hasLogin: editing.hasLogin,
    };
    try {
      setIsSaving(true);
      if (editing.hasLogin && !editing.userId) {
        if (!editing.loginEmail || !editing.loginPassword) {
          toast.error("Preencha o e-mail e senha para o acesso ao sistema.");
          return;
        }
      }

      let techId = editing.id;
      if (editing.id) {
        await updateTechnician.mutateAsync({ ...payload, id: editing.id });
        toast.success("Técnico atualizado");
      } else {
        const result = await addTechnician.mutateAsync(payload);
        techId = result.id;
        toast.success("Técnico cadastrado");
      }

      if (techId && editing.hasLogin && !editing.userId && editing.loginEmail && editing.loginPassword) {
        await createLogin({
          data: {
            email: editing.loginEmail,
            password: editing.loginPassword,
            technicianId: techId,
            allowedFeatures: editing.allowedFeatures ?? [],
          }
        });
        toast.success("Acesso ao sistema criado com sucesso!");
      } else if (techId && editing.hasLogin && editing.userId) {
        await updateFeatures({
          data: {
            targetUserId: editing.userId,
            allowedFeatures: editing.allowedFeatures ?? [],
          }
        });
      }

      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally {
      setIsSaving(false);
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
          <p className="text-muted-foreground mt-1">Gerencie a equipe, valores de cobrança, ASO, NRs e entrega de EPIs</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew} className="gap-2"><Plus className="h-4 w-4" /> Novo técnico</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Editar técnico" : "Novo técnico"}</DialogTitle>
              <DialogDescription className="sr-only">Preencha os dados do técnico abaixo.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto px-2">
              <div className="grid gap-2">
                <Label>Nome do técnico *</Label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: João Silva" />
              </div>
              <div className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">O técnico é Mensalista?</Label>
                    <p className="text-xs text-muted-foreground">Os custos de hora serão zerados para este técnico.</p>
                  </div>
                  <Switch
                    checked={!!editing.isSalaried}
                    onCheckedChange={(v) => setEditing({ ...editing, isSalaried: v, hourlyRate: v ? 0 : editing.hourlyRate, overtimeWeekdayRate: v ? 0 : editing.overtimeWeekdayRate, overtimeWeekendRate: v ? 0 : editing.overtimeWeekendRate })}
                  />
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-4 ${editing.isSalaried ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="grid gap-2">
                  <Label>Valor por hora (R$)</Label>
                  <Input type="number" step="0.01" disabled={!!editing.isSalaried} value={editing.hourlyRate || ""} onChange={e => setEditing({ ...editing, hourlyRate: Number(e.target.value) })} placeholder="80,00" />
                </div>
                <div className="grid gap-2">
                  <Label>Valor por km (R$)</Label>
                  <Input type="number" step="0.01" value={editing.kmRate || ""} onChange={e => setEditing({ ...editing, kmRate: Number(e.target.value) })} placeholder="1,50" />
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-4 ${editing.isSalaried ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="grid gap-2">
                  <Label>Hora extra — semana (R$)</Label>
                  <Input type="number" step="0.01" disabled={!!editing.isSalaried} value={editing.overtimeWeekdayRate || ""} onChange={e => setEditing({ ...editing, overtimeWeekdayRate: Number(e.target.value) })} placeholder="120,00" />
                </div>
                <div className="grid gap-2">
                  <Label>Hora extra — fim de semana (R$)</Label>
                  <Input type="number" step="0.01" disabled={!!editing.isSalaried} value={editing.overtimeWeekendRate || ""} onChange={e => setEditing({ ...editing, overtimeWeekendRate: Number(e.target.value) })} placeholder="160,00" />
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

              <div className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Possui acesso ao sistema?</Label>
                    <p className="text-xs text-muted-foreground">Permite que o técnico faça login e gerencie suas OS</p>
                  </div>
                  <Switch
                    checked={!!editing.hasLogin}
                    disabled={!!editing.userId}
                    onCheckedChange={(v) => setEditing({ ...editing, hasLogin: v })}
                  />
                </div>
                {editing.hasLogin && !editing.userId && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="grid gap-2">
                      <Label>E-mail de acesso</Label>
                      <Input type="email" value={editing.loginEmail || ""} onChange={e => setEditing({ ...editing, loginEmail: e.target.value })} placeholder="tecnico@email.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Senha</Label>
                      <Input type="text" value={editing.loginPassword || ""} onChange={e => setEditing({ ...editing, loginPassword: e.target.value })} placeholder="******" />
                    </div>
                  </div>
                )}
                {editing.userId && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-4">Login ativo e configurado.</div>
                )}
                {editing.hasLogin && (
                  <div className="pt-3 border-t">
                    <Label className="text-sm font-semibold mb-3 block">Permissões Adicionais</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="perm-req"
                          checked={editing.allowedFeatures?.includes("requisicoes") ?? false}
                          onCheckedChange={(checked) => {
                            const current = editing.allowedFeatures ?? [];
                            setEditing({ ...editing, allowedFeatures: checked ? [...current, "requisicoes"] : current.filter(f => f !== "requisicoes") });
                          }}
                        />
                        <Label htmlFor="perm-req" className="text-sm">Acesso a aba Requisições</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="perm-est"
                          checked={editing.allowedFeatures?.includes("estoque") ?? false}
                          onCheckedChange={(checked) => {
                            const current = editing.allowedFeatures ?? [];
                            setEditing({ ...editing, allowedFeatures: checked ? [...current, "estoque"] : current.filter(f => f !== "estoque") });
                          }}
                        />
                        <Label htmlFor="perm-est" className="text-sm">Acesso a aba Estoque</Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={isSaving || addTechnician.isPending || updateTechnician.isPending}>
                {(isSaving || addTechnician.isPending || updateTechnician.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {(isSaving || addTechnician.isPending || updateTechnician.isPending) ? "Salvando..." : "Salvar"}
              </Button>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {technicians.map(t => (
            <TechnicianCardItem
              key={t.id}
              t={t}
              money={money}
              onEdit={startEdit}
              onRemove={remove}
              onOpenCompliance={(tech) => setComplianceTech(tech)}
            />
          ))}
        </div>
      )}

      {complianceTech && (
        <TechnicianComplianceModal
          technician={complianceTech}
          open={!!complianceTech}
          onOpenChange={(v) => { if (!v) setComplianceTech(null); }}
        />
      )}
    </div>
  );
}

function TechnicianCardItem({
  t,
  money,
  onEdit,
  onRemove,
  onOpenCompliance,
}: {
  t: Technician;
  money: (v: number) => string;
  onEdit: (t: Technician) => void;
  onRemove: (id: string) => void;
  onOpenCompliance: (t: Technician) => void;
}) {
  const { techDocs, techEPIs } = useTechnicianDocs(t.id);

  const expiredDocs = techDocs.filter(d => getDocStatus(d.expiryDate).status === "vencido");
  const expiringDocs = techDocs.filter(d => getDocStatus(d.expiryDate).status === "vencendo");
  const hasNoDocs = techDocs.length === 0;
  const hasNoEPIs = techEPIs.length === 0;
  const isIrregular = hasNoDocs || hasNoEPIs || expiredDocs.length > 0;

  return (
    <Card className={`hover:shadow-elegant transition-shadow flex flex-col justify-between ${isIrregular ? "border-red-300 dark:border-red-900/60" : ""}`}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                {t.name}
                {t.isSalaried && <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary">Mensalista</span>}
              </h3>
              {t.monthlyFixedHours != null && (
                <p className="text-xs text-muted-foreground">Carga fixa: {t.monthlyFixedHours}h/mês</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => onEdit(t)} title="Editar dados do técnico"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onRemove(t.id)} title="Excluir técnico"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>

          {/* Compliance Status Badges */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {hasNoDocs && hasNoEPIs ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-300">
                🔴 Irregular (Sem Docs/EPI)
              </span>
            ) : hasNoDocs ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-300">
                🔴 Irregular (Sem Docs/NR)
              </span>
            ) : hasNoEPIs ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-300">
                🔴 Irregular (Sem Ficha EPI)
              </span>
            ) : expiredDocs.length > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-300">
                🔴 {expiredDocs.length} Doc(s) Vencido(s)
              </span>
            ) : expiringDocs.length > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300">
                ⚠️ {expiringDocs.length} Doc(s) a Vencer
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                🟢 Regular / Docs em Dia
              </span>
            )}

            {!hasNoEPIs && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-300">
                🛡️ {techEPIs.length} EPI(s) / Uniforme
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted rounded-md p-2">
              <div className="text-xs text-muted-foreground">Hora</div>
              <div className="font-semibold">{money(t.hourlyRate)}</div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-xs text-muted-foreground">Km</div>
              <div className="font-semibold">{money(t.kmRate)}</div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-xs text-muted-foreground">Hora extra semana</div>
              <div className="font-semibold">{money(t.overtimeWeekdayRate)}</div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-xs text-muted-foreground">Hora extra FDS</div>
              <div className="font-semibold">{money(t.overtimeWeekendRate)}</div>
            </div>
          </div>
        </div>

        {/* Industrial Document & EPI Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 gap-1.5 text-xs font-semibold border-amber-300 dark:border-amber-800 hover:bg-amber-500/10"
          onClick={() => onOpenCompliance(t)}
        >
          <FileText className="h-4 w-4 text-amber-600" />
          Documentos, NR's & EPIs
        </Button>
      </CardContent>
    </Card>
  );
}
