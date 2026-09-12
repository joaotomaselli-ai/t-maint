"use client";

import React from "react";
import { BarChart3, TrendingUp, Cpu, Wrench, Clock, CheckCircle2 } from "lucide-react";

interface MonthlyData {
  month: string;
  hours: number;
  orders: number;
}

interface AnalyticsProps {
  monthlyHistory?: MonthlyData[];
  categoryBreakdown?: { name: string; count: number; color: string }[];
  totalHoursMonth: number;
  totalOrdersMonth: number;
}

export function CockpitAnalytics({
  monthlyHistory = [
    { month: "Abr", hours: 42, orders: 12 },
    { month: "Mai", hours: 58, orders: 18 },
    { month: "Jun", hours: 65, orders: 20 },
    { month: "Jul", hours: 78, orders: 24 },
    { month: "Ago", hours: 82, orders: 26 },
    { month: "Set", hours: 94, orders: 31 },
  ],
  categoryBreakdown = [
    { name: "Tornos CNC (Okuma/Romi)", count: 45, color: "#00F5D4" },
    { name: "Centros de Usinagem", count: 30, color: "#38BDF8" },
    { name: "Diagnóstico Elétrico / Alarmes", count: 15, color: "#F59E0B" },
    { name: "Preventivas Periódicas", count: 10, color: "#10B981" },
  ],
  totalHoursMonth,
  totalOrdersMonth,
}: AnalyticsProps) {
  const maxHours = Math.max(...monthlyHistory.map((d) => d.hours), 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gráfico de Evolução Mensal (2 Cols) */}
      <div className="lg:col-span-2 rounded-2xl bg-[#131A26] border border-[#1F293D] p-5 sm:p-6 relative overflow-hidden shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#1F293D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/20">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">EVOLUÇÃO DE ATENDIMENTOS & HORAS</h3>
              <p className="text-[11px] text-slate-400">Histórico de produtividade técnica semestral</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-[#00F5D4]" /> Horas Técnicas
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-[#38BDF8]" /> Ordens de Serviço
            </span>
          </div>
        </div>

        {/* Custom High-Precision SVG/CSS Bar Graph */}
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
          {monthlyHistory.map((item, idx) => {
            const heightPercent = Math.round((item.hours / maxHours) * 100);
            const isCurrent = idx === monthlyHistory.length - 1;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-white bg-[#0B0F17] px-2 py-0.5 rounded border border-[#1F293D] whitespace-nowrap pointer-events-none mb-1 shadow-md">
                  {item.hours}h • {item.orders} OSs
                </div>

                {/* Bars Container */}
                <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-36 bg-[#0B0F17]/60 rounded-lg p-1 border border-[#1F293D]/50">
                  {/* Hours Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-sm transition-all duration-500 ${
                      isCurrent
                        ? "bg-gradient-to-t from-[#00F5D4]/80 to-[#00F5D4] shadow-[0_0_12px_rgba(0,245,212,0.4)]"
                        : "bg-slate-700 group-hover:bg-[#00F5D4]/70"
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span className={`text-[11px] font-mono ${isCurrent ? "text-[#00F5D4] font-bold" : "text-slate-400"}`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribuição por Categoria CNC / Serviços (1 Col) */}
      <div className="rounded-2xl bg-[#131A26] border border-[#1F293D] p-5 sm:p-6 flex flex-col justify-between shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#1F293D]">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">DISTRIBUIÇÃO POR MÁQUINA</h3>
              <p className="text-[11px] text-slate-400">Demandas mais frequentes</p>
            </div>
          </div>

          {/* Category Progress Bars */}
          <div className="space-y-3.5 pt-1">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1.5 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[190px]">{cat.name}</span>
                  <span className="font-bold text-white">{cat.count}%</span>
                </div>
                <div className="h-2 w-full bg-[#0B0F17] rounded-full overflow-hidden border border-[#1F293D]/60">
                  <div
                    style={{ width: `${cat.count}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full transition-all duration-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#1F293D] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Total Mês: <strong className="text-[#00F5D4]">{totalOrdersMonth} Atendimentos</strong></span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Auditado
          </span>
        </div>
      </div>
    </div>
  );
}
