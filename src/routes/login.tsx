import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { signInWithUsernameOrEmail, isEmailAllowed } from "@/lib/admin.functions";
import { Cog, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const signInFn = useServerFn(signInWithUsernameOrEmail);
  const checkEmail = useServerFn(isEmailAllowed);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await signInFn({ data: { identifier: identifier.trim(), password } });
      const { error } = await supabase.auth.setSession({
        access_token: res.accessToken,
        refresh_token: res.refreshToken,
      });
      if (error) toast.error(error.message);
      else navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.message ?? "Credenciais inválidas");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error("Erro no login com Google"); setBusy(false); return; }
    // After redirect back, an auth state change will fire; we check authorization there.
  };

  // After login succeeds (Google or password), verify the e-mail is whitelisted.
  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await checkEmail({ data: { email: user.email! } });
        if (cancelled) return;
        if (!res.allowed) {
          toast.error("E-mail não autorizado. Solicite acesso ao administrador.");
          await supabase.auth.signOut();
        }
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        toast.error("Não foi possível validar o e-mail. Tente novamente.");
        await supabase.auth.signOut();
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email, checkEmail]);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-3">
            <Cog className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">T-Maint</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão Inteligente de Manutenção</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Acessar plataforma</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={signIn} className="space-y-3">
              <div className="grid gap-2">
                <Label>Usuário ou e-mail</Label>
                <Input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="seu usuário ou e-mail" />
              </div>
              <div className="grid gap-2">
                <Label>Senha</Label>
                <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
              </Button>
            </form>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={google} disabled={busy}>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Entrar com Google
            </Button>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Acesso restrito. Solicite uma conta ao administrador da sua empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
