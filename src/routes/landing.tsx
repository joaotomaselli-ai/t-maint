import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";

export const Route = createFileRoute("/landing")({ component: LandingPage });

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const whatsappUrlService = "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20diagn%C3%B3stico%20de%20manuten%C3%A7%C3%A3o%20eletr%C3%B4nica%20para%20minha%20m%C3%A1quina%20CNC.";
  const whatsappUrlSoftware = "https://wa.me/5547988485668?text=Ol%C3%A1!%20Tenho%20interesse%20em%20conhecer%20os%20planos%20da%20plataforma%20T-MAINT%20para%20minha%20empresa.";

  const faqs = [
    {
      q: "Quais marcas de comando e eletrônica CNC são atendidas no serviço técnico?",
      a: "Atendemos os principais fabricantes globais de comando e acionamento, incluindo Okuma (OSP), Fanuc, Siemens (Sinumerik), Fagor, Yaskawa, Mazak (Mazatrol), Mitsubishi, Romi e MCS, abrangendo fontes chaveadas, servodrives, encoders e placas de controle.",
    },
    {
      q: "Como funciona a plataforma de software T-MAINT para outras empresas?",
      a: "O T-Maint é disponibilizado como SaaS (Software as a Service). Empresas de assistência técnica, prestadores de serviços industriais e equipes de manutenção interna podem contratar para gerenciar técnicos, clientes, emissão de O.S., orçamentos no WhatsApp e relatórios em PDF.",
    },
    {
      q: "O cliente da minha empresa pode acompanhar os históricos?",
      a: "Sim. O T-Maint possui o Portal do Cliente, onde as indústrias acessam fichas técnicas de cada máquina, fotos de evidências antes/depois, relatórios assinados digitalmente e cronograma de manutenções preventivas.",
    },
    {
      q: "Como é feita a emissão de orçamentos e relatórios técnicos?",
      a: "Em menos de 1 minuto, o técnico ou gestor preenche peças, serviços e deslocamento. O sistema calcula impostos/totais e gera uma proposta profissional com botão de compartilhamento direto no WhatsApp do cliente.",
    },
    {
      q: "O software funciona em tablets e celulares no campo?",
      a: "Sim, 100% responsivo e otimizado para navegadores mobile. O técnico faz o apontamento de horas no local, fotografa as máquinas e colhe a assinatura digital do cliente diretamente na tela do smartphone ou tablet.",
    },
  ];

  const cncBrands = [
    { name: "Okuma", tag: "OSP Series" },
    { name: "Fanuc", tag: "Alpha/i Series" },
    { name: "Siemens", tag: "Sinumerik" },
    { name: "Yaskawa", tag: "Sigma Drivers" },
    { name: "Fagor", tag: "8055 / 8065" },
    { name: "Mitsubishi", tag: "Meldas" },
    { name: "Mazak", tag: "Mazatrol" },
    { name: "Romi", tag: "CNC Machines" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F3F4F6] font-sans selection:bg-[#00F5D4] selection:text-[#0B0F17]">
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
                CNC Electronics & Maintenance SaaS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#solucoes" className="hover:text-[#00F5D4] transition-colors">Soluções</a>
            <a href="#bento" className="hover:text-[#00F5D4] transition-colors">Plataforma</a>
            <a href="#cnc" className="hover:text-[#00F5D4] transition-colors">Manutenção CNC</a>
            <a href="#planos" className="hover:text-[#00F5D4] text-[#00F5D4] transition-colors flex items-center gap-1">
              <Laptop className="h-3.5 w-3.5" /> Planos SaaS
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
        {/* Subtle Engineering Grid Background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#1F293D_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Live Telemetry Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#131A26] border border-[#1F293D] text-xs font-mono text-slate-300 shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5D4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F5D4]"></span>
              </span>
              <span className="text-[#00F5D4] font-semibold">ONLINE</span>
              <span className="text-slate-600">|</span>
              <span>TELEMETRIA & MANUTENÇÃO INDUSTRIAL DE PRECISÃO</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Manutenção Eletrônica CNC & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] via-teal-200 to-cyan-400">
                Plataforma de Gestão
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
              Diagnóstico de alta precisão em servodrives, tornos e centros de usinagem combinado ao software definitivo para controle de O.S., orçamentos no WhatsApp e relatórios técnicos.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-sm">
              <a
                href={whatsappUrlService}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-md bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-[#0B0F17] font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(0,245,212,0.3)] hover:shadow-[0_0_35px_rgba(0,245,212,0.45)] transition-all"
              >
                <Wrench className="h-4 w-4" /> Solicitar Manutenção CNC
              </a>
              <a
                href="#planos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-md bg-[#131A26] hover:bg-[#182232] text-[#F3F4F6] border border-[#1F293D] hover:border-[#00F5D4]/60 uppercase tracking-wider transition-all"
              >
                <Laptop className="h-4 w-4 text-[#00F5D4]" /> Conhecer o Software T-Maint
              </a>
            </div>
          </div>

          {/* COCKPIT HERO WIDGET (Interactive Mockup) */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="rounded-lg border border-[#1F293D] bg-[#131A26]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
              {/* Cockpit Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F293D] pb-4 mb-4 font-mono text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-slate-300 font-semibold">T-MAINT_LIVE_COCKPIT // v2.6.4</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-[#00F5D4]">● LATÊNCIA: 18ms</span>
                  <span>SSL: ATIVO</span>
                  <span>BANCO: POSTGRES_OK</span>
                </div>
              </div>

              {/* Cockpit Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-md bg-[#0B0F17] border border-[#1F293D]/80">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Última O.S. Gerada</div>
                  <div className="mt-1 text-lg font-mono font-bold text-white">#OS-2026-0912</div>
                  <div className="mt-2 text-xs text-slate-300">Torno CNC Okuma LB3000</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" /> Assinatura Digital OK
                  </div>
                </div>

                <div className="p-4 rounded-md bg-[#0B0F17] border border-[#1F293D]/80">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Diagnóstico Eletrônico</div>
                  <div className="mt-1 text-lg font-mono font-bold text-[#00F5D4]">SERVODRIVE FANUC</div>
                  <div className="mt-2 text-xs text-slate-300">Alarme 401 / IGBT Substituído</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">
                    <Zap className="h-3 w-3" /> Bancada de Teste 100%
                  </div>
                </div>

                <div className="p-4 rounded-md bg-[#0B0F17] border border-[#1F293D]/80">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Orçamento Comercial</div>
                  <div className="mt-1 text-lg font-mono font-bold text-white">R$ 4.850,00</div>
                  <div className="mt-2 text-xs text-slate-300">Envio WhatsApp Instantâneo</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Share2 className="h-3 w-3" /> Proposta Aprovada
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
            Especialistas Multimarcas em Automação e Eletrônica Industrial
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {cncBrands.map((b, i) => (
              <div key={i} className="p-3 rounded-md bg-[#131A26]/60 border border-[#1F293D] text-center hover:border-[#00F5D4]/40 transition-colors">
                <div className="text-sm font-bold text-white">{b.name}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{b.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENTO GRID SECTION (THE CORE INDUSTRIAL HIGHLIGHT) */}
      <section id="bento" className="py-24 border-b border-[#1F293D] bg-[#0B0F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#00F5D4] border border-[#00F5D4]/30 px-2.5 py-1 rounded bg-[#00F5D4]/10">
              Arquitetura de Alta Performance
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A Solução Completa para o Chão de Fábrica e Equipes Técnicas
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Desenvolvido com o rigor e a precisão exigidos pela indústria moderna.
            </p>
          </div>

          {/* THE BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* BENTO CARD 1 (Large - 2 Cols) */}
            <div className="md:col-span-2 rounded-lg bg-[#131A26] border border-[#1F293D] p-6 sm:p-8 relative overflow-hidden hover:border-[#00F5D4]/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2.5 rounded-md bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/20">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Módulo O.S. Digital</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Ordens de Serviço & Apontamento em Tempo Real</h3>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Controle exato de horas normais, extras, deslocamento e fotos de evidências. Assinatura do cliente colhida digitalmente no encerramento da intervenção com PDF padronizado.
              </p>

              <div className="mt-6 p-4 rounded-md bg-[#0B0F17] border border-[#1F293D] font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>⏱️ TEMPO DE SERVIÇO: <strong className="text-white">04h 30m</strong></span>
                  <span>🚗 DESLOCAMENTO: <strong className="text-white">120 km</strong></span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-[#1F293D]/60">
                  <span>CLIENTE: Usinagem Industrial Vale</span>
                  <span className="text-[#00F5D4]">RELATÓRIO ASSINADO ✓</span>
                </div>
              </div>
            </div>

            {/* BENTO CARD 2 (1 Col) */}
            <div className="rounded-lg bg-[#131A26] border border-[#1F293D] p-6 sm:p-8 hover:border-[#00F5D4]/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Cpu className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Laboratório CNC</span>
              </div>
              <h3 className="text-xl font-bold text-white">Reparo Eletrônico CNC</h3>
              <p className="mt-2 text-slate-400 text-sm">
                Manutenção e reparo em bancada para servodrives, placas de comando, módulos IGBT, fontes chaveadas e encoders multimarcas com testes sob carga.
              </p>
              <div className="mt-6 font-mono text-xs text-[#00F5D4] flex items-center gap-1">
                <span>VER PROTOCOLO DE TESTES</span> <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* BENTO CARD 3 (1 Col) */}
            <div className="rounded-lg bg-[#131A26] border border-[#1F293D] p-6 sm:p-8 hover:border-[#00F5D4]/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  <Package className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Estoque Inteligente</span>
              </div>
              <h3 className="text-xl font-bold text-white">Peças Críticas & QR Code</h3>
              <p className="mt-2 text-slate-400 text-sm">
                Kardex digital, aviso automático de estoque mínimo para reposição e rastreamento de peças por máquina através de etiquetas com QR Code.
              </p>
              <div className="mt-6 font-mono text-xs text-yellow-400 flex items-center gap-1">
                <span>CONTROLE DE ALMOXARIFADO</span> <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* BENTO CARD 4 (Large - 2 Cols) */}
            <div className="md:col-span-2 rounded-lg bg-[#131A26] border border-[#1F293D] p-6 sm:p-8 relative overflow-hidden hover:border-[#00F5D4]/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Share2 className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Comercial & Propostas</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Orçamentos Rápidos com Envio no WhatsApp</h3>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Crie orçamentos detalhados em menos de 1 minuto, com cálculo automático de serviços, peças, km e prazos de garantia. Converta orçamentos em Ordens de Serviço com apenas 1 clique.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
                <span className="px-3 py-1.5 rounded bg-[#0B0F17] border border-[#1F293D] text-slate-300">
                  ✓ DISPARO NO WHATSAPP COM LINK DIRETO
                </span>
                <span className="px-3 py-1.5 rounded bg-[#0B0F17] border border-[#1F293D] text-[#00F5D4]">
                  ✓ CONVERSÃO IMEDIATA EM O.S.
                </span>
                <span className="px-3 py-1.5 rounded bg-[#0B0F17] border border-[#1F293D] text-slate-300">
                  ✓ EXPORTAÇÃO PDF CORPORATIVO
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS & PRICING (SAAS) */}
      <section id="planos" className="py-24 border-b border-[#1F293D] bg-[#0B0F17]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#00F5D4] border border-[#00F5D4]/30 px-2.5 py-1 rounded bg-[#00F5D4]/10">
              Planos & Licenciamento
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Adquira a Plataforma T-MAINT para a sua Empresa
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Escolha a versão ideal para digitalizar e acelerar a sua equipe de manutenção.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* PLANO BÁSICO */}
            <div className="rounded-lg bg-[#131A26] border border-[#1F293D] p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
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
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Relatórios em PDF</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Cadastro de Clientes</li>
                </ul>
              </div>

              <a
                href={whatsappUrlSoftware}
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full block text-center py-3 rounded-md bg-[#0B0F17] hover:bg-[#182232] text-white border border-[#1F293D] hover:border-[#00F5D4]/50 font-mono text-xs uppercase tracking-wider transition-all"
              >
                Contratar Plano
              </a>
            </div>

            {/* PLANO PRO (DESTAQUE) */}
            <div className="rounded-lg bg-[#131A26] border-2 border-[#00F5D4] p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(0,245,212,0.15)] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-[#00F5D4] text-[#0B0F17] text-[10px] font-mono font-bold uppercase tracking-widest">
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
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Controle de Estoque com QR Code</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Painel Financeiro de Horas & Km</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Portal do Cliente Liberado</li>
                </ul>
              </div>

              <a
                href={whatsappUrlSoftware}
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full block text-center py-3.5 rounded-md bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-[#0B0F17] font-bold font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,245,212,0.3)] transition-all"
              >
                Conhecer os Planos
              </a>
            </div>

            {/* PLANO ELITE */}
            <div className="rounded-lg bg-[#131A26] border border-[#1F293D] p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Corporativo</div>
                <h3 className="text-2xl font-bold text-white mt-1">Elite Enterprise</h3>
                <p className="text-xs text-slate-400 mt-2">Para indústrias e grandes operações de campo.</p>
                <div className="mt-6 text-3xl font-extrabold text-white font-mono">
                  R$ 697<span className="text-xs font-normal text-slate-400">/mês</span>
                </div>

                <ul className="mt-8 space-y-3 text-sm text-slate-300 font-mono">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Técnicos Ilimitados</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Todos os Recursos do Pro</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Suporte Técnico Prioritário</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00F5D4]" /> Consultoria em Eletrônica CNC</li>
                </ul>
              </div>

              <a
                href={whatsappUrlSoftware}
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full block text-center py-3 rounded-md bg-[#0B0F17] hover:bg-[#182232] text-white border border-[#1F293D] hover:border-[#00F5D4]/50 font-mono text-xs uppercase tracking-wider transition-all"
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
                className="rounded-lg bg-[#131A26] border border-[#1F293D] overflow-hidden transition-colors"
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
            <span>— Soluções em Manutenção CNC & SaaS</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <a href="https://t-maint.com.br" className="hover:text-[#00F5D4] transition-colors">t-maint.com.br</a>
            <a href={whatsappUrlService} target="_blank" rel="noreferrer" className="hover:text-[#00F5D4] transition-colors">WhatsApp Suporte</a>
          </div>

          <div>
            © {new Date().getFullYear()} T-Maint. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
