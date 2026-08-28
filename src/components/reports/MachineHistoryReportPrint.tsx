import React, { forwardRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ServiceReport, Settings, ServiceSession } from "@/lib/api";
import { reportTotalsWithSessions, fmtHours, cleanObservation } from "@/lib/api";

type MachineHistoryReportPrintProps = {
  clientName: string;
  machineTitle?: string;
  reports: ServiceReport[];
  settings: Settings;
  period?: { from?: string; to?: string };
  sessions?: ServiceSession[];
};

export const MachineHistoryReportPrint = forwardRef<HTMLDivElement, MachineHistoryReportPrintProps>(({
  clientName,
  machineTitle,
  reports = [],
  settings,
  period,
  sessions = [],
}, ref) => {
  const sessionsByActivity = new Map<string, ServiceSession[]>();
  for (const s of sessions) {
    if (!sessionsByActivity.has(s.activityId)) {
      sessionsByActivity.set(s.activityId, []);
    }
    sessionsByActivity.get(s.activityId)!.push(s);
  }

  let totalServiceHours = 0;
  let totalDowntimeHours = 0;
  let corretivasCount = 0;
  let preventivasCount = 0;

  const rows = reports.map((r) => {
    const actSessions = sessionsByActivity.get(r.id) ?? [];
    const t = reportTotalsWithSessions(r, actSessions);
    const rDowntime = (r.downtimeHours || 0) + actSessions.reduce((acc, s) => acc + (s.downtimeHours || 0), 0);

    totalServiceHours += t.totalHours;
    totalDowntimeHours += rDowntime;
    if (r.type === "preventiva") preventivasCount++;
    else corretivasCount++;

    return {
      report: r,
      totals: t,
      downtime: rDowntime,
    };
  });

  return (
    <div
      ref={ref}
      className="bg-white text-slate-800 p-8 font-sans w-full max-w-[210mm] mx-auto"
      style={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif" }}
    >
      {/* HEADER */}
      <header className="flex justify-between items-start border-b-[3px] border-[#003B73] pb-6 mb-6">
        <div className="flex items-center gap-5">
          {settings.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="max-h-16 w-auto object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-black text-[#002b5e] m-0 tracking-tight">
              {settings.companyName || "Relatório Técnico de Manutenção"}
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {[settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone, settings.address].filter(Boolean).join("  •  ")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-[#003B73] text-white px-3.5 py-1.5 rounded-md font-bold text-sm inline-block mb-1 shadow-sm">
            {machineTitle ? "HISTÓRICO DO EQUIPAMENTO" : "HISTÓRICO GERAL DE MANUTENÇÃO"}
          </div>
          <p className="text-xs text-slate-500">
            Emitido em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </header>

      {/* METADADOS / IDENTIFICAÇÃO */}
      <section className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Cliente</span>
          <span className="text-base font-bold text-slate-900">{clientName || "—"}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Equipamento / Escopo</span>
          <span className="text-base font-bold text-slate-900">{machineTitle || "Todos os Equipamentos"}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Período de Apuração</span>
          <span className="text-sm font-semibold text-slate-700">
            {period?.from || period?.to
              ? `${period.from ? format(new Date(period.from + "T00:00:00"), "dd/MM/yyyy") : "Início"} até ${period.to ? format(new Date(period.to + "T00:00:00"), "dd/MM/yyyy") : "Hoje"}`
              : "Histórico Completo"}
          </span>
        </div>
      </section>

      {/* KPI SUMMARY CARDS */}
      <section className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500">Ordens de Serviço</span>
          <p className="text-xl font-extrabold text-[#003B73] mt-0.5">{reports.length}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500">Horas Técnicas</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{fmtHours(totalServiceHours)}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500">Parada de Máquina</span>
          <p className="text-xl font-extrabold text-amber-700 mt-0.5">{fmtHours(totalDowntimeHours)}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500">Corretivas / Prev.</span>
          <p className="text-base font-extrabold text-slate-800 mt-1">
            <span className="text-rose-600">{corretivasCount} C</span> / <span className="text-emerald-600">{preventivasCount} P</span>
          </p>
        </div>
      </section>

      {/* TABELA DE ATENDIMENTOS */}
      <section className="mb-8">
        <table className="w-full border-collapse text-left text-xs" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr className="bg-[#003B73] text-white">
              <th className="p-2.5 font-bold rounded-tl-md w-[50px]">OS</th>
              <th className="p-2.5 font-bold w-[75px]">Data</th>
              <th className="p-2.5 font-bold w-[120px]">Equipamento</th>
              <th className="p-2.5 font-bold w-[75px]">Tipo</th>
              <th className="p-2.5 font-bold w-[105px]">Técnico</th>
              <th className="p-2.5 font-bold w-[65px] text-center">Horas OS</th>
              <th className="p-2.5 font-bold w-[65px] text-center">Parada</th>
              <th className="p-2.5 font-bold rounded-tr-md">Resumo Técnico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map(({ report: r, totals: t, downtime }, index) => {
              const isPreventive = r.type === "preventiva";
              const summaryText = r.summary || cleanObservation(r.observation) || r.description || "—";
              return (
                <tr
                  key={r.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                  style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                >
                  <td className="p-2.5 font-mono font-bold text-slate-900">
                    #{r.orderNumber || r.id.substring(0, 6)}
                  </td>
                  <td className="p-2.5 text-slate-700 whitespace-nowrap">
                    {format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}
                  </td>
                  <td className="p-2.5 font-semibold text-slate-900 break-words">
                    {r.machine || "—"}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isPreventive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isPreventive ? "Preventiva" : "Corretiva"}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-700 truncate" title={r.technician}>
                    {r.technician || "—"}
                  </td>
                  <td className="p-2.5 font-semibold text-slate-900 text-center whitespace-nowrap">
                    {fmtHours(t.totalHours)}
                  </td>
                  <td className="p-2.5 font-semibold text-amber-800 text-center whitespace-nowrap">
                    {downtime > 0 ? fmtHours(downtime) : "—"}
                  </td>
                  <td className="p-2.5 text-slate-600 leading-snug text-[11px] break-words">
                    {summaryText.length > 140 ? `${summaryText.slice(0, 140)}...` : summaryText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* FOOTER & ASSINATURA */}
      <footer className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
        <div>
          <div className="border-t border-slate-400 pt-2 w-3/4 mx-auto font-medium">
            {settings.companyName || "Responsável Técnico"}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Assinatura / Carimbo</p>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-2 w-3/4 mx-auto font-medium">
            {clientName || "Cliente"}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Confirmação de Recebimento</p>
        </div>
      </footer>
    </div>
  );
});

MachineHistoryReportPrint.displayName = "MachineHistoryReportPrint";
