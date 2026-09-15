import { Check, Phone, ArrowRight, Laptop } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface PricingAndContactSectionProps {
  whatsappUrlSoftware: string;
  whatsappUrlService: string;
}

export function PricingAndContactSection({
  whatsappUrlSoftware,
  whatsappUrlService,
}: PricingAndContactSectionProps) {
  return (
    <section id="planos" className="py-24 border-b border-slate-800/80 bg-slate-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
            Planos & Contratação
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Adquira o Software T-MAINT para sua Operação
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Escolha o plano ideal para gerenciar seus técnicos em campo e elevar o padrão dos seus laudos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* PLANO BÁSICO */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Essencial</div>
              <h3 className="text-2xl font-bold text-white mt-1">Básico</h3>
              <p className="text-xs text-slate-400 mt-2">Para técnicos autônomos e pequenas assistências.</p>
              <div className="mt-6 text-3xl font-extrabold text-white font-mono">
                R$ 197<span className="text-xs font-normal text-slate-400">/mês</span>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-slate-300 font-mono">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Até 2 Técnicos</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Emissão de O.S. Ilimitada</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Laudos Técnicos em PDF</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Cadastro de Clientes e Máquinas</li>
              </ul>
            </div>

            <a
              href={whatsappUrlSoftware}
              target="_blank"
              rel="noreferrer"
              className="mt-8 w-full block text-center py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-cyan-500/50 font-mono text-xs uppercase tracking-wider transition-all"
            >
              Contratar Essencial
            </a>
          </div>

          {/* PLANO PRO */}
          <div className="relative rounded-2xl bg-slate-900 border-2 border-cyan-500 p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
            <BorderBeam size={240} duration={8} colorFrom="#06b6d4" colorTo="#38bdf8" />

            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-widest z-10 shadow-md">
              Mais Recomendado
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">Profissional</div>
              <h3 className="text-2xl font-bold text-white mt-1">Pro Industrial</h3>
              <p className="text-xs text-slate-400 mt-2">Para oficinas de manutenção e assistências estruturadas.</p>
              <div className="mt-6 text-3xl font-extrabold text-white font-mono">
                R$ 397<span className="text-xs font-normal text-slate-400">/mês</span>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-slate-200 font-mono">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Até 10 Técnicos</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Orçamentos Rápidos no WhatsApp</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Etiquetas Machine QR Tag</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Painel de Deslocamento & Km</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Portal B2B do Cliente Liberado</li>
              </ul>
            </div>

            <a
              href={whatsappUrlSoftware}
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

          {/* PLANO ENTERPRISE */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Corporativo</div>
              <h3 className="text-2xl font-bold text-white mt-1">Elite Enterprise</h3>
              <p className="text-xs text-slate-400 mt-2">Para indústrias e grandes frotas de técnicos.</p>
              <div className="mt-6 text-3xl font-extrabold text-white font-mono">
                R$ 697<span className="text-xs font-normal text-slate-400">/mês</span>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-slate-300 font-mono">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Técnicos Ilimitados</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Todos os Recursos do Plano Pro</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Suporte Prioritário VIP</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400" /> Implantação e Treinamento Dedicado</li>
              </ul>
            </div>

            <a
              href={whatsappUrlSoftware}
              target="_blank"
              rel="noreferrer"
              className="mt-8 w-full block text-center py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-cyan-500/50 font-mono text-xs uppercase tracking-wider transition-all"
            >
              Falar com Especialista
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
