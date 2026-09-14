import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import logoTmaint from "@/assets/logo-tmaint-icon.png";
import {
  Menu,
  X,
  Laptop,
  BarChart3,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export function LandingNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Soluções", href: "#solucoes" },
    { label: "Antes vs. Depois", href: "#comparativo" },
    { label: "Plataforma", href: "#plataforma" },
    { label: "Serviços CNC", href: "#manutencao-cnc" },
    { label: "QR Tag Máquinas", href: "#qr-machines" },
    { label: "Especialista", href: "#autoridade" },
    { label: "Planos", href: "#planos", highlight: true },
    { label: "Dúvidas", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <a href="#" className="flex items-center gap-3 shrink-0 group">
          <div className="relative">
            <img
              src={logoTmaint}
              alt="T-MAINT"
              className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-transform group-hover:scale-105"
            />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              T-MAINT
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-400">
                Industrial OS
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Manutenção Especializada CNC & Gestão Técnica
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-medium text-slate-300">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className={
                "transition-colors hover:text-cyan-400 py-1 " +
                (link.highlight
                  ? "text-cyan-400 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30"
                  : "")
              }
            >
              {link.highlight && <Laptop className="h-3.5 w-3.5" />}
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions & Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Button
              onClick={() => navigate({ to: "/" })}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all px-4"
            >
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Painel de Controle
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate({ to: "/login" })}
                variant="outline"
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-500/50 font-mono text-xs uppercase tracking-wider transition-all px-3 sm:px-4"
              >
                Entrar
              </Button>
              <a
                href="#planos"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Criar Conta
              </a>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950/98 px-4 py-6 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-200 hover:text-cyan-400 py-2.5 px-3 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 flex items-center justify-between transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </a>
            ))}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate({ to: "/login" });
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider py-3"
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
