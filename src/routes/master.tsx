import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { listCompanies, createCompany, deleteCompany } from "@/lib/admin.functions";
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

  const q = useQuery({
    queryKey: ["companies"],
    queryFn: () => list(),
    enabled: access.isMaster,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", adminEmail: "", adminPassword: "", adminName: "" });

  const createMut = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: () => {
      toast.success("Empresa criada");
      qc.invalidateQueries({ queryKey: ["companies"] });
      setOpen(false);
      setForm({ name: "", adminEmail: "", adminPassword: "", adminName: "" });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const deleteMut = useMutation({
    mutationFn: (companyId: string) => remove({ data: { companyId } }),
    onSuccess: () => {
      toast.success("Empresa excluída");
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  if (access.isLoading) return <div className="p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!access.isMaster) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Master</h1>
          <p className="text-muted-foreground mt-1">Gerencie as empresas que utilizam o T-Maint</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Nova empresa</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar empresa</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-2"><Label>Nome da empresa</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Nome do administrador</Label><Input value={form.adminName} onChange={e => setForm({ ...form, adminName: e.target.value })} /></div>
              <div className="grid gap-2"><Label>E-mail do administrador</Label><Input type="email" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Senha inicial</Label><Input type="password" value={form.adminPassword} onChange={e => setForm({ ...form, adminPassword: e.target.value })} placeholder="mínimo 6 caracteres" /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.name || !form.adminEmail || form.adminPassword.length < 6}>
                {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader><CardTitle>Empresas</CardTitle></CardHeader>
        <CardContent>
          {q.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Empresa</TableHead><TableHead>Administrador</TableHead><TableHead className="text-right">Usuários</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {(q.data?.companies ?? []).map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.ownerEmail}</TableCell>
                    <TableCell className="text-right">{c.usersCount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Excluir empresa "${c.name}" e todos os seus dados?`)) deleteMut.mutate(c.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
