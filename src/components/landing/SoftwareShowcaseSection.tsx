import { useState } from "react";
import {
  BarChart3,
  Clock,
  QrCode,
  PackageCheck,
  Users,
  CheckCircle2,
} from "lucide-react";

export function SoftwareShowcaseSection() {
  const [activeTab, setActiveTab] = useState<"cockpit" | "apontamento" | "qrtag" | "estoque" | "portal">("cockpit");

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
            Navegue pelos 5 módulos fundamentais do T-MAINT e entenda como cada tela resolve um gargalo real do técnico e do gestor industrial.
          </p>
        </div>

        {/* Navigation Tabs (5 Modules) */}
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
            onClick={() => setActiveTab("apontamento")}
            className={
              "px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer " +
              (activeTab === "apontamento"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800")
            }
          >
            <Clock className="h-4 w-4" /> 2. Apontamento de Campo
          </button>

          <button
            onClick={() => setActiveTab("qrtag")}
            className={
              "px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer " +
              (activeTab === "qrtag"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800")
            }
          >
            <QrCode className="h-4 w-4" /> 3. Machine QR Tag
          </button>

          <button
            onClick={() => setActiveTab("estoque")}
            className={
              "px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer " +
              (activeTab === "estoque"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800")
            }
          >
            <PackageCheck className="h-4 w-4" /> 4. Controle de Estoque
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
            <Users className="h-4 w-4" /> 5. Portal B2B do Cliente
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {/* Módulo 1: Cockpit & Ordens de Serviço */}
          {activeTab === "cockpit" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">Controle & Priorização SLA</span>
                <h3 className="text-2xl font-bold text-white mt-1">Cockpit de Ordens de Serviço & Fila Inteligente</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Gerencie todas as ordens de serviço preventivas e corretivas em um painel unificado com criticidade por cores (Urgente, Alta, Normal e Baixa). Proteja prazos de atendimento (SLA) e acabe com máquinas paradas sem diagnóstico.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Fila operacional unificada com SLA e cores de criticidade</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Alocação de técnicos com status em tempo real</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Histórico completo de intervenções anteriores da máquina</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
                  <span>FILA OPERACIONAL INTELIGENTE</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">SLA ATIVO</span>
                </div>
                
                {/* OS Item 1: Urgente */}
                <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/30 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      #OS-2026-104 • Torno Romi Centur 30D
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Técnico: João Tomaselli • Alarme Spindle</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] block">URGENTE</span>
                    <span className="text-[10px] text-rose-400 mt-1 block">SLA: 42min restantes</span>
                  </div>
                </div>

                {/* OS Item 2: Alta */}
                <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/30 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">#OS-2026-105 • Centro Fanuc Robodrill</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Técnico: Lucas Santos • Preventiva 500h</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] block">ALTA</span>
                    <span className="text-[10px] text-amber-400 mt-1 block">SLA: 04h 15m</span>
                  </div>
                </div>

                {/* OS Item 3: Normal */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">#OS-2026-106 • Fresadora Universal</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Técnico: Carlos Eduardo • Troca de Óleo</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 text-[10px] block">NORMAL</span>
                    <span className="text-[10px] text-emerald-400 mt-1 block">No prazo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Módulo 2: Apontamento de Campo */}
          {activeTab === "apontamento" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">Mobilidade Sem Burocracia</span>
                <h3 className="text-2xl font-bold text-white mt-1">Apontamento de Campo (Horas, KM e Deslocamento)</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  O técnico registra início, pausas e encerramento diretamente no celular ou tablet. Quilometragem e despesas de deslocamento são apuradas automaticamente para garantir faturamento justo e reembolso sem atritos.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Cronômetro inteligente para horas normais e extras</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Registro de KM e cálculo instantâneo de reembolso</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Assinatura digital colhida no encerramento da O.S.</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
                  <span>APONTAMENTO EM CAMPO #AP-882</span>
                  <span className="text-emerald-400 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> SINCRONIZADO</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Tempo Trabalhado:</span>
                    <strong className="text-xl text-cyan-400 font-extrabold">03h 45m 12s</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Deslocamento Ida/Volta:</span>
                    <strong className="text-white">84 km (R$ 168,00)</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Assinatura do Cliente:</span>
                    <strong className="text-emerald-400">✓ Eng. Roberto M. (Fábrica)</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                    <span className="text-slate-300 font-bold">Total Apurado:</span>
                    <strong className="text-white">R$ 918,00 auditado</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Módulo 3: Machine QR Tag */}
          {activeTab === "qrtag" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">Acesso Instantâneo Sem App</span>
                <h3 className="text-2xl font-bold text-white mt-1">Machine QR Tag & QR Tag do Cliente</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Gere etiquetas adesivas com QR Code diretamente no sistema para colar nos painéis das máquinas. Qualquer operador ou técnico aponta a câmera e acessa o prontuário completo, histórico de laudos e botão de chamado no WhatsApp.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Prontuário técnico completo na ponta dos dedos</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Funciona em qualquer smartphone sem precisar instalar aplicativo</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Botão rápido para abertura de chamado urgente</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
                  <span>PRONTUÁRIO PÚBLICO DA MÁQUINA</span>
                  <span className="text-cyan-400">ID: MC-ROMI-D800</span>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <QrCode className="h-5 w-5 text-cyan-400" />
                    Centro de Usinagem Romi D800
                  </div>
                  <div className="text-slate-400 text-[11px]">Comando: Siemens Sinumerik 828D • Setor: Usinagem Pesada</div>
                  <div className="text-emerald-400 text-[11px]">Última Intervenção: Preventiva 500h (Concluída em 18/08/2026)</div>
                  <div className="pt-2 border-t border-slate-800 flex gap-2">
                    <span className="px-2.5 py-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 text-[10px]">
                      Laudos Técnicos (4)
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[10px]">
                      Manuais Anexados
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Módulo 4: Controle de Estoque */}
          {activeTab === "estoque" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">Gestão de Materiais & Margem</span>
                <h3 className="text-2xl font-bold text-white mt-1">Controle de Insumos com Baixa Automática de Estoque</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Vincule peças, sensores, rolamentos e lubrificantes utilizados diretamente à Ordem de Serviço. O sistema realiza o abate imediato no saldo do almoxarifado, calcula o custo real dos materiais e impede perdas invisíveis.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Baixa imediata de peças e materiais no fechamento da O.S.</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Alerta de estoque mínimo para reposição programada</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Composição transparente do custo de insumos vs. faturado</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
                  <span>BAIXA DE MATERIAIS #OS-2026-104</span>
                  <span className="text-emerald-400">ESTOQUE ATUALIZADO</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">Sensor Indutivo M12 Balluff</div>
                      <div className="text-[10px] text-slate-400">Almoxarifado Principal • Saldo: 14 un</div>
                    </div>
                    <span className="text-rose-400 font-bold">- 2 un</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">Óleo Lubrificante ISO VG 68</div>
                      <div className="text-[10px] text-slate-400">Tambor Oficina • Saldo: 85 L</div>
                    </div>
                    <span className="text-rose-400 font-bold">- 5 L</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-300">
                    <span>Custo Total de Insumos:</span>
                    <strong className="text-white">R$ 480,00 (Apuração Automática)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Módulo 5: Portal B2B do Cliente */}
          {activeTab === "portal" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">Transparência Corporativa</span>
                <h3 className="text-2xl font-bold text-white mt-1">Portal B2B do Cliente & Prontidão para Auditorias ISO</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Seus clientes ganham um ambiente exclusivo com login seguro (Row Level Security) onde visualizam o parque fabril, linha do tempo das manutenções, disponibilidade de máquinas e download de laudos em PDF com assinatura digital.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Login exclusivo e isolado para cada indústria cliente</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Histórico auditável para atendimento a normas ISO 9001 / IATF</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Central de download de laudos, fotos e notas fiscais</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
                  <span>PORTAL CLIENTE: USINAGEM VALE LTDA</span>
                  <span className="text-emerald-400">ISO 9001 READY</span>
                </div>
                <div className="mt-4 space-y-2.5">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">Parque Fabril: 12 Máquinas</div>
                      <div className="text-[11px] text-slate-400">100% das manutenções em conformidade</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">OPERACIONAL</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">Laudo #OS-2026-0912</div>
                      <div className="text-[11px] text-slate-400">Assinado digitalmente por Eng. Roberto</div>
                    </div>
                    <span className="text-cyan-400 text-[11px]">Download PDF</span>
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
