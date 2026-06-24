import React, { forwardRef } from 'react';
import { format } from "date-fns";
import type { Client, ServiceReport, Settings, ServiceSession } from "@/lib/api";
import { fmtCurrency, fmtHours, reportTotalsWithSessions } from "@/lib/api";

type ClientReportPrintProps = {
  client: Client;
  reports: ServiceReport[];
  settings: Settings;
  sessions?: ServiceSession[];
  period?: { from?: string; to?: string };
};

export const ClientReportPrint = forwardRef<HTMLDivElement, ClientReportPrintProps>(({
  client, reports, settings, sessions = [], period
}, ref) => {

  const totals = reports.reduce((acc, r) => {
    const t = reportTotalsWithSessions(r, sessions, client);
    acc.hours += t.totalHours; acc.km += t.km; acc.total += t.total;
    acc.service += t.service; acc.travel += t.travelOut + t.travelBack;
    acc.hoursValue += t.hoursValue; acc.kmValue += t.kmValue;
    return acc;
  }, { hours: 0, service: 0, travel: 0, km: 0, hoursValue: 0, kmValue: 0, total: 0 });

  return (
    <div ref={ref} className="bg-white text-slate-800 p-8 font-sans w-full max-w-[210mm] mx-auto" style={{ fontFamily: "'Inter', 'Helvetica', sans-serif" }}>
      {/* HEADER */}
      <header className="flex justify-between items-start border-b-[3px] border-[#003B73] pb-6 mb-8">
        <div className="flex items-center gap-6">
          {settings.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="max-h-16 w-auto object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-black text-[#002b5e] m-0">{settings.companyName || "Relatório de Serviços"}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {[settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone, settings.address].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-[#003B73] text-white px-4 py-2 rounded-md font-bold text-lg inline-block mb-2">
            Relatório de Cliente
          </div>
          <p className="text-sm text-slate-500">Emitido em {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        </div>
      </header>

      {/* METADADOS */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Cliente</p>
          <p className="font-bold text-slate-800 text-lg">{client.name}</p>
          <p className="text-sm text-slate-600 mt-1">Valor/hora: {fmtCurrency(client.hourlyRate)} • Valor/km: {fmtCurrency(client.kmRate)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Período Selecionado</p>
          <p className="font-bold text-slate-800 text-lg">
            {period?.from ? format(new Date(period.from + "T00:00:00"), "dd/MM/yyyy") : "—"} a {period?.to ? format(new Date(period.to + "T00:00:00"), "dd/MM/yyyy") : "—"}
          </p>
          <p className="text-sm text-slate-600 mt-1">Total de atendimentos: {reports.length}</p>
        </div>
      </section>

      {/* TABELA DE OSs */}
      <section className="mb-8" style={{ pageBreakInside: 'auto' }}>
        <h3 className="text-sm font-bold text-[#003B73] uppercase tracking-wider mb-4 border-b border-slate-200 pb-1">Extrato de Serviços</h3>
        
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
            <tr>
              <th className="px-3 py-3 font-semibold">OS</th>
              <th className="px-3 py-3 font-semibold">Data</th>
              <th className="px-3 py-3 font-semibold">Máquina</th>
              <th className="px-3 py-3 font-semibold">Tipo</th>
              <th className="px-3 py-3 font-semibold text-center">Horas</th>
              <th className="px-3 py-3 font-semibold text-right">KM</th>
              <th className="px-3 py-3 font-semibold text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => {
              const t = reportTotalsWithSessions(r, sessions, client);
              return (
                <tr key={r.id} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-slate-50/30' : ''}`} style={{ pageBreakInside: 'avoid' }}>
                  <td className="px-3 py-3 font-medium">{r.orderNumber || "—"}</td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}</td>
                  <td className="px-3 py-3 text-slate-600 truncate max-w-[150px]">{r.machine || "—"}</td>
                  <td className="px-3 py-3 text-slate-600">{r.type === "corretiva" ? "Corretiva" : "Preventiva"}</td>
                  <td className="px-3 py-3 text-center text-slate-600 whitespace-nowrap">{fmtHours(t.totalHours)}</td>
                  <td className="px-3 py-3 text-right text-slate-600 whitespace-nowrap">{t.km}</td>
                  <td className="px-3 py-3 text-right text-slate-800 font-medium whitespace-nowrap">{fmtCurrency(t.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* FECHAMENTO DE VALORES */}
      <section className="mb-10 w-2/3 ml-auto" style={{ pageBreakInside: 'avoid' }}>
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between text-sm">
            <span className="text-slate-600">Horas Totais (Serviço + Desloc.):</span>
            <span className="font-bold text-slate-800">{fmtHours(totals.hours)}</span>
          </div>
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between text-sm">
            <span className="text-slate-600">Apuração de Horas:</span>
            <span className="font-medium text-slate-800">{fmtCurrency(totals.hoursValue)}</span>
          </div>
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between text-sm">
            <span className="text-slate-600">Apuração de KM ({totals.km} km):</span>
            <span className="font-medium text-slate-800">{fmtCurrency(totals.kmValue)}</span>
          </div>
          <div className="px-4 py-4 bg-[#003B73]/5 flex justify-between items-center">
            <span className="font-bold text-[#003B73] uppercase tracking-wider text-sm">Total a Faturar:</span>
            <span className="font-black text-xl text-[#003B73]">{fmtCurrency(totals.total)}</span>
          </div>
        </div>
      </section>
    </div>
  );
});
