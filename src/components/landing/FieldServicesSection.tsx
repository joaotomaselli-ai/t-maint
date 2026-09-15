import { Wrench, Zap, Cog, Cpu, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface FieldServicesSectionProps {
  whatsappUrlService: string;
}

export function FieldServicesSection({ whatsappUrlService }: FieldServicesSectionProps) {
  const cncBrands = [
    { name: "Okuma", desc: "Comandos OSP / Motores & Drives" },
    { name: "Fanuc", desc: "Séries 0i / 31i / Motores Alpha" },
    { name: "Siemens", desc: "Sinumerik 808D / 828D / 840D" },
    { name: "Yaskawa", desc: "Servodrives Sigma V / VII" },
    { name: "Fagor", desc: "Comandos 8055 / 8065" },
    { name: "Mitsubishi", desc: "Meldas / M70 / M80" },
    { name: "Mazak", desc: "Mazatrol Matrix / Smooth" },
    { name: "Romi", desc: "Tornos CNC e Centros Mach" },
  ];

  return (
    <section id="manutencao-cnc" className="py-24 border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
            Atendimento Técnico Especializado
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Diagnóstico Elétrico em Campo & Ecossistema de Especialistas
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Atuação direta em campo para diagnosticar e solucionar falhas elétricas complexas em máquinas CNC, integrando parceiros homologados para intervenções mecânicas pesadas e laboratório de placas.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Diagnóstico Elétrico em Campo</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Intervenção direta na fábrica para diagnóstico de alarmes, réguas ópticas, encoders, sensores de fim de curso, relés de segurança e cabeamento.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Atendimento Presencial
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Parametrização & Retrofit</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Ajustes de parâmetros de malha, sintonia de servodrives, modernização de comandos obsoletos e adequação de rotinas lógicas no ladder do PLC.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Precisão & Estabilidade
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-4">
                <Cog className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Mecânica com Rede Homologada</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Trabalho coordenado com mecânicos industriais parceiros de altíssima confiança para ajuste de eixos, fusos de esferas, guias lineares e barramentos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Parceiros de Confiança
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Reparo Eletrônico em Bancada</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Intermediação técnica com laboratório eletrônico parceiro altamente especializado para reparo de servodrives, placas CNC, fontes e módulos I/O.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-purple-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Teste sob Carga Real
            </div>
          </div>
        </div>

        {/* Brand Matrix */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h4 className="text-lg font-bold text-white">Principais Fabricantes e Comandos Atendidos</h4>
            <p className="text-xs text-slate-400 font-mono mt-1">Conhecimento aprofundado nos protocolos e alarmes de cada fabricante</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {cncBrands.map((b, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-center hover:border-cyan-500/40 transition-colors">
                <div className="text-sm font-bold text-white">{b.name}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">{b.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href={whatsappUrlService}
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <ShimmerButton
                variant="teal"
                shimmerDuration="2.5s"
                className="text-xs uppercase tracking-wider py-3.5 px-8"
              >
                <Phone className="h-4 w-4 mr-2" /> Solicitar Diagnóstico em Campo no WhatsApp
              </ShimmerButton>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
