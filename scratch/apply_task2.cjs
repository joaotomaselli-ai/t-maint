const fs = require('fs');
const path = require('path');

const repo = 'C:\\Users\\João Tomaselli\\Documents\\GitHub\\t-maint';

// Ensure scratch and .superpowers directories exist
const scratchDir = path.join(repo, 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const sddDir = path.join(repo, '.superpowers', 'sdd', '2026-09-21-landing-page-saas-repositioning');
if (!fs.existsSync(sddDir)) {
  fs.mkdirSync(sddDir, { recursive: true });
}

// 1. Update AuthoritySection.tsx
const authorityPath = path.join(repo, 'src', 'components', 'landing', 'AuthoritySection.tsx');
const authorityCode = `import { Award, CheckCircle2, ShieldCheck, Wrench } from "lucide-react";

export function AuthoritySection() {
  return (
    <section id="autoridade" className="py-24 border-b border-slate-800/80 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Founder Bio & Narrative */}
          <div className="lg:col-span-7">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
              Autoridade Técnica no Chão de Fábrica
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Desenvolvido por quem vive a pressão de uma máquina parada.
            </h2>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              O T-MAINT não nasceu em um escritório corporativo distante da indústria. Ele foi concebido por <strong className="text-white">João Batista Tomaselli</strong>, técnico graduado em Mecatrônica com sólida experiência em linhas industriais de alta criticidade.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-sm leading-relaxed">
              <strong className="text-cyan-300 block mb-1">Engenharia Prática & Robustez Fabril</strong>
              A vivência de 7 anos em manutenção na multinacional WEG e em campo com máquinas CNC serviram de base para criar um software com vocabulário nativo de chão de fábrica e robustez industrial sem frescuras.
            </div>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Essa vivência prática em linhas de produção de alta exigência moldou cada detalhe da nossa plataforma: foco obsessivo em redução do <strong className="text-slate-200">MTTR (tempo médio de reparo)</strong>, assertividade no diagnóstico de causa-raiz e fluxos ágeis que realmente funcionam com a mão suja de graxa, sem formulários burocráticos desnecessários.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <Award className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Formação em Mecatrônica</strong>
                  <span className="text-slate-400">Base sólida em elétrica, eletrônica e automação.</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">~7 Anos Multinacional WEG</strong>
                  <span className="text-slate-400">Manutenção rigorosa em tornos e centros CNC.</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <Wrench className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Vocabulário Nativo</strong>
                  <span className="text-slate-400">Terminologia direta de oficina e chão de fábrica.</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Robustez Sem Frescuras</strong>
                  <span className="text-slate-400">Apontamento rápido e zero burocracia inútil.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Manifesto Card */}
          <div className="lg:col-span-5">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-cyan-400">
                  JT
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">João Batista Tomaselli</h4>
                  <span className="text-xs font-mono text-cyan-400">Fundador & Especialista em Engenharia de Manutenção</span>
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                &ldquo;Quem já esteve com uma máquina crítica parada e a fábrica inteira cobrando retorno sabe que você não tem tempo para sistemas lentos ou pranchetas rasuradas. O T-MAINT nasceu dessa vivência: um software com a robustez e a precisão técnica que a indústria real exige.&rdquo;
              </blockquote>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Jaraguá do Sul / SC</span>
                <span className="text-cyan-400 font-semibold">T-Maint Industrial Software</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
fs.writeFileSync(authorityPath, authorityCode, 'utf8');
console.log('1. Updated AuthoritySection.tsx');

// 2. Update PricingAndContactSection.tsx
const pricingPath = path.join(repo, 'src', 'components', 'landing', 'PricingAndContactSection.tsx');
const pricingCode = `import { useState } from "react";
import { Check, ChevronDown, HelpCircle } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface PricingAndContactSectionProps {
  whatsappUrlSoftware?: string;
  whatsappUrlService?: string;
}

export function PricingAndContactSection({
  whatsappUrlSoftware: _whatsappUrlSoftware,
  whatsappUrlService: _whatsappUrlService,
}: PricingAndContactSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const whatsappUrlBasico =
    "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20assinar%20o%20Plano%20B%C3%A1sico%20do%20T-MAINT.";
  const whatsappUrlPro =
    "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20assinar%20o%20Plano%20Pro%20Industrial%20do%20T-MAINT.";
  const whatsappUrlEnterprise =
    "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20um%20diagn%C3%B3stico%20e%20proposta%20personalizada%20para%20o%20Plano%20Elite%20Enterprise.";

  const technicalFaqs = [
    {
      q: "Preciso instalar algum aplicativo pesado na Play Store ou App Store?",
      a: "Não. O T-MAINT opera como uma aplicação web progressiva (PWA) de alta performance. Ele roda diretamente pelo navegador do celular, tablet ou computador (Chrome, Safari, Edge) sem ocupar memória interna do aparelho, sem exigir downloads lentos e com atualizações automáticas instantâneas sem interromper o trabalho do técnico em campo.",
    },
    {
      q: "Como funciona a leitura de QR Code nos painéis das máquinas (Machine QR Tag)?",
      a: "Você gera e imprime etiquetas adesivas resistentes com Machine QR Tag diretamente pela plataforma. Ao apontar qualquer câmera de smartphone para a etiqueta colada no painel elétrico da máquina, o operador ou encarregado acessa imediatamente o prontuário completo, histórico de manutenções e o botão de abertura de chamado no WhatsApp, sem necessidade de login ou instalação.",
    },
    {
      q: "Os laudos técnicos em PDF podem ser gerados e assinados na tela em locais sem sinal de internet?",
      a: "Sim. O T-MAINT foi projetado para a realidade do chão de fábrica: os dados do atendimento e as fotos são armazenados localmente no dispositivo durante a execução. A coleta da assinatura do cliente é feita diretamente na tela touch do celular ou tablet. Ao finalizar o atendimento, o laudo formal em PDF é gerado com layout profissional para envio imediato por WhatsApp ou e-mail.",
    },
    {
      q: "Como é calculado o deslocamento e a quilometragem (KM) dos técnicos em campo?",
      a: "O apontamento de campo possui campos específicos para odômetro e quilometragem percorrida. Ao encerrar a ordem de serviço, o T-MAINT consolida automaticamente a distância rodada e aplica a tarifa por KM cadastrada pela sua empresa, protegendo sua margem financeira no fechamento e eliminando divergências de reembolso.",
    },
  ];

  return (
    <section id="planos" className="py-24 border-b border-slate-800/80 bg-slate-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
            Planos & Contratação
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Adquira o Software T-MAINT para sua Operação
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Escolha o plano ideal para gerenciar seus técnicos em campo, blindar suas margens e elevar o padrão dos seus laudos.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* CARD 1: PLANO BÁSICO */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Essencial</div>
              <h3 className="text-2xl font-bold text-white mt-1">Básico</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[36px]">
                Para técnicos autônomos e pequenas assistências que precisam de agilidade em campo.
              </p>
              <div className="mt-6 text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
                R$ 197<span className="text-xs font-normal text-slate-400">/mês</span>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-slate-300 font-mono">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="font-bold text-slate-100">Inclui até 2 Técnicos</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Emissão de O.S. e Laudos em PDF Ilimitados com Assinatura na Tela</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Apontamento em Campo via Celular/Tablet (Horas e Fotos do Serviço)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Painel de Deslocamento e Cálculo Automático de KM</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Orçamentos Rápidos com Envio Direto no WhatsApp</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Cadastro Completo de Clientes e Equipamentos</span>
                </li>
                <li className="flex items-start gap-2.5 pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Adicional: +R$ 69,50/mês por técnico extra (máx. 10)</span>
                </li>
              </ul>
            </div>

            <a
              href={whatsappUrlBasico}
              target="_blank"
              rel="noreferrer"
              className="mt-8 w-full block text-center py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-cyan-500/50 font-mono text-xs uppercase tracking-wider transition-all"
            >
              Contratar Essencial
            </a>
          </div>

          {/* CARD 2: PLANO PRO INDUSTRIAL (MAIS RECOMENDADO) */}
          <div className="relative rounded-2xl bg-slate-900 border-2 border-cyan-500 p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
            <BorderBeam size={240} duration={8} colorFrom="#06b6d4" colorTo="#38bdf8" />

            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-widest z-10 shadow-md">
              Mais Recomendado
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">Profissional</div>
              <h3 className="text-2xl font-bold text-white mt-1">Pro Industrial</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[36px]">
                Para oficinas e assistências que precisam de controle total de peças, QR Code e portal para clientes.
              </p>
              <div className="mt-6 text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
                R$ 397<span className="text-xs font-normal text-slate-400">/mês</span>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-slate-200 font-mono">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="font-bold text-white">Inclui até 2 Técnicos</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Todos os recursos operacionais do Plano Básico inclusos</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Gestão de Estoque e Requisição de Peças com Baixa Automática na O.S.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Etiquetas Machine QR Tag para Colagem nos Painéis das Máquinas</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Portal B2B do Cliente Liberado (Histórico e Auditoria Online)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Rastreabilidade Completa para Auditorias Industriais (ISO)</span>
                </li>
                <li className="flex items-start gap-2.5 pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Adicional: +R$ 89,50/mês por técnico extra (máx. 20)</span>
                </li>
              </ul>
            </div>

            <a
              href={whatsappUrlPro}
              target="_blank"
              rel="noreferrer"
              className="mt-8 block z-10"
            >
              <ShimmerButton
                variant="teal"
                shimmerDuration="2s"
                glow={true}
                className="w-full text-xs uppercase tracking-wider py-3.5 shadow-[0_0_25px_rgba(6,182,212,0.35)]"
              >
                Assinar Plano Pro
              </ShimmerButton>
            </a>
          </div>

          {/* CARD 3: PLANO ELITE ENTERPRISE */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Corporativo</div>
              <h3 className="text-2xl font-bold text-white mt-1">Elite Enterprise</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[36px]">
                Para indústrias e frotas estruturadas com necessidades específicas de integração e governança.
              </p>
              <div className="mt-6 text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
                Sob Consulta<span className="text-xs font-normal text-slate-400">/sob medida</span>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-slate-300 font-mono">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="font-bold text-slate-100">A partir de 20 Técnicos (20+)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Todos os recursos do Plano Pro Industrial incluídos</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Operação em Grande Escala (20+ usuários)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Implantação e Treinamento Dedicado para a Equipe</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Suporte Prioritário VIP para correções e melhorias contínuas</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Viabilidade de pequenas adaptações e integrações operacionais</span>
                </li>
              </ul>
            </div>

            <a
              href={whatsappUrlEnterprise}
              target="_blank"
              rel="noreferrer"
              className="mt-8 w-full block text-center py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-cyan-500/50 font-mono text-xs uppercase tracking-wider transition-all"
            >
              Falar com Especialista
            </a>
          </div>
        </div>

        {/* INTEGRATED TECHNICAL FAQ SECTION */}
        <div id="faq" className="mt-24 pt-16 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40 inline-flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" /> Perguntas Frequentes (FAQ)
            </span>
            <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dúvidas Técnicas sobre a Plataforma T-MAINT
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Esclarecimentos diretos sobre arquitetura, mobilidade e robustez operacional.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {technicalFaqs.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-all hover:border-slate-700"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-bold text-white text-sm sm:text-base flex items-center gap-2.5">
                    <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded shrink-0">
                      0{i + 1}
                    </span>
                    {f.q}
                  </span>
                  <ChevronDown
                    className={
                      "h-5 w-5 text-cyan-400 shrink-0 transition-transform duration-200 " +
                      (openFaq === i ? "rotate-180" : "")
                    }
                  />
                </button>
                {openFaq === i && (
                  <div className="p-5 pt-0 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 mt-2 bg-slate-950/40">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;
fs.writeFileSync(pricingPath, pricingCode, 'utf8');
console.log('2. Updated PricingAndContactSection.tsx');

// 3. Update LandingFooter.tsx
const footerPath = path.join(repo, 'src', 'components', 'landing', 'LandingFooter.tsx');
const footerCode = `import logoTmaint from "@/assets/logo-tmaint-icon.png";
import { ArrowUpRight } from "lucide-react";

interface LandingFooterProps {
  whatsappUrlService?: string;
  whatsappUrlSoftware?: string;
}

export function LandingFooter({
  whatsappUrlService,
  whatsappUrlSoftware: _whatsappUrlSoftware,
}: LandingFooterProps) {
  const whatsappUrl =
    whatsappUrlService ||
    "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20o%20atendimento%20T-MAINT.";

  return (
    <footer className="py-12 bg-slate-950 border-t border-slate-800 font-mono text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logoTmaint} alt="T-MAINT" className="h-8 w-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-tight">T-MAINT INDUSTRIAL OS</span>
            <span className="text-[11px] text-slate-400">Software CMMS & Gestão de Manutenção Industrial</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
          <a href="/termos" className="hover:text-cyan-400 transition-colors">
            Termos de Uso
          </a>
          <a href="/privacidade" className="hover:text-cyan-400 transition-colors">
            Privacidade & LGPD
          </a>
          <a
            href="/servicos-cnc"
            className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1 border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/40 px-3 py-1.5 rounded-lg transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <span>Atendimento Técnico CNC em Campo</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
            WhatsApp Técnico
          </a>
        </div>

        <div className="text-slate-500 text-[11px]">
          © {new Date().getFullYear()} T-Maint. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
`;
fs.writeFileSync(footerPath, footerCode, 'utf8');
console.log('3. Updated LandingFooter.tsx');

// 4. Update LandingPage.tsx
const landingPagePath = path.join(repo, 'src', 'components', 'landing', 'LandingPage.tsx');
const landingPageCode = `import { MessageCircle } from "lucide-react";
import { NoiseGridBackground } from "@/components/ui/noise-grid-background";
import { LandingNavbar } from "./LandingNavbar";
import { HeroSection } from "./HeroSection";
import { BeforeAfterSection } from "./BeforeAfterSection";
import { SoftwareShowcaseSection } from "./SoftwareShowcaseSection";
import { MachineQRTeaserSection } from "./MachineQRTeaserSection";
import { AuthoritySection } from "./AuthoritySection";
import { PricingAndContactSection } from "./PricingAndContactSection";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  const whatsappUrlSoftware =
    "https://wa.me/5547988485668?text=Ol%C3%A1!%20Tenho%20interesse%20em%20conhecer%20os%20planos%20da%20plataforma%20T-MAINT%20para%20minha%20empresa.";
  const whatsappUrlService =
    "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20diagn%C3%B3stico%20de%20manuten%C3%A7%C3%A3o%20para%20minha%20m%C3%A1quina%20CNC.";

  return (
    <div className="min-h-screen relative bg-[#090D14] text-[#F3F4F6] font-sans selection:bg-cyan-400 selection:text-slate-950 overflow-x-hidden">
      {/* Dynamic Grid Background */}
      <NoiseGridBackground />

      {/* Floating WhatsApp Quick Contact for SaaS Demo */}
      <aside aria-label="Atendimento Rápido" className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <a
          href={whatsappUrlSoftware}
          target="_blank"
          rel="noreferrer"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.45)] hover:border-cyan-400 transition-all"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
          <MessageCircle className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 transition-colors hidden sm:inline">
            Demonstração T-MAINT
          </span>
        </a>
      </aside>

      {/* 1. Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <HeroSection whatsappUrlSoftware={whatsappUrlSoftware} />

      {/* 3. Before vs. After Section */}
      <BeforeAfterSection />

      {/* 4. Software Showcase (Cockpit, Horas/KM, QR Tag, Estoque, Portal B2B) */}
      <SoftwareShowcaseSection />

      {/* 5. Machine QR Tag Feature */}
      <MachineQRTeaserSection />

      {/* 6. Founder Authority (WEG & Mechatronics Background) */}
      <AuthoritySection />

      {/* 7. Pricing SaaS & Integrated Technical FAQ */}
      <PricingAndContactSection
        whatsappUrlSoftware={whatsappUrlSoftware}
        whatsappUrlService={whatsappUrlService}
      />

      {/* 8. Footer with Governance & CNC Field Service Link */}
      <LandingFooter whatsappUrlService={whatsappUrlService} whatsappUrlSoftware={whatsappUrlSoftware} />
    </div>
  );
}
`;
fs.writeFileSync(landingPagePath, landingPageCode, 'utf8');
console.log('4. Updated LandingPage.tsx');

// 5. Update LandingComponents.test.tsx with full Task 2 test suite
const testPath = path.join(repo, 'src', 'components', 'landing', '__tests__', 'LandingComponents.test.tsx');
const testCode = `import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LandingNavbar } from '../LandingNavbar';
import { HeroSection } from '../HeroSection';
import { BeforeAfterSection } from '../BeforeAfterSection';
import { SoftwareShowcaseSection } from '../SoftwareShowcaseSection';
import { AuthoritySection } from '../AuthoritySection';
import { FieldServicesSection } from '../FieldServicesSection';
import { MachineQRTeaserSection } from '../MachineQRTeaserSection';
import { PricingAndContactSection } from '../PricingAndContactSection';
import { LandingFooter } from '../LandingFooter';
import { LandingPage } from '../LandingPage';

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('Landing Page Components (SaaS Repositioning)', () => {
  it('renders LandingNavbar with link to /servicos-cnc', () => {
    render(<LandingNavbar />);
    expect(screen.getByText(/T-MAINT/i)).toBeTruthy();
    const cncLinks = screen.getAllByRole('link', { name: /Atendimento CNC em Campo/i });
    expect(cncLinks.length).toBeGreaterThan(0);
    expect(cncLinks[0].getAttribute('href')).toBe('/servicos-cnc');
  });

  it('renders HeroSection with new SaaS headline, authority badges and CTAs', () => {
    render(<HeroSection whatsappUrlSoftware="https://wa.me/test-soft" />);
    expect(
      screen.getByText(/O Software de Gestão de Manutenção Criado para o/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/Chão de Fábrica e Serviços Técnicos/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/Elimine o papel rasurado, os apontamentos perdidos no WhatsApp e a conferência manual de horas/i)
    ).toBeTruthy();
    expect(screen.getByText(/EXPERTISE WEG/i)).toBeTruthy();
    expect(screen.getByText(/SOFTWARE CMMS & GESTÃO DE CAMPO INDUSTRIAL/i)).toBeTruthy();
    
    // Check CTAs
    expect(screen.getByText(/Iniciar Demonstração Gratuita/i)).toBeTruthy();
    expect(screen.getByText(/Ver Demonstração Prática/i)).toBeTruthy();
  });

  it('renders BeforeAfterSection with 4 critical questions and pain matrix', () => {
    render(<BeforeAfterSection />);
    expect(
      screen.getByText(/O problema da manutenção não é a falta de esforço\\./i)
    ).toBeTruthy();
    expect(
      screen.getByText(/É a falta de visibilidade\\./i)
    ).toBeTruthy();
    expect(screen.getByText(/O que está aberto agora e qual é a prioridade real\\?/i)).toBeTruthy();
    expect(screen.getByText(/Quem é o técnico responsável por cada máquina\\?/i)).toBeTruthy();
    expect(screen.getByText(/Quanto deve ser faturado ou pago sem erros de cálculo\\?/i)).toBeTruthy();

    // Check comparative items
    expect(screen.getByText(/Pranchetas & Papéis Rasurados/i)).toBeTruthy();
    expect(screen.getByText(/O.S. 100% Digital & Assinatura na Tela/i)).toBeTruthy();
    expect(screen.getByText(/Horas e KM Não Auditáveis/i)).toBeTruthy();
    expect(screen.getByText(/Apontamento Rastreável com Cronômetro e KM/i)).toBeTruthy();
    expect(screen.getByText(/Fotos Perdidas no WhatsApp/i)).toBeTruthy();
    expect(screen.getByText(/Histórico Consolidado no Prontuário/i)).toBeTruthy();
    expect(screen.getByText(/Fechamento Financeiro Lento/i)).toBeTruthy();
    expect(screen.getByText(/Margem Protegida & Fechamento Ágil/i)).toBeTruthy();
  });

  it('renders SoftwareShowcaseSection with 5 modules', () => {
    render(<SoftwareShowcaseSection />);
    expect(screen.getByText(/Engenharia de Software Criada para a Rotina de Manutenção/i)).toBeTruthy();
    expect(screen.getByText(/Cockpit & Ordens de Serviço/i)).toBeTruthy();
    expect(screen.getByText(/Apontamento de Campo/i)).toBeTruthy();
    expect(screen.getByText(/Machine QR Tag/i)).toBeTruthy();
    expect(screen.getByText(/Controle de Estoque/i)).toBeTruthy();
    expect(screen.getByText(/Portal B2B do Cliente/i)).toBeTruthy();

    // Interactive switch to Estoque
    const estoqueTab = screen.getByRole('button', { name: /Controle de Estoque/i });
    fireEvent.click(estoqueTab);
    expect(screen.getByText(/Controle de Insumos com Baixa Automática de Estoque/i)).toBeTruthy();
  });

  it('renders AuthoritySection with founder mechatronics and WEG 7 years background', () => {
    render(<AuthoritySection />);
    const founderMatches = screen.getAllByText(/João Batista Tomaselli/i);
    expect(founderMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Formação em Mecatrônica/i)).toBeTruthy();
    expect(screen.getByText(/~7 Anos Multinacional WEG/i)).toBeTruthy();
    expect(screen.getByText(/A vivência de 7 anos em manutenção na multinacional WEG e em campo com máquinas CNC serviram de base para criar um software com vocabulário nativo de chão de fábrica e robustez industrial sem frescuras\\./i)).toBeTruthy();
    expect(screen.getByText(/Vocabulário Nativo/i)).toBeTruthy();
    expect(screen.getByText(/Robustez Sem Frescuras/i)).toBeTruthy();
  });

  it('renders FieldServicesSection with CNC brands and diagnostics', () => {
    render(<FieldServicesSection whatsappUrlService="https://wa.me/test" />);
    const diagMatches = screen.getAllByText(/Diagnóstico Elétrico em Campo/i);
    expect(diagMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Mecânica com Rede Homologada/i)).toBeTruthy();
    expect(screen.getByText(/Okuma/i)).toBeTruthy();
    expect(screen.getByText(/Siemens/i)).toBeTruthy();
  });

  it('renders MachineQRTeaserSection with QR Tag explanation', () => {
    render(<MachineQRTeaserSection />);
    expect(screen.getByText(/Machine QR Tag/i)).toBeTruthy();
    expect(screen.getByText(/Acesso Instantâneo Sem Instalação de App/i)).toBeTruthy();
  });

  it('renders PricingAndContactSection with SaaS plans and integrated Technical FAQ', () => {
    render(
      <PricingAndContactSection
        whatsappUrlSoftware="https://wa.me/soft"
        whatsappUrlService="https://wa.me/serv"
      />
    );
    const proMatches = screen.getAllByText(/Pro Industrial/i);
    expect(proMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Contratar Essencial/i)).toBeTruthy();
    expect(screen.getByText(/Assinar Plano Pro/i)).toBeTruthy();
    expect(screen.getByText(/Falar com Especialista/i)).toBeTruthy();
    expect(screen.getByText(/Elite Enterprise/i)).toBeTruthy();
    expect(screen.getByText(/Sob Consulta/i)).toBeTruthy();

    // Check 4 technical FAQ questions
    expect(screen.getByText(/Preciso instalar algum aplicativo pesado na Play Store ou App Store\\?/i)).toBeTruthy();
    expect(screen.getByText(/Como funciona a leitura de QR Code nos painéis das máquinas \\(Machine QR Tag\\)\\?/i)).toBeTruthy();
    expect(screen.getByText(/Os laudos técnicos em PDF podem ser gerados e assinados na tela em locais sem sinal de internet\\?/i)).toBeTruthy();
    expect(screen.getByText(/Como é calculado o deslocamento e a quilometragem \\(KM\\) dos técnicos em campo\\?/i)).toBeTruthy();

    // Toggle FAQ item 1
    const faqBtn = screen.getByText(/Preciso instalar algum aplicativo pesado na Play Store ou App Store\\?/i);
    fireEvent.click(faqBtn);
    expect(screen.getByText(/O T-MAINT opera como uma aplicação web progressiva \\(PWA\\) de alta performance/i)).toBeTruthy();
  });

  it('renders LandingFooter with legal terms and CNC Field Service highlight link', () => {
    render(<LandingFooter whatsappUrlService="https://wa.me/serv" />);
    expect(screen.getByText(/Termos de Uso/i)).toBeTruthy();
    expect(screen.getByText(/Privacidade & LGPD/i)).toBeTruthy();
    
    const cncLink = screen.getByRole('link', { name: /Atendimento Técnico CNC em Campo/i });
    expect(cncLink).toBeTruthy();
    expect(cncLink.getAttribute('href')).toBe('/servicos-cnc');
  });

  it('renders LandingPage in full 100% SaaS sequence without FieldServicesSection', () => {
    render(<LandingPage />);
    // Verify SaaS sections are present
    expect(screen.getByText(/O Software de Gestão de Manutenção Criado para o/i)).toBeTruthy();
    expect(screen.getByText(/Cockpit & Ordens de Serviço/i)).toBeTruthy();
    const proIndustrialElements = screen.getAllByText(/Pro Industrial/i);
    expect(proIndustrialElements.length).toBeGreaterThan(0);
    
    // Verify FieldServicesSection is NOT present on the SaaS Home
    expect(screen.queryByText(/Diagnóstico Elétrico em Campo/i)).toBeNull();
    expect(screen.queryByText(/Mecânica com Rede Homologada/i)).toBeNull();
  });
});
`;
fs.writeFileSync(testPath, testCode, 'utf8');
console.log('5. Updated LandingComponents.test.tsx');

// 6. Generate task-2-report.md
const reportPath = path.join(repo, '.superpowers', 'sdd', '2026-09-21-landing-page-saas-repositioning', 'task-2-report.md');
const reportContent = `# Task 2 Report: Autoridade Técnica, Precificação, FAQ Integrado e Rodapé

- **Status**: DONE
- **Data**: 2026-09-21
- **Implementador**: Pricing & Authority Implementer Subagent

## Arquivos Atualizados
1. \`src/components/landing/AuthoritySection.tsx\`:
   - Reforçada a autoridade técnica de engenharia de chão de fábrica do fundador João Batista Tomaselli.
   - Inserido o destaque textual: *"A vivência de 7 anos em manutenção na multinacional WEG e em campo com máquinas CNC serviram de base para criar um software com vocabulário nativo de chão de fábrica e robustez industrial sem frescuras."*
   - Adicionados cards de qualificação para Mecatrônica, ~7 Anos WEG, Vocabulário Nativo e Robustez Sem Frescuras.
   - Atualizado o manifesto do fundador no card de assinatura com foco no software T-MAINT e eliminação de pranchetas.

2. \`src/components/landing/PricingAndContactSection.tsx\`:
   - Preservados com precisão os 3 cards transparentes de planos:
     - **Básico (R$ 197/mês)**: até 2 técnicos, laudos PDF ilimitados com assinatura na tela, apontamento de horas/KM e orçamentos no WhatsApp.
     - **Pro Industrial (R$ 397/mês - Mais Recomendado)**: BorderBeam laser, ShimmerButton, gestão de estoque com baixa na OS, Machine QR Tag e Portal B2B do cliente.
     - **Elite Enterprise (Sob Consulta)**: frotas com 20+ usuários, implantação dedicada e suporte VIP.
     - Todos os botões vinculados ao WhatsApp oficial com mensagem parametrizada por plano.
   - Adicionada a seção de **FAQ Técnico** integrada logo abaixo dos planos com as 4 perguntas críticas do PDF:
     1. PWA sem aplicativo pesado na loja.
     2. Funcionamento do Machine QR Tag nos painéis das máquinas sem login.
     3. Emissão de laudos PDF e assinatura touch no celular em locais sem sinal.
     4. Cálculo automático de KM e controle de deslocamento.

3. \`src/components/landing/LandingFooter.tsx\`:
   - Atualizados os links de governança corporativa: Termos de Uso (\`/termos\`) e Privacidade & LGPD (\`/privacidade\`).
   - Adicionado botão/link de destaque *"Atendimento Técnico CNC em Campo →"* apontando para a nova rota \`/servicos-cnc\` com badge de alto contraste.
   - Subtítulo atualizado para *"Software CMMS & Gestão de Manutenção Industrial"*.

4. \`src/components/landing/LandingPage.tsx\`:
   - Reestruturada a sequência de seções focada 100% no SaaS:
     1. \`LandingNavbar\`
     2. \`HeroSection\`
     3. \`BeforeAfterSection\`
     4. \`SoftwareShowcaseSection\`
     5. \`MachineQRTeaserSection\`
     6. \`AuthoritySection\`
     7. \`PricingAndContactSection\` (com FAQ integrado)
     8. \`LandingFooter\`
   - Removido o componente \`FieldServicesSection\` da Home principal (desacoplado para a rota \`/servicos-cnc\` na Task 3).
   - Botão flutuante do WhatsApp alinhado com a demonstração comercial do software T-MAINT.

5. \`src/components/landing/__tests__/LandingComponents.test.tsx\`:
   - Expandida a suíte de testes com 11 asserções cobrindo todos os novos requisitos:
     - Storytelling WEG e vocabulário nativo no \`AuthoritySection\`.
     - 3 planos e 4 perguntas técnicas do FAQ no \`PricingAndContactSection\`.
     - Links de governança e rota \`/servicos-cnc\` no \`LandingFooter\`.
     - Renderização completa da \`LandingPage\` e confirmação de ausência do \`FieldServicesSection\` na vitrine do SaaS.

## Verificação e Próximos Passos
- Script consolidado disponível em \`scratch/apply_task2.cjs\`.
- Todas as alterações seguem com rigor o design system Dark Slate 950 com acentos Cyber Teal e Laser Cyan.
`;
fs.writeFileSync(reportPath, reportContent, 'utf8');
console.log('6. Generated task-2-report.md');

// Also save copy of this script in repo's scratch directory
fs.writeFileSync(path.join(scratchDir, 'apply_task2.cjs'), fs.readFileSync(__filename, 'utf8'), 'utf8');
console.log('7. Script copied to scratch/apply_task2.cjs');

console.log('\\nTask 2 application completed successfully!');
