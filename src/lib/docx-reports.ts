import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, HeadingLevel, BorderStyle, ShadingType, ImageRun, PageBreak,
} from "docx";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import type { Client, ServiceReport, Settings, ServiceSession, Technician } from "./api";
import { reportTotals, technicianTotals, technicianPayForReport, fmtCurrency, fmtHours, reportTotalsWithSessions } from "./api";

const HEADER_FILL = "283C6E";
const ALT_FILL = "F5F7FA";
const ACCENT_FILL = "F59E0B";

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function txt(s: string, opts: { bold?: boolean; color?: string; size?: number } = {}) {
  return new TextRun({ text: s, bold: opts.bold, color: opts.color, size: opts.size, font: "Arial" });
}
function p(text: string | TextRun[], opts: { bold?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel]; spacingAfter?: number } = {}) {
  const children = typeof text === "string" ? [txt(text, { bold: opts.bold })] : text;
  return new Paragraph({
    children,
    alignment: opts.align,
    heading: opts.heading,
    spacing: { after: opts.spacingAfter ?? 80 },
  });
}
function headerCell(text: string, width?: number) {
  return new TableCell({
    borders: cellBorders,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: { fill: HEADER_FILL, type: ShadingType.CLEAR, color: "auto" },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ children: [txt(text, { bold: true, color: "FFFFFF" })] })],
  });
}
function bodyCell(text: string, opts: { width?: number; bold?: boolean; fill?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}) {
  return new TableCell({
    borders: cellBorders,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ alignment: opts.align, children: [txt(text, { bold: opts.bold })] })],
  });
}
async function buildHeader(settings: Settings, rightText?: string) {
  const sub = [settings.cnpj && `CNPJ ${settings.cnpj}`, settings.phone, settings.address].filter(Boolean).join("  •  ");
  
  const headerChildren: any[] = [];
  if (settings.logoUrl) {
    const img = await fetchOrientedImage(settings.logoUrl, "image/png");
    if (img) {
      const maxH = 40;
      const w = (img.w / img.h) * maxH;
      headerChildren.push(new ImageRun({ type: "png", data: img.data, transformation: { width: Math.round(w), height: maxH } }));
      headerChildren.push(txt("   ")); // spacing
    }
  }
  headerChildren.push(txt(settings.companyName || "Relatório", { bold: true, size: 32 }));

  const out: Paragraph[] = [
    p(headerChildren, { spacingAfter: 40 }),
  ];
  if (sub) out.push(p([txt(sub, { size: 18, color: "555555" })], { spacingAfter: 20 }));
  out.push(p([txt(`Emitido em ${format(new Date(), "dd/MM/yyyy HH:mm")}${rightText ? `   •   ${rightText}` : ""}`, { size: 18, color: "555555" })], { spacingAfter: 200 }));
  return out;
}
function makeTable(head: string[], rows: string[][], colWidths: number[]) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: head.map((h, i) => headerCell(h, colWidths[i])), tableHeader: true }),
      ...rows.map((r, ri) => new TableRow({
        children: r.map((c, i) => bodyCell(c, { width: colWidths[i], fill: ri % 2 === 1 ? ALT_FILL : undefined })),
      })),
    ],
  });
}
function fmtDate(d: string) { return format(new Date(d + "T00:00:00"), "dd/MM/yyyy"); }

