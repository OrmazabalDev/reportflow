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
  doneBg: rgb(0.92, 0.97, 0.94),
  observed: rgb(0.78, 0.52, 0.11),
  observedBg: rgb(0.99, 0.97, 0.92),
  pending: rgb(0.45, 0.49, 0.56),
  pendingBg: rgb(0.95, 0.96, 0.97),
  notApplicable: rgb(0.55, 0.59, 0.66),
  notApplicableBg: rgb(0.95, 0.96, 0.97),
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
  const headerHeight = 45;
  const hasLogo = Boolean(report.companyLogoPath);
  const headerLeftOffset = hasLogo ? margin + 80 : margin;

  if (hasLogo) {
    await drawStoredImage(
      pdfDoc,
      page,
      report.companyLogoPath!,
      margin,
      cursorY - 35,
      70,
      35,
      regular,
      "Logo"
    );
  }
  
  const statusLabels: Record<string, string> = { DRAFT: "Borrador", FINALIZED: "Finalizado", FINAL: "Finalizado", ARCHIVED: "Archivado" };
  const statusText = statusLabels[report.status] || report.status;

  // Left Column: Empresa y Área
  const empresaText = report.companyName || "Personal / General";
  const areaText = report.area ? `${report.area}` : "";
  
  page.drawText(empresaText.toUpperCase(), { x: headerLeftOffset, y: cursorY, size: 9, font: bold, color: colors.primary });
  if (areaText) {
    page.drawText(areaText, { x: headerLeftOffset, y: cursorY - 11, size: 8, font: regular, color: colors.muted });
  }

  // Right Column: Título, Autor, Fecha y Estado
  const rightColX = pageWidth - margin - 230; // 230px max width for right col
  const tituloText = report.title || "Reporte";
  const formattedDate = formatDate(report.date);
  const metaText = `${formattedDate} · ${report.author || "N/A"}`;
  const estadoText = `Estado: ${statusText}`;

  let currentRightY = cursorY;
  // Draw title
  const titleLines = splitText(tituloText.toUpperCase(), bold, 9, 230);
  for (const line of titleLines) {
    page.drawText(line, { x: rightColX, y: currentRightY, size: 9, font: bold, color: colors.ink });
    currentRightY -= 11;
  }
  page.drawText(metaText, { x: rightColX, y: currentRightY, size: 8, font: regular, color: colors.muted });
  page.drawText(estadoText, { x: rightColX, y: currentRightY - 11, size: 8, font: bold, color: colors.primary });

  cursorY -= headerHeight;

  page.drawLine({ start: { x: margin, y: cursorY }, end: { x: pageWidth - margin, y: cursorY }, thickness: 1, color: colors.line });
  cursorY -= 12;

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
      const itemLines = splitText(item.text || "", bold, 9, pageWidth - margin * 2 - 140);
      const noteLines = item.note ? splitText(item.note, regular, 8, pageWidth - margin * 2 - 140) : [];
      const itemHeight = Math.max(20, (itemLines.length * 12) + (noteLines.length * 10) + 10);
      
      checkPageBreak(itemHeight);

      // Nº
      drawTextBlock(page, `${index + 1}`, margin + 5, cursorY - 12, { font: regular, size: 9, color: colors.muted });
      
      // Ítem
      let textY = cursorY - 12;
      for (const line of itemLines) {
        page.drawText(line, { x: margin + 30, y: textY, size: 9, font: bold, color: colors.ink });
        textY -= 12;
      }
      
      if (noteLines.length > 0) {
        textY -= 1;
        for (const line of noteLines) {
          page.drawText(line, { x: margin + 30, y: textY, size: 8, font: regular, color: colors.body });
          textY -= 10;
        }
      }

      // Estado
      let statusLabel = "Pendiente";
      let statusColor = colors.pending;
      let statusBgColor = colors.pendingBg;

      if (item.status === "DONE") {
        statusLabel = "Realizado";
        statusColor = colors.done;
        statusBgColor = colors.doneBg;
      } else if (item.status === "OBSERVED") {
        statusLabel = "Observado";
        statusColor = colors.observed;
        statusBgColor = colors.observedBg;
      } else if (item.status === "NOT_APPLICABLE") {
        statusLabel = "No aplica";
        statusColor = colors.notApplicable;
        statusBgColor = colors.notApplicableBg;
      }

      // Draw Badge Background
      const badgeWidth = 70;
      const badgeHeight = 14;
      const badgeX = pageWidth - margin - badgeWidth;
      const badgeY = cursorY - 15;
      
      page.drawRectangle({
        x: badgeX,
        y: badgeY,
        width: badgeWidth,
        height: badgeHeight,
        color: statusBgColor,
        borderColor: statusColor,
        borderWidth: 0.5,
      });

      // Centered Text inside badge
      const textWidth = bold.widthOfTextAtSize(statusLabel, 7);
      const textX = badgeX + (badgeWidth - textWidth) / 2;
      const badgeTextY = badgeY + 4;
      
      page.drawText(statusLabel, {
        x: textX,
        y: badgeTextY,
        size: 7,
        font: bold,
        color: statusColor,
      });

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

    if (report.findings.length === 1) {
      // Dibujar 1 sola imagen a ancho completo
      const item = report.findings[0];
      const fullWidth = pageWidth - margin * 2;
      const imgHeight = 240;
      
      // Calculate caption lines and note lines to estimate block height
      const captionLines = splitText(`Hallazgo 1: ${item.caption || "Sin título"}`, bold, 10, fullWidth);
      const noteLines = item.note ? splitText(item.note, regular, 9, fullWidth) : [];
      const textHeight = (captionLines.length * 14) + (noteLines.length * 12) + 10;
      const blockHeight = imgHeight + textHeight + 15;

      checkPageBreak(blockHeight);

      await drawStoredImage(pdfDoc, page, item.imagePath, margin, cursorY - imgHeight, fullWidth, imgHeight, regular, "Sin evidencia adjunta");
      
      let textCursorY = cursorY - imgHeight - 16;
      for (const line of captionLines) {
        page.drawText(line, { x: margin, y: textCursorY, size: 10, font: bold, color: colors.ink });
        textCursorY -= 14;
      }
      
      if (noteLines.length > 0) {
        textCursorY -= 2;
        for (const line of noteLines) {
          page.drawText(line, { x: margin, y: textCursorY, size: 9, font: regular, color: colors.body });
          textCursorY -= 12;
        }
      }

      cursorY -= blockHeight;
    } else {
      // Dibujar grilla de 2 columnas
      const colWidth = (pageWidth - margin * 2 - 20) / 2;
      const imgHeight = 160;
      
      for (let i = 0; i < report.findings.length; i += 2) {
        const item1 = report.findings[i];
        const item2 = report.findings[i + 1];

        // Calculate max text height between col 1 and col 2
        const capLines1 = splitText(`Hallazgo ${i + 1}: ${item1.caption || "Sin título"}`, bold, 10, colWidth);
        const noteLines1 = item1.note ? splitText(item1.note, regular, 9, colWidth) : [];
        const textH1 = (capLines1.length * 14) + (noteLines1.length * 12) + 10;

        let textH2 = 0;
        let capLines2: string[] = [];
        let noteLines2: string[] = [];
        if (item2) {
          capLines2 = splitText(`Hallazgo ${i + 2}: ${item2.caption || "Sin título"}`, bold, 10, colWidth);
          noteLines2 = item2.note ? splitText(item2.note, regular, 9, colWidth) : [];
          textH2 = (capLines2.length * 14) + (noteLines2.length * 12) + 10;
        }

        const blockHeight = imgHeight + Math.max(textH1, textH2) + 15;
        checkPageBreak(blockHeight);

        // Columna 1
        await drawStoredImage(pdfDoc, page, item1.imagePath, margin, cursorY - imgHeight, colWidth, imgHeight, regular, "Sin evidencia adjunta");
        let textY1 = cursorY - imgHeight - 16;
        for (const line of capLines1) {
          page.drawText(line, { x: margin, y: textY1, size: 10, font: bold, color: colors.ink });
          textY1 -= 14;
        }
        if (noteLines1.length > 0) {
          textY1 -= 2;
          for (const line of noteLines1) {
            page.drawText(line, { x: margin, y: textY1, size: 9, font: regular, color: colors.body });
            textY1 -= 12;
          }
        }

        // Columna 2
        if (item2) {
          const x2 = margin + colWidth + 20;
          await drawStoredImage(pdfDoc, page, item2.imagePath, x2, cursorY - imgHeight, colWidth, imgHeight, regular, "Sin evidencia adjunta");
          let textY2 = cursorY - imgHeight - 16;
          for (const line of capLines2) {
            page.drawText(line, { x: x2, y: textY2, size: 10, font: bold, color: colors.ink });
            textY2 -= 14;
          }
          if (noteLines2.length > 0) {
            textY2 -= 2;
            for (const line of noteLines2) {
              page.drawText(line, { x: x2, y: textY2, size: 9, font: regular, color: colors.body });
              textY2 -= 12;
            }
          }
        }

        cursorY -= blockHeight;
      }
    }
    cursorY -= 15;
  }

  // --- F. Firmas ---
  if (report.includeSignatures !== false) {
    checkPageBreak(120);
    cursorY -= 50;
    
    const sigWidth = 160;
    // Firma Izquierda
    page.drawLine({ start: { x: margin + 20, y: cursorY }, end: { x: margin + 20 + sigWidth, y: cursorY }, thickness: 1, color: colors.ink });
    drawTextBlock(page, "Firma Responsable", margin + 20, cursorY - 16, { font: bold, size: 9, color: colors.muted });
    
    // Firma Derecha
    page.drawLine({ start: { x: pageWidth - margin - sigWidth - 20, y: cursorY }, end: { x: pageWidth - margin - 20, y: cursorY }, thickness: 1, color: colors.ink });
    drawTextBlock(page, "Firma Revisión / Aprobación", pageWidth - margin - sigWidth - 20, cursorY - 16, { font: bold, size: 9, color: colors.muted });
  }

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
