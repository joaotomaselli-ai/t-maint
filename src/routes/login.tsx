import { createFileRoute, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { signInWithUsernameOrEmail } from "@/lib/admin.functions";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import { 
  Cog, 
  Loader2, 
  Wrench, 
  ShieldCheck, 
  Terminal, 
  ArrowLeft, 
  MessageCircle, 
  CheckCircle2, 
  Cpu, 
  Sparkles,
  Lock,
  User,
  Building2,
  QrCode
} from "lucide-react";
import { toast } from "sonner";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientParam = searchParams.get("client") || undefined;
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const signInFn = useServerFn(signInWithUsernameOrEmail);

  const whatsappUrlSupport = "https://wa.me/5547988485668?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20para%20acessar%20minha%20conta%20no%20T-MAINT.";

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
      else {
        toast.success("Acesso autorizado com sucesso!");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Credenciais inválidas");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dark min-h-screen relative flex bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-hidden">

      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* LADO ESQUERDO: SHOWCASE INDUSTRIAL & TELEMETRIA (7 Cols em telas grandes) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 border-r border-border bg-background/80 backdrop-blur-md relative overflow-hidden">
          {/* Top Logo */}
          <div className="flex items-center gap-3">
            <img src={logoTmaint} alt="T-MAINT" className="h-11 w-11 object-contain" />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                T-MAINT
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary">
                  Industrial
                </span>
              </span>
              <span className="text-xs text-slate-400">
                Manutenção Especializada CNC & Software de Gestão
              </span>
            </div>
          </div>

          {/* Central Telemetry Showcase Card */}
          <div className="my-auto max-w-xl">
            <div className="relative rounded-lg bg-card/90 border border-border p-8 shadow-2xl backdrop-blur-md overflow-hidden">
              {/* Feixe Laser BorderBeam */}
              <BorderBeam size={220} duration={9} colorFrom="#00F5D4" colorTo="#06B6D4" />

              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span className="text-white font-bold">PAINEL OPERACIONAL</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/30 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  SISTEMA ONLINE
                </span>
              </div>

              <h2 className="text-xl font-bold text-white leading-snug">
                Plataforma Definitiva para Gestão de Manutenção e Atendimento em Campo
              </h2>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Controle integral de ordens de serviço, apontamento de técnicos, fotos de evidências e orçamentos comerciais padronizados para o chão de fábrica.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-slate-400 text-[10px]">Apontamento</div>
                  <div className="text-sm font-bold text-primary mt-0.5">Horas & KM Gravados</div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-slate-400 text-[10px]">Validação</div>
                  <div className="text-sm font-bold text-white mt-0.5">Assinatura Digital</div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-slate-400 text-[10px]">Comercial</div>
                  <div className="text-sm font-bold text-white mt-0.5">Orçamentos no WhatsApp</div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-slate-400 text-[10px]">Rastreio</div>
                  <div className="text-sm font-bold text-primary mt-0.5">Estoque & QR Code</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-border/60">
            <span>Segurança Criptografada SSL 256-bit</span>
            <Link to="/landing" className="text-primary hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o Site
            </Link>
          </div>
        </div>

        {/* LADO DIREITO: FORMULÁRIO DE LOGIN (5 Cols em telas grandes) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-14 relative">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
            <img src={logoTmaint} alt="T-MAINT" className="h-12 w-12 object-contain mb-3" />
            <h1 className="text-2xl font-semibold text-white flex items-center gap-1.5">
              T-MAINT
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary">
                Industrial
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Gestão Inteligente de Manutenção</p>
          </div>

          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="relative rounded-lg bg-card/95 border border-border p-8 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden">
              <div className="mb-6">
                <span className="text-[10px] text-primary font-bold">
                  Autenticação Segura
                </span>
                <h2 className="text-2xl font-semibold text-white mt-1">Entrar no T-Maint</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Digite seu usuário ou e-mail corporativo para continuar.
                </p>
              </div>

              {clientParam && (
                <div className="mb-5 p-3.5 rounded-md bg-brand-950/60 border border-brand-500/40 text-xs text-brand-200 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0 mt-0.5">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-brand-400 block font-bold">
                      Portal do Cliente • Acesso via QR Tag
                    </span>
                    <span className="text-white font-semibold text-sm truncate block">
                      {decodeURIComponent(clientParam)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Entre com seu usuário para visualizar suas máquinas e laudos.
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={signIn} className="space-y-5">
                {/* Identifier */}
                <div className="space-y-2">
                  <Label htmlFor="login-identifier" className="text-sm text-slate-300 font-medium flex items-center gap-1.5">
                    <User aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" /> Usuário ou e-mail
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      id="login-identifier"
                      name="username"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="ex: admin@empresa.com…"
                      className="normal-case h-12 bg-background border-border text-foreground placeholder:text-slate-500 rounded-md text-base sm:text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-sm text-slate-300 font-medium flex items-center gap-1.5">
                      <Lock aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" /> Senha
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="Sua senha"
                      className="h-12 bg-background border-border text-foreground placeholder:text-slate-500 rounded-md text-base sm:text-sm"
                    />
                  </div>
                </div>

                {/* Submit CTA Button com Shimmer e Glow */}
                <div className="pt-2">
                  <ShimmerButton
                    type="submit"
                    variant="teal"
                    shimmerDuration="2s"
                    disabled={busy}
                    className="w-full text-xs py-4 font-bold"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Validando Credenciais...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Entrar
                      </>
                    )}
                  </ShimmerButton>
                </div>
              </form>

              {/* Help & WhatsApp Support */}
              <div className="mt-8 pt-6 border-t border-border text-center space-y-3 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Esqueceu sua senha ou precisa de um novo acesso?
                </p>
                <a
                  href={whatsappUrlSupport}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-xs text-primary hover:text-primary/80 font-bold hover:underline transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                  Suporte Técnico via WhatsApp
                </a>

                <div className="lg:hidden pt-2">
                  <Link to="/landing" className="text-slate-500 hover:text-slate-300 text-[11px] inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Voltar para o Site
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
