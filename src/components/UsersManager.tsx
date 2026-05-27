import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createSubUser,
  listCompanyUsers,
  removeCompanyUser,
  authorizeEmail,
  listAuthorizedEmails,
} from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, UserPlus, Mail } from "lucide-react";

export function UsersManager({ companyId }: { companyId?: string }) {
  const qc = useQueryClient();
  const listUsersFn = useServerFn(listCompanyUsers);
  const listEmailsFn = useServerFn(listAuthorizedEmails);
  const createUserFn = useServerFn(createSubUser);
  const removeUserFn = useServerFn(removeCompanyUser);
  const authorizeFn = useServerFn(authorizeEmail);

  const users = useQuery({
    queryKey: ["company-users", companyId],
    queryFn: () => listUsersFn({ data: { companyId } }),
  });
  const emails = useQuery({
    queryKey: ["allowed-emails", companyId],
    queryFn: () => listEmailsFn({ data: { companyId } }),
  });

  const [nu, setNu] = useState({ email: "", password: "", role: "user" as "admin" | "user" });
  const [ae, setAe] = useState({ email: "", role: "user" as "admin" | "user" });

  const addUser = useMutation({
    mutationFn: () => createUserFn({ data: { ...nu, companyId } }),
    onSuccess: () => {
      toast.success("Usuário criado");
      setNu({ email: "", password: "", role: "user" });
      qc.invalidateQueries({ queryKey: ["company-users", companyId] });
      qc.invalidateQueries({ queryKey: ["allowed-emails", companyId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const removeUser = useMutation({
    mutationFn: (targetUserId: string) => removeUserFn({ data: { targetUserId, companyId } }),
    onSuccess: () => {
      toast.success("Usuário removido");
      qc.invalidateQueries({ queryKey: ["company-users", companyId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const authorize = useMutation({
    mutationFn: () => authorizeFn({ data: { ...ae, companyId } }),
    onSuccess: () => {
      toast.success("E-mail autorizado");
      setAe({ email: "", role: "user" });
      qc.invalidateQueries({ queryKey: ["allowed-emails", companyId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Criar usuário (e-mail + senha)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <div className="grid gap-1 sm:col-span-2">
            <Label>E-mail</Label>
            <Input type="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <Label>Senha</Label>
            <Input type="password" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <Label>Papel</Label>
            <Select value={nu.role} onValueChange={(v: "admin" | "user") => setNu({ ...nu, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-4 flex justify-end">
            <Button onClick={() => addUser.mutate()} disabled={!nu.email || !nu.password || addUser.isPending}>Criar usuário</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Usuários da empresa</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.data?.users?.length ? users.data.users.map((u) => (
              <div key={u.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <div className="font-medium text-sm">{u.email}</div>
                  <div className="text-xs text-muted-foreground capitalize">{u.role}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeUser.mutate(u.userId)} title="Remover">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )) : <div className="text-sm text-muted-foreground">Nenhum usuário.</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Autorizar e-mail Google</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <div className="grid gap-1 sm:col-span-2">
            <Label>E-mail</Label>
            <Input type="email" value={ae.email} onChange={(e) => setAe({ ...ae, email: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <Label>Papel</Label>
            <Select value={ae.role} onValueChange={(v: "admin" | "user") => setAe({ ...ae, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={() => authorize.mutate()} disabled={!ae.email || authorize.isPending}>Autorizar</Button>
          </div>
          <div className="sm:col-span-4 space-y-1">
            {emails.data?.emails?.map((e) => (
              <div key={e.id} className="text-xs text-muted-foreground flex justify-between border-b py-1">
                <span>{e.email}</span><span className="capitalize">{e.role}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
