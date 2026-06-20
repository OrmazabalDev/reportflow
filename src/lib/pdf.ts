import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { fileService } from "@/lib/infrastructure/BrowserFileService";
import type { ReportWithRelations } from "@/lib/domain/types";
import { formatDate } from "@/lib/utils";
import { exportAndSharePdf } from "@/lib/pdf/pdf-export.service";

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 48;

const colors = {
  ink: rgb(0.16, 0.19, 0.25),
  body: rgb(0.28, 0.31, 0.37),
  muted: rgb(0.47, 0.53, 0.61),
  line: rgb(0.87, 0.9, 0.94),
  panel: rgb(0.97, 0.98, 0.99),
  primary: rgb(0.19, 0.28, 0.39),
  done: rgb(0.12, 0.55, 0.35),
  observed: rgb(0.78, 0.52, 0.11),
  pending: rgb(0.45, 0.49, 0.56),
  notApplicable: rgb(0.55, 0.59, 0.66),
};

type TextOptions = {
  font: PDFFont;
  size: number;
  color?: ReturnType<typeof rgb>;
  lineHeight?: number;
  maxWidth?: number;
};

function splitText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(trial, size);

    if (width <= maxWidth) {
      current = trial;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function drawTextBlock(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  options: TextOptions,
) {
  const color = options.color ?? colors.ink;
  const maxWidth = options.maxWidth ?? pageWidth - margin * 2;
  const lineHeight = options.lineHeight ?? options.size * 1.35;
  const lines = splitText(text, options.font, options.size, maxWidth);

  let cursor = y;

  for (const line of lines) {
    page.drawText(line, {
      x,
      y: cursor,
      size: options.size,
      font: options.font,
      color,
    });
    cursor -= lineHeight;
  }

  return cursor;
}

function getFooterCopy(report: ReportWithRelations) {
  if (report.footerText) return report.footerText;
  return "Documento interno de carácter restringido.";
}

async function drawStoredImage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  imagePath: string | null,
  x: number,
  y: number,
  width: number,
  height: number,
  font: PDFFont,
  placeholder: string,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: colors.line,
    borderWidth: 1,
    color: colors.panel,
  });

  if (!imagePath) {
    drawTextBlock(page, placeholder, x + 18, y + height / 2 + 4, {
      font,
      size: 10,
      color: colors.muted,
      maxWidth: width - 36,
      lineHeight: 14,
    });
    return;
  }

  try {
    const file = await fileService.readImage(imagePath);
    const image = await pdfDoc.embedJpg(file.content);
    const imageDims = image.scale(1);
    const ratio = Math.min(width / imageDims.width, height / imageDims.height);
    const finalWidth = imageDims.width * ratio;
    const finalHeight = imageDims.height * ratio;

    page.drawImage(image, {
      x: x + (width - finalWidth) / 2,
      y: y + (height - finalHeight) / 2,
      width: finalWidth,
      height: finalHeight,
    });
  } catch {
    drawTextBlock(page, "No fue posible cargar la imagen", x + 18, y + height / 2 + 4, {
      font,
      size: 10,
      color: colors.muted,
      maxWidth: width - 36,
      lineHeight: 14,
    });
  }
}

