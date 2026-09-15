import logoTmaint from "@/assets/logo-tmaint-icon.png";

interface LandingFooterProps {
  whatsappUrlService: string;
}

export function LandingFooter({ whatsappUrlService }: LandingFooterProps) {
  return (
    <footer className="py-12 bg-slate-950 border-t border-slate-800 font-mono text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logoTmaint} alt="T-MAINT" className="h-8 w-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-tight">T-MAINT INDUSTRIAL OS</span>
            <span className="text-[11px] text-slate-400">Manutenção CNC Especializada & Software de Gestão</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-slate-400">
          <a href="/termos" className="hover:text-cyan-400 transition-colors">Termos de Uso</a>
          <a href="/privacidade" className="hover:text-cyan-400 transition-colors">Privacidade & LGPD</a>
          <a href={whatsappUrlService} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">WhatsApp Técnico</a>
        </div>

        <div className="text-slate-500 text-[11px]">
          © {new Date().getFullYear()} T-Maint. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
