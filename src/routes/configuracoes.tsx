import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({ component: Configuracoes });

function Configuracoes() {
  const { settings, saveSettings } = useSettings();
  const { user, signOut } = useAuth();
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);

  const save = async () => {
    try {
      await saveSettings.mutateAsync(form);
      toast.success("Configurações salvas");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Dados que aparecem no cabeçalho dos relatórios</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Dados da empresa / técnico</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Nome da empresa</Label>
            <Input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Ex: Tomaselli CNC" />
          </div>
          <div className="grid gap-2">
            <Label>Nome do técnico</Label>
            <Input value={form.technicianName} onChange={e => setForm({ ...form, technicianName: e.target.value })} placeholder="Seu nome completo" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>CNPJ</Label>
              <Input value={form.cnpj || ""} onChange={e => setForm({ ...form, cnpj: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Telefone</Label>
              <Input value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Endereço</Label>
            <Textarea rows={2} value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button onClick={save} size="lg" disabled={saveSettings.isPending}>Salvar configurações</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conta</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <div className="text-muted-foreground">Conectado como</div>
            <div className="font-medium">{user?.email}</div>
          </div>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
