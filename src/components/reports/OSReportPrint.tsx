import React, { forwardRef } from 'react';
import { format } from "date-fns";
import type { Client, ServiceReport, Settings, ServiceSession, Technician } from "@/lib/api";
import { reportTotals, fmtCurrency, fmtHours, reportTotalsWithSessions } from "@/lib/api";

type OSReportPrintProps = {
  report: ServiceReport;
  client?: Client;
  settings: Settings;
  sessions?: ServiceSession[];
  technicians?: Technician[];
  includeValues?: boolean;
  photos?: { kind: string; url: string }[];
  technicianName?: string;
};

export const OSReportPrint = forwardRef<HTMLDivElement, OSReportPrintProps>(({
  report, client, settings, sessions = [], technicians = [], includeValues = false, photos = [], technicianName
}, ref) => {
  const isPreventive = report.type === "preventiva";
  const t = reportTotalsWithSessions(report, sessions, client);
  const techByName = new Map(technicians.map(tt => [tt.id, tt.name]));
  
  const beforePhotos = photos.filter(p => p.kind.includes('before'));
  const afterPhotos = photos.filter(p => p.kind.includes('after'));
  const hasPhotos = beforePhotos.length > 0 || afterPhotos.length > 0;

  const renderPhotoTable = (photosList: {url: string}[], altText: string) => {
    const rows = [];
    for (let i = 0; i < photosList.length; i += 2) {
      rows.push(photosList.slice(i, i + 2));
    }
    return (
      <table className="w-full" style={{ tableLayout: 'fixed' }}>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              {row.map((p, i) => (
                <td key={i} className={`w-1/2 align-top pb-6 ${i === 0 ? 'pr-3' : 'pl-3'}`}>
                  <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                    <div className="aspect-[4/3] w-full bg-slate-100 flex items-center justify-center p-1">
                      <img src={p.url} alt={altText} className="max-w-full max-h-full object-contain rounded" />
                    </div>
                  </div>
                </td>
              ))}
              {row.length === 1 && <td className="w-1/2"></td>}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div ref={ref} className="bg-white text-slate-800 p-8 font-sans w-full max-w-[210mm] mx-auto" style={{ fontFamily: "'Inter', 'Helvetica', sans-serif" }}>
      {/* HEADER */}
      <header className="flex justify-between items-start border-b-[3px] border-[#003B73] pb-6 mb-8">
        <div className="flex items-center gap-6">
          {settings.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="max-h-16 w-auto object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-black text-[#002b5e] m-0">{settings.companyName || "Relatório de Serviço"}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {[settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone, settings.address].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-[#003B73] text-white px-4 py-2 rounded-md font-bold text-lg inline-block mb-2">
            OS Nº {report.orderNumber || report.id.substring(0, 8)}
          </div>
          <p className="text-sm text-slate-500">Emitido em {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
          <p className="text-sm font-semibold text-slate-700 mt-1 uppercase tracking-wider">{isPreventive ? "Preventiva" : "Corretiva"}</p>
        </div>
      </header>

      {/* METADADOS (Grid) */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Cliente</p>
          <p className="font-bold text-slate-800 text-lg">{client?.name || "—"}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Data do Serviço</p>
          <p className="font-bold text-slate-800 text-lg">{format(new Date(report.date + "T00:00:00"), "dd/MM/yyyy")}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Equipamento / Máquina</p>
          <p className="font-medium text-slate-800">{report.machine || "—"}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Técnico Responsável / Solicitante</p>
          <p className="font-medium text-slate-800">{report.technician || settings.technicianName || "—"} / {report.requester || "—"}</p>
        </div>
      </section>

      {/* CONTEÚDO TÉCNICO */}
      <section className="mb-8 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#003B73] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            {isPreventive ? "Atividades Mecânicas" : "Descrição do Serviço Solicitado"}
          </h3>
          <p className="text-slate-700 text-justify leading-relaxed whitespace-pre-wrap">{report.description || "Nenhuma descrição fornecida."}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-bold text-[#003B73] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            {isPreventive ? "Atividades Elétricas" : "Resumo dos Serviços Executados"}
          </h3>
          <p className="text-slate-700 text-justify leading-relaxed whitespace-pre-wrap">{report.summary || "Nenhum resumo fornecido."}</p>
        </div>

        {report.futureReplacements && (
          <div>
            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2 border-b border-amber-200 pb-1">
              Requisições para Troca Futura
            </h3>
            <p className="text-slate-700 text-justify leading-relaxed whitespace-pre-wrap">{report.futureReplacements}</p>
          </div>
        )}

        {report.observation && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Observações Gerais</h3>
            <p className="text-slate-700 text-justify leading-relaxed whitespace-pre-wrap">{report.observation}</p>
          </div>
        )}
      </section>

      {/* SESSÕES E HORÁRIOS (Tabelas Elegantes) */}
      <section className="mb-8" style={{ pageBreakInside: 'avoid' }}>
        <h3 className="text-sm font-bold text-[#003B73] uppercase tracking-wider mb-4 border-b border-slate-200 pb-1">Apontamentos de Horas</h3>
        
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Técnico</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold text-center">Deslocamento (Ida)</th>
              <th className="px-4 py-3 font-semibold text-center">Serviço</th>
              <th className="px-4 py-3 font-semibold text-center">Deslocamento (Volta)</th>
              <th className="px-4 py-3 font-semibold text-right">KM</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="px-4 py-3 font-medium">{report.technician || "—"}</td>
              <td className="px-4 py-3 text-slate-600">{format(new Date(report.date + "T00:00:00"), "dd/MM/yyyy")}</td>
              <td className="px-4 py-3 text-center text-slate-600">{report.travelOutStart} → {report.travelOutEnd} <br/><span className="text-xs text-slate-400">{fmtHours(t.travelOut)}</span></td>
              <td className="px-4 py-3 text-center text-slate-600 font-medium">{report.serviceStart} → {report.serviceEnd} <br/><span className="text-xs text-slate-400">{fmtHours(t.service)}</span></td>
              <td className="px-4 py-3 text-center text-slate-600">{report.travelBackStart} → {report.travelBackEnd} <br/><span className="text-xs text-slate-400">{fmtHours(t.travelBack)}</span></td>
              <td className="px-4 py-3 text-right text-slate-600">{report.km}</td>
            </tr>
            {sessions.map((s, i) => {
              const st = reportTotals(s as any, client);
              return (
                <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-slate-50/30' : ''}`}>
                  <td className="px-4 py-3 font-medium">{(s.technicianId && techByName.get(s.technicianId)) || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{format(new Date(s.date + "T00:00:00"), "dd/MM/yyyy")}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{s.travelOutStart} → {s.travelOutEnd}</td>
                  <td className="px-4 py-3 text-center text-slate-600 font-medium">{s.serviceStart} → {s.serviceEnd}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{s.travelBackStart} → {s.travelBackEnd}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{s.km}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* FECHAMENTO DE VALORES (Se Aplicável) */}
      {includeValues && (
        <section className="mb-10 w-2/3 ml-auto" style={{ pageBreakInside: 'avoid' }}>
          <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between text-sm">
              <span className="text-slate-600">Horas Totais de Serviço & Deslocamento:</span>
              <span className="font-bold text-slate-800">{fmtHours(t.totalHours)}</span>
            </div>
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between text-sm">
              <span className="text-slate-600">
                {report.isPackage ? "Pacote de Serviço (Valor Fechado):" : `Apuração de Horas (${fmtCurrency(client?.hourlyRate ?? 0)}/h):`}
              </span>
              <span className="font-medium text-slate-800">{fmtCurrency(t.hoursValue)}</span>
            </div>
            {!report.isPackage && (
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between text-sm">
                <span className="text-slate-600">Apuração de Deslocamento ({t.km} km × {fmtCurrency(client?.kmRate ?? 0)}):</span>
                <span className="font-medium text-slate-800">{fmtCurrency(t.kmValue)}</span>
              </div>
            )}
            <div className="px-4 py-4 bg-[#003B73]/5 flex justify-between items-center">
              <span className="font-bold text-[#003B73] uppercase tracking-wider text-sm">Total da Ordem de Serviço:</span>
              <span className="font-black text-xl text-[#003B73]">{fmtCurrency(t.total)}</span>
            </div>
          </div>
        </section>
      )}

      {/* GALERIA DE FOTOS */}
      {hasPhotos && (
        <section className="mt-8 pt-8 border-t border-slate-200" style={{ pageBreakBefore: 'always' }}>
          <h3 className="text-xl font-bold text-[#003B73] mb-6">Galeria de Evidências</h3>
          
          {beforePhotos.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold text-slate-600 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Antes do Serviço
              </h4>
              {renderPhotoTable(beforePhotos, "Antes")}
            </div>
          )}

          {afterPhotos.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-[#003B73] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#003B73]"></span> Depois do Serviço
              </h4>
              {renderPhotoTable(afterPhotos, "Depois")}
            </div>
          )}
        </section>
      )}

      {/* ASSINATURA / RODAPÉ */}
      <footer className="mt-20 pt-8 border-t border-slate-200" style={{ pageBreakInside: 'avoid' }}>
        <div className="flex justify-between items-end">
          <div className="w-1/2 pr-8 flex flex-col items-center">
            {report.technicianSignature ? (
              <img src={report.technicianSignature} alt="Assinatura do Técnico" className="h-16 object-contain mb-2" />
            ) : (
              <div className="h-16 mb-2"></div>
            )}
            <div className="border-b border-slate-400 w-full mb-2"></div>
            <p className="text-xs text-center text-slate-500 uppercase tracking-wider">{report.technician || technicianName || settings.technicianName || "Técnico Responsável"}</p>
          </div>
          <div className="w-1/2 pl-8 flex flex-col items-center">
            {report.clientSignature ? (
              <img src={report.clientSignature} alt="Assinatura do Cliente" className="h-16 object-contain mb-2" />
            ) : (
              <div className="h-16 mb-2"></div>
            )}
            <div className="border-b border-slate-400 w-full mb-2"></div>
            <p className="text-xs text-center text-slate-500 uppercase tracking-wider">Assinatura do Cliente ({client?.name || "Cliente"})</p>
          </div>
        </div>
        <div className="mt-12 text-center text-xs text-slate-400">
          Documento gerado eletronicamente por {settings.companyName || "Sistema de Gestão"}
        </div>
      </footer>
    </div>
  );
});

OSReportPrint.displayName = "OSReportPrint";
