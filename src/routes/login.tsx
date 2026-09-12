import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
  User
} from "lucide-react";
import { toast } from "sonner";
import { NoiseGridBackground } from "@/components/ui/noise-grid-background";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
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
    <div className="min-h-screen relative flex bg-[#0B0F17] text-[#F3F4F6] font-sans selection:bg-[#00F5D4] selection:text-[#0B0F17] overflow-hidden">
      {/* Background Interativo */}
      <NoiseGridBackground />

      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* LADO ESQUERDO: SHOWCASE INDUSTRIAL & TELEMETRIA (7 Cols em telas grandes) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 border-r border-[#1F293D] bg-[#0B0F17]/80 backdrop-blur-md relative overflow-hidden">
          {/* Top Logo */}
          <div className="flex items-center gap-3">
            <img src={logoTmaint} alt="T-MAINT" className="h-11 w-11 object-contain drop-shadow-[0_0_15px_rgba(0,245,212,0.35)]" />
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                T-MAINT
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-[#00F5D4]/40 bg-[#00F5D4]/10 text-[#00F5D4]">
                  Industrial
                </span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Manutenção Especializada CNC & Software de Gestão
              </span>
            </div>
          </div>

          {/* Central Telemetry Showcase Card */}
          <div className="my-auto max-w-xl">
            <div className="relative rounded-2xl bg-[#131A26]/90 border border-[#1F293D] p-8 shadow-2xl backdrop-blur-md overflow-hidden">
              {/* Feixe Laser BorderBeam */}
              <BorderBeam size={220} duration={9} colorFrom="#00F5D4" colorTo="#06B6D4" />

              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1F293D] font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-[#00F5D4]" />
                  <span className="text-white font-bold">PAINEL OPERACIONAL</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
                  SISTEMA ONLINE
                </span>
              </div>

              <h2 className="text-xl font-bold text-white leading-snug">
                Plataforma Definitiva para Gestão de Manutenção e Atendimento em Campo
              </h2>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Controle integral de ordens de serviço, apontamento de técnicos, fotos de evidências e orçamentos comerciais padronizados para o chão de fábrica.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#1F293D]">
                  <div className="text-slate-400 text-[10px] uppercase">Apontamento</div>
                  <div className="text-sm font-bold text-[#00F5D4] mt-0.5">Horas & KM Gravados</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#1F293D]">
                  <div className="text-slate-400 text-[10px] uppercase">Validação</div>
                  <div className="text-sm font-bold text-white mt-0.5">Assinatura Digital</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#1F293D]">
                  <div className="text-slate-400 text-[10px] uppercase">Comercial</div>
                  <div className="text-sm font-bold text-white mt-0.5">Orçamentos no WhatsApp</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#1F293D]">
                  <div className="text-slate-400 text-[10px] uppercase">Rastreio</div>
                  <div className="text-sm font-bold text-[#00F5D4] mt-0.5">Estoque & QR Code</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-[#1F293D]/60">
            <span>Segurança Criptografada SSL 256-bit</span>
            <Link to="/landing" className="text-[#00F5D4] hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o Site
            </Link>
          </div>
        </div>

        {/* LADO DIREITO: FORMULÁRIO DE LOGIN (5 Cols em telas grandes) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-14 relative">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
            <img src={logoTmaint} alt="T-MAINT" className="h-12 w-12 object-contain drop-shadow-[0_0_15px_rgba(0,245,212,0.35)] mb-3" />
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-1.5">
              T-MAINT
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-[#00F5D4]/40 bg-[#00F5D4]/10 text-[#00F5D4]">
                Industrial
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Gestão Inteligente de Manutenção</p>
          </div>

          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="relative rounded-2xl bg-[#131A26]/95 border border-[#1F293D] p-8 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden">
              <div className="mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F5D4] font-bold">
                  Autenticação Segura
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">Acessar Sistema</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Digite seu usuário ou e-mail corporativo para continuar.
                </p>
              </div>

              <form onSubmit={signIn} className="space-y-5 font-mono">
                {/* Identifier */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#00F5D4]" /> Usuário ou E-mail
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="ex: admin@empresa.com"
                      className="h-12 bg-[#0B0F17] border-[#1F293D] text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-1 focus-visible:ring-[#00F5D4] focus-visible:border-[#00F5D4] text-xs transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-[#00F5D4]" /> Senha de Acesso
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-12 bg-[#0B0F17] border-[#1F293D] text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-1 focus-visible:ring-[#00F5D4] focus-visible:border-[#00F5D4] text-xs transition-all"
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
                    className="w-full text-xs uppercase tracking-wider py-4 font-bold shadow-[0_0_25px_rgba(0,245,212,0.35)]"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Validando Credenciais...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Entrar na Plataforma
                      </>
                    )}
                  </ShimmerButton>
                </div>
              </form>

              {/* Help & WhatsApp Support */}
              <div className="mt-8 pt-6 border-t border-[#1F293D] text-center space-y-3 font-mono text-xs">
                <p className="text-slate-400 text-[11px]">
                  Esqueceu sua senha ou precisa de um novo acesso?
                </p>
                <a
                  href={whatsappUrlSupport}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-xs text-[#00F5D4] hover:text-[#00F5D4]/80 font-bold hover:underline transition-colors"
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