async function pack(doc: Document, filename: string) {
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

// ===================== CLIENT REPORT =====================
export async function exportClientReportDocx(
  client: Client,
  reports: ServiceReport[],
  settings: Settings,
  period?: { from?: string; to?: string },
  sessions: ServiceSession[] = [],
) {
  const rows = reports.map(r => {
    const t = reportTotalsWithSessions(r, sessions, client);
    return [
      r.orderNumber || "—",
      fmtDate(r.date),
      r.machine,
      r.type === "corretiva" ? "Corretiva" : "Preventiva",
      fmtHours(t.service),
      fmtHours(t.travelOut + t.travelBack),
      `${t.km} km`,
      fmtCurrency(t.total),
    ];
  });
  const totals = reports.reduce((acc, r) => {
    const t = reportTotalsWithSessions(r, sessions, client);
    return {
      hours: acc.hours + t.totalHours, service: acc.service + t.service,
      travel: acc.travel + t.travelOut + t.travelBack, km: acc.km + t.km,
      hoursValue: acc.hoursValue + t.hoursValue, kmValue: acc.kmValue + t.kmValue,
      total: acc.total + t.total,
    };
  }, { hours: 0, service: 0, travel: 0, km: 0, hoursValue: 0, kmValue: 0, total: 0 });

  const periodText = (period?.from || period?.to)
    ? `Período: ${period?.from ? fmtDate(period.from) : "—"} a ${period?.to ? fmtDate(period.to) : "—"}`
    : "";

  const children: any[] = [
    ...(await buildHeader(settings)),
    p([txt("Relatório por Cliente", { bold: true, size: 28 })], { spacingAfter: 120 }),
    p(`Cliente: ${client.name}`, { bold: true }),
    p(`Valor/hora: ${fmtCurrency(client.hourlyRate)}   •   Valor/km: ${fmtCurrency(client.kmRate)}`),
    ...(periodText ? [p(periodText)] : []),
    p(""),
    makeTable(
      ["OS", "Data", "Máquina", "Tipo", "Serviço", "Deslocamento", "KM", "Valor"],
      rows,
      [900, 1100, 1700, 1100, 900, 1300, 800, 1560],
    ),
    p(""),
    p([txt("Resumo", { bold: true, size: 24 })], { spacingAfter: 80 }),
    makeTable(
      ["Item", "Valor"],
      [
        ["Total de atendimentos", String(reports.length)],
        ["Horas de serviço", fmtHours(totals.service)],
        ["Horas de deslocamento", fmtHours(totals.travel)],
        ["Horas totais", fmtHours(totals.hours)],
        ["Quilometragem total", `${totals.km} km`],
        ["Valor por horas", fmtCurrency(totals.hoursValue)],
        ["Valor por km", fmtCurrency(totals.kmValue)],
        ["TOTAL A FATURAR", fmtCurrency(totals.total)],
      ],
      [5000, 4360],
    ),
  ];

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }],
  });
  await pack(doc, `relatorio-${client.name.replace(/\s+/g, "_")}-${format(new Date(), "yyyyMMdd")}.docx`);
}

// ===================== TECHNICIAN REPORT =====================
export async function exportTechnicianReportDocx(
  technician: { name: string; hourlyRate: number; kmRate: number; overtimeWeekdayRate: number; overtimeWeekendRate: number },
  reports: ServiceReport[],
  clientsById: Record<string, Client | undefined>,
  settings: Settings,
  period?: { from?: string; to?: string },
  filterClient?: Client,
  sessions: ServiceSession[] = [],
) {
  const rows = reports.map(r => {
    const t = technicianPayForReport(r, sessions, technician as any);
    return [
      r.orderNumber || "—",
      fmtDate(r.date),
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

  const periodText = (period?.from || period?.to)
    ? `Período: ${period?.from ? fmtDate(period.from) : "—"} a ${period?.to ? fmtDate(period.to) : "—"}`
    : "";

  const children: any[] = [
    ...(await buildHeader(settings)),
    p([txt("Relatório por Técnico", { bold: true, size: 28 })], { spacingAfter: 120 }),
    p(`Técnico: ${technician.name}`, { bold: true }),
    p(`Hora: ${fmtCurrency(technician.hourlyRate)}  •  KM: ${fmtCurrency(technician.kmRate)}  •  HE semana: ${fmtCurrency(technician.overtimeWeekdayRate)}  •  HE fim de semana: ${fmtCurrency(technician.overtimeWeekendRate)}`),
    p(`Cliente: ${filterClient ? filterClient.name : "Todos os clientes"}`),
    ...(periodText ? [p(periodText)] : []),
    p(""),
    makeTable(
      ["OS", "Data", "Cliente", "Horas", "HE Sem.", "HE F.S.", "KM", "A pagar"],
      rows,
      [900, 1100, 2200, 900, 900, 900, 800, 1660],
    ),
    p(""),
    p([txt("Resumo", { bold: true, size: 24 })], { spacingAfter: 80 }),
    makeTable(
      ["Item", "Valor"],
      [
        ["Total de atendimentos", String(reports.length)],
        ["Horas totais", fmtHours(totals.hours)],
        ["Horas extras semana", fmtHours(totals.ovtWk)],
        ["Horas extras fim de semana", fmtHours(totals.ovtWe)],
        ["Quilometragem total", `${totals.km} km`],
        ["Valor por horas", fmtCurrency(totals.hoursValue)],
        ["Valor por km", fmtCurrency(totals.kmValue)],
        ["TOTAL A PAGAR", fmtCurrency(totals.total)],
      ],
      [5000, 4360],
    ),
  ];

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }],
  });
  await pack(doc, `relatorio-tecnico-${technician.name.replace(/\s+/g, "_")}-${format(new Date(), "yyyyMMdd")}.docx`);
}