export async function buildReportPdf(report: ReportWithRelations) {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - margin;

  const checkPageBreak = (neededSpace: number) => {
    if (cursorY - neededSpace < margin + 40) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - margin;
    }
  };

  // --- A. Encabezado Compacto ---
  const headerHeight = 60;
  const hasLogo = Boolean(report.companyLogoPath);
  const headerLeftOffset = hasLogo ? margin + 90 : margin;

  if (hasLogo) {
    await drawStoredImage(
      pdfDoc,
      page,
      report.companyLogoPath!,
      margin,
      cursorY - 40,
      80,
      40,
      regular,
      "Logo"
    );
  }
  
  const statusLabels: Record<string, string> = { DRAFT: "Borrador", FINAL: "FINALIZADO", ARCHIVED: "Archivado" };
  const statusText = statusLabels[report.status] || report.status;

  const empresaText = (report.companyName || "Empresa").toUpperCase();
  const tituloText = (report.title || "Reporte Operativo").toUpperCase();
  drawTextBlock(page, empresaText, headerLeftOffset, cursorY, { font: bold, size: 10, color: colors.muted });
  
  const titleWidth = bold.widthOfTextAtSize(tituloText, 10);
  drawTextBlock(page, tituloText, pageWidth - margin - titleWidth, cursorY, { font: bold, size: 10, color: colors.primary });

  const areaText = report.area || "Área/Unidad";
  drawTextBlock(page, areaText, headerLeftOffset, cursorY - 14, { font: regular, size: 10, color: colors.muted });
  
  const estadoText = `Estado: ${statusText}`;
  const estadoWidth = bold.widthOfTextAtSize(estadoText, 10);
  drawTextBlock(page, estadoText, pageWidth - margin - estadoWidth, cursorY - 14, { font: bold, size: 10, color: colors.primary });

  const formattedDate = formatDate(report.date);
  const linea3 = `Fecha: ${formattedDate} | Autor: ${report.author || "N/A"}${report.area ? ` | Área: ${report.area}` : ""}`;
  drawTextBlock(page, linea3, headerLeftOffset, cursorY - 34, { font: regular, size: 10, color: colors.ink });

  cursorY -= headerHeight;

  page.drawLine({ start: { x: margin, y: cursorY }, end: { x: pageWidth - margin, y: cursorY }, thickness: 1, color: colors.line });
  cursorY -= 20;

  // --- B. Resumen Ejecutivo ---
  if (report.description) {
    checkPageBreak(80);
    drawTextBlock(page, "Resumen Ejecutivo", margin, cursorY, { font: bold, size: 11, color: colors.ink });
    cursorY -= 16;
    cursorY = drawTextBlock(page, report.description, margin, cursorY, { font: regular, size: 10, color: colors.body, lineHeight: 14 });
    cursorY -= 20;
  }

  // --- C. Checklist (Prioridad 1) ---
  if (report.checklistItems.length > 0) {
    checkPageBreak(60);
    drawTextBlock(page, "Checklist de Condiciones", margin, cursorY, { font: bold, size: 14, color: colors.ink });
    cursorY -= 24;

    // Table Header
    page.drawRectangle({ x: margin, y: cursorY - 20, width: pageWidth - margin * 2, height: 20, color: colors.panel });
    drawTextBlock(page, "Nº", margin + 5, cursorY - 6, { font: bold, size: 9, color: colors.muted });
    drawTextBlock(page, "Ítem", margin + 30, cursorY - 6, { font: bold, size: 9, color: colors.muted });
    drawTextBlock(page, "Estado", pageWidth - margin - 100, cursorY - 6, { font: bold, size: 9, color: colors.muted });
    cursorY -= 20;

    for (const [index, item] of report.checklistItems.entries()) {
      const itemLines = splitText(item.text || "", bold, 10, pageWidth - margin * 2 - 140);
      const noteLines = item.note ? splitText(item.note, regular, 9, pageWidth - margin * 2 - 140) : [];
      const itemHeight = Math.max(24, (itemLines.length * 14) + (noteLines.length * 12) + 16);
      
      checkPageBreak(itemHeight);

      // Nº
      drawTextBlock(page, `${index + 1}`, margin + 5, cursorY - 16, { font: regular, size: 10, color: colors.muted });
      
      // Ítem
      let textY = cursorY - 16;
      for (const line of itemLines) {
        page.drawText(line, { x: margin + 30, y: textY, size: 10, font: bold, color: colors.ink });
        textY -= 14;
      }
      
      if (noteLines.length > 0) {
        textY -= 2;
        for (const line of noteLines) {
          page.drawText(line, { x: margin + 30, y: textY, size: 9, font: regular, color: colors.body });
          textY -= 12;
        }
      }

      // Estado
      let statusLabel = "Pendiente";
      let statusColor = colors.pending;

      if (item.status === "DONE") {
        statusLabel = "Realizado";
        statusColor = colors.done;
      } else if (item.status === "OBSERVED") {
        statusLabel = "Observado";
        statusColor = colors.observed;
      } else if (item.status === "NOT_APPLICABLE") {
        statusLabel = "No aplica";
        statusColor = colors.notApplicable;
      }
      
      page.drawRectangle({ x: pageWidth - margin - 100, y: cursorY - 22, width: 8, height: 8, color: statusColor });
      drawTextBlock(page, statusLabel, pageWidth - margin - 86, cursorY - 16, { font: bold, size: 9, color: statusColor });

      cursorY -= itemHeight;
      page.drawLine({ start: { x: margin, y: cursorY }, end: { x: pageWidth - margin, y: cursorY }, thickness: 1, color: colors.line });
    }
    cursorY -= 30;
  }

  // --- D. Hallazgos y E. Grilla Fotográfica ---
  if (report.findings.length > 0) {
    checkPageBreak(80);
    drawTextBlock(page, "Resumen de Hallazgos", margin, cursorY, { font: bold, size: 14, color: colors.ink });
    cursorY -= 18;
    drawTextBlock(page, `Total de hallazgos registrados: ${report.findings.length}`, margin, cursorY, { font: regular, size: 10, color: colors.muted });
    cursorY -= 30;

    const colWidth = (pageWidth - margin * 2 - 20) / 2;
    const imgHeight = 160;
    const blockHeight = imgHeight + 80;

    for (let i = 0; i < report.findings.length; i += 2) {
      checkPageBreak(blockHeight);
      
      const item1 = report.findings[i];
      const item2 = report.findings[i + 1];

      // Primera columna
      await drawStoredImage(pdfDoc, page, item1.imagePath, margin, cursorY - imgHeight, colWidth, imgHeight, regular, "Sin evidencia adjunta");
      drawTextBlock(page, `Hallazgo ${i + 1}: ${item1.caption || "Sin título"}`, margin, cursorY - imgHeight - 20, { font: bold, size: 10, color: colors.ink, maxWidth: colWidth });
      if (item1.note) {
        drawTextBlock(page, item1.note, margin, cursorY - imgHeight - 34, { font: regular, size: 9, color: colors.body, maxWidth: colWidth, lineHeight: 12 });
      }

      // Segunda columna (si existe)
      if (item2) {
        const x2 = margin + colWidth + 20;
        await drawStoredImage(pdfDoc, page, item2.imagePath, x2, cursorY - imgHeight, colWidth, imgHeight, regular, "Sin evidencia adjunta");
        drawTextBlock(page, `Hallazgo ${i + 2}: ${item2.caption || "Sin título"}`, x2, cursorY - imgHeight - 20, { font: bold, size: 10, color: colors.ink, maxWidth: colWidth });
        if (item2.note) {
          drawTextBlock(page, item2.note, x2, cursorY - imgHeight - 34, { font: regular, size: 9, color: colors.body, maxWidth: colWidth, lineHeight: 12 });
        }
      }

      cursorY -= blockHeight;
    }
  }

  // --- F. Firmas ---
  checkPageBreak(120);
  cursorY -= 60;
  
  const sigWidth = 160;
  // Firma Izquierda
  page.drawLine({ start: { x: margin + 20, y: cursorY }, end: { x: margin + 20 + sigWidth, y: cursorY }, thickness: 1, color: colors.ink });
  drawTextBlock(page, "Firma Responsable", margin + 20, cursorY - 16, { font: bold, size: 9, color: colors.muted });
  
  // Firma Derecha
  page.drawLine({ start: { x: pageWidth - margin - sigWidth - 20, y: cursorY }, end: { x: pageWidth - margin - 20, y: cursorY }, thickness: 1, color: colors.ink });
  drawTextBlock(page, "Firma Revisión / Aprobación", pageWidth - margin - sigWidth - 20, cursorY - 16, { font: bold, size: 9, color: colors.muted });

  // --- Pie de página y paginación en todas las hojas ---
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  const footerText = getFooterCopy(report);

  for (let i = 0; i < totalPages; i++) {
    const p = pages[i];
    p.drawLine({
      start: { x: margin, y: 34 },
      end: { x: pageWidth - margin, y: 34 },
      thickness: 1,
      color: colors.line,
    });

    drawTextBlock(p, footerText, margin, 20, {
      font: regular,
      size: 9,
      color: colors.muted,
      maxWidth: pageWidth - margin * 2 - 100,
    });

    drawTextBlock(p, `Página ${i + 1} / ${totalPages}`, pageWidth - margin - 60, 20, {
      font: regular,
      size: 9,
      color: colors.muted,
    });
  }

  return pdfDoc.save();
}

export async function downloadReportPdf(report: ReportWithRelations) {
  const bytes = await buildReportPdf(report);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  await exportAndSharePdf(blob, `reportflow-${report.id}.pdf`);
}
