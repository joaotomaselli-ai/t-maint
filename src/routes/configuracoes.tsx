import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { useAccess } from "@/hooks/use-access";
import { UsersManager } from "@/components/UsersManager";
import { toast } from "sonner";
import { LogOut, ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/configuracoes")({ component: Configuracoes });

function Configuracoes() {
  const { settings, saveSettings } = useSettings();
  const { user, signOut } = useAuth();
  const { isAdmin, isMaster, companyId } = useAccess();
  const canManageUsers = isAdmin && !isMaster;
  const [form, setForm] = useState(settings);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  useEffect(() => setForm(settings), [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const ext = file.name.split('.').pop();
      const fileName = `${companyId || user?.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('company-logos').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('company-logos').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, logoUrl: data.publicUrl }));
      toast.success("Logo carregada com sucesso. Não esqueça de Salvar as configurações.");
    } catch (err: any) {
      toast.error("Erro ao carregar logo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const save = async () => {
    try {
      await saveSettings.mutateAsync(form);
      toast.success("Configurações salvas");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Dados da empresa e gestão de usuários</p>
      </header>

      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          {canManageUsers && <TabsTrigger value="usuarios">Usuários</TabsTrigger>}
          <TabsTrigger value="conta">Conta</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Dados da empresa / técnico</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Logo da Empresa nos Relatórios</Label>
                <div className="flex items-center gap-4">
                  {form.logoUrl && (
                    <div className="flex flex-col gap-2">
                      <div className="h-16 w-32 rounded-md border flex items-center justify-center overflow-hidden bg-slate-50 relative group">
                        <img src={form.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setForm(prev => ({ ...prev, logoUrl: "" }))}
                        className="w-full text-xs"
                      >
                        Remover Logo
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    <p className="text-xs text-muted-foreground mt-1">Recomendado: Imagem PNG com fundo transparente.</p>
                  </div>
                  {uploadingLogo && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Nome da empresa</Label>
                <Input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Ex: T-Maint" />
              </div>
              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" />
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
        </TabsContent>

        {canManageUsers && (
          <TabsContent value="usuarios" className="mt-4">
            <UsersManager companyId={companyId ?? undefined} />
          </TabsContent>
        )}

        <TabsContent value="conta" className="mt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

