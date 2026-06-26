import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createCompany,
  deleteCompany,
  listAllUsersGrouped,
  updateSubUser,
  removeCompanyUser,
  createSubUser,
  updateCompany,
} from "@/lib/admin.functions";
import { ALL_FEATURES, type FeatureKey } from "@/lib/features";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Plus, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";

type EditTarget = {
  userId: string;
  companyId: string;
  email: string;
  role: "admin" | "user";
  allowedFeatures: string[] | null;
};

export function MasterPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAllUsersGrouped);
  const createCoFn = useServerFn(createCompany);
  const deleteCoFn = useServerFn(deleteCompany);
  const updateFn = useServerFn(updateSubUser);
  const removeFn = useServerFn(removeCompanyUser);
  const createSubUserFn = useServerFn(createSubUser);

  const groups = useQuery({ queryKey: ["all-users-grouped"], queryFn: () => listFn() });

  const [newCo, setNewCo] = useState<{ name: string; adminEmail: string; adminPassword: string; subscriptionFee?: number }>({ name: "", adminEmail: "", adminPassword: "", subscriptionFee: 0 });
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [editingCompany, setEditingCompany] = useState<{ id: string; name: string; fee: number } | null>(null);
  const [newSubUser, setNewSubUser] = useState<{ companyId: string; email: string; password: string; features: FeatureKey[] } | null>(null);
  const [editPwd, setEditPwd] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["all-users-grouped"] });

  const createCo = useMutation({
    mutationFn: () => createCoFn({ data: newCo }),
    onSuccess: () => { toast.success("Administrador criado"); setNewCo({ name: "", adminEmail: "", adminPassword: "", subscriptionFee: 0 }); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const deleteCo = useMutation({
    mutationFn: (companyId: string) => deleteCoFn({ data: { companyId } }),
    onSuccess: () => { toast.success("Administrador excluído"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const updateCo = useMutation({
    mutationFn: () => updateCompany({ data: { companyId: editingCompany!.id, subscriptionFee: editingCompany!.fee } }),
    onSuccess: () => { toast.success("Empresa atualizada"); setEditingCompany(null); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const addUser = useMutation({
    mutationFn: () => createSubUserFn({ data: { email: newSubUser!.email, password: newSubUser!.password, role: "user", companyId: newSubUser!.companyId, allowedFeatures: newSubUser!.features } }),
    onSuccess: () => { toast.success("Usuário criado"); setNewSubUser(null); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const removeUser = useMutation({
    mutationFn: (v: { targetUserId: string; companyId: string }) => removeFn({ data: v }),
    onSuccess: () => { toast.success("Usuário removido"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const saveEdit = useMutation({
    mutationFn: () => updateFn({
      data: {
        targetUserId: editing!.userId,
        companyId: editing!.companyId,
        email: editing!.email,
        password: editPwd ? editPwd : undefined,
        role: editing!.role,
        allowedFeatures: editing!.allowedFeatures,
      },
    }),
    onSuccess: () => { toast.success("Usuário atualizado"); setEditing(null); setEditPwd(""); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const toggleFeature = (set: FeatureKey[], key: FeatureKey): FeatureKey[] =>
    set.includes(key) ? set.filter((k) => k !== key) : [...set, key];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Painel do Master</h1>
        <p className="text-muted-foreground mt-1">Gerencie empresas, administradores e usuários do sistema.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Criar novo Administrador</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <div className="grid gap-1">
            <Label>Nome da Empresa (Workspace)</Label>
            <Input value={newCo.name} onChange={(e) => setNewCo({ ...newCo, name: e.target.value })} />
          </div>
          <div className="grid gap-1 sm:col-span-1">
            <Label>Valor da Assinatura (R$)</Label>
            <Input type="number" step="0.01" value={newCo.subscriptionFee || ""} onChange={(e) => setNewCo({ ...newCo, subscriptionFee: parseFloat(e.target.value) })} />
          </div>
          <div className="grid gap-1 sm:col-span-1">
            <Label>E-mail do administrador</Label>
            <Input type="email" value={newCo.adminEmail} onChange={(e) => setNewCo({ ...newCo, adminEmail: e.target.value })} />
          </div>
          <div className="grid gap-1 sm:col-span-1">
            <Label>Senha</Label>
            <Input type="password" value={newCo.adminPassword} onChange={(e) => setNewCo({ ...newCo, adminPassword: e.target.value })} />
          </div>
          <div className="sm:col-span-4 flex justify-end">
            <Button onClick={() => createCo.mutate()} disabled={!newCo.name || !newCo.adminEmail || !newCo.adminPassword || createCo.isPending}>
              Criar Administrador
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Administradores do Sistema e Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}
          {!groups.isLoading && !groups.data?.groups?.length && (
            <div className="text-sm text-muted-foreground">Nenhum administrador cadastrado.</div>
          )}
          <Accordion type="multiple" className="w-full">
            {groups.data?.groups?.map((g) => (
              <AccordionItem value={g.id} key={g.id}>
                <AccordionTrigger>
                  <div className="flex flex-1 items-center justify-between pr-3">
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold">{g.name}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2">
                        <span>Admin: {g.ownerEmail}</span>
                        <span>· {g.members.length} usuários</span>
                        <span className="flex items-center gap-1">
                          · Assinatura: R$ {g.subscriptionFee?.toFixed(2) ?? "0.00"}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 ml-1" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCompany({ id: g.id, name: g.name, fee: g.subscriptionFee ?? 0 });
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {g.members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between border rounded-md px-3 py-2 gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{m.email}</div>
                          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                            <span className="capitalize">{m.role}</span>
                            {m.lastSignInAt && <span>Último login: {format(new Date(m.lastSignInAt), "dd/MM/yy HH:mm")}</span>}
                            <span>Funções: {m.allowedFeatures === null ? "todas" : (m.allowedFeatures?.length ? m.allowedFeatures.join(", ") : "nenhuma")}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditing({
                              userId: m.userId,
                              companyId: g.id,
                              email: m.email,
                              role: m.role as "admin" | "user",
                              allowedFeatures: m.allowedFeatures,
                            });
                            setEditPwd("");
                          }} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            if (confirm(`Remover ${m.email}?`)) removeUser.mutate({ targetUserId: m.userId, companyId: g.id });
                          }} title="Remover">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewSubUser({ companyId: g.id, email: "", password: "", features: ALL_FEATURES.map(f => f.key) })}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Adicionar usuário
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm(`Excluir o workspace "${g.name}" e TODOS os seus dados?`)) deleteCo.mutate(g.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir administrador
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setEditPwd(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Editar usuário</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label>E-mail</Label>
                <Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label>Nova senha (opcional)</Label>
                <Input type="password" value={editPwd} onChange={(e) => setEditPwd(e.target.value)} placeholder="Deixe em branco para manter" />
              </div>
              <div className="grid gap-1">
                <Label>Papel</Label>
                <Select value={editing.role} onValueChange={(v: "admin" | "user") => setEditing({ ...editing, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Funções disponíveis</Label>
                <div className="flex flex-wrap gap-3">
                  {ALL_FEATURES.map((f) => {
                    const list = editing.allowedFeatures ?? ALL_FEATURES.map((x) => x.key);
                    const checked = list.includes(f.key);
                    return (
                      <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => setEditing({
                            ...editing,
                            allowedFeatures: toggleFeature(list as FeatureKey[], f.key),
                          })}
                        />
                        {f.label}
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Administradores têm acesso total automaticamente.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setEditing(null); setEditPwd(""); }}>Cancelar</Button>
            <Button onClick={() => saveEdit.mutate()} disabled={saveEdit.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!newSubUser} onOpenChange={(o) => { if (!o) setNewSubUser(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Adicionar usuário</DialogTitle></DialogHeader>
          {newSubUser && (
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label>E-mail</Label>
                <Input type="email" value={newSubUser.email} onChange={(e) => setNewSubUser({ ...newSubUser, email: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label>Senha</Label>
                <Input type="password" value={newSubUser.password} onChange={(e) => setNewSubUser({ ...newSubUser, password: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Funções disponíveis</Label>
                <div className="flex flex-wrap gap-3">
                  {ALL_FEATURES.map((f) => (
                    <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={newSubUser.features.includes(f.key)}
                        onCheckedChange={() => setNewSubUser({
                          ...newSubUser,
                          features: toggleFeature(newSubUser.features, f.key),
                        })}
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewSubUser(null)}>Cancelar</Button>
            <Button onClick={() => addUser.mutate()} disabled={addUser.isPending || !newSubUser?.email || !newSubUser?.password}>Criar usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingCompany} onOpenChange={(o) => { if (!o) setEditingCompany(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Empresa</DialogTitle></DialogHeader>
          {editingCompany && (
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label>Nome (somente leitura)</Label>
                <Input value={editingCompany.name} disabled />
              </div>
              <div className="grid gap-1">
                <Label>Valor da Assinatura (R$)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={editingCompany.fee || ""} 
                  onChange={(e) => setEditingCompany({ ...editingCompany, fee: parseFloat(e.target.value) || 0 })} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCompany(null)}>Cancelar</Button>
            <Button onClick={() => updateCo.mutate()} disabled={updateCo.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