// ===================== SINGLE REPORT (operational) =====================
export async function exportSingleReportDocx(
  r: ServiceReport,
  client: Client | undefined,
  settings: Settings,
  opts: { includeValues?: boolean; sessions?: ServiceSession[]; technicians?: Technician[] } = {},
) {
  const includeValues = opts.includeValues !== false;
  const sessions = opts.sessions ?? [];
  const technicians = opts.technicians ?? [];
  const isPreventive = r.type === "preventiva";
  const t = reportTotals(r, client);
  const techByName = new Map(technicians.map(tt => [tt.id, tt.name]));

  const infoTable = makeTable(
    ["Campo", "Valor", "Campo", "Valor"],
    [
      ["Cliente", client?.name || "—", "Data", fmtDate(r.date)],
      ["Máquina", r.machine, "Tipo", isPreventive ? "Preventiva" : "Corretiva"],
      ["Solicitante", r.requester, "Técnico", r.technician || settings.technicianName || "—"],
    ],
    [1600, 3000, 1600, 3160],
  );

  const hoursTable = makeTable(
    ["Viagem de ida", "Serviço", "Viagem de volta", "KM"],
    [[
      `${r.travelOutStart} → ${r.travelOutEnd}\n${fmtHours(t.travelOut)}`,
      `${r.serviceStart} → ${r.serviceEnd}\n${fmtHours(t.service)}`,
      `${r.travelBackStart} → ${r.travelBackEnd}\n${fmtHours(t.travelBack)}`,
      `${r.km} km`,
    ]],
    [2400, 2400, 2400, 2160],
  );

  const children: any[] = [
    ...(await buildHeader(settings, `OS ${r.orderNumber || "—"}`)),
    p([txt("Relatório de Serviço", { bold: true, size: 28 })], { spacingAfter: 120 }),
    infoTable,
    p(""),
    p([txt(isPreventive ? "Descrição de Atividades Mecânicas" : "Descrição do serviço solicitado", { bold: true })]),
    p(r.description || "—"),
    p([txt(isPreventive ? "Descrição das Atividades Elétricas" : "Resumo dos serviços executados", { bold: true })]),
    p(r.summary || "—"),
  ];

  if (isPreventive && r.futureReplacements) {
    children.push(p([txt("Requisições para troca futura", { bold: true })]));
    children.push(p(r.futureReplacements));
  }

  children.push(p(""));
  children.push(hoursTable);

  if (includeValues) {
    const valuesRows: string[][] = [
      ["Horas totais", fmtHours(t.totalHours)],
      [`Horas × ${fmtCurrency(client?.hourlyRate ?? 0)}`, fmtCurrency(t.hoursValue)],
      [`${r.km} km × ${fmtCurrency(client?.kmRate ?? 0)}`, fmtCurrency(t.kmValue)],
      ["TOTAL", fmtCurrency(t.total)],
    ];
    children.push(p(""));
    children.push(makeTable(["Apuração", "Valor"], valuesRows, [5000, 4360]));
  }

  if (sessions.length > 0) {
    const totalsRow = reportTotalsWithSessions(r, sessions, client);
    const sessRows: string[][] = [
      [
        fmtDate(r.date), r.technician || "—",
        `${r.travelOutStart}→${r.travelOutEnd}`,
        `${r.serviceStart}→${r.serviceEnd}`,
        `${r.travelBackStart}→${r.travelBackEnd}`,
        String(r.km), fmtHours(r.overtimeWeekdayHours || 0), fmtHours(r.overtimeWeekendHours || 0),
      ],
      ...sessions.map(s => [
        fmtDate(s.date),
        (s.technicianId && techByName.get(s.technicianId)) || "—",
        `${s.travelOutStart}→${s.travelOutEnd}`,
        `${s.serviceStart}→${s.serviceEnd}`,
        `${s.travelBackStart}→${s.travelBackEnd}`,
        String(s.km),
        fmtHours(s.overtimeWeekdayHours || 0),
        fmtHours(s.overtimeWeekendHours || 0),
      ]),
    ];
    children.push(p(""));
    children.push(p([txt("Sessões de trabalho", { bold: true, size: 24 })]));
    children.push(makeTable(
      ["Data", "Técnico", "Ida", "Serviço", "Volta", "KM", "HE Sem.", "HE F.S."],
      sessRows,
      [1100, 1700, 1300, 1300, 1300, 700, 1000, 960],
    ));
    children.push(p([
      txt(`Totais — Horas: ${fmtHours(totalsRow.totalHours)} · KM: ${totalsRow.km}${includeValues ? ` · A cobrar: ${fmtCurrency(totalsRow.total)}` : ""}`, { bold: true }),
    ]));

    const activitiesBlock = sessions.filter(s => s.activitiesDone?.trim());
    if (activitiesBlock.length > 0) {
      children.push(p(""));
      children.push(p([txt("Histórico de atividades por sessão", { bold: true, size: 24 })]));
      for (const s of activitiesBlock) {
        children.push(p([txt(`${fmtDate(s.date)} — ${(s.technicianId && techByName.get(s.technicianId)) || "—"}`, { bold: true })]));
        children.push(p(s.activitiesDone));
      }
    }
  }

  if (r.observation) {
    children.push(p(""));
    children.push(p([txt("Observação", { bold: true })]));
    children.push(p(r.observation));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }],
  });
  await pack(doc, `OS-${r.orderNumber || r.id}-${client?.name?.replace(/\s+/g, "_") || "cliente"}.docx`);
}

