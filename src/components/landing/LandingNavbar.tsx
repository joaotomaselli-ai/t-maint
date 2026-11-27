import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import {
  Menu,
  X,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export function LandingNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Soluções", href: "#solucoes" },
    { label: "Comparativo", href: "#comparativo" },
    { label: "Módulos", href: "#plataforma" },
    { label: "Autoridade", href: "#autoridade" },
    { label: "Planos", href: "#planos" },
    { label: "Dúvidas", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand Identity */}
        <a href="#" className="flex items-center gap-3 shrink-0 group">
          <img src={logoTmaint} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-base font-semibold tracking-tight text-foreground" translate="no">
            T-Maint
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="transition-colors hover:text-white py-1 whitespace-nowrap text-slate-300"
            >
              {link.label}
            </a>
          ))}

          {/* Dedicated CNC Services Route Link */}
          <Link
            to="/servicos-cnc"
            className="flex items-center gap-1.5 whitespace-nowrap py-1 text-slate-300 transition-colors hover:text-white"
            title="Atendimento técnico elétrico e diagnóstico em campo para máquinas CNC"
          >
            <Wrench aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Atendimento CNC em campo</span>
          </Link>
        </nav>

        {/* Actions & Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Button
              onClick={() => navigate({ to: "/" })}
              className="h-9 px-4"
            >
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Painel
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate({ to: "/login" })}
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-900 text-sm font-medium px-3.5 h-9 transition-colors"
              >
                Entrar
              </Button>
              <a
                href="#planos"
                className="hidden h-9 items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                Ver planos
              </a>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-brand-500/50 transition-colors"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 px-4 py-6 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-200 hover:text-brand-400 py-2 px-3 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 flex items-center justify-between transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </a>
            ))}

            <Link
              to="/servicos-cnc"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-amber-400 hover:text-amber-300 py-2.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-400" />
                Atendimento CNC em Campo →
              </span>
              <ChevronRight className="h-4 w-4 text-amber-500" />
            </Link>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate({ to: "/login" });
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-3"
              >
                Acessar Plataforma T-Maint
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
