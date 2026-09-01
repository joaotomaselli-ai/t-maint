import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import {
  Wrench,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  Zap,
  Activity,
  LogIn,
  ChevronRight,
  Sparkles,
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
} from "lucide-react";

export const Route = createFileRoute("/landing")({ component: LandingPage });

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const whatsappUrlService = "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20atendimento%20t%C3%A9cnico%20de%20manuten%C3%A7%C3%A3o.";
  const whatsappUrlSoftware = "https://wa.me/5547988485668?text=Ol%C3%A1!%20Tenho%20interesse%20em%20adquirir%20a%20plataforma%20de%20gest%C3%A3o%20T-MAINT%20para%20minha%20empresa.";

  const faqs = [
    {
      q: "Quais marcas de comando e eletrônica CNC são atendidas?",
      a: "Atendemos multimarcas de mercado, incluindo sistemas Okuma, Fanuc, Fagor, Mazak, Mitsubishi, MCS, além de toda a infraestrutura eletroeletrônica de máquinas operatrizes e usinagens.",
    },
    {
      q: "Como o cliente acompanha o histórico das manutenções?",
      a: "Através do Portal do Cliente T-MAINT, cada equipamento possui uma ficha digital completa com histórico de paradas, relatórios fotográficos antes/depois, requisição de peças e apontamento de horas.",
    },
    {
      q: "Como é feita a emissão dos relatórios de serviço?",
      a: "Ao finalizar o atendimento, os relatórios técnicos e operacionais são gerados em PDF de forma padronizada, prontos para envio ao cliente e arquivamento de compliance.",
    },
    {
      q: "Minha empresa pode adquirir apenas a plataforma de software T-MAINT?",
      a: "Sim! Se você possui uma empresa de manutenção, assistência técnica ou equipe de manutenção interna, pode contratar a plataforma T-MAINT no modelo SaaS (Software como Serviço) para gerenciar seus próprios técnicos, ordens de serviço, clientes e estoque.",
    },
    {
      q: "O cliente tem acesso a valores dentro do Portal do Cliente?",
      a: "Não. O Portal do Cliente é voltado 100% para o histórico técnico e operacional dos equipamentos, fotos de evidências e relatórios em PDF, sem exibição de valores financeiros internos.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-primary selection:text-primary-foreground">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoTmaint} alt="T-MAINT" className="h-10 w-10 object-contain" />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                T-MAINT
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  Industrial
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Manutenção Eletrônica CNC & Gestão
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
            <a href="#diferenciais" className="hover:text-white transition-colors">Diferenciais</a>
            <a href="#plataforma" className="hover:text-white transition-colors">Plataforma T-MAINT</a>
            <a href="#software" className="hover:text-white text-cyan-400 transition-colors flex items-center gap-1">
              <Laptop className="h-3.5 w-3.5" /> Adquirir Sistema
            </a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate({ to: "/" })} className="gap-2 font-semibold shadow-lg shadow-primary/20">
                <BarChart3 className="h-4 w-4" /> Ir para o Painel
              </Button>
            ) : (
              <Link to="/login">
                <Button className="gap-2 font-semibold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <LogIn className="h-4 w-4" /> Acessar Sistema
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent opacity-70 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide">
                <Sparkles className="h-3.5 w-3.5" /> Soluções Integradas para Usinagens & Indústrias
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Manutenção Eletrônica CNC &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-300">
                  Gestão Industrial
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Maximizando a disponibilidade do seu parque fabril através de atendimento especializado em elétrica e eletrônica CNC com controle inteligente de paradas e histórico digital de máquinas.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <a
                  href={whatsappUrlService}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full sm:w-auto gap-2 font-bold text-base px-8 h-12 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Zap className="h-5 w-5 text-amber-300" /> Solicitar Atendimento
                  </Button>
                </a>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 font-semibold text-base px-8 h-12 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200">
                    <LogIn className="h-5 w-5 text-primary" /> Área do Cliente / Sistema
                  </Button>
                </Link>
              </div>

              {/* Destaques Rápidos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 text-left">
                <div>
                  <div className="text-2xl font-bold text-white flex items-center gap-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" /> Multi-marcas
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Okuma, Fanuc, Fagor, Mazak, Mitsubishi, MCS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white flex items-center gap-1">
                    <Gauge className="h-5 w-5 text-primary" /> Rápida Resposta
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Foco em redução de setup e paradas</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-2xl font-bold text-white flex items-center gap-1">
                    <FileText className="h-5 w-5 text-primary" /> 100% Digital
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Relatórios técnicos com fotos e histórico</div>
                </div>
              </div>
            </div>

            {/* CARD INTERATIVO DE APRESENTAÇÃO */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Controle de Atendimento</h3>
                      <p className="text-xs text-slate-400">Plataforma Integrada T-MAINT</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ativo
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Diagnóstico Eletroeletrônico</span>
                    <span className="font-semibold text-white">Drives / Servo Motores / Painéis</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Histórico de Máquina</span>
                    <span className="font-semibold text-primary">Rastreabilidade Total</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Relatório Técnico</span>
                    <span className="font-semibold text-emerald-400">Com Evidências & Fotos</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Portal do Cliente</span>
                    <span className="font-semibold text-cyan-300">Acesso Transparente</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/login" className="block">
                    <Button variant="secondary" className="w-full justify-between font-semibold bg-slate-800 hover:bg-slate-700 text-white">
                      <span>Acessar Portal do Cliente</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO 1: SERVIÇOS TÉCNICOS */}
      <section id="servicos" className="py-20 md:py-28 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Especialização em Campo</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Serviços de Manutenção Elétrica & Eletrônica CNC
            </p>
            <p className="text-slate-400 text-base">
              Atendimento técnico completo para demandas elétricas de usinagens, metalúrgicas e indústrias em geral.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-primary/5">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit border border-primary/20">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Manutenção Corretiva Emergencial</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Atendimento ágil para paradas de máquina. Diagnóstico preciso em comandos CNC, acionamentos, drives, servo drivers, fontes e painéis elétricos industriais.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Busca de falhas em alarmes e sensores</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Substituição e parametrização de módulos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-primary/5">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit border border-primary/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Manutenção Preventiva & Preditiva</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Planos periódicos de revisão eletroeletrônica, identificando desgastes antes que ocorra a quebra, garantindo a continuidade da produção fabril.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Limpeza técnica especializada de painéis</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Teste de isolamento e conexões de potência</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-primary/5">
              <CardContent className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit border border-primary/20">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Adequação Elétrica & Retrofit</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Modernização de comando e painéis de máquinas operatrizes antigas, reorganização de infraestrutura elétrica e adequação a normas técnicas.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Esquemas elétricos atualizados</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Reestruturação de fiação e sinalizadores</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SEÇÃO DIFERENCIAIS (NOVA SEÇÃO ANCORADA) */}
      <section id="diferenciais" className="py-20 md:py-28 border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Por Que a T-MAINT?</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Diferenciais que Elevam a Gestão da Sua Fábrica
            </p>
            <p className="text-slate-400 text-base">
              A união definitiva entre experiência prática de campo e tecnologia de ponta em gestão industrial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit border border-blue-500/20">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Especialização em Comandos & Usinagem</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Diagnóstico aprofundado em multimarcas (Okuma, Fanuc, Fagor, Mazak, Mitsubishi, MCS) e elétrica industrial pesada.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Relatórios Técnicos Padronizados</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Documentação fotográfica antes/depois, detalhamento de peças trocadas e fechamento de horas em PDF para arquivo técnico.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit border border-purple-500/20">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Portal do Cliente com Histórico de Máquinas</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Acesse a "ficha médica" digital de cada equipamento da sua empresa, consultando manutenções passadas a qualquer momento.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Apuração Justa e Transparente</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Registro detalhado de horários de viagem e serviço, com opção de desconto de horário de almoço faturado ao cliente.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Segurança do Trabalho & Compliance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Controle rigoroso de ASO, NRs dos técnicos e entrega de EPIs, garantindo conformidade total para entrada em plantas industriais.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit border border-rose-500/20">
                <Gauge className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Foco na Redução de Paradas</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Identificação ágil da causa-raiz das falhas, minimizando o tempo de máquina parada (MTTR) e evitando paradas repetitivas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: PLATAFORMA T-MAINT */}
      <section id="plataforma" className="py-20 md:py-28 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Tecnologia Exclusiva</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Plataforma T-MAINT: Gestão Inteligente ao Seu Alcance
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Esqueça ordens de serviço em papel e informações perdidas no WhatsApp. O T-MAINT traz uma gestão transparente e profissional para o seu parque fabril.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Relatórios Fotográficos e Técnicos em PDF</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Evidências de fotos antes/depois, detalhamento de peças trocadas e fechamento claro de horas faturadas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Histórico Digital de Paradas por Equipamento</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Consulte a "ficha médica" de qualquer torno ou centro de usinagem com 1 clique para identificar falhas reincidentes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Controle Rígido de Horas & Deslocamento</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Regras transparentes de horas normais, extras e desconto opcional de horário de almoço faturado ao cliente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/login">
                  <Button size="lg" className="gap-2 font-bold px-6 shadow-lg shadow-primary/20">
                    <LogIn className="h-5 w-5" /> Entrar no Portal / Sistema
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400">
                  <span className="font-semibold text-white">Visualização de Ordem de Serviço</span>
                  <span>OS #2026-08</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Cliente</div>
                      <div className="font-bold text-slate-200 mt-0.5">Usinagem Metalúrgica Brasil</div>
                    </div>
                    <div className="p-3 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Equipamento</div>
                      <div className="font-bold text-slate-200 mt-0.5">Centro Usinagem CNC (Fanuc / Okuma)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-primary uppercase font-bold">Serviço Executado</div>
                    <p className="text-slate-300">Substituição do módulo de potência do eixo Z e parametrização de ganho de malha fechada.</p>
                  </div>

                  <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 flex justify-between items-center">
                    <span>Desconto de Almoço Aplicado</span>
                    <span className="font-bold">-1.0h (Não cobrado do cliente)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO NOVO: PARA EMPRESAS & ASSISTÊNCIAS TÉCNICAS (SAAS / ADQUIRIR O SISTEMA) */}
      <section id="software" className="py-20 md:py-28 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
                  <Laptop className="h-3.5 w-3.5" /> Software de Gestão para Prestadores e Equipes Internas
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Quer Utilizar a Plataforma T-MAINT na Sua Empresa?
                </h2>

                <p className="text-slate-300 text-base leading-relaxed">
                  Se você possui uma <strong>empresa de manutenção</strong>, <strong>assistência técnica</strong> ou uma <strong>equipe própria de manutenção industrial</strong>, você pode contratar o T-MAINT como software (SaaS). Tenha controle completo de ordens de serviço, técnicos de campo, documentação de ASO/NRs, estoque e portal para seus próprios clientes.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Gestão completa de OS e atendimentos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Portal do Cliente personalizado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Relatórios fotográficos automáticos em PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Controle de estoque, peças e técnicos</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-4">
                <a
                  href={whatsappUrlSoftware}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full sm:w-auto gap-2 font-bold px-8 h-12 bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-xl shadow-cyan-500/20">
                    <Phone className="h-4 w-4" /> Conhecer os Planos
                  </Button>
                </a>
                <p className="text-[11px] text-slate-400 text-center lg:text-right">
                  Planos flexíveis para profissionais autônomos e equipes corporativas.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: DÚVIDAS FREQUENTES (FAQ) */}
      <section id="faq" className="py-20 md:py-28 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Tire Suas Dúvidas</h2>
            <p className="text-3xl font-extrabold text-white tracking-tight">Perguntas Frequentes</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center font-bold text-white text-base hover:bg-slate-900/80 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`h-5 w-5 text-primary transition-transform ${activeFaq === idx ? "rotate-90" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 text-sm text-slate-300 border-t border-slate-800/60 bg-slate-950/40 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoTmaint} alt="T-MAINT" className="h-8 w-8 object-contain" />
            <span className="font-bold text-white text-base">T-MAINT</span>
            <span className="text-xs text-slate-500">· Soluções em Manutenção Elétrica CNC & Gestão Industrial</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
            <a href="#diferenciais" className="hover:text-white transition-colors">Diferenciais</a>
            <a href="#plataforma" className="hover:text-white transition-colors">Sistema</a>
            <a href="#software" className="hover:text-white transition-colors">Adquirir Software</a>
            <Link to="/login" className="hover:text-white text-primary font-semibold transition-colors flex items-center gap-1">
              <LogIn className="h-3.5 w-3.5" /> Área de Login
            </Link>
          </div>

          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} T-MAINT. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
