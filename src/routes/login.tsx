import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { signInWithUsernameOrEmail } from "@/lib/admin.functions";
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
                  <Input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Seu usuário ou e-mail" className="normal-case h-12 border-0 bg-transparent relative z-10 focus-visible:ring-0 placeholder:text-slate-400" />
                  <Cog className="absolute -right-4 -top-2 h-16 w-16 text-slate-100 z-0 pointer-events-none" strokeWidth={1} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-800 font-semibold text-sm">Senha</Label>
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[#1E90FF] focus-within:border-transparent transition-all">
                  <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="h-12 border-0 bg-transparent relative z-10 focus-visible:ring-0 placeholder:text-slate-400" />
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

            <p className="text-[11px] text-slate-400 text-center leading-tight pt-2 px-4">
              Acesso restrito. Solicite uma conta ao administrador da sua empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
