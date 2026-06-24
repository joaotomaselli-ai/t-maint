import React, { forwardRef } from 'react';
import { format } from "date-fns";
import type { Client, ServiceReport, Settings, ServiceSession, Technician, ActivityTechnician } from "@/lib/api";
import { fmtCurrency, fmtHours, technicianPayForReport } from "@/lib/api";

type TechnicianReportPrintProps = {
  technician: Technician;
  reports: ServiceReport[];
  clientsById: Record<string, Client>;
  settings: Settings;
  sessions?: ServiceSession[];
  activityTechnicians?: ActivityTechnician[];
  period?: { from?: string; to?: string };
  filterClient?: Client;
};

export const TechnicianReportPrint = forwardRef<HTMLDivElement, TechnicianReportPrintProps>(({
  technician, reports, clientsById, settings, sessions = [], activityTechnicians = [], period, filterClient
}, ref) => {

  const totalsByReport = new Map<string, ReturnType<typeof technicianPayForReport>>();
  for (const r of reports) {
    totalsByReport.set(r.id, technicianPayForReport(r, sessions, technician, activityTechnicians));
  }

  let hours = 0, ovtWk = 0, ovtWe = 0, km = 0, total = 0;
  for (const t of totalsByReport.values()) {
    hours += t.totalHours; ovtWk += t.ovtWk; ovtWe += t.ovtWe;
    km += t.km; total += t.total;
  }

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
            Relatório de Técnico
          </div>
          <p className="text-sm text-slate-500">Emitido em {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        </div>
      </header>

      {/* METADADOS */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Técnico</p>
          <p className="font-bold text-slate-800 text-lg">{technician.name}</p>
          <p className="text-sm text-slate-600 mt-1">
            Filtro de Cliente: <span className="font-medium">{filterClient ? filterClient.name : "Todos"}</span>
          </p>
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
              <th className="px-3 py-3 font-semibold">Cliente</th>
              <th className="px-3 py-3 font-semibold text-center">Horas</th>
              <th className="px-3 py-3 font-semibold text-right">KM</th>
              <th className="px-3 py-3 font-semibold text-right">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => {
              const t = totalsByReport.get(r.id)!;
              const cli = r.clientId ? clientsById[r.clientId] : undefined;
              return (
                <tr key={r.id} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-slate-50/30' : ''}`} style={{ pageBreakInside: 'avoid' }}>
                  <td className="px-3 py-3 font-medium">{r.orderNumber || "—"}</td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")}</td>
                  <td className="px-3 py-3 text-slate-600 truncate max-w-[180px]">{cli?.name || "—"}</td>
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
            <span className="text-slate-600">Horas Totais de Atendimento:</span>
            <span className="font-bold text-slate-800">{fmtHours(hours)}</span>
          </div>
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between text-sm">
            <span className="text-slate-600">Horas Extras FDS:</span>
            <span className="font-medium text-slate-800">{fmtHours(ovtWe)}</span>
          </div>
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between text-sm">
            <span className="text-slate-600">Quilometragem Total:</span>
            <span className="font-medium text-slate-800">{km} km</span>
          </div>
          <div className="px-4 py-4 bg-[#003B73]/5 flex justify-between items-center">
            <span className="font-bold text-[#003B73] uppercase tracking-wider text-sm">Total de Comissão:</span>
            <span className="font-black text-xl text-[#003B73]">{fmtCurrency(total)}</span>
          </div>
        </div>
      </section>
    </div>
  );
});
