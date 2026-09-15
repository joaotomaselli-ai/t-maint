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
      <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 sm:p-6 relative overflow-hidden shadow-sm dark:shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                EVOLUÇÃO DE ATENDIMENTOS & HORAS
              </h3>
              <p className="text-[11px] text-muted-foreground">Histórico semestral consolidado do banco de dados</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500 dark:bg-cyan-400" /> Horas Técnicas
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded bg-sky-500 dark:bg-sky-400" /> Ordens de Serviço
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
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-popover-foreground bg-popover px-2 py-0.5 rounded border border-border whitespace-nowrap pointer-events-none mb-1 shadow-md z-10">
                  {item.hours}h • {item.orders} OS{item.orders === 1 ? "" : "s"}
                </div>

                {/* Bars Container */}
                <div className="w-full max-w-[38px] flex items-end justify-center gap-1 h-36 bg-muted/50 dark:bg-[#0B0F17]/60 rounded-lg p-1 border border-border/60 dark:border-[#1F293D]/50">
                  {/* Hours Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-sm transition-all duration-500 ${
                      item.hours > 0
                        ? isCurrent
                          ? "bg-gradient-to-t from-cyan-600 to-cyan-400 dark:from-cyan-500 dark:to-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                          : "bg-slate-300 hover:bg-cyan-500/70 dark:bg-slate-600 dark:hover:bg-cyan-500/70"
                        : "bg-muted-foreground/20 dark:bg-slate-800/60"
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span className={`text-[11px] font-mono ${isCurrent ? "text-cyan-600 dark:text-cyan-400 font-bold" : "text-muted-foreground"}`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribuição por Categoria CNC / Serviços (1 Col) */}
      <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 flex flex-col justify-between shadow-sm dark:shadow-md">
        <div>
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-border">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">DISTRIBUIÇÃO POR MÁQUINA</h3>
              <p className="text-[11px] text-muted-foreground">Demandas mais frequentes registradas</p>
            </div>
          </div>

          {/* Category Progress Bars or Empty State */}
          {categoryBreakdown.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center text-muted-foreground font-mono text-xs">
              <div className="p-3 rounded-xl bg-muted border border-border text-muted-foreground mb-2">
                <Wrench className="h-5 w-5" />
              </div>
              <p className="font-semibold text-foreground">Sem histórico de máquinas</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[210px]">
                Cadastre novas Ordens de Serviço para calcular o percentual por modelo de máquina.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground/90 font-medium truncate max-w-[190px]" title={cat.name}>
                      {cat.name}
                    </span>
                    <span className="font-bold text-foreground">{cat.count}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted dark:bg-[#0B0F17] rounded-full overflow-hidden border border-border/60 dark:border-[#1F293D]/60">
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

        <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>Total Mês: <strong className="text-cyan-600 dark:text-cyan-400">{totalOrdersMonth} Atendimentos</strong></span>
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {totalOrdersMonth > 0 ? "100% Auditado" : "Sem pendências"}
          </span>
        </div>
      </div>
    </div>
  );
}
