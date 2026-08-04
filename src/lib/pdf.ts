import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Client, ServiceReport, Settings, ServiceSession, Technician } from "./api";
import { reportTotals, technicianTotals, technicianPayForReport, fmtCurrency, fmtHours, reportTotalsWithSessions } from "./api";

async function fetchImageAsBase64(url: string): Promise<{ dataUrl: string, width: number, height: number } | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => resolve({ dataUrl, width: img.width, height: img.height });
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}

export async function exportClientReport(
  client: Client,
  reports: ServiceReport[],
  settings: Settings,
  period?: { from?: string; to?: string },
  sessions: ServiceSession[] = [],
) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(40, 60, 110);
  doc.rect(0, 0, pageW, 28, "F");
  
  let startX = 14;
  if (settings.logoUrl) {
    const logoInfo = await fetchImageAsBase64(settings.logoUrl);
    if (logoInfo) {
      const maxH = 16;
      const w = (logoInfo.width / logoInfo.height) * maxH;
      doc.addImage(logoInfo.dataUrl, "PNG", startX, 6, w, maxH);
      startX += w + 6;
    }
  }

  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(settings.companyName || "Relatório de Serviços", startX, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subParts = [settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone, settings.address].filter(Boolean);
  doc.text(subParts.join("  •  "), startX, 19);
  doc.text(`Emitido em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, startX, 24);

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
    const t = reportTotalsWithSessions(r, sessions, client);
    return [
      r.orderNumber || "—",
      format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy"),
      r.machine,
      r.type === "corretiva" ? "Corretiva" : "Preventiva",
      fmtHours(t.service),
      fmtHours(t.travelOut + t.travelBack),
      `${t.km} km`,
      fmtCurrency(t.total),
    ];
  });

  const totalGeral = reports.reduce((acc, r) => {
    const t = reportTotalsWithSessions(r, sessions, client);
    return {
      hours: acc.hours + t.totalHours,
      service: acc.service + t.service,
      travel: acc.travel + t.travelOut + t.travelBack,
      km: acc.km + t.km,
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

export async function exportSingleReport(
  r: ServiceReport,
  client: Client | undefined,
  settings: Settings,
  opts: { includeValues?: boolean; sessions?: ServiceSession[]; technicians?: Technician[] } = {},
) {
  const includeValues = opts.includeValues !== false;
  const sessions = opts.sessions ?? [];
  const technicians = opts.technicians ?? [];
  const isPreventive = r.type === "preventiva";
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  // Header
  doc.setFillColor(40, 60, 110);
  doc.rect(0, 0, pageW, 28, "F");
  
  let startX = 14;
  if (settings.logoUrl) {
    const logoInfo = await fetchImageAsBase64(settings.logoUrl);
    if (logoInfo) {
      const maxH = 16;
      const w = (logoInfo.width / logoInfo.height) * maxH;
      doc.addImage(logoInfo.dataUrl, "PNG", startX, 6, w, maxH);
      startX += w + 6;
    }
  }

  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(settings.companyName || "Relatório de Serviço", startX, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subParts = [settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone].filter(Boolean);
  doc.text(subParts.join("  •  "), startX, 19);
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
      ["Máquina", r.machine, "Tipo", isPreventive ? "Preventiva" : "Corretiva"],
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
  doc.text(isPreventive ? "Descrição de Atividades Mecânicas" : "Descrição do serviço solicitado", 14, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  const descLines = doc.splitTextToSize(r.description || "—", pageW - 28);
  doc.text(descLines, 14, y);
  y += Math.max(10, descLines.length * 5);

  doc.setFont("helvetica", "bold");
  doc.text(isPreventive ? "Descrição das Atividades Elétricas" : "Resumo dos serviços executados", 14, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  const sumLines = doc.splitTextToSize(r.summary || "—", pageW - 28);
  doc.text(sumLines, 14, y);
  y += Math.max(10, sumLines.length * 5);

  if (r.futureReplacements) {
    doc.setFont("helvetica", "bold");
    doc.text("Requisições para troca futura", 14, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    const lines = doc.splitTextToSize(r.futureReplacements, pageW - 28);
    doc.text(lines, 14, y);
    y += Math.max(10, lines.length * 5);
  }

  if (r.observation) {
    doc.setFont("helvetica", "bold");
    doc.text("Observações Gerais", 14, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    const lines = doc.splitTextToSize(r.observation, pageW - 28);
    doc.text(lines, 14, y);
    y += Math.max(10, lines.length * 5);
  }

  // Activities & observations log per session (rendered BEFORE tables)
  const techByName = new Map(technicians.map(t => [t.id, t.name]));
  const activitiesBlock = sessions.filter(s => s.activitiesDone?.trim() || s.observation?.trim());
  if (activitiesBlock.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Atividades executadas e observações das sessões adicionais", 14, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    for (const s of activitiesBlock) {
      const head = `Sessão / Dia Adicional (${format(new Date(s.date + "T00:00:00"), "dd/MM/yyyy")}) — ${(s.technicianId && techByName.get(s.technicianId)) || r.technician || "Técnico"}`;
      doc.setFont("helvetica", "bold");
      doc.text(head, 14, y); y += 4;
      doc.setFont("helvetica", "normal");
      if (s.activitiesDone?.trim()) {
        doc.setFont("helvetica", "bold");
        doc.text("Descrição das Atividades Executadas:", 14, y); y += 4;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(s.activitiesDone, pageW - 28);
        doc.text(lines, 14, y); y += lines.length * 4 + 2;
      }
      if (s.observation?.trim()) {
        doc.setFont("helvetica", "bold");
        doc.text("Observação da Sessão:", 14, y); y += 4;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(s.observation, pageW - 28);
        doc.text(lines, 14, y); y += lines.length * 4 + 2;
      }
    }
  }

  const t = reportTotalsWithSessions(r, sessions, client);
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

  if (includeValues) {
    y = (doc as any).lastAutoTable.finalY + 6;
    const bodyRows: (string[])[] = [
      ["Horas totais", fmtHours(t.totalHours)],
      r.isPackage 
        ? ["Pacote de Serviço (Valor Fechado)", fmtCurrency(t.hoursValue)]
        : [`Horas × ${fmtCurrency(client?.hourlyRate ?? 0)}`, fmtCurrency(t.hoursValue)],
    ];
    if (!r.isPackage) {
      bodyRows.push([`${t.km} km × ${fmtCurrency(client?.kmRate ?? 0)}`, fmtCurrency(t.kmValue)]);
    }
    bodyRows.push(["TOTAL", fmtCurrency(t.total)]);

    autoTable(doc, {
      startY: y,
      head: [["Apuração", "Valor"]],
      body: bodyRows,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [40, 60, 110], textColor: 255 },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      didParseCell: (data) => {
        if (data.row.index === bodyRows.length - 1 && data.section === "body") {
          data.cell.styles.fillColor = [40, 60, 110];
          data.cell.styles.textColor = 255;
        }
      },
    });
  }

  if (sessions.length > 0) {
    y = (doc as any).lastAutoTable.finalY + 6;
    const totalsRow = reportTotalsWithSessions(r, sessions, client);
    autoTable(doc, {
      startY: y,
      head: [["Data", "Técnico", "Ida", "Serviço", "Volta", "KM", "HE Sem.", "HE F.S."]],
      body: [
        [
          format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy"),
          r.technician || "—",
          `${r.travelOutStart}→${r.travelOutEnd}`,
          `${r.serviceStart}→${r.serviceEnd}`,
          `${r.travelBackStart}→${r.travelBackEnd}`,
          `${r.km}`,
          fmtHours(r.overtimeWeekdayHours || 0),
          fmtHours(r.overtimeWeekendHours || 0),
        ],
        ...sessions.map(s => [
          format(new Date(s.date + "T00:00:00"), "dd/MM/yyyy"),
          (s.technicianId && techByName.get(s.technicianId)) || "—",
          `${s.travelOutStart}→${s.travelOutEnd}`,
          `${s.serviceStart}→${s.serviceEnd}`,
          `${s.travelBackStart}→${s.travelBackEnd}`,
          `${s.km}`,
          fmtHours(s.overtimeWeekdayHours || 0),
          fmtHours(s.overtimeWeekendHours || 0),
        ]),
      ],
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 60, 110], textColor: 255 },
    });

    y = (doc as any).lastAutoTable.finalY + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Totais — Horas: ${fmtHours(totalsRow.totalHours)} · KM: ${totalsRow.km}${includeValues ? ` · A cobrar: ${fmtCurrency(totalsRow.total)}` : ""}`, 14, y);
    doc.setFont("helvetica", "normal");
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

async function fetchImageAsDataUrl(url: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();

    // Use createImageBitmap with imageOrientation 'from-image' so EXIF rotation
    // from phone cameras is applied automatically. Then re-encode via canvas
    // so the resulting JPEG has the pixels already rotated (jsPDF ignores EXIF).
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" } as any);
    } catch {
      bitmap = await createImageBitmap(blob);
    }

    const w = bitmap.width;
    const h = bitmap.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close?.(); return null; }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return { dataUrl, w, h };
  } catch { return null; }
}

