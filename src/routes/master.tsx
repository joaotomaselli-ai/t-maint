import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Trash2, Plus, Loader2, ShieldAlert, CheckCircle2, AlertTriangle, XCircle,
  MessageCircle, RefreshCw, Edit, Lock, Unlock, Phone, Mail, Building,
  Calendar, DollarSign, Users, ShieldCheck, Crown
} from "lucide-react";
import {
  listCompanies, createCompany, deleteCompany, updateCompany,
  toggleCompanyBlock, renewCompanySubscription, getSubscriptionReminderMessage,
  type SubscriptionCycle
} from "@/lib/admin.functions";
import { useAccess } from "@/hooks/use-access";

export const Route = createFileRoute("/master")({ component: MasterPage });

function MasterPage() {
  const access = useAccess();
  const navigate = useNavigate();
  useEffect(() => {
    if (!access.isLoading && !access.isMaster) navigate({ to: "/" });
  }, [access.isLoading, access.isMaster, navigate]);

  const qc = useQueryClient();
  const list = useServerFn(listCompanies);
  const create = useServerFn(createCompany);
  const remove = useServerFn(deleteCompany);
  const update = useServerFn(updateCompany);
  const toggleBlock = useServerFn(toggleCompanyBlock);
  const renew = useServerFn(renewCompanySubscription);
  const getReminder = useServerFn(getSubscriptionReminderMessage);

  const q = useQuery({
    queryKey: ["companies"],
    queryFn: () => list(),
    enabled: access.isMaster,
  });

  // Create modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    contactPhone: "",
    subscriptionFee: 397,
    planType: "pro" as "basic" | "pro" | "elite" | "elite_pro",
    subscriptionCycle: "mensal" as SubscriptionCycle,
    subscriptionStartDate: new Date().toISOString().slice(0, 10),
    subscriptionEndDate: "",
    autoBlockOnExpire: true,
  });

  // Calculate default endDate for createForm
  useEffect(() => {
    if (!createForm.subscriptionStartDate) return;
    const d = new Date(createForm.subscriptionStartDate + "T00:00:00");
    if (createForm.subscriptionCycle === "anual") d.setFullYear(d.getFullYear() + 1);
    else if (createForm.subscriptionCycle === "semestral") d.setMonth(d.getMonth() + 6);
    else if (createForm.subscriptionCycle === "mensal") d.setDate(d.getDate() + 30);
    setCreateForm(prev => ({ ...prev, subscriptionEndDate: d.toISOString().slice(0, 10) }));
  }, [createForm.subscriptionCycle, createForm.subscriptionStartDate]);

  // Edit modal state
  const [editingCompany, setEditingCompany] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    adminName: "",
    contactPhone: "",
    contactEmail: "",
    subscriptionFee: 0,
    planType: "pro" as "basic" | "pro" | "elite" | "elite_pro",
    subscriptionCycle: "mensal" as SubscriptionCycle,
    subscriptionStartDate: "",
    subscriptionEndDate: "",
    isBlocked: false,
    blockedReason: "",
    autoBlockOnExpire: true,
  });

  // Renewal modal state
  const [renewCompany, setRenewCompany] = useState<any | null>(null);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewAmount, setRenewAmount] = useState(397);

  // Mutations
  const createMut = useMutation({
    mutationFn: () => create({ data: createForm }),
    onSuccess: () => {
      toast.success("Empresa cadastrada com sucesso!");
      qc.invalidateQueries({ queryKey: ["companies"] });
      setOpenCreate(false);
      setCreateForm({
        name: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        contactPhone: "",
        subscriptionFee: 397,
        planType: "pro",
        subscriptionCycle: "mensal",
        subscriptionStartDate: new Date().toISOString().slice(0, 10),
        subscriptionEndDate: "",
        autoBlockOnExpire: true,
      });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao cadastrar empresa"),
  });

  const updateMut = useMutation({
    mutationFn: () => update({
      data: {
        companyId: editingCompany.id,
        ...editForm,
      }
    }),
    onSuccess: () => {
      toast.success("Dados da empresa atualizados!");
      qc.invalidateQueries({ queryKey: ["companies"] });
      setEditingCompany(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao atualizar"),
  });

  const toggleBlockMut = useMutation({
    mutationFn: ({ companyId, isBlocked }: { companyId: string; isBlocked: boolean }) =>
      toggleBlock({ data: { companyId, isBlocked } }),
    onSuccess: (_, vars) => {
      toast.success(vars.isBlocked ? "Administrador bloqueado." : "Administrador desbloqueado.");
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao alterar bloqueio"),
  });

  const renewMut = useMutation({
    mutationFn: () => renew({
      data: {
        companyId: renewCompany.id,
        monthsToAdd: renewMonths,
        amount: renewAmount,
        cycle: renewMonths === 12 ? "anual" : renewMonths === 6 ? "semestral" : "mensal",
      }
    }),
    onSuccess: (res) => {
      toast.success(`Assinatura renovada até ${res.newEndDate.split("-").reverse().join("/")}!`);
      qc.invalidateQueries({ queryKey: ["companies"] });
      setRenewCompany(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao renovar"),
  });

  const deleteMut = useMutation({
    mutationFn: (companyId: string) => remove({ data: { companyId } }),
    onSuccess: () => {
      toast.success("Empresa excluída com sucesso");
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao excluir"),
  });

  // Reminder trigger
  const handleSendWhatsAppReminder = async (companyId: string) => {
    try {
      const res = await getReminder({ data: { companyId } });
      if (!res.phone) {
        toast.error("Esta empresa não possui telefone/WhatsApp cadastrado. Edite a empresa para adicionar.");
        return;
      }
      window.open(res.whatsappUrl, "_blank");
      toast.success("Abrindo WhatsApp com mensagem de lembrete...");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar lembrete.");
    }
  };

  const openEditModal = (c: any) => {
    setEditingCompany(c);
    setEditForm({
      name: c.name,
      adminName: c.adminName || "",
      contactPhone: c.subscription?.contactPhone || "",
      contactEmail: c.subscription?.contactEmail || c.ownerEmail || "",
      subscriptionFee: c.subscriptionFee ?? 0,
      planType: c.planType ?? "pro",
      subscriptionCycle: c.subscription?.cycle ?? "mensal",
      subscriptionStartDate: c.subscription?.startDate ?? "",
      subscriptionEndDate: c.subscription?.endDate ?? "",
      isBlocked: c.subscription?.isBlocked ?? false,
      blockedReason: c.subscription?.blockedReason ?? "",
      autoBlockOnExpire: c.subscription?.autoBlockOnExpire ?? true,
    });
  };

  const openRenewModal = (c: any) => {
    setRenewCompany(c);
    const months = c.subscription?.cycle === "anual" ? 12 : c.subscription?.cycle === "semestral" ? 6 : 1;
    setRenewMonths(months);
    setRenewAmount(c.subscriptionFee ?? 397);
  };

  // KPIs
  const companies = q.data?.companies ?? [];
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.isMasterAccount || c.subscription?.status === "active").length;
  const expiringSoonCompanies = companies.filter(c => !c.isMasterAccount && c.subscription?.status === "expiring_soon").length;
  const blockedOrExpired = companies.filter(c => !c.isMasterAccount && (c.subscription?.status === "expired" || c.subscription?.status === "blocked")).length;
  const totalRevenue = companies.reduce((acc, c) => acc + (c.subscriptionFee || 0), 0);

  if (access.isLoading) return <div className="p-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  if (!access.isMaster) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
            <ShieldCheck className="h-4 w-4" /> Painel Master de Controle
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Empresas & Assinaturas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Controle de vigência, renovações, bloqueio de administradores e cobrança.
          </p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Cadastrar Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" /> Cadastrar Nova Empresa / Administrador
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Nome da Empresa *</Label>
                  <Input
                    placeholder="Ex: TECH CNC Manutenções"
                    value={createForm.name}
                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Nome do Administrador</Label>
                  <Input
                    placeholder="Ex: João da Silva"
                    value={createForm.adminName}
                    onChange={e => setCreateForm({ ...createForm, adminName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>E-mail de Login do Admin *</Label>
                  <Input
                    type="email"
                    placeholder="admin@empresa.com"
                    value={createForm.adminEmail}
                    onChange={e => setCreateForm({ ...createForm, adminEmail: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Senha Inicial *</Label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 dígitos"
                    value={createForm.adminPassword}
                    onChange={e => setCreateForm({ ...createForm, adminPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>WhatsApp / Telefone de Contato</Label>
                  <Input
                    placeholder="Ex: 47988485668"
                    value={createForm.contactPhone}
                    onChange={e => setCreateForm({ ...createForm, contactPhone: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Valor da Assinatura (R$)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="397"
                    value={createForm.subscriptionFee}
                    onChange={e => setCreateForm({ ...createForm, subscriptionFee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Plano de Acesso</Label>
                  <Select
                    value={createForm.planType}
                    onValueChange={(v: any) => setCreateForm({ ...createForm, planType: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico (até 2 usuários)</SelectItem>
                      <SelectItem value="pro">Pro (até 5 usuários)</SelectItem>
                      <SelectItem value="elite">Elite (até 15 usuários)</SelectItem>
                      <SelectItem value="elite_pro">Elite Pro (ilimitado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Ciclo da Assinatura</Label>
                  <Select
                    value={createForm.subscriptionCycle}
                    onValueChange={(v: any) => setCreateForm({ ...createForm, subscriptionCycle: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal (30 dias)</SelectItem>
                      <SelectItem value="semestral">Semestral (6 meses)</SelectItem>
                      <SelectItem value="anual">Anual (1 ano)</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={createForm.subscriptionStartDate}
                    onChange={e => setCreateForm({ ...createForm, subscriptionStartDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Data de Vencimento / Expiração</Label>
                  <Input
                    type="date"
                    value={createForm.subscriptionEndDate}
                    onChange={e => setCreateForm({ ...createForm, subscriptionEndDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="auto-block"
                  checked={createForm.autoBlockOnExpire}
                  onCheckedChange={checked => setCreateForm({ ...createForm, autoBlockOnExpire: checked })}
                />
                <Label htmlFor="auto-block" className="cursor-pointer text-xs font-medium text-muted-foreground">
                  Bloquear automaticamente o acesso se a assinatura expirar sem renovação
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button
                onClick={() => createMut.mutate()}
                disabled={createMut.isPending || !createForm.name || !createForm.adminEmail || createForm.adminPassword.length < 6}
              >
                {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Criar Empresa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/60 backdrop-blur shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total de Empresas</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalCompanies}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Building className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Assinaturas Ativas</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCompanies}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Vencendo em ≤ 5 dias</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{expiringSoonCompanies}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Bloqueadas / Expiradas</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{blockedOrExpired}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Companies Table */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Empresas Cadastradas</span>
            <span className="text-xs font-normal text-muted-foreground">
              Receita Recorrente Estimada: <b>R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês</b>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {q.isLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : companies.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma empresa cadastrada no sistema.</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Empresa & Plano</TableHead>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Assinatura & Valor</TableHead>
                    <TableHead>Vigência / Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Bloqueio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map(c => {
                    const isMaster = c.isMasterAccount;
                    const sub = c.subscription;
                    const isBlocked = !isMaster && (sub?.isBlocked || (sub?.autoBlockOnExpire && sub?.daysRemaining < 0));
                    const formattedEnd = isMaster ? "Vitalício" : (sub?.endDate ? sub.endDate.split("-").reverse().join("/") : "—");
                    const formattedStart = sub?.startDate ? sub.startDate.split("-").reverse().join("/") : "—";

                    return (
                      <TableRow
                        key={c.id}
                        className={
                          isMaster
                            ? "bg-indigo-50/70 dark:bg-indigo-950/25 border-l-4 border-l-indigo-600 hover:bg-indigo-100/50"
                            : isBlocked
                            ? "bg-rose-50/40 dark:bg-rose-950/10"
                            : undefined
                        }
                      >
                        {/* Empresa & Plano */}
                        <TableCell>
                          {isMaster ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-indigo-950 dark:text-indigo-100 text-sm">{c.name}</span>
                                <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-[10px] gap-1 px-2 py-0.5 shadow-sm font-semibold">
                                  <Crown className="h-3 w-3 text-amber-300 fill-amber-300" /> MASTER DO SISTEMA
                                </Badge>
                              </div>
                              <div className="text-xs text-indigo-800/80 dark:text-indigo-300 font-medium mt-0.5">
                                Acesso Total e Vitalício · {c.usersCount} usuário(s)
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-foreground">{c.name}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">{c.planType}</span>
                                <span className="text-muted-foreground text-xs">·</span>
                                <span className="text-xs text-muted-foreground">{c.usersCount} usuário(s)</span>
                              </div>
                            </div>
                          )}
                        </TableCell>

                        {/* Administrador */}
                        <TableCell>
                          <div className={isMaster ? "text-xs font-bold text-indigo-950 dark:text-indigo-100" : "text-xs font-medium text-foreground"}>
                            {c.adminName || (isMaster ? "João Tomaselli" : "Administrador")}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" /> {c.ownerEmail}
                          </div>
                          {sub?.contactPhone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" /> {sub.contactPhone}
                            </div>
                          )}
                        </TableCell>

                        {/* Assinatura & Valor */}
                        <TableCell>
                          {isMaster ? (
                            <div>
                              <div className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                                Gratuito / Master
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Plano do Sistema
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-xs text-foreground">
                                R$ {(c.subscriptionFee || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize mt-0.5">
                                Ciclo {sub?.cycle || "Mensal"}
                              </div>
                            </div>
                          )}
                        </TableCell>

                        {/* Vigência / Vencimento */}
                        <TableCell>
                          {isMaster ? (
                            <div>
                              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Acesso Vitalício
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                Sem expiração
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-xs font-medium text-foreground">
                                Vence: <span className="font-bold">{formattedEnd}</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                Início: {formattedStart}
                              </div>
                            </div>
                          )}
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell>
                          {isMaster ? (
                            <Badge variant="outline" className="gap-1 text-[11px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 font-semibold">
                              <Crown className="h-3 w-3 text-amber-500 fill-amber-500" /> Ativo Permanente
                            </Badge>
                          ) : sub?.isBlocked ? (
                            <Badge variant="destructive" className="gap-1 text-[11px]">
                              <Lock className="h-3 w-3" /> Bloqueado Manual
                            </Badge>
                          ) : sub?.daysRemaining !== undefined && sub.daysRemaining < 0 ? (
                            <Badge variant="destructive" className="gap-1 text-[11px] bg-rose-600">
                              <XCircle className="h-3 w-3" /> Expirado ({Math.abs(sub.daysRemaining)}d atrás)
                            </Badge>
                          ) : sub?.daysRemaining !== undefined && sub.daysRemaining <= 5 ? (
                            <Badge variant="outline" className="gap-1 text-[11px] bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse">
                              <AlertTriangle className="h-3 w-3" /> Vence em {sub.daysRemaining} dia(s)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-[11px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" /> Ativo ({sub?.daysRemaining ?? 30}d rest.)
                            </Badge>
                          )}
                        </TableCell>

                        {/* Switch Bloqueio Manual */}
                        <TableCell className="text-center">
                          {isMaster ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <Badge variant="outline" className="bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 gap-1 text-[10px]">
                                <ShieldCheck className="h-3 w-3 text-indigo-600" /> Permanente
                              </Badge>
                              <span className="text-[9px] text-muted-foreground">Inviolável</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Switch
                                checked={!sub?.isBlocked}
                                onCheckedChange={(checked) => {
                                  const newBlockedState = !checked;
                                  const actionText = newBlockedState ? `Bloquear o acesso de "${c.name}"?` : `Desbloquear o acesso de "${c.name}"?`;
                                  if (confirm(actionText)) {
                                    toggleBlockMut.mutate({ companyId: c.id, isBlocked: newBlockedState });
                                  }
                                }}
                                title={sub?.isBlocked ? "Clique para desbloquear" : "Clique para bloquear"}
                              />
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {sub?.isBlocked ? "Bloqueado" : "Liberado"}
                              </span>
                            </div>
                          )}
                        </TableCell>

                        {/* Ações */}
                        <TableCell className="text-right">
                          {isMaster ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100/60"
                                onClick={() => openEditModal(c)}
                                title="Editar Dados da Empresa Master"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              {/* WhatsApp Reminder Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-300 dark:border-emerald-800"
                                onClick={() => handleSendWhatsAppReminder(c.id)}
                                title="Enviar Lembrete de Renovação via WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4 mr-1 text-emerald-600" />
                                <span className="hidden sm:inline text-xs">Lembrar</span>
                              </Button>

                              {/* Renew Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300 dark:border-blue-800"
                                onClick={() => openRenewModal(c)}
                                title="Renovar Assinatura"
                              >
                                <RefreshCw className="h-4 w-4 mr-1 text-blue-600" />
                                <span className="hidden sm:inline text-xs">Renovar</span>
                              </Button>

                              {/* Edit Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => openEditModal(c)}
                                title="Editar Detalhes da Empresa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              {/* Delete Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (confirm(`ATENÇÃO: Excluir definitivamente a empresa "${c.name}" e todos os seus registros de clientes, técnicos, ordens de serviço e fotos?`)) {
                                    deleteMut.mutate(c.id);
                                  }
                                }}
                                title="Excluir Empresa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
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

      {/* Edit Company Modal */}
      {editingCompany && (
        <Dialog open={!!editingCompany} onOpenChange={open => { if (!open) setEditingCompany(null); }}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" /> Editar Empresa: {editingCompany.name}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Nome do Administrador</Label>
                  <Input
                    value={editForm.adminName}
                    onChange={e => setEditForm({ ...editForm, adminName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Telefone / WhatsApp de Contato</Label>
                  <Input
                    placeholder="Ex: 47988485668"
                    value={editForm.contactPhone}
                    onChange={e => setEditForm({ ...editForm, contactPhone: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>E-mail de Contato / Login</Label>
                  <Input
                    type="email"
                    value={editForm.contactEmail}
                    onChange={e => setEditForm({ ...editForm, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              {!editingCompany.isMasterAccount && (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label>Plano de Acesso</Label>
                      <Select
                        value={editForm.planType}
                        onValueChange={(v: any) => setEditForm({ ...editForm, planType: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básico (até 2 usuários)</SelectItem>
                          <SelectItem value="pro">Pro (até 5 usuários)</SelectItem>
                          <SelectItem value="elite">Elite (até 15 usuários)</SelectItem>
                          <SelectItem value="elite_pro">Elite Pro (ilimitado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Valor da Assinatura (R$)</Label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        value={editForm.subscriptionFee}
                        onChange={e => setEditForm({ ...editForm, subscriptionFee: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="grid gap-1.5">
                      <Label>Ciclo do Plano</Label>
                      <Select
                        value={editForm.subscriptionCycle}
                        onValueChange={(v: any) => setEditForm({ ...editForm, subscriptionCycle: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="semestral">Semestral</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                          <SelectItem value="personalizado">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Data de Início</Label>
                      <Input
                        type="date"
                        value={editForm.subscriptionStartDate}
                        onChange={e => setEditForm({ ...editForm, subscriptionStartDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Data de Vencimento</Label>
                      <Input
                        type="date"
                        value={editForm.subscriptionEndDate}
                        onChange={e => setEditForm({ ...editForm, subscriptionEndDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-lg space-y-3 border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Bloquear Acesso Administrativo</Label>
                        <p className="text-xs text-muted-foreground">Suspende imediatamente o login desta empresa.</p>
                      </div>
                      <Switch
                        checked={editForm.isBlocked}
                        onCheckedChange={checked => setEditForm({ ...editForm, isBlocked: checked })}
                      />
                    </div>
                    {editForm.isBlocked && (
                      <div className="grid gap-1.5 pt-1">
                        <Label className="text-xs">Motivo do Bloqueio (exibido ao usuário)</Label>
                        <Input
                          placeholder="Ex: Assinatura suspensa por falta de pagamento"
                          value={editForm.blockedReason}
                          onChange={e => setEditForm({ ...editForm, blockedReason: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-auto-block"
                      checked={editForm.autoBlockOnExpire}
                      onCheckedChange={checked => setEditForm({ ...editForm, autoBlockOnExpire: checked })}
                    />
                    <Label htmlFor="edit-auto-block" className="cursor-pointer text-xs font-medium text-muted-foreground">
                      Bloquear automaticamente ao ultrapassar a data de vencimento
                    </Label>
                  </div>
                </>
              )}

              {editingCompany.isMasterAccount && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs space-y-1 text-indigo-900 dark:text-indigo-200">
                  <div className="font-bold flex items-center gap-1">
                    <Crown className="h-4 w-4 text-amber-500 fill-amber-500" /> Conta Master do Sistema
                  </div>
                  <p className="text-indigo-700 dark:text-indigo-300">
                    Esta conta possui privilégios máximos e acesso permanente vitalício. Ela não possui bloqueios ou cobranças de assinatura.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCompany(null)}>Cancelar</Button>
              <Button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}>
                {updateMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Renew Modal */}
      {renewCompany && (
        <Dialog open={!!renewCompany} onOpenChange={open => { if (!open) setRenewCompany(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-600">
                <RefreshCw className="h-5 w-5" /> Renovar Assinatura: {renewCompany.name}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <p className="text-xs text-muted-foreground">
                Selecione o período de renovação. O vencimento será estendido automaticamente e qualquer bloqueio anterior será removido.
              </p>

              <div className="grid gap-1.5">
                <Label>Período de Renovação</Label>
                <Select
                  value={String(renewMonths)}
                  onValueChange={(v) => setRenewMonths(Number(v))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">+ 1 Mês (Mensal)</SelectItem>
                    <SelectItem value="6">+ 6 Meses (Semestral)</SelectItem>
                    <SelectItem value="12">+ 12 Meses (Anual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Valor Cobrado (R$)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={renewAmount}
                  onChange={e => setRenewAmount(Number(e.target.value))}
                />
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="font-semibold text-emerald-800 dark:text-emerald-300">Nova data de vencimento estimada:</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  {(() => {
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const curr = new Date(renewCompany.subscription?.endDate + "T00:00:00");
                    const base = (!isNaN(curr.getTime()) && curr > now) ? curr : now;
                    const next = new Date(base);
                    next.setMonth(next.getMonth() + renewMonths);
                    return next.toISOString().slice(0, 10).split("-").reverse().join("/");
                  })()}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenewCompany(null)}>Cancelar</Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                onClick={() => renewMut.mutate()}
                disabled={renewMut.isPending}
              >
                {renewMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Confirmar Renovação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