// ===================== PREVENTIVE INFORMATIVE (with photos) =====================
async function fetchOrientedImage(url: string, format: string = "image/jpeg"): Promise<{ data: ArrayBuffer; w: number; h: number } | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    let bitmap: ImageBitmap | null = null;
    try { bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" } as any); }
    catch { bitmap = await createImageBitmap(blob); }
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close?.(); return null; }
    ctx.drawImage(bitmap, 0, 0);
    const w = bitmap.width, h = bitmap.height;
    bitmap.close?.();
    const out: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), format, format === "image/jpeg" ? 0.85 : undefined);
    });
    const buf = await out.arrayBuffer();
    return { data: buf, w, h };
  } catch { return null; }
}

export async function exportPreventiveInformativeReportDocx(
  r: ServiceReport,
  client: Client | undefined,
  settings: Settings,
) {
  const { listAttachments, getAttachmentUrl } = await import("./api");
  const atts = await listAttachments(r.id);

  const infoTable = makeTable(
    ["Campo", "Valor", "Campo", "Valor"],
    [
      ["Cliente", client?.name || "—", "Data", fmtDate(r.date)],
      ["Máquina", r.machine, "Solicitante", r.requester],
    ],
    [1600, 3000, 1600, 3160],
  );

  const children: any[] = [
    ...(await buildHeader(settings, `OS ${r.orderNumber || "—"}`)),
    p([txt("Relatório de Manutenção Preventiva", { bold: true, size: 28 })], { spacingAfter: 120 }),
    infoTable,
    p(""),
  ];

  const sectionHeading = (title: string, fill = HEADER_FILL) =>
    new Paragraph({
      shading: { fill, type: ShadingType.CLEAR, color: "auto" },
      spacing: { before: 160, after: 120 },
      children: [txt(title, { bold: true, color: "FFFFFF", size: 24 })],
    });

  const addGallery = async (kind: string, label: string) => {
    const items = atts.filter(a => a.kind === kind);
    if (items.length === 0) return;
    children.push(p([txt(label, { bold: true, color: "555555" })]));
    const maxW = 540; // pixels, ~ usable width with 0.75" margins
    for (const a of items) {
      try {
        const url = await getAttachmentUrl(a.storagePath);
        const img = await fetchOrientedImage(url);
        if (!img) continue;
        const ratio = img.w / img.h;
        let w = maxW, h = w / ratio;
        const maxH = 520;
        if (h > maxH) { h = maxH; w = h * ratio; }
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new ImageRun({ type: "jpg", data: img.data, transformation: { width: Math.round(w), height: Math.round(h) } } as any)],
        }));
      } catch (e) { console.error(e); }
    }
  };

  const addSection = async (title: string, body: string, beforeKind: string, afterKind: string) => {
    children.push(sectionHeading(title));
    if (body) children.push(p(body));
    await addGallery(beforeKind, "Antes");
    await addGallery(afterKind, "Depois");
  };

  await addSection("Atividades Mecânicas", r.description || "", "mechanical_before", "mechanical_after");
  await addSection("Atividades Elétricas", r.summary || "", "electrical_before", "electrical_after");

  if (r.futureReplacements) {
    children.push(sectionHeading("Requisições para troca futura", ACCENT_FILL));
    children.push(p(r.futureReplacements));
  }
  if (r.observation) {
    children.push(p(""));
    children.push(p([txt("Observação", { bold: true })]));
    children.push(p(r.observation));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, children }],
  });
  await pack(doc, `preventiva-${r.orderNumber || r.id}-${client?.name?.replace(/\s+/g, "_") || "cliente"}.docx`);
}