export async function exportPreventiveInformativeReport(
  r: ServiceReport,
  client: Client | undefined,
  settings: Settings,
) {
  const { listAttachments, getAttachmentUrl } = await import("./api");
  const atts = await listAttachments(r.id);
  const isPreventive = r.type === "preventiva";

  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(40, 60, 110);
  doc.rect(0, 0, pageW, 28, "F");

  let startX = 14;
  if (settings.logoUrl) {
    const logoInfo = await fetchImageAsBase64(settings.logoUrl);
    if (logoInfo) {
      const maxH = 16;
      const w = (logoInfo.width / logoInfo.height) * maxH;
      doc.addImage(logoInfo.dataUrl, "PNG", startX, 6, w, maxH);
      startX += w + 6;
    }
  }

  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(settings.companyName || "Relatório de Manutenção Preventiva", startX, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subParts = [settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone].filter(Boolean);
  doc.text(subParts.join("  •  "), startX, 19);
  doc.setFontSize(11);
  doc.text(`OS ${r.orderNumber || "—"}`, pageW - 14, 19, { align: "right" });

  doc.setTextColor(20);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Manutenção Preventiva", 14, 40);

  autoTable(doc, {
    startY: 46,
    body: [
      ["Cliente", client?.name || "—", "Data", format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy")],
      ["Máquina", r.machine, "Solicitante", r.requester],
    ],
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [240, 243, 248], cellWidth: 30 },
      2: { fontStyle: "bold", fillColor: [240, 243, 248], cellWidth: 30 },
    },
    theme: "grid",
  });

  let y = (doc as any).lastAutoTable.finalY + 8;

  const ensureSpace = (need: number) => {
    if (y + need > pageH - 20) { doc.addPage(); y = 20; }
  };

  const section = async (title: string, body: string, beforeKind: string, afterKind: string) => {
    ensureSpace(10);
    doc.setFillColor(40, 60, 110);
    doc.rect(14, y, pageW - 28, 8, "F");
    doc.setTextColor(255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, 18, y + 5.5);
    y += 12;
    doc.setTextColor(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (body) {
      const lines = doc.splitTextToSize(body, pageW - 28);
      ensureSpace(lines.length * 5 + 4);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 4;
    }
    await renderGallery(beforeKind, "Antes");
    await renderGallery(afterKind, "Depois");
    y += 4;
  };

  const renderGallery = async (kind: string, label: string) => {
    const items = atts.filter(a => a.kind === kind);
    if (items.length === 0) return;
    ensureSpace(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(label, 14, y);
    y += 4;
    doc.setTextColor(20);
    // One image per row, full content width, height scaled by aspect ratio.
    // Caps each image at a max height so very tall photos don't take an entire page.
    const contentW = pageW - 28;
    const maxImgH = (pageH - 40) * 0.6; // up to 60% of usable page height
    const gap = 6;
    for (const a of items) {
      try {
        const url = await getAttachmentUrl(a.storagePath);
        const img = await fetchImageAsDataUrl(url);
        if (!img || !img.w || !img.h) continue;
        const ratio = img.w / img.h;
        let drawW = contentW;
        let drawH = drawW / ratio;
        if (drawH > maxImgH) { drawH = maxImgH; drawW = drawH * ratio; }
        ensureSpace(drawH + gap);
        const x = 14 + (contentW - drawW) / 2;
        doc.addImage(img.dataUrl, "JPEG", x, y, drawW, drawH, undefined, "FAST");
        y += drawH + gap;
      } catch (e) { console.error(e); }
    }
  };

  if (isPreventive) {
    await section("Atividades Mecânicas", r.description || "", "mechanical_before", "mechanical_after");
    await section("Atividades Elétricas", r.summary || "", "electrical_before", "electrical_after");
  } else {
    await section("Descrição do serviço solicitado", r.description || "", "", "");
    await section("Resumo e Evidências dos serviços executados", r.summary || "", "mechanical_before", "mechanical_after");
  }

  if (r.futureReplacements) {
    ensureSpace(20);
    doc.setFillColor(245, 158, 11);
    doc.rect(14, y, pageW - 28, 8, "F");
    doc.setTextColor(255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Requisições para troca futura", 18, y + 5.5);
    y += 12;
    doc.setTextColor(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(r.futureReplacements, pageW - 28);
    ensureSpace(lines.length * 5);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 4;
  }

  if (r.observation) {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Observação", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(r.observation, pageW - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 4;
  }

  // Footer on last page
  const finalPH = doc.internal.pageSize.getHeight();
  if (r.technicianSignature) {
    try { doc.addImage(r.technicianSignature, "PNG", 21, finalPH - 50, 76, 16, undefined, "FAST"); } catch (e) {}
  }
  if (r.clientSignature) {
    try { doc.addImage(r.clientSignature, "PNG", pageW - 90, finalPH - 50, 76, 16, undefined, "FAST"); } catch (e) {}
  }
  doc.setDrawColor(180);
  doc.line(14, finalPH - 30, 90, finalPH - 30);
  doc.line(pageW - 90, finalPH - 30, pageW - 14, finalPH - 30);
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Técnico: ${r.technician || settings.technicianName || "—"}`, 14, finalPH - 25);
  doc.text(`Cliente: ${client?.name || "—"}`, pageW - 90, finalPH - 25);

  doc.save(`os-${r.orderNumber || r.id}-${client?.name?.replace(/\s+/g, "_") || "cliente"}.pdf`);
}


export async function exportTechnicianReport(
  technician: { name: string; hourlyRate: number; kmRate: number; overtimeWeekdayRate: number; overtimeWeekendRate: number },
  reports: ServiceReport[],
  clientsById: Record<string, Client | undefined>,
  settings: Settings,
  period?: { from?: string; to?: string },
  filterClient?: Client,
  sessions: ServiceSession[] = [],
) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(40, 60, 110);
  doc.rect(0, 0, pageW, 28, "F");

  let startX = 14;
  if (settings.logoUrl) {
    const logoInfo = await fetchImageAsBase64(settings.logoUrl);
    if (logoInfo) {
      const maxH = 16;
      const w = (logoInfo.width / logoInfo.height) * maxH;
      doc.addImage(logoInfo.dataUrl, "PNG", startX, 6, w, maxH);
      startX += w + 6;
    }
  }

  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(settings.companyName || "Relatório de Técnico", startX, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subParts = [settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone, settings.address].filter(Boolean);
  doc.text(subParts.join("  •  "), startX, 19);
  doc.text(`Emitido em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, startX, 24);

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
    const t = technicianPayForReport(r, sessions, technician as any);
    return [
      r.orderNumber || "—",
      format(new Date(r.date + "T00:00:00"), "dd/MM/yyyy"),
      clientsById[r.clientId]?.name || "—",
      fmtHours(t.totalHours),
      fmtHours(t.ovtWk),
      fmtHours(t.ovtWe),
      `${t.km} km`,
      fmtCurrency(t.total),
    ];
  });

  const totals = reports.reduce((acc, r) => {
    const t = technicianPayForReport(r, sessions, technician as any);
    acc.hours += t.totalHours; acc.ovtWk += t.ovtWk; acc.ovtWe += t.ovtWe;
    acc.km += t.km; acc.hoursValue += t.hoursValue; acc.kmValue += t.kmValue; acc.total += t.total;
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
