"use client";

import React, { useState } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileSpreadsheet, 
  Clock, 
  MessageSquareOff, 
  ShieldAlert,
  Smartphone,
  FileCheck2,
  BarChart3,
  ArrowRightLeft
} from "lucide-react";

export function InteractiveComparison() {
  const [activeMode, setActiveMode] = useState<"before" | "after" | "split">("split");

  const beforeItems = [
    {
      icon: FileSpreadsheet,
      title: "Pranchetas & Papéis Rasurados",
      desc: "Apontamento manual de horas e serviços perdidos na oficina ou esquecidos na mala do técnico.",
    },
    {
      icon: Clock,
      title: "Horas e KM Não Auditáveis",
      desc: "Sem comprovação real do horário de início e término das intervenções mecânicas/elétricas e deslocamento.",
    },
    {
      icon: MessageSquareOff,
      title: "Fotos Perdidas no WhatsApp",
      desc: "Comprovantes e fotos de peças defeituosas misturados em conversas pessoais sem histórico centralizado.",
    },
    {
      icon: ShieldAlert,
      title: "Fechamento Financeiro Lento",
      desc: "Dias perdidos conferindo notas fiscais, KM e horas extras, atrasando o faturamento e corroendo a margem líquida.",
    },
  ];

  const afterItems = [
    {
      icon: Smartphone,
      title: "O.S. 100% Digital & Assinatura na Tela",
      desc: "Emissão de Ordem de Serviço pelo celular com assinatura do cliente e laudo formal em PDF gerado na hora.",
    },
    {
      icon: Clock,
      title: "Apontamento Rastreável com Cronômetro e KM",
      desc: "Registro exato do tempo trabalhado e quilometragem com um toque, eliminando divergências de cobrança.",
    },
    {
      icon: FileCheck2,
      title: "Histórico Consolidado no Prontuário",
      desc: "Fotos antes/depois e intervenções vinculadas à máquina via QR Code, prontas para auditorias ISO e laudos.",
    },
    {
      icon: BarChart3,
      title: "Margem Protegida & Fechamento Ágil",
      desc: "Deslocamento, peças e horas apuradas automaticamente no encerramento da O.S., blindando o lucro da empresa.",
    },
  ];

  return (
    <div className="w-full">
      {/* Mode Switcher Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 rounded-xl bg-[#131A26] border border-[#1F293D] shadow-lg">
          <button
            onClick={() => setActiveMode("split")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeMode === "split"
                ? "bg-[#00F5D4] text-[#0B0F17] shadow-[0_0_15px_rgba(0,245,212,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Lado a Lado
          </button>
          <button
            onClick={() => setActiveMode("before")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeMode === "before"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <XCircle className="w-4 h-4" />
            Processo Tradicional
          </button>
          <button
            onClick={() => setActiveMode("after")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeMode === "after"
                ? "bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Com T-MAINT
          </button>
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BEFORE CARD */}
        {(activeMode === "split" || activeMode === "before") && (
          <div className={`relative rounded-2xl bg-[#131A26]/80 border border-rose-900/40 p-6 md:p-8 backdrop-blur-md overflow-hidden transition-all duration-300 ${
            activeMode === "before" ? "lg:col-span-2 max-w-3xl mx-auto w-full" : ""
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-rose-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Processo Tradicional
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Gargalos Operacionais
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Como a maioria das empresas de manutenção ainda opera</p>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {beforeItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0B0F17]/60 border border-rose-900/20 hover:border-rose-800/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Tag */}
            <div className="mt-6 pt-4 border-t border-[#1F293D] flex items-center justify-between text-xs text-rose-400/80 font-mono">
              <span>Status: Baixa rastreabilidade</span>
              <span>Risco de perdas financeiras</span>
            </div>
          </div>
        )}

        {/* AFTER CARD */}
        {(activeMode === "split" || activeMode === "after") && (
          <div className={`relative rounded-2xl bg-[#131A26]/90 border border-[#1F293D] p-6 md:p-8 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(0,245,212,0.06)] ${
            activeMode === "after" ? "lg:col-span-2 max-w-3xl mx-auto w-full" : ""
          }`}>
            {/* Feixe Laser BorderBeam em volta do card T-Maint */}
            <BorderBeam size={180} duration={9} delay={0} colorFrom="#00F5D4" colorTo="#3B82F6" />

            {/* Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#1F293D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Com a Plataforma T-MAINT
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30">
                      Padrão Industrial
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Eficiência, transparência e controle ponta a ponta</p>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {afterItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0B0F17]/80 border border-[#1F293D] hover:border-[#00F5D4]/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/10 text-[#00F5D4] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        {item.title}
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00F5D4]" />
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Tag */}
            <div className="mt-6 pt-4 border-t border-[#1F293D] flex items-center justify-between text-xs text-[#00F5D4] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse"></span>
                100% Digital & Auditado
              </span>
              <span>Margem líquida blindada</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
