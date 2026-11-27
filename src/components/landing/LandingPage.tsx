import { MessageCircle } from "lucide-react";
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
    <div className="dark min-h-screen relative overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Contato rápido (WhatsApp) */}
      <aside aria-label="Contato rápido" className="fixed bottom-5 right-5 z-50">
        <a
          href={whatsappUrlSoftware}
          target="_blank"
          rel="noreferrer"
          aria-label="Falar com a equipe T-Maint no WhatsApp"
          className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessageCircle aria-hidden="true" className="h-4 w-4 text-success" />
          <span className="hidden sm:inline">Falar no WhatsApp</span>
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
