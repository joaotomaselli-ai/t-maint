import { useState } from "react";
import { MessageCircle, ChevronRight } from "lucide-react";
import { NoiseGridBackground } from "@/components/ui/noise-grid-background";
import { LandingNavbar } from "./LandingNavbar";
import { HeroSection } from "./HeroSection";
import { BeforeAfterSection } from "./BeforeAfterSection";
import { SoftwareShowcaseSection } from "./SoftwareShowcaseSection";
import { FieldServicesSection } from "./FieldServicesSection";
import { AuthoritySection } from "./AuthoritySection";
import { MachineQRTeaserSection } from "./MachineQRTeaserSection";
import { PricingAndContactSection } from "./PricingAndContactSection";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const whatsappUrlService = "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20diagn%C3%B3stico%20de%20manuten%C3%A7%C3%A3o%20para%20minha%20m%C3%A1quina%20CNC.";
  const whatsappUrlSoftware = "https://wa.me/5547988485668?text=Ol%C3%A1!%20Tenho%20interesse%20em%20conhecer%20os%20planos%20da%20plataforma%20T-MAINT%20para%20minha%20empresa.";

  const faqs = [
    {
      q: "Como funciona o atendimento de manutenção em máquinas CNC?",
      a: "Realizamos o atendimento técnico elétrico direto em campo para diagnóstico de alarmes, réguas ópticas, encoders, parametrização e testes operacionais. Para intervenções mecânicas pesadas e reparos de bancada de servodrives/placas, atuamos em conjunto com parceiros homologados e de extrema confiança.",
    },
    {
      q: "Quais marcas e comandos CNC são atendidos?",
      a: "Atendemos os principais fabricantes e comandos do mercado industrial, incluindo Okuma (OSP), Fanuc, Siemens (Sinumerik), Fagor, Yaskawa, Mazak, Mitsubishi, Romi e MCS.",
    },
    {
      q: "Como funciona o recurso de etiqueta QR Code (Machine Tag) nas máquinas?",
      a: "Você pode gerar e imprimir etiquetas adesivas diretamente no sistema para colar no painel elétrico de cada CNC. Qualquer operador ou gestor que apontar a câmera do celular acessa na hora o histórico da máquina, laudos anteriores e um botão para abrir chamado imediato no WhatsApp.",
    },
    {
      q: "Como funciona a contratação do software T-MAINT para outras empresas?",
      a: "O T-Maint é disponibilizado como serviço em nuvem. Empresas de manutenção, assistências técnicas e equipes internas podem contratar para gerenciar técnicos em campo, ordens de serviço, clientes, orçamentos rápidos e controle de estoque.",
    },
    {
      q: "O cliente da minha empresa pode acompanhar o histórico dos serviços?",
      a: "Sim. O T-Maint conta com o Portal do Cliente B2B, onde as indústrias acessam o histórico das máquinas, fotos antes/depois, laudos técnicos em PDF com assinatura digital e cronograma de preventivas.",
    },
    {
      q: "O software funciona em tablets e celulares no chão de fábrica?",
      a: "Sim, 100% otimizado para celulares e tablets. O técnico faz o apontamento de horas no local, fotografa o painel ou peça danificada e colhe a assinatura digital do encarregado diretamente na tela.",
    },
  ];

  return (
    <div className="min-h-screen relative bg-[#090D14] text-[#F3F4F6] font-sans selection:bg-cyan-400 selection:text-slate-950 overflow-x-hidden">
      {/* Dynamic Grid Background */}
      <NoiseGridBackground />

      {/* Floating WhatsApp Quick Contact */}
      <aside aria-label="Atendimento Rápido" className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <a
          href={whatsappUrlService}
          target="_blank"
          rel="noreferrer"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.45)] hover:border-cyan-400 transition-all"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <MessageCircle className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 transition-colors hidden sm:inline">
            Plantão Técnico CNC
          </span>
        </a>
      </aside>

      {/* 1. Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <HeroSection whatsappUrlService={whatsappUrlService} />

      {/* 3. Before vs. After Section */}
      <BeforeAfterSection />

      {/* 4. Software Showcase (Cockpit, Laudo, Portal, Orçamentos) */}
      <SoftwareShowcaseSection />

      {/* 5. Field Services & Partner Network */}
      <FieldServicesSection whatsappUrlService={whatsappUrlService} />

      {/* 6. Machine QR Tag Feature */}
      <MachineQRTeaserSection />

      {/* 7. Founder Authority (WEG & Mechatronics Background) */}
      <AuthoritySection />

      {/* 8. Pricing SaaS & Field Service Options */}
      <PricingAndContactSection
        whatsappUrlSoftware={whatsappUrlSoftware}
        whatsappUrlService={whatsappUrlService}
      />

      {/* 9. FAQ Section */}
      <section id="faq" className="py-24 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
              Perguntas Frequentes
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-white">Dúvidas Técnicas e Operacionais</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-white text-base">{f.q}</span>
                  <ChevronRight
                    className={
                      "h-5 w-5 text-cyan-400 transition-transform " +
                      (activeFaq === i ? "rotate-90" : "")
                    }
                  />
                </button>
                {activeFaq === i && (
                  <div className="p-5 pt-0 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 mt-2">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <LandingFooter whatsappUrlService={whatsappUrlService} />
    </div>
  );
}
