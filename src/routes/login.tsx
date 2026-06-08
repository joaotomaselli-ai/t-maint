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
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-200 via-slate-100 to-white p-4 relative overflow-hidden">
      {/* Background Pattern - Thin stroke gears/tools */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/gears.png')] mix-blend-multiply pointer-events-none"></div>
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <img src="/logo.png" alt="T-Maint Logo" className="h-32 w-auto drop-shadow-md mb-2" />
          <h2 className="text-slate-600 font-medium tracking-wide">Gestão Inteligente de Manutenção</h2>
        </div>

        <Card className="rounded-3xl bg-white/90 backdrop-blur-md shadow-[0_10px_40px_rgba(0,43,94,0.1)] border border-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
          <CardContent className="p-8 space-y-6">
            <form onSubmit={signIn} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-slate-600 font-semibold text-xs ml-1">Usuário ou e-mail</Label>
                <Input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Digite seu acesso" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#008b8b] focus-visible:border-[#008b8b] transition-all px-4" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 font-semibold text-xs ml-1">Senha</Label>
                <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#008b8b] focus-visible:border-[#008b8b] transition-all px-4" />
              </div>
              
              <Button type="submit" className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-[#008b8b] to-[#002b5e] hover:opacity-90 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2" disabled={busy}>
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <Cog className="h-5 w-5" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs font-medium text-slate-400 uppercase">
                <span className="bg-white px-4">Ou</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-3" onClick={google} disabled={busy}>
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Entrar com Google
            </Button>

            <p className="text-xs text-slate-400 text-center pt-2">
              Acesso restrito. Solicite uma conta ao administrador da sua empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
