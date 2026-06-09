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
import { Cog, Loader2, Wrench } from "lucide-react";
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF8ED] via-[#F2F6FA] to-[#E6EEF6]">
      {/* Decorative Background Elements (Line Art Gears & Tools) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none text-slate-300/30">
        <Cog className="absolute -top-20 -left-20 w-[40rem] h-[40rem] animate-[spin_120s_linear_infinite]" strokeWidth={0.5} />
        <Cog className="absolute top-40 right-[-10rem] w-[30rem] h-[30rem] animate-[spin_90s_linear_infinite_reverse]" strokeWidth={0.5} />
        <Wrench className="absolute bottom-10 left-10 w-[20rem] h-[20rem] -rotate-45" strokeWidth={0.5} />
      </div>
      
      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700 px-4">
        <div className="text-center flex flex-col items-center mb-8">
          <img src="/logo.png" alt="T-Maint Logo" className="h-44 w-auto drop-shadow-md mb-2" />
          <h1 className="text-[#002b5e] text-3xl font-black tracking-tight mb-1">T-MAINT</h1>
          <h2 className="text-[#003B73] text-sm font-semibold uppercase tracking-widest opacity-80">Gestão Inteligente de Manutenção</h2>
        </div>

        {/* Main Card */}
        <Card className="rounded-[2rem] bg-white/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,30,80,0.08)] border-0 overflow-hidden">
          <CardContent className="p-8 pb-10 space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Acessar plataforma</h3>
            
            <form onSubmit={signIn} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-800 font-semibold text-sm">Usuário ou e-mail</Label>
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[#1E90FF] focus-within:border-transparent transition-all">
                  <Input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="SEU USUÁRIO OU E-MAIL" className="h-12 border-0 bg-transparent relative z-10 uppercase focus-visible:ring-0 placeholder:text-slate-400" />
                  <Cog className="absolute -right-4 -top-2 h-16 w-16 text-slate-100 z-0 pointer-events-none" strokeWidth={1} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-800 font-semibold text-sm">Senha</Label>
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[#1E90FF] focus-within:border-transparent transition-all">
                  <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="senha" className="h-12 border-0 bg-transparent relative z-10 focus-visible:ring-0 placeholder:text-slate-400 lowercase" />
                  <Cog className="absolute -right-4 -top-2 h-16 w-16 text-slate-100 z-0 pointer-events-none" strokeWidth={1} />
                </div>
              </div>
              
              <Button type="submit" className="w-full h-12 mt-4 rounded-full bg-gradient-to-r from-[#20B2AA] to-[#004080] hover:opacity-90 text-white font-medium shadow-[0_8px_20px_rgba(32,178,170,0.3)] transition-all flex items-center justify-center gap-2" disabled={busy}>
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <Cog className="h-5 w-5" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#20B2AA]/50 to-transparent" />
              </div>
              <div className="relative flex justify-center text-sm font-semibold text-slate-500 uppercase tracking-widest">
                <span className="bg-white px-4">OU</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold border-slate-200 shadow-sm transition-all flex items-center justify-center gap-3" onClick={google} disabled={busy}>
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Entrar com Google
            </Button>

            <p className="text-[11px] text-slate-400 text-center leading-tight pt-2 px-4">
              Acesso restrito. Solicite uma conta ao administrador da sua empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
