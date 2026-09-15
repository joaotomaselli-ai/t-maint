import { QrCode, Smartphone, History, ShieldAlert, ArrowRight, Check } from "lucide-react";

export function MachineQRTeaserSection() {
  return (
    <section id="qr-machines" className="py-24 border-b border-slate-800/80 bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
              Inovação Exclusiva T-MAINT
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Adesivo Inteligente Machine QR Tag no Painel da Máquina
            </h2>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Cada equipamento atendido ou cadastrado no T-MAINT pode receber uma etiqueta física com QR Code único. Ao apontar o celular, qualquer operador ou encarregado acessa a linha do tempo do equipamento e pode solicitar socorro com um clique.
            </p>

            <div className="mt-8 space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <Smartphone className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Acesso Instantâneo Sem Instalação de App</strong>
                  <span className="text-slate-400">Funciona diretamente na câmera do celular de qualquer colaborador.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <History className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Linha do Tempo & Histórico de Intervenções</strong>
                  <span className="text-slate-400">Visualização de todas as O.S., laudos anteriores e horas de parada (downtime).</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Botão de Socorro Imediato no WhatsApp</strong>
                  <span className="text-slate-400">Dispara chamado com dados exatos da máquina já preenchidos.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Mockup */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl">
              {/* Sticker Simulation */}
              <div className="p-5 rounded-xl bg-slate-950 border-2 border-dashed border-cyan-500/50 text-center font-mono">
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">ETIQUETA DE PAINEL CNC</div>
                <div className="mt-1 text-sm font-extrabold text-white">TORNO CNC OKUMA LB3000</div>
                <div className="text-[11px] text-slate-400">TAG: CNC-OKU-042 • USINAGEM VALE</div>

                <div className="my-5 p-4 rounded-xl bg-white w-36 h-36 mx-auto flex items-center justify-center shadow-lg">
                  <QrCode className="h-28 w-28 text-slate-950" />
                </div>

                <div className="text-[10px] text-slate-300">
                  Aponte a câmera para consultar histórico técnico ou solicitar suporte
                </div>
              </div>

              <div className="mt-5 text-center">
                <span className="text-xs font-mono text-cyan-400 flex items-center justify-center gap-1">
                  <span>Impressão de etiquetas disponível no sistema</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
