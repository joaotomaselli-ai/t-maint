"use client";

import React from "react";
import { TrendingUp, Cpu, Wrench, CheckCircle2 } from "lucide-react";

export interface MonthlyData {
  month: string;
  hours: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  count: number; // Percentage (0-100)
  color: string;
}

interface AnalyticsProps {
  monthlyHistory?: MonthlyData[];
  categoryBreakdown?: CategoryData[];
  totalHoursMonth: number;
  totalOrdersMonth: number;
}

export function CockpitAnalytics({
  monthlyHistory = [],
  categoryBreakdown = [],
  totalHoursMonth,
  totalOrdersMonth,
}: AnalyticsProps) {
  const maxHours = Math.max(...monthlyHistory.map((d) => d.hours), 1);

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
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                EVOLUÇÃO DE ATENDIMENTOS & HORAS
              </h3>
              <p className="text-[11px] text-slate-400">Histórico semestral consolidado do banco de dados</p>
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

        {/* Custom High-Precision Bar Graph */}
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
          {monthlyHistory.map((item, idx) => {
            const heightPercent = item.hours > 0 ? Math.max(Math.round((item.hours / maxHours) * 100), 8) : 4;
            const isCurrent = idx === monthlyHistory.length - 1;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-white bg-[#0B0F17] px-2 py-0.5 rounded border border-[#1F293D] whitespace-nowrap pointer-events-none mb-1 shadow-md z-10">
                  {item.hours}h • {item.orders} OS{item.orders === 1 ? "" : "s"}
                </div>

                {/* Bars Container */}
                <div className="w-full max-w-[38px] flex items-end justify-center gap-1 h-36 bg-[#0B0F17]/60 rounded-lg p-1 border border-[#1F293D]/50">
                  {/* Hours Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-sm transition-all duration-500 ${
                      item.hours > 0
                        ? isCurrent
                          ? "bg-gradient-to-t from-[#00F5D4]/80 to-[#00F5D4] shadow-[0_0_12px_rgba(0,245,212,0.4)]"
                          : "bg-slate-600 hover:bg-[#00F5D4]/70"
                        : "bg-slate-800/60"
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
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">DISTRIBUIÇÃO POR MÁQUINA</h3>
              <p className="text-[11px] text-slate-400">Demandas mais frequentes registradas</p>
            </div>
          </div>

          {/* Category Progress Bars or Empty State */}
          {categoryBreakdown.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#1F293D] text-slate-500 mb-2">
                <Wrench className="h-5 w-5 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-200">Sem histórico de máquinas</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[210px]">
                Cadastre novas Ordens de Serviço para calcular o percentual por modelo de máquina.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[190px]" title={cat.name}>
                      {cat.name}
                    </span>
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
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[#1F293D] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Total Mês: <strong className="text-[#00F5D4]">{totalOrdersMonth} Atendimentos</strong></span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {totalOrdersMonth > 0 ? "100% Auditado" : "Sem pendências"}
          </span>
        </div>
      </div>
    </div>
  );
}
