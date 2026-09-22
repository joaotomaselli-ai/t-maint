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
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Brand Identity */}
        <a href="#" className="flex items-center gap-3 shrink-0 group">
          <div className="relative flex items-center justify-center">
            <img
              src={logoTmaint}
              alt="T-MAINT"
              className="h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-transform duration-200 group-hover:scale-105"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-white font-sans">
              T-MAINT
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 whitespace-nowrap">
              Industrial OS
            </span>
          </div>
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all whitespace-nowrap shadow-[0_0_10px_rgba(245,158,11,0.15)]"
            title="Atendimento técnico elétrico e diagnóstico em campo para máquinas CNC"
          >
            <Wrench className="h-3.5 w-3.5 text-amber-400" />
            <span>Atendimento CNC em Campo →</span>
          </Link>
        </nav>

        {/* Actions & Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Button
              onClick={() => navigate({ to: "/" })}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all px-4 h-9"
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
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all whitespace-nowrap"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Criar Conta
              </a>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors"
            aria-label="Abrir Menu"
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
                className="text-sm font-medium text-slate-200 hover:text-cyan-400 py-2 px-3 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 flex items-center justify-between transition-colors"
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
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs uppercase tracking-wider py-3"
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
