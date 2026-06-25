import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createSubUser,
  listCompanyUsers,
  removeCompanyUser,
  updateSubUser,
} from "@/lib/admin.functions";
import { ALL_FEATURES, type FeatureKey } from "@/lib/features";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, UserPlus, Pencil } from "lucide-react";
import { format } from "date-fns";

type EditTarget = {
  userId: string;
  email: string;
  username: string;
  role: "admin" | "user" | "technician";
  allowedFeatures: string[] | null;
};

export function UsersManager({
  companyId,
  allowRoleAdmin = true,
}: {
  companyId?: string;
  allowRoleAdmin?: boolean;
}) {
  const qc = useQueryClient();
  const listUsersFn = useServerFn(listCompanyUsers);
  const createUserFn = useServerFn(createSubUser);
  const removeUserFn = useServerFn(removeCompanyUser);
  const updateFn = useServerFn(updateSubUser);

  const users = useQuery({
    queryKey: ["company-users", companyId],
    queryFn: () => listUsersFn({ data: { companyId } }),
  });

  const [nu, setNu] = useState<{ email: string; username: string; password: string; role: "admin" | "user" | "technician"; features: FeatureKey[] }>({
    email: "",
    username: "",
    password: "",
    role: "user",
    features: ALL_FEATURES.map((f) => f.key),
  });

  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [editPwd, setEditPwd] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["company-users", companyId] });
    qc.invalidateQueries({ queryKey: ["all-users-grouped"] });
  };

  const addUser = useMutation({
    mutationFn: () => createUserFn({ data: { email: nu.email, username: nu.username, password: nu.password, role: nu.role, companyId, allowedFeatures: nu.features } }),
    onSuccess: () => {
      toast.success("Usuário criado");
      setNu({ email: "", username: "", password: "", role: "user", features: ALL_FEATURES.map((f) => f.key) });
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const removeUser = useMutation({
    mutationFn: (targetUserId: string) => removeUserFn({ data: { targetUserId, companyId } }),
    onSuccess: () => { toast.success("Usuário removido"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });


  const saveEdit = useMutation({
    mutationFn: () => updateFn({
      data: {
        targetUserId: editing!.userId,
        companyId,
        email: editing!.email,
        username: editing!.username,
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Criar usuário</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-5">
            <div className="grid gap-1 sm:col-span-2">
              <Label>E-mail</Label>
              <Input type="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} />
            </div>
            <div className="grid gap-1">
              <Label>Usuário (Login)</Label>
              <Input type="text" value={nu.username} onChange={(e) => setNu({ ...nu, username: e.target.value.toLowerCase() })} className="normal-case" />
            </div>
            <div className="grid gap-1">
              <Label>Senha</Label>
              <Input type="password" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} />
            </div>
            <div className="grid gap-1">
              <Label>Papel</Label>
              <Select value={nu.role} onValueChange={(v: "admin" | "user" | "technician") => {
                let newFeatures = nu.features;
                if (v === "technician") {
                  newFeatures = newFeatures.filter(f => f !== "clientes" && f !== "tecnicos");
                }
                setNu({ ...nu, role: v, features: newFeatures });
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="technician">Técnico</SelectItem>
                  {allowRoleAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Funções disponíveis</Label>
            <div className="flex flex-wrap gap-3">
              {ALL_FEATURES.map((f) => {
                const isRestricted = nu.role === "technician" && (f.key === "clientes" || f.key === "tecnicos");
                const checked = isRestricted ? false : nu.features.includes(f.key);
                return (
                  <label key={f.key} className={`flex items-center gap-2 text-sm ${isRestricted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                    <Checkbox
                      disabled={isRestricted}
                      checked={checked}
                      onCheckedChange={() => setNu({ ...nu, features: toggleFeature(nu.features, f.key) })}
                    />
                    {f.label}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Administradores têm acesso total automaticamente.</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => addUser.mutate()} disabled={!nu.email || !nu.username || !nu.password || addUser.isPending}>Criar usuário</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Usuários da empresa</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.data?.users?.length ? users.data.users.map((u) => (
              <div key={u.id} className="flex items-center justify-between border rounded-md px-3 py-2 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {u.email} {u.username && <span className="text-muted-foreground ml-2">@{u.username}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className="capitalize">{u.role}</span>
                    {u.lastSignInAt && <span>Último login: {format(new Date(u.lastSignInAt), "dd/MM/yy HH:mm")}</span>}
                    {u.role === "user" && (
                      <span>Funções: {u.allowedFeatures === null ? "todas" : (u.allowedFeatures?.length ? u.allowedFeatures.join(", ") : "nenhuma")}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditing({
                      userId: u.userId,
                      email: u.email,
                      username: u.username || "",
                      role: u.role as "admin" | "user" | "technician",
                      allowedFeatures: u.allowedFeatures,
                    });
                    setEditPwd("");
                  }} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm("Remover este usuário?")) removeUser.mutate(u.userId);
                  }} title="Remover">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )) : <div className="text-sm text-muted-foreground">Nenhum usuário.</div>}
          </div>
        </CardContent>
      </Card>


      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setEditPwd(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
            <DialogDescription className="sr-only">Edite as informações de acesso do usuário.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label>E-mail</Label>
                <Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label>Usuário (Login)</Label>
                <Input type="text" value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value.toLowerCase() })} className="normal-case" />
              </div>
              <div className="grid gap-1">
                <Label>Nova senha (opcional)</Label>
                <Input type="password" value={editPwd} onChange={(e) => setEditPwd(e.target.value)} placeholder="Deixe em branco para manter" />
              </div>
              <div className="grid gap-1">
                <Label>Papel</Label>
                <Select value={editing.role} onValueChange={(v: "admin" | "user" | "technician") => {
                  let newFeatures = editing.allowedFeatures;
                  if (v === "technician" && newFeatures) {
                    newFeatures = newFeatures.filter(f => f !== "clientes" && f !== "tecnicos");
                  } else if (v === "technician" && !newFeatures) {
                    newFeatures = ALL_FEATURES.map(x => x.key).filter(f => f !== "clientes" && f !== "tecnicos");
                  }
                  setEditing({ ...editing, role: v, allowedFeatures: newFeatures });
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="technician">Técnico</SelectItem>
                    {allowRoleAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Funções disponíveis</Label>
                <div className="flex flex-wrap gap-3">
                  {ALL_FEATURES.map((f) => {
                    const list = editing.allowedFeatures ?? ALL_FEATURES.map((x) => x.key);
                    const isRestricted = editing.role === "technician" && (f.key === "clientes" || f.key === "tecnicos");
                    const checked = isRestricted ? false : list.includes(f.key);
                    return (
                      <label key={f.key} className={`flex items-center gap-2 text-sm ${isRestricted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        <Checkbox
                          disabled={isRestricted}
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
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setEditing(null); setEditPwd(""); }}>Cancelar</Button>
            <Button onClick={() => saveEdit.mutate()} disabled={saveEdit.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
