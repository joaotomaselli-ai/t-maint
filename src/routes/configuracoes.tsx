import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-storage";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({ component: Configuracoes });

function Configuracoes() {
  const [settings, setSettings] = useSettings();
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);

  const save = () => { setSettings(form); toast.success("Configurações salvas"); };

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
            <Button onClick={save} size="lg">Salvar configurações</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sobre seus dados</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Os dados são salvos localmente neste navegador. Para fazer backup, exporte os relatórios em PDF.</p>
          <p>Para sincronizar entre dispositivos e ter login, podemos ativar o Lovable Cloud em uma próxima versão.</p>
        </CardContent>
      </Card>
    </div>
  );
}
