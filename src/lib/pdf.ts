import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Client, ServiceReport, Settings } from "./api";
import { reportTotals, technicianTotals, fmtCurrency, fmtHours } from "./api";

export function exportClientReport(
  client: Client,
  reports: ServiceReport[],
  settings: Settings,
  period?: { from?: string; to?: string }
) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(40, 60, 110);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(settings.companyName || "Relatório de Serviços", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subParts = [settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone, settings.address].filter(Boolean);
  doc.text(subParts.join("  •  "), 14, 19);
  doc.text(`Emitido em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 24);

  // Client block
  doc.setTextColor(20);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório por Cliente", 14, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Cliente: ${client.name}`, 14, 47);
  doc.text(`Valor/hora: ${fmtCurrency(client.hourlyRate)}   •   Valor/km: ${fmtCurrency(client.kmRate)}`, 14, 53);
  if (period?.from || period?.to) {
    const f = period.from ? format(new Date(period.from), "dd/MM/yyyy") : "—";
    const t = period.to ? format(new Date(period.to), "dd/MM/yyyy") : "—";
    doc.text(`Período: ${f}  a  ${t}`, 14, 59);
  }

  // Table
  const rows = reports.map(r => {
    const t = reportTotals(r, client);
    return [
      r.orderNumber || "—",
      format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy"),
      r.machine,
      r.type === "corretiva" ? "Corretiva" : "Preventiva",
      fmtHours(t.service),
      fmtHours(t.travelOut + t.travelBack),
      `${r.km} km`,
      fmtCurrency(t.total),
    ];
  });

  const totalGeral = reports.reduce((acc, r) => {
    const t = reportTotals(r, client);
    return {
      hours: acc.hours + t.totalHours,
      service: acc.service + t.service,
      travel: acc.travel + t.travelOut + t.travelBack,
      km: acc.km + (r.km || 0),
      hoursValue: acc.hoursValue + t.hoursValue,
      kmValue: acc.kmValue + t.kmValue,
      total: acc.total + t.total,
    };
  }, { hours: 0, service: 0, travel: 0, km: 0, hoursValue: 0, kmValue: 0, total: 0 });

  autoTable(doc, {
    startY: 66,
    head: [["OS", "Data", "Máquina", "Tipo", "Serviço", "Deslocamento", "KM", "Valor"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [40, 60, 110], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 80;

  // Summary
  autoTable(doc, {
    startY: finalY + 6,
    head: [["Resumo", ""]],
    body: [
      ["Total de atendimentos", String(reports.length)],
      ["Horas de serviço", fmtHours(totalGeral.service)],
      ["Horas de deslocamento", fmtHours(totalGeral.travel)],
      ["Horas totais", fmtHours(totalGeral.hours)],
      ["Quilometragem total", `${totalGeral.km} km`],
      ["Valor por horas", fmtCurrency(totalGeral.hoursValue)],
      ["Valor por km", fmtCurrency(totalGeral.kmValue)],
      ["TOTAL A FATURAR", fmtCurrency(totalGeral.total)],
    ],
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [40, 60, 110], textColor: 255 },
    columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" } },
    didParseCell: (data) => {
      if (data.row.index === 7 && data.section === "body") {
        data.cell.styles.fillColor = [40, 60, 110];
        data.cell.styles.textColor = 255;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // Footer signature
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(180);
  doc.line(14, pageH - 30, 90, pageH - 30);
  doc.line(pageW - 90, pageH - 30, pageW - 14, pageH - 30);
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Técnico: ${settings.technicianName || "—"}`, 14, pageH - 25);
  doc.text(`Cliente: ${client.name}`, pageW - 90, pageH - 25);

  doc.save(`relatorio-${client.name.replace(/\s+/g, "_")}-${format(new Date(), "yyyyMMdd")}.pdf`);
}

export function exportSingleReport(r: ServiceReport, client: Client | undefined, settings: Settings) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(40, 60, 110);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(settings.companyName || "Relatório de Serviço", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subParts = [settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone].filter(Boolean);
  doc.text(subParts.join("  •  "), 14, 19);
  doc.setFontSize(11);
  doc.text(`OS ${r.orderNumber || "—"}`, pageW - 14, 19, { align: "right" });

  doc.setTextColor(20);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Serviço", 14, 40);

  autoTable(doc, {
    startY: 46,
    body: [
      ["Cliente", client?.name || "—", "Data", format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")],
      ["Máquina", r.machine, "Tipo", r.type === "corretiva" ? "Corretiva" : "Preventiva"],
      ["Solicitante", r.requester, "Técnico", r.technician || settings.technicianName || "—"],
    ],
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [240, 243, 248], cellWidth: 30 },
      2: { fontStyle: "bold", fillColor: [240, 243, 248], cellWidth: 25 },
    },
    theme: "grid",
  });

  let y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Descrição do serviço solicitado", 14, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(doc.splitTextToSize(r.description || "—", pageW - 28), 14, y);
  y += Math.max(10, doc.splitTextToSize(r.description || "—", pageW - 28).length * 5);

  doc.setFont("helvetica", "bold");
  doc.text("Resumo dos serviços executados", 14, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(doc.splitTextToSize(r.summary || "—", pageW - 28), 14, y);
  y += Math.max(10, doc.splitTextToSize(r.summary || "—", pageW - 28).length * 5);

  const t = reportTotals(r, client);
  autoTable(doc, {
    startY: y + 4,
    head: [["Viagem de ida", "Serviço", "Viagem de volta", "KM"]],
    body: [[
      `${r.travelOutStart} → ${r.travelOutEnd}\n${fmtHours(t.travelOut)}`,
      `${r.serviceStart} → ${r.serviceEnd}\n${fmtHours(t.service)}`,
      `${r.travelBackStart} → ${r.travelBackEnd}\n${fmtHours(t.travelBack)}`,
      `${r.km} km`,
    ]],
    styles: { fontSize: 9, cellPadding: 3, halign: "center" },
    headStyles: { fillColor: [40, 60, 110], textColor: 255 },
  });

  y = (doc as any).lastAutoTable.finalY + 6;
  autoTable(doc, {
    startY: y,
    head: [["Apuração", "Valor"]],
    body: [
      ["Horas totais", fmtHours(t.totalHours)],
      [`Horas × ${fmtCurrency(client?.hourlyRate ?? 0)}`, fmtCurrency(t.hoursValue)],
      [`${r.km} km × ${fmtCurrency(client?.kmRate ?? 0)}`, fmtCurrency(t.kmValue)],
      ["TOTAL", fmtCurrency(t.total)],
    ],
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [40, 60, 110], textColor: 255 },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    didParseCell: (data) => {
      if (data.row.index === 3 && data.section === "body") {
        data.cell.styles.fillColor = [40, 60, 110];
        data.cell.styles.textColor = 255;
      }
    },
  });

  if (r.observation) {
    y = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont("helvetica", "bold");
    doc.text("Observação", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(r.observation, pageW - 28), 14, y + 5);
  }

  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(180);
  doc.line(14, pageH - 30, 90, pageH - 30);
  doc.line(pageW - 90, pageH - 30, pageW - 14, pageH - 30);
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Técnico: ${r.technician || settings.technicianName || "—"}`, 14, pageH - 25);
  doc.text(`Cliente: ${client?.name || "—"}`, pageW - 90, pageH - 25);

  doc.save(`OS-${r.orderNumber || r.id}-${client?.name?.replace(/\s+/g, "_") || "cliente"}.pdf`);
}

export function exportTechnicianReport(
  technician: { name: string; hourlyRate: number; kmRate: number; overtimeWeekdayRate: number; overtimeWeekendRate: number },
  reports: ServiceReport[],
  clientsById: Record<string, Client | undefined>,
  settings: Settings,
  period?: { from?: string; to?: string },
  filterClient?: Client,
) {
  const { technicianTotals } = require("./api") as typeof import("./api");
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(40, 60, 110);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(settings.companyName || "Relatório de Técnico", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subParts = [settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone, settings.address].filter(Boolean);
  doc.text(subParts.join("  •  "), 14, 19);
  doc.text(`Emitido em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 24);

  doc.setTextColor(20);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório por Técnico", 14, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Técnico: ${technician.name}`, 14, 47);
  doc.text(
    `Hora: ${fmtCurrency(technician.hourlyRate)}  •  KM: ${fmtCurrency(technician.kmRate)}  •  HE semana: ${fmtCurrency(technician.overtimeWeekdayRate)}  •  HE fim de semana: ${fmtCurrency(technician.overtimeWeekendRate)}`,
    14, 53
  );
  doc.text(`Cliente: ${filterClient ? filterClient.name : "Todos os clientes"}`, 14, 59);
  if (period?.from || period?.to) {
    const f = period.from ? format(new Date(period.from), "dd/MM/yyyy") : "—";
    const t = period.to ? format(new Date(period.to), "dd/MM/yyyy") : "—";
    doc.text(`Período: ${f}  a  ${t}`, 14, 65);
  }

  const rows = reports.map(r => {
    const t = technicianTotals(r, technician as any);
    return [
      r.orderNumber || "—",
      format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy"),
      clientsById[r.clientId]?.name || "—",
      fmtHours(t.totalHours),
      fmtHours(t.ovtWk),
      fmtHours(t.ovtWe),
      `${r.km} km`,
      fmtCurrency(t.total),
    ];
  });

  const totals = reports.reduce((acc, r) => {
    const t = technicianTotals(r, technician as any);
    acc.hours += t.totalHours; acc.ovtWk += t.ovtWk; acc.ovtWe += t.ovtWe;
    acc.km += r.km || 0; acc.hoursValue += t.hoursValue; acc.kmValue += t.kmValue; acc.total += t.total;
    return acc;
  }, { hours: 0, ovtWk: 0, ovtWe: 0, km: 0, hoursValue: 0, kmValue: 0, total: 0 });

  autoTable(doc, {
    startY: (period?.from || period?.to) ? 72 : 66,
    head: [["OS", "Data", "Cliente", "Horas", "HE Sem.", "HE F.S.", "KM", "A pagar"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [40, 60, 110], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 80;

  autoTable(doc, {
    startY: finalY + 6,
    head: [["Resumo", ""]],
    body: [
      ["Total de atendimentos", String(reports.length)],
      ["Horas totais", fmtHours(totals.hours)],
      ["Horas extras semana", fmtHours(totals.ovtWk)],
      ["Horas extras fim de semana", fmtHours(totals.ovtWe)],
      ["Quilometragem total", `${totals.km} km`],
      ["Valor por horas", fmtCurrency(totals.hoursValue)],
      ["Valor por km", fmtCurrency(totals.kmValue)],
      ["TOTAL A PAGAR", fmtCurrency(totals.total)],
    ],
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [40, 60, 110], textColor: 255 },
    columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" } },
    didParseCell: (data) => {
      if (data.row.index === 7 && data.section === "body") {
        data.cell.styles.fillColor = [40, 60, 110];
        data.cell.styles.textColor = 255;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(180);
  doc.line(14, pageH - 30, 90, pageH - 30);
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Técnico: ${technician.name}`, 14, pageH - 25);

  doc.save(`relatorio-tecnico-${technician.name.replace(/\s+/g, "_")}-${format(new Date(), "yyyyMMdd")}.pdf`);
}
