import { Check } from "lucide-react";
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
  const whatsappUrlBasico =
    "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20assinar%20o%20Plano%20B%C3%A1sico%20do%20T-MAINT.";
  const whatsappUrlPro =
    "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20assinar%20o%20Plano%20Pro%20Industrial%20do%20T-MAINT.";
  const whatsappUrlEnterprise =
    "https://wa.me/5547988485668?text=Ol%C3%A1!%20Gostaria%20de%20um%20diagn%C3%B3stico%20e%20proposta%20personalizada%20para%20o%20Plano%20Elite%20Enterprise.";

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
      </div>
    </section>
  );
}
