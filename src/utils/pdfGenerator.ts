import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportPdfOptions {
  orientation: 'landscape' | 'portrait';
  fileName?: string;
  onProgress?: (progress: number, stage: string) => void;
}

/**
 * Client-side PDF export using html2canvas and jsPDF with high DPI rendering
 * Specifically calibrated for A4 Landscape (297mm x 210mm) official document sheets
 */
export async function generatePdfFromElement(
  elementId: string,
  options: ExportPdfOptions = { orientation: 'landscape' }
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  const { orientation = 'landscape', fileName = 'Koseki_Tohon_Terjemahan_KK.pdf', onProgress } = options;

  onProgress?.(10, 'Mempersiapkan dokumen...');

  // Save original scroll and positioning
  const originalWidth = element.style.width;
  const originalMaxWidth = element.style.maxWidth;

  try {
    onProgress?.(30, 'Merender dokumen A4 Landscape...');

    const isLandscape = orientation === 'landscape';
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const canvas = await html2canvas(element, {
      scale: 3.0, // High DPI (300 DPI) for crisp Japanese Kanji & razor-sharp lines
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    onProgress?.(70, 'Mengonversi ke PDF...');

    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;
    const marginX = isLandscape ? 8 : 10;
    const marginY = isLandscape ? 8 : 10;

    const printableWidth = pdfWidth - marginX * 2;
    const printableHeight = pdfHeight - marginY * 2;

    const imgWidth = printableWidth;
    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    if (imgHeight <= printableHeight) {
      // Single page document - perfectly centered vertically
      const yOffset = marginY + (printableHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', marginX, Math.max(marginY, yOffset), imgWidth, imgHeight);
    } else {
      // If height is slightly higher, scale to fit precisely on single A4 sheet without multi-page break
      const scaleFactor = printableHeight / imgHeight;
      const scaledWidth = imgWidth * scaleFactor;
      const scaledHeight = printableHeight;
      const xOffset = marginX + (printableWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, marginY, scaledWidth, scaledHeight);
    }

    onProgress?.(95, 'Menyimpan file PDF...');
    pdf.save(fileName);
    onProgress?.(100, 'Selesai!');
  } finally {
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
  }
}

/**
 * Native vector print dialog with browser's high quality PDF engine
 */
export function triggerBrowserPrint(): void {
  window.print();
}
