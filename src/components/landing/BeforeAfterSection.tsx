import { InteractiveComparison } from "@/components/ui/interactive-comparison";

export function BeforeAfterSection() {
  return (
    <section id="comparativo" className="py-24 border-b border-slate-800/80 bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
            Transformação Operacional
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Do Caos de Papel à Clareza Digital
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Arraste o comparador interativo abaixo e veja por que oficinas e técnicos que usam o T-MAINT eliminam retrabalho e faturam até 3x mais rápido.
          </p>
        </div>

        <InteractiveComparison />
      </div>
    </section>
  );
}
