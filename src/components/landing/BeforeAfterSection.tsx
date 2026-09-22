import { InteractiveComparison } from "@/components/ui/interactive-comparison";
import { AlertTriangle } from "lucide-react";

export function BeforeAfterSection() {
  const criticalQuestions = [
    {
      num: "01",
      question: "O que está aberto agora e qual é a prioridade real?",
      detail: "Sem visibilidade, emergências concorrem com chamados triviais e paradas de linha se prolongam.",
    },
    {
      num: "02",
      question: "Quem é o técnico responsável por cada máquina?",
      detail: "Sem atribuição clara, ordens de serviço ficam esquecidas ou sofrem retrabalho de múltiplos técnicos.",
    },
    {
      num: "03",
      question: "O que foi efetivamente executado no cliente?",
      detail: "Sem fotos antes/depois e laudo com assinatura na tela, clientes contestam serviços e horas gastas.",
    },
    {
      num: "04",
      question: "Quanto deve ser faturado ou pago sem erros de cálculo?",
      detail: "Sem registro de KM e cronômetro de campo, deslocamentos e horas extras evaporam da sua margem.",
    },
  ];

  return (
    <section id="comparativo" className="py-24 border-b border-slate-800/80 bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
            Diagnóstico Operacional
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            O problema da manutenção não é a falta de esforço.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-400">
              É a falta de visibilidade.
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Antes de contratar qualquer software, responda honestamente a estas 4 perguntas críticas da rotina técnica:
          </p>
        </div>

        {/* 4 Critical Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {criticalQuestions.map((q, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                    PERGUNTA {q.num}
                  </span>
                  <AlertTriangle className="h-4 w-4 text-amber-400/80" />
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {q.question}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-3 border-t border-slate-800/60 pt-3 leading-relaxed">
                {q.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Comparison Cards */}
        <InteractiveComparison />
      </div>
    </section>
  );
}
