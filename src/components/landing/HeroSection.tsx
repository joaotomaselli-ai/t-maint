import { useState, useEffect } from "react";
import { Wrench, Laptop, Terminal, Cog, PenTool, Play, FileCheck2, RotateCcw, Award } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface HeroSectionProps {
  whatsappUrlService: string;
}

export function HeroSection({ whatsappUrlService }: HeroSectionProps) {
  const [simStep, setSimStep] = useState<"idle" | "running" | "signed" | "done">("idle");
  const [simSeconds, setSimSeconds] = useState(145);
  const [simKm] = useState(48);

  useEffect(() => {
    let interval: any;
    if (simStep === "running") {
      interval = setInterval(() => {
        setSimSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [simStep]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return "00h " + mins.toString().padStart(2, "0") + "m " + secs.toString().padStart(2, "0") + "s";
  };

  return (
    <section className="relative pt-14 pb-20 sm:pt-16 sm:pb-24 overflow-hidden border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Authority Pill Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs font-mono text-slate-300 shadow-inner">
            <Award className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-cyan-400 font-bold">EXPERTISE WEG</span>
            <span className="text-slate-600">|</span>
            <span className="truncate max-w-[260px] sm:max-w-none text-slate-300">
              MANUTENÇÃO ELÉTRICA CNC EM CAMPO & GESTÃO DIGITAL
            </span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Manutenção Especializada CNC & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200">
              Sistema Operacional de Gestão
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Atendimento técnico elétrico e diagnóstico em campo para máquinas CNC, rede integrada de parceiros mecânicos/eletrônicos e software definitivo para controle de O.S., laudos com assinatura digital e histórico por QR Code.
          </p>

          {/* Dual CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-sm">
            <a
              href={whatsappUrlService}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <ShimmerButton
                variant="teal"
                shimmerDuration="2.2s"
                glow={true}
                className="w-full sm:w-auto text-xs uppercase tracking-wider py-4 px-8"
              >
                <Wrench className="h-4 w-4 mr-2" /> Solicitar Atendimento Técnico CNC
              </ShimmerButton>
            </a>

            <a
              href="#planos"
              className="w-full sm:w-auto"
            >
              <ShimmerButton
                variant="dark"
                shimmerDuration="3s"
                glow={false}
                className="w-full sm:w-auto text-xs uppercase tracking-wider py-4 px-8 hover:border-cyan-500/60"
              >
                <Laptop className="h-4 w-4 text-cyan-400 mr-2" /> Conhecer a Plataforma SaaS
              </ShimmerButton>
            </a>
          </div>
        </div>

        {/* Interactive Live Simulator Cockpit */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-2xl backdrop-blur-md overflow-hidden">
            <BorderBeam size={280} duration={10} colorFrom="#06b6d4" colorTo="#38bdf8" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5 font-mono text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-white font-semibold flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  COCKPIT INTERATIVO DE ATENDIMENTO EM TEMPO REAL
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  EXPERIMENTE AO VIVO
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Machine & Timer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Máquina em Atendimento</div>
                  <div className="mt-1 text-base font-bold text-white flex items-center gap-2">
                    <Cog className="h-4 w-4 text-cyan-400" /> Torno CNC Romi Centur 30D
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">CLIENTE: Metalúrgica Industrial</div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Apontamento de Horas em Campo</div>
                  <div className="text-2xl font-mono font-extrabold text-cyan-400 tracking-tight mt-0.5">
                    {formatTime(simSeconds)}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                    <span>Deslocamento: <strong className="text-slate-200">{simKm} km</strong></span>
                    <span className="text-slate-600">•</span>
                    <span>Status: <strong className={simStep === "idle" ? "text-amber-400" : "text-emerald-400"}>
                      {simStep === "idle" ? "Pendente" : simStep === "running" ? "Em Execução" : "Concluído"}
                    </strong></span>
                  </div>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Assinatura Digital no Celular</div>
                  <div className="mt-2 h-20 rounded-lg border border-dashed border-slate-800 bg-slate-900/50 flex items-center justify-center relative overflow-hidden">
                    {simStep === "signed" || simStep === "done" ? (
                      <div className="text-center font-mono">
                        <span className="text-xs text-emerald-400 font-bold block">✓ Assinatura Validada na Tela</span>
                        <span className="text-[10px] text-slate-400 italic">Eng. Roberto M. (Gerência de Fábrica)</span>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-slate-500 font-mono flex items-center gap-1.5">
                        <PenTool className="h-3.5 w-3.5" /> Aguardando encerramento técnico
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                  <span>Fotos Antes/Depois: <strong className="text-white">4 Anexadas</strong></span>
                  <span className="text-emerald-400 font-bold">100% OK</span>
                </div>
              </div>

              {/* Control Action Buttons */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Fluxo de Ação Técnica
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {simStep === "idle" && (
                    <button
                      onClick={() => setSimStep("running")}
                      className="w-full py-2.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> 1. Iniciar Atendimento
                    </button>
                  )}

                  {simStep === "running" && (
                    <button
                      onClick={() => setSimStep("signed")}
                      className="w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all animate-pulse cursor-pointer"
                    >
                      <PenTool className="h-3.5 w-3.5" /> 2. Coletar Assinatura na Tela
                    </button>
                  )}

                  {simStep === "signed" && (
                    <button
                      onClick={() => setSimStep("done")}
                      className="w-full py-2.5 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                    >
                      <FileCheck2 className="h-3.5 w-3.5" /> 3. Gerar Laudo Técnico PDF
                    </button>
                  )}

                  {simStep === "done" && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-bold text-xs">
                      ✓ Laudo #OS-2026-0912 Gerado & Enviado no WhatsApp!
                    </div>
                  )}

                  {simStep !== "idle" && (
                    <button
                      onClick={() => {
                        setSimStep("idle");
                        setSimSeconds(145);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 flex items-center justify-center gap-1.5 text-[11px] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" /> Reiniciar Simulação
                    </button>
                  )}
                </div>

                <div className="mt-3 text-[10px] font-mono text-slate-500 text-center">
                  Veja como o fechamento de um laudo leva menos de 30 segundos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
