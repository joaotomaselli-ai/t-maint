import { useState } from "react";
import { FileCheck2, BarChart3, Users, Share2, Shield, Clock, CheckCircle2, QrCode } from "lucide-react";

export function SoftwareShowcaseSection() {
  const [activeTab, setActiveTab] = useState<"cockpit" | "laudo" | "portal" | "orcamento">("cockpit");

  return (
    <section id="plataforma" className="py-24 border-b border-slate-800/80 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded bg-cyan-950/40">
            Por Dentro do Sistema
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engenharia de Software Criada para a Rotina de Manutenção
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Navegue pelos módulos principais do T-MAINT e entenda como cada tela resolve um gargalo real do técnico e do gestor.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={
              "px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer " +
              (activeTab === "cockpit"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800")
            }
          >
            <BarChart3 className="h-4 w-4" /> 1. Cockpit & Ordens de Serviço
          </button>
          <button
            onClick={() => setActiveTab("laudo")}
            className={
              "px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer " +
              (activeTab === "laudo"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800")
            }
          >
            <FileCheck2 className="h-4 w-4" /> 2. Laudos Instantâneos PDF
          </button>
          <button
            onClick={() => setActiveTab("portal")}
            className={
              "px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer " +
              (activeTab === "portal"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800")
            }
          >
            <Users className="h-4 w-4" /> 3. Portal B2B do Cliente
          </button>
          <button
            onClick={() => setActiveTab("orcamento")}
            className={
              "px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer " +
              (activeTab === "orcamento"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800")
            }
          >
            <Share2 className="h-4 w-4" /> 4. Orçamentos Rápidos
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {activeTab === "cockpit" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">Controle Operacional Total</span>
                <h3 className="text-2xl font-bold text-white mt-1">Cockpit em Tempo Real & Apontamento em Campo</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Gerencie todas as ordens de serviço preventivas e corretivas em um painel unificado. Monitore horas trabalhadas, quilometragem percorrida pelo técnico, intervalos e despesas de deslocamento de forma automatizada.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Visibilidade de O.S. abertas, em andamento e encerradas</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Cálculo automático de taxas por hora e quilômetro rodado</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Identificação rápida da máquina e histórico anterior</div>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
                  <span>ORDEM DE SERVIÇO #2026-089</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">EM ANDAMENTO</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Máquina:</span>
                    <strong className="text-white">Centro de Usinagem Romi D800</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Técnico Responsável:</span>
                    <strong className="text-cyan-400">João B. Tomaselli</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Horas Trabalhadas:</span>
                    <strong className="text-white">03h 45m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deslocamento:</span>
                    <strong className="text-white">84 km</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "laudo" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">Padronização Profissional</span>
                <h3 className="text-2xl font-bold text-white mt-1">Laudos Técnicos em PDF com Assinatura Digital</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Elimine pranchetas e canetas. Ao concluir a intervenção, o técnico colhe a assinatura do gerente diretamente na tela do smartphone e o sistema gera instantaneamente um laudo formal em PDF com fotos antes/depois.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Assinatura digital colhida no encerramento da O.S.</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Compressão automática e posicionamento de fotos</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Envio do link e PDF direto no WhatsApp do cliente</div>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
                  <span>LAUDO_TECNICO_FINAL.PDF</span>
                  <span className="text-cyan-400">GERADO EM 2.1s</span>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-white font-bold">✓ Diagnóstico: Falha no Encoder Eixo X substituído</div>
                  <div className="text-slate-400 text-[11px]">Evidências: 2 fotos do painel elétrico + 2 fotos do servodrive</div>
                  <div className="text-emerald-400 text-[11px]">Assinado por: Eng. Fábio Rezende (14/09/2026 17:30)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "portal" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">Transparência B2B</span>
                <h3 className="text-2xl font-bold text-white mt-1">Portal do Cliente com Acesso às Máquinas</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Seus clientes ganham um portal exclusivo onde visualizam o parque fabril, histórico completo de laudos, horas de parada (downtime) e botão direto para abrir chamados sem burocracia.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Login isolado para cada indústria cliente</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Histórico de cada máquina cadastrada</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Download de laudos e notas fiscais</div>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
                  <span>PORTAL CLIENTE: USINAGEM VALE</span>
                  <span className="text-emerald-400">ATIVO</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">Torno Okuma LB3000</div>
                      <div className="text-[11px] text-slate-400">Última intervenção: Preventiva 500h</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">OPERACIONAL</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">Centro Fanuc Robodrill</div>
                      <div className="text-[11px] text-slate-400">Última intervenção: Troca de fusível I/O</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">OPERACIONAL</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orcamento" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">Agilidade Comercial</span>
                <h3 className="text-2xl font-bold text-white mt-1">Orçamentos Rápidos & Disparo no WhatsApp</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Monte propostas comerciais em segundos, somando mão de obra técnica, peças de reposição e deslocamento. Converta propostas aprovadas em Ordens de Serviço com apenas um clique.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Cálculo automático de margens e impostos</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Link direto para envio no WhatsApp da diretoria</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Conversão imediata em O.S. ao ser aprovado</div>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
                  <span>ORÇAMENTO #ORC-2026-44</span>
                  <span className="text-amber-400">APROVADO PELO CLIENTE</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Mão de Obra Elétrica (8h):</span>
                    <strong className="text-white">R$ 1.600,00</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Peças (Sensor Indutivo + Fonte):</span>
                    <strong className="text-white">R$ 850,00</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Deslocamento (120 km):</span>
                    <strong className="text-white">R$ 240,00</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-base">
                    <span className="text-cyan-400 font-bold">TOTAL GERAL:</span>
                    <strong className="text-white">R$ 2.690,00</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
