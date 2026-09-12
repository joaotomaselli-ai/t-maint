import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import {
  Wrench,
  Cpu,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  Zap,
  Activity,
  BarChart3,
  Building2,
  Gauge,
  HelpCircle,
  Check,
  Layers,
  Shield,
  Laptop,
  Users,
  Package,
  QrCode,
  Sparkles,
  ChevronRight,
  Terminal,
  FileCheck2,
  HardDrive,
  Share2,
  Settings,
  Cog,
  Handshake,
  Play,
  RotateCcw,
  PenTool,
  Download,
  MessageCircle,
} from "lucide-react";
import { NoiseGridBackground } from "@/components/ui/noise-grid-background";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { InteractiveComparison } from "@/components/ui/interactive-comparison";

export const Route = createFileRoute("/landing")({ component: LandingPage });

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Live Interactive Simulator State
  const [simStep, setSimStep] = useState<"idle" | "running" | "signed" | "done">("idle");
  const [simSeconds, setSimSeconds] = useState(145);
  const [simKm, setSimKm] = useState(48);

  useEffect(() => {
    let interval: any;
    if (simStep === "running") {
      interval = setInterval(() => {
        setSimSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [simStep]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `00h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  const whatsappUrlService = "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20diagn%C3%B3stico%20de%20manuten%C3%A7%C3%A3o%20para%20minha%20m%C3%A1quina%20CNC.";
  const whatsappUrlSoftware = "https://wa.me/5547988485668?text=Ol%C3%A1!%20Tenho%20interesse%20em%20conhecer%20os%20planos%20da%20plataforma%20T-MAINT%20para%20minha%20empresa.";

  const faqs = [
    {
      q: "Como funciona o atendimento de manutenção em máquinas CNC?",
      a: "Realizamos o atendimento técnico direto em campo para diagnóstico de falhas elétricas, parametrização e testes operacionais. Para intervenções mecânicas complexas e reparos de placas/servodrives, atuamos em conjunto com parceiros técnicos homologados e de extrema confiança.",
    },
    {
      q: "Quais marcas e comandos CNC são atendidos?",
      a: "Atendemos os principais fabricantes e comandos do mercado, incluindo Okuma (OSP), Fanuc, Siemens (Sinumerik), Fagor, Yaskawa, Mazak, Mitsubishi, Romi e MCS.",
    },
    {
      q: "Como funciona a contratação do software T-MAINT para outras empresas?",
      a: "O T-Maint é disponibilizado como serviço em nuvem. Empresas de manutenção, assistências técnicas e equipes internas podem contratar para gerenciar técnicos em campo, ordens de serviço, clientes, orçamentos rápidos e controle de estoque.",
    },
    {
      q: "O cliente da minha empresa pode acompanhar o histórico dos serviços?",
      a: "Sim. O T-Maint conta com o Portal do Cliente, onde as indústrias acessam o histórico das máquinas, fotos antes/depois, relatórios técnicos em PDF com assinatura digital e cronograma de preventivas.",
    },
    {
      q: "Como é feita a emissão de orçamentos e relatórios técnicos?",
      a: "Em menos de 1 minuto, o técnico ou gestor preenche peças, serviços e deslocamento. O sistema calcula os totais e gera uma proposta profissional com botão para envio direto no WhatsApp do cliente.",
    },
    {
      q: "O software funciona em tablets e celulares no campo?",
      a: "Sim, 100% otimizado para celulares e tablets. O técnico faz o apontamento de horas no local, fotografa a máquina e colhe a assinatura digital do cliente diretamente na tela.",
    },
  ];

  const cncBrands = [
    { name: "Okuma", tag: "Comandos OSP" },
    { name: "Fanuc", tag: "Séries Alpha / i" },
    { name: "Siemens", tag: "Sinumerik" },
    { name: "Yaskawa", tag: "Servodrives Sigma" },
    { name: "Fagor", tag: "8055 / 8065" },
    { name: "Mitsubishi", tag: "Meldas / M70" },
    { name: "Mazak", tag: "Mazatrol" },
    { name: "Romi", tag: "Tornos e Centros" },
  ];

  return (
    <div className="min-h-screen relative bg-[#0B0F17] text-[#F3F4F6] font-sans selection:bg-[#00F5D4] selection:text-[#0B0F17] overflow-x-hidden">
      {/* Background Interativo 21st.dev */}
      <NoiseGridBackground />

      {/* FLOATING WHATSAPP CTA COM GLOW */}
      <aside aria-label="Atendimento Rápido" className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <a
          href={whatsappUrlService}
          target="_blank"
          rel="noreferrer"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#131A26]/95 border border-[#00F5D4]/40 backdrop-blur-md shadow-[0_0_30px_rgba(0,245,212,0.25)] hover:shadow-[0_0_40px_rgba(0,245,212,0.45)] hover:border-[#00F5D4] transition-all"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#25D366]"></span>
          </span>
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <span className="text-xs font-mono font-bold text-white group-hover:text-[#00F5D4] transition-colors hidden sm:inline">
            Plantão Técnico CNC
          </span>
        </a>
      </aside>

      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#1F293D] bg-[#0B0F17]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoTmaint} alt="T-MAINT" className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(0,245,212,0.3)]" />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                T-MAINT
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-[#00F5D4]/40 bg-[#00F5D4]/10 text-[#00F5D4]">
                  Industrial
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Manutenção Especializada CNC & Software de Gestão
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#solucoes" className="hover:text-[#00F5D4] transition-colors">Soluções</a>
            <a href="#comparativo" className="hover:text-[#00F5D4] transition-colors">Antes vs. Depois</a>
            <a href="#manutencao-cnc" className="hover:text-[#00F5D4] transition-colors">Manutenção CNC</a>
            <a href="#plataforma" className="hover:text-[#00F5D4] transition-colors">Plataforma T-Maint</a>
            <a href="#planos" className="hover:text-[#00F5D4] text-[#00F5D4] transition-colors flex items-center gap-1">
              <Laptop className="h-3.5 w-3.5" /> Planos do Sistema
            </a>
            <a href="#faq" className="hover:text-[#00F5D4] transition-colors">Dúvidas</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button 
                onClick={() => navigate({ to: "/" })} 
                className="bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-[#0B0F17] font-bold font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,245,212,0.25)] transition-all"
              >
                <BarChart3 className="h-4 w-4 mr-1.5" /> Painel de Controle
              </Button>
            ) : (
              <Button 
                onClick={() => navigate({ to: "/login" })} 
                className="bg-[#131A26] hover:bg-[#182232] text-[#F3F4F6] border border-[#1F293D] font-mono text-xs uppercase tracking-wider hover:border-[#00F5D4]/50 transition-all"
              >
                Acessar Sistema
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-[#1F293D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Live Status Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#131A26] border border-[#1F293D] text-xs font-mono text-slate-300 shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5D4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F5D4]"></span>
              </span>
              <span className="text-[#00F5D4] font-semibold">SISTEMA ATIVO</span>
              <span className="text-slate-600">|</span>
              <span>ORDENS DE SERVIÇO & ATENDIMENTO TÉCNICO CNC</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Manutenção Especializada CNC & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] via-teal-200 to-cyan-400">
                Plataforma de Gestão
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
              Atendimento técnico em campo para tornos e centros de usinagem CNC, suporte mecânico/eletrônico integrado e software definitivo para controle de O.S., orçamentos no WhatsApp e relatórios padronizados.
            </p>

            {/* CTAs COM SHIMMER BUTTON & GLOW */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-sm">
              <a
                href={whatsappUrlService}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <ShimmerButton
                  shimmerColor="#00F5D4"
                  shimmerDuration="2.2s"
                  glow={true}
                  className="w-full sm:w-auto bg-[#00F5D4] text-[#0B0F17] hover:text-[#0B0F17] font-bold text-xs uppercase tracking-wider py-4 px-8 shadow-[0_0_30px_rgba(0,245,212,0.35)]"
                >
                  <Wrench className="h-4 w-4 mr-2" /> Solicitar Atendimento CNC
                </ShimmerButton>
              </a>

              <a
                href="#planos"
                className="w-full sm:w-auto"
              >
                <ShimmerButton
                  shimmerColor="#38BDF8"
                  shimmerDuration="3s"
                  background="rgba(19, 26, 38, 0.95)"
                  glow={false}
                  className="w-full sm:w-auto text-[#F3F4F6] font-semibold text-xs uppercase tracking-wider py-4 px-8 border border-[#1F293D] hover:border-[#00F5D4]/60"
                >
                  <Laptop className="h-4 w-4 mr-2 text-[#00F5D4]" /> Conhecer o Software T-Maint
                </ShimmerButton>
              </a>
            </div>
          </div>

          {/* SIMULADOR INTERATIVO DE O.S. COM FEIXE LASER BORDER BEAM */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border border-[#1F293D] bg-[#131A26]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-md overflow-hidden">
              {/* Feixe Laser BorderBeam percorrendo o cockpit */}
              <BorderBeam size={280} duration={10} colorFrom="#00F5D4" colorTo="#06B6D4" />

              {/* Cockpit Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F293D] pb-4 mb-5 font-mono text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-white font-semibold flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-[#00F5D4]" />
                    SIMULADOR INTERATIVO DE O.S. EM TEMPO REAL
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-teal-500/10 text-[#00F5D4] border border-teal-500/30">
                    TESTE O FLUXO AO VIVO
                  </span>
                </div>
              </div>

              {/* Interactive Simulator Cockpit */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Coluna 1: Dados da Máquina & Cronômetro */}
                <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1F293D] flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Equipamento em Atendimento</div>
                    <div className="mt-1 text-base font-bold text-white flex items-center gap-2">
                      <Cog className="h-4 w-4 text-[#00F5D4]" /> Torno CNC Okuma LB3000
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">CLIENTE: Usinagem Vale do Itajaí</div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#1F293D]/80">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Apontamento de Horas</div>
                    <div className="text-2xl font-mono font-extrabold text-[#00F5D4] tracking-tight mt-0.5">
                      {formatTime(simSeconds)}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                      <span>Deslocamento: <strong className="text-slate-200">{simKm} km</strong></span>
                      <span className="text-slate-600">•</span>
                      <span>Status: <strong className={simStep === "idle" ? "text-yellow-400" : "text-emerald-400"}>
                        {simStep === "idle" ? "Pendente" : simStep === "running" ? "Em Execução" : "Concluído"}
                      </strong></span>
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Assinatura Digital & Evidências */}
                <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1F293D] flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Assinatura Digital do Cliente</div>
                    <div className="mt-2 h-20 rounded-lg border border-dashed border-[#1F293D] bg-[#131A26]/50 flex items-center justify-center relative overflow-hidden">
                      {simStep === "signed" || simStep === "done" ? (
                        <div className="text-center font-mono">
                          <span className="text-xs text-emerald-400 font-bold block">✓ Assinatura Validada na Tela</span>
                          <span className="text-[10px] text-slate-400 italic">Eng. Roberto M. (Gerente de Manutenção)</span>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-slate-500 font-mono flex items-center gap-1.5">
                          <PenTool className="h-3.5 w-3.5" /> Aguardando coleta de assinatura
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                    <span>Fotos de Evidências: <strong className="text-white">3 Fotos Anexadas</strong></span>
                    <span className="text-emerald-400 font-bold">OK</span>
                  </div>
                </div>

                {/* Coluna 3: Painel de Controle de Ações Interativas */}
                <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1F293D] flex flex-col justify-between">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Controle de Ações do Técnico
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {simStep === "idle" && (
                      <button
                        onClick={() => setSimStep("running")}
                        className="w-full py-2.5 px-3 rounded-lg bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-[#0B0F17] font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,245,212,0.3)] transition-all"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> 1. Iniciar Atendimento
                      </button>
                    )}

                    {simStep === "running" && (
                      <button
                        onClick={() => setSimStep("signed")}
                        className="w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all animate-pulse"
                      >
                        <PenTool className="h-3.5 w-3.5" /> 2. Coletar Assinatura
                      </button>
                    )}

                    {simStep === "signed" && (
                      <button
                        onClick={() => setSimStep("done")}
                        className="w-full py-2.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                      >
                        <FileCheck2 className="h-3.5 w-3.5" /> 3. Gerar Relatório PDF
                      </button>
                    )}

                    {simStep === "done" && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-bold text-xs">
                        ✓ Relatório #OS-2026-0912 Gerado & Pronto para Envio!
                      </div>
                    )}

                    {simStep !== "idle" && (
                      <button
                        onClick={() => {
                          setSimStep("idle");
                          setSimSeconds(145);
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#131A26] hover:bg-[#182232] text-slate-400 border border-[#1F293D] flex items-center justify-center gap-1.5 text-[11px] transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" /> Reiniciar Teste
                      </button>
                    )}
                  </div>

                  <div className="mt-3 text-[10px] font-mono text-slate-500 text-center">
                    Clique nos botões acima para simular a rapidez do fluxo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND CHIPS */}
      <section className="py-10 border-b border-[#1F293D] bg-[#0B0F17]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">
            Comandos e Fabricantes Atendidos
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {cncBrands.map((b, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#131A26]/60 border border-[#1F293D] text-center hover:border-[#00F5D4]/40 transition-colors">
                <div className="text-sm font-bold text-white">{b.name}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{b.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: SOLUÇÕES / BENTO GRID */}
      <section id="solucoes" className="py-24 border-b border-[#1F293D] bg-[#0B0F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#00F5D4] border border-[#00F5D4]/30 px-2.5 py-1 rounded bg-[#00F5D4]/10">
              Soluções Integradas
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Manutenção Prática no Chão de Fábrica & Gestão Completa em Software
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Unindo a experiência de campo com a tecnologia necessária para organizar sua rotina de manutenção.
            </p>
          </div>

          {/* THE BENTO GRID */}
          <div id="plataforma" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* BENTO CARD 1 (Large - 2 Cols) */}
            <div className="md:col-span-2 rounded-2xl bg-[#131A26] border border-[#1F293D] p-6 sm:p-8 relative overflow-hidden hover:border-[#00F5D4]/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2.5 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/20">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Módulo de O.S. Digital</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Ordens de Serviço & Apontamento de Horas</h3>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Controle exato de horas trabalhadas, deslocamento em quilômetros e fotos de evidências. Assinatura do cliente colhida digitalmente no encerramento do serviço com geração de relatório em PDF.
              </p>

              <div className="mt-6 p-4 rounded-xl bg-[#0B0F17] border border-[#1F293D] font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>⏱️ TEMPO DE ATENDIMENTO: <strong className="text-white">04h 30m</strong></span>
                  <span>🚗 DESLOCAMENTO: <strong className="text-white">120 km</strong></span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-[#1F293D]/60">
                  <span>CLIENTE: Usinagem Industrial Vale</span>
                  <span className="text-[#00F5D4]">RELATÓRIO ASSINADO ✓</span>
                </div>
              </div>
            </div>

            {/* BENTO CARD 2 (1 Col) - MANUTENÇÃO CNC & PARCERIAS TÉCNICAS */}
            <div id="manutencao-cnc" className="rounded-2xl bg-[#131A26] border border-[#1F293D] p-6 sm:p-8 hover:border-[#00F5D4]/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Wrench className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Atendimento Especializado</span>
              </div>
              <h3 className="text-xl font-bold text-white">Manutenção Mecânica & Eletrônica CNC</h3>
              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                Diagnóstico técnico em campo para tornos e centros de usinagem. Atuação conjunta com parceiros homologados para manutenção mecânica pesada e reparo eletrônico de servodrives, fontes e placas de comando.
              </p>
              <a 
                href={whatsappUrlService} 
                target="_blank" 
                rel="noreferrer" 
                className="mt-6 font-mono text-xs text-[#00F5D4] inline-flex items-center gap-1 hover:underline"
              >
                <span>SOLICITAR AVALIAÇÃO TÉCNICA</span> <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* BENTO CARD 3 (1 Col) */}
            <div className="rounded-2xl bg-[#131A26] border border-[#1F293D] p-6 sm:p-8 hover:border-[#00F5D4]/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  <Package className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Controle de Materiais</span>
              </div>
              <h3 className="text-xl font-bold text-white">Estoque de Peças & QR Code</h3>
              <p className="mt-2 text-slate-400 text-sm">
                Histórico de peças utilizadas, aviso automático de estoque mínimo para reposição e identificação rápida das máquinas através de QR Code.
              </p>
              <div className="mt-6 font-mono text-xs text-yellow-400 flex items-center gap-1">
                <span>GESTÃO DE ALMOXARIFADO</span> <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* BENTO CARD 4 (Large - 2 Cols) */}
            <div className="md:col-span-2 rounded-2xl bg-[#131A26] border border-[#1F293D] p-6 sm:p-8 relative overflow-hidden hover:border-[#00F5D4]/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Share2 className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Comercial & Propostas</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Orçamentos Rápidos com Envio no WhatsApp</h3>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Crie orçamentos detalhados em menos de 1 minuto, com cálculo automático de serviços, peças, deslocamento e prazos de garantia. Converta orçamentos aprovados em Ordens de Serviço com apenas 1 clique.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1F293D] text-slate-300">
                  ✓ ENVIO DIRETO NO WHATSAPP
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1F293D] text-[#00F5D4]">
                  ✓ CONVERSÃO IMEDIATA EM O.S.
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1F293D] text-slate-300">
                  ✓ RELATÓRIO PDF CORPORATIVO
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: COMPARADOR INTERATIVO ANTES VS DEPOIS */}
      <section id="comparativo" className="py-24 border-b border-[#1F293D] bg-[#0B0F17]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#00F5D4] border border-[#00F5D4]/30 px-2.5 py-1 rounded bg-[#00F5D4]/10">
              Transformação Operacional
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A Diferença Prática na Sua Operação Diária
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Compare como a digitalização do T-MAINT elimina perdas de faturamento, retrabalho e desorganização.
            </p>
          </div>

          <InteractiveComparison />
        </div>
      </section>

      {/* SECTION: DETALHES DE MANUTENÇÃO CNC COM BORDER BEAM */}
      <section className="py-20 border-b border-[#1F293D] bg-[#0B0F17]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div>
              <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#00F5D4] border border-[#00F5D4]/30 px-2.5 py-1 rounded bg-[#00F5D4]/10">
                Atendimento Técnico Integrado
              </span>
              <h3 className="mt-4 text-2xl sm:text-3xl font-bold text-white">
                Diagnóstico em Campo & Parcerias Especializadas
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Combinamos experiência prática no diagnóstico de alarmes e falhas elétricas com uma rede sólida de parceiros para intervenções mecânicas e manutenção eletrônica avançada.
              </p>
              <div className="mt-6">
                <a
                  href={whatsappUrlService}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ShimmerButton
                    shimmerColor="#00F5D4"
                    shimmerDuration="2.5s"
                    className="bg-[#00F5D4] text-[#0B0F17] hover:text-[#0B0F17] font-bold text-xs uppercase tracking-wider py-3.5 px-6 shadow-[0_0_20px_rgba(0,245,212,0.3)]"
                  >
                    <Phone className="h-4 w-4 mr-2" /> Chamar Especialista no WhatsApp
                  </ShimmerButton>
                </a>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#131A26] border border-[#1F293D]">
                <div className="flex items-center gap-2.5 text-[#00F5D4] font-semibold text-sm">
                  <Zap className="h-4 w-4" /> Diagnóstico Elétrico & Alarmes
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Identificação precisa de falhas em réguas ópticas, encoders, sensores, relés e comandos de segurança em tornos e centros CNC.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131A26] border border-[#1F293D]">
                <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-sm">
                  <Cog className="h-4 w-4" /> Mecânica com Parceiros Sólidos
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Atuação em conjunto com especialistas para ajustes de eixos, fusos de esferas, guias lineares, cabeçotes e trocadores de ferramentas.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131A26] border border-[#1F293D]">
                <div className="flex items-center gap-2.5 text-yellow-400 font-semibold text-sm">
                  <Cpu className="h-4 w-4" /> Gestão de Reparo Eletrônico
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Intermediação e envio seguro de servodrives, placas e fontes para reparo em bancada com parceiro técnico altamente confiável.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131A26] border border-[#1F293D]">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
                  <FileText className="h-4 w-4" /> Relatório Técnico Detalhado
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Toda intervenção é registrada na plataforma T-Maint com fotos, causas-raiz e recomendações preventivas para a sua indústria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS & PRICING (SAAS) COM BORDER BEAM NO PLANO PRO */}
      <section id="planos" className="py-24 border-b border-[#1F293D] bg-[#0B0F17]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#00F5D4] border border-[#00F5D4]/30 px-2.5 py-1 rounded bg-[#00F5D4]/10">
              Planos do Sistema
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Adquira a Plataforma T-MAINT para sua Empresa
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Escolha o plano ideal para digitalizar e organizar o atendimento da sua equipe técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* PLANO BÁSICO */}
            <div className="rounded-2xl bg-[#131A26] border border-[#1F293D] p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Essencial</div>
                <h3 className="text-2xl font-bold text-white mt-1">Básico</h3>
                <p className="text-xs text-slate-400 mt-2">Para técnicos autônomos e pequenos prestadores.</p>
                <div className="mt-6 text-3xl font-extrabold text-white font-mono">
                  R$ 197<span className="text-xs font-normal text-slate-400">/mês</span>
                </div>

                <ul className="mt-8 space-y-3 text-sm text-slate-300 font-mono">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Até 2 Técnicos</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Emissão de O.S. Ilimitada</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Relatórios Técnicos em PDF</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Cadastro de Clientes e Máquinas</li>
                </ul>
              </div>

              <a
                href={whatsappUrlSoftware}
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full block text-center py-3 rounded-xl bg-[#0B0F17] hover:bg-[#182232] text-white border border-[#1F293D] hover:border-[#00F5D4]/50 font-mono text-xs uppercase tracking-wider transition-all"
              >
                Contratar Plano
              </a>
            </div>

            {/* PLANO PRO (DESTAQUE COM BORDER BEAM E SHIMMER BUTTON) */}
            <div className="relative rounded-2xl bg-[#131A26] border-2 border-[#00F5D4] p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(0,245,212,0.15)] overflow-hidden">
              {/* Feixe Laser BorderBeam */}
              <BorderBeam size={240} duration={8} colorFrom="#00F5D4" colorTo="#06B6D4" />

              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00F5D4] text-[#0B0F17] text-[10px] font-mono font-bold uppercase tracking-widest z-10 shadow-md">
                Mais Recomendado
              </div>

              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#00F5D4]">Profissional</div>
                <h3 className="text-2xl font-bold text-white mt-1">Pro Industrial</h3>
                <p className="text-xs text-slate-400 mt-2">Para oficinas de manutenção e empresas estruturadas.</p>
                <div className="mt-6 text-3xl font-extrabold text-white font-mono">
                  R$ 397<span className="text-xs font-normal text-slate-400">/mês</span>
                </div>

                <ul className="mt-8 space-y-3 text-sm text-slate-200 font-mono">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Até 10 Técnicos</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Módulo Orçamentos no WhatsApp</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Controle de Peças com QR Code</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Painel Financeiro de Horas & Km</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Portal do Cliente Liberado</li>
                </ul>
              </div>

              <a
                href={whatsappUrlSoftware}
                target="_blank"
                rel="noreferrer"
                className="mt-8 block z-10"
              >
                <ShimmerButton
                  shimmerColor="#00F5D4"
                  shimmerDuration="2s"
                  glow={true}
                  className="w-full bg-[#00F5D4] text-[#0B0F17] hover:text-[#0B0F17] font-bold text-xs uppercase tracking-wider py-3.5 shadow-[0_0_25px_rgba(0,245,212,0.35)]"
                >
                  Assinar Plano Pro
                </ShimmerButton>
              </a>
            </div>

            {/* PLANO ELITE */}
            <div className="rounded-2xl bg-[#131A26] border border-[#1F293D] p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Corporativo</div>
                <h3 className="text-2xl font-bold text-white mt-1">Elite Enterprise</h3>
                <p className="text-xs text-slate-400 mt-2">Para indústrias e grandes operações de campo.</p>
                <div className="mt-6 text-3xl font-extrabold text-white font-mono">
                  R$ 697<span className="text-xs font-normal text-slate-400">/mês</span>
                </div>

                <ul className="mt-8 space-y-3 text-sm text-slate-300 font-mono">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Técnicos Ilimitados</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Todos os Recursos do Plano Pro</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Suporte Prioritário no WhatsApp</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Treinamento e Implantação VIP</li>
                </ul>
              </div>

              <a
                href={whatsappUrlSoftware}
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full block text-center py-3 rounded-xl bg-[#0B0F17] hover:bg-[#182232] text-white border border-[#1F293D] hover:border-[#00F5D4]/50 font-mono text-xs uppercase tracking-wider transition-all"
              >
                Falar com Especialista
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 border-b border-[#1F293D] bg-[#0B0F17]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#00F5D4] border border-[#00F5D4]/30 px-2.5 py-1 rounded bg-[#00F5D4]/10">
              Perguntas Frequentes
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-white">Dúvidas Técnicas e Operacionais</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div 
                key={i} 
                className="rounded-2xl bg-[#131A26] border border-[#1F293D] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-[#182232] transition-colors"
                >
                  <span className="font-semibold text-white text-base">{f.q}</span>
                  <ChevronRight className={`h-5 w-5 text-[#00F5D4] transition-transform ${activeFaq === i ? "rotate-90" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="p-5 pt-0 text-sm text-slate-400 leading-relaxed border-t border-[#1F293D]/60 mt-2">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-[#0B0F17] border-t border-[#1F293D] font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoTmaint} alt="T-MAINT" className="h-8 w-8 object-contain" />
            <span className="text-white font-bold tracking-tight">T-MAINT INDUSTRIAL</span>
            <span>— Soluções em Manutenção CNC & Software de Gestão</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <a href="https://t-maint.com.br" className="hover:text-[#00F5D4] transition-colors">t-maint.com.br</a>
            <a href={whatsappUrlService} target="_blank" rel="noreferrer" className="hover:text-[#00F5D4] transition-colors">WhatsApp de Atendimento</a>
          </div>

          <div>
            © {new Date().getFullYear()} T-Maint. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
