import logoTmaint from "@/assets/logo-tmaint-icon.png";
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
