import { Award, CheckCircle2, ShieldCheck } from "lucide-react";

export function AuthoritySection() {
  return (
    <section id="autoridade" className="py-24 border-b border-slate-800/80 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Founder Bio & Narrative */}
          <div className="lg:col-span-7">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
              Autoridade Técnica no Chão de Fábrica
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Desenvolvido por quem vive a pressão de uma máquina parada.
            </h2>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              O T-MAINT não nasceu em um escritório corporativo distante da indústria. Ele foi concebido por <strong className="text-white">João Batista Tomaselli</strong>, técnico graduado em Mecatrônica com cerca de <strong className="text-cyan-400">7 anos de experiência na manutenção de máquinas CNC e industriais na multinacional WEG</strong>.
            </p>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Essa vivência prática em linhas de produção de alta exigência moldou cada detalhe da nossa atuação: foco obsessivo em redução do <strong className="text-slate-200">MTTR (tempo médio de reparo)</strong>, assertividade no diagnóstico de causa-raiz e ferramentas que realmente funcionam com a mão suja de graxa.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <Award className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Formação em Mecatrônica</strong>
                  <span className="text-slate-400">Base sólida em elétrica, mecânica e automação.</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">~7 Anos Multinacional WEG</strong>
                  <span className="text-slate-400">Manutenção rigorosa em tornos e centros CNC.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Manifesto Card */}
          <div className="lg:col-span-5">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-cyan-400">
                  JT
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">João Batista Tomaselli</h4>
                  <span className="text-xs font-mono text-cyan-400">Fundador & Especialista em Manutenção CNC</span>
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                &ldquo;Uma máquina CNC parada custa milhares de reais por hora para a indústria. O T-MAINT existe para unir a precisão do diagnóstico elétrico em campo com uma gestão transparente e ágil que nunca deixa o cliente desamparado.&rdquo;
              </blockquote>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Jaraguá do Sul / SC</span>
                <span className="text-cyan-400 font-semibold">T-Maint Industrial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
