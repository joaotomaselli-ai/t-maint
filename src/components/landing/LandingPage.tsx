import { MessageCircle } from "lucide-react";
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
