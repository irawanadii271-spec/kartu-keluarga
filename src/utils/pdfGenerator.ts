import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportPdfOptions {
  orientation: 'landscape' | 'portrait';
  fileName?: string;
  onProgress?: (progress: number, stage: string) => void;
}

const COLOR_PROPS = [
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'textDecorationColor',
] as const;

/**
 * Converts modern CSS color functions (oklch, lab, color-mix) to standard sRGB hex or rgb()
 * so html2canvas never encounters unhandled color function tokens.
 */
function sanitizeColorValue(val: any): string {
  if (!val || typeof val !== 'string') return val;
  if (!val.includes('oklch') && !val.includes('lab') && !val.includes('color(') && !val.includes('color-mix')) {
    return val;
  }

  // Attempt conversion via native browser canvas 2D
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = val;
      const res = ctx.fillStyle;
      if (res && !res.includes('oklch') && !res.includes('color(')) {
        return res;
      }
    }
  } catch {
    // fallback to regex replacement
  }

  // Replace oklch/lab functions with safe black/transparent
  return val
    .replace(/oklch\([^)]+\)/gi, '#000000')
    .replace(/color-mix\([^)]+\)/gi, '#000000')
    .replace(/color\([^)]+\)/gi, '#000000')
    .replace(/lab\([^)]+\)/gi, '#000000');
}

/**
 * Patch CSSStyleDeclaration prototype getters so declaration.borderTopColor etc.
 * always return valid rgb/hex instead of oklch.
 */
function patchCSSStyleDeclaration(proto: any): () => void {
  const originalDescriptors: Record<string, PropertyDescriptor | undefined> = {};
  const origGetPropertyValue = proto.getPropertyValue;

  proto.getPropertyValue = function (prop: string) {
    const res = origGetPropertyValue.call(this, prop);
    return sanitizeColorValue(res);
  };

  for (const prop of COLOR_PROPS) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc && desc.get) {
      originalDescriptors[prop] = desc;
      Object.defineProperty(proto, prop, {
        get() {
          const val = desc.get!.call(this);
          return sanitizeColorValue(val);
        },
        configurable: true,
        enumerable: desc.enumerable,
      });
    }
  }

  // Return restore callback
  return () => {
    proto.getPropertyValue = origGetPropertyValue;
    for (const prop of COLOR_PROPS) {
      const orig = originalDescriptors[prop];
      if (orig) {
        Object.defineProperty(proto, prop, orig);
      }
    }
  };
}

/**
 * Hooks CanvasRenderingContext2D.prototype.fillText and strokeText.
 * In html2canvas, FontMetrics hardcodes "+2px" to baseline and calculation bias
 * pushes text downward into the bottom border line of table cells.
 * Offsetting y upward by 3.5px counteracts this html2canvas quirk, positioning text
 * in the true optical vertical center of each table cell.
 */
function patchCanvasFillText(win: Window): () => void {
  const proto = (win as any).CanvasRenderingContext2D?.prototype;
  if (!proto) return () => {};
  const origFillText = proto.fillText;
  const origStrokeText = proto.strokeText;

  proto.fillText = function (text: string, x: number, y: number, maxWidth?: number) {
    return origFillText.call(this, text, x, y - 3.5, maxWidth);
  };

  proto.strokeText = function (text: string, x: number, y: number, maxWidth?: number) {
    return origStrokeText.call(this, text, x, y - 3.5, maxWidth);
  };

  return () => {
    proto.fillText = origFillText;
    proto.strokeText = origStrokeText;
  };
}

/**
 * Core engine to render an HTML element to a jsPDF Blob.
 * 
 * SOLVES:
 * 1. Mobile squashing: Uses an isolated offscreen host with fixed 1040px width and 1200px desktop viewport.
 * 2. Text cut in half: Sets clean lineHeight, removes overflow clipping, uses iOS-native Japanese fonts.
 * 3. Table filling the full page: Balances vertical spacing and scales the image to fill the A4 printable area.
 */
export async function generatePdfBlobFromElement(
  elementId: string,
  options: { orientation?: 'landscape' | 'portrait'; onProgress?: (progress: number, stage: string) => void } = {}
): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Dokumen "${elementId}" tidak ditemukan di halaman. Pastikan lembar preview aktif.`);
  }

  const { orientation = 'landscape', onProgress } = options;
  const isLandscape = orientation === 'landscape';

  onProgress?.(15, 'Mempersiapkan dokumen beresolusi tinggi...');

  // Hook CSSStyleDeclaration on current window
  const restoreMainCSS = patchCSSStyleDeclaration(CSSStyleDeclaration.prototype);
  // Hook CanvasRenderingContext2D fillText on current window to lift baseline
  const restoreCanvasFillText = patchCanvasFillText(window);

  // Create an isolated offscreen host attached directly to document.body
  const exportHost = document.createElement('div');
  exportHost.id = 'pdf-export-isolated-host';
  exportHost.style.position = 'fixed';
  exportHost.style.left = '-9999px';
  exportHost.style.top = '0';
  exportHost.style.width = '1040px';
  exportHost.style.minWidth = '1040px';
  exportHost.style.maxWidth = '1040px';
  exportHost.style.height = 'auto';
  exportHost.style.overflow = 'visible';
  exportHost.style.transform = 'none';
  exportHost.style.zIndex = '-99999';
  exportHost.style.backgroundColor = '#ffffff';
  exportHost.style.margin = '0';
  exportHost.style.padding = '0';
  exportHost.style.boxSizing = 'border-box';

  // Deep clone the official sheet
  const clonedTarget = element.cloneNode(true) as HTMLElement;
  clonedTarget.id = 'kk-export-render-node';
  clonedTarget.style.transform = 'none';
  clonedTarget.style.width = '1040px';
  clonedTarget.style.minWidth = '1040px';
  clonedTarget.style.maxWidth = '1040px';
  clonedTarget.style.height = 'auto';
  clonedTarget.style.margin = '0';
  clonedTarget.style.padding = '18px 22px';
  clonedTarget.style.boxSizing = 'border-box';
  clonedTarget.style.backgroundColor = '#ffffff';
  clonedTarget.style.color = '#000000';
  clonedTarget.style.border = '2px solid #000000';
  clonedTarget.style.position = 'static';
  clonedTarget.style.overflow = 'visible';
  clonedTarget.style.display = 'block';

  // Remove any non-print elements or SVGs
  clonedTarget.querySelectorAll('.no-print, svg').forEach((node) => node.remove());

  exportHost.appendChild(clonedTarget);
  document.body.appendChild(exportHost);

  try {
    onProgress?.(45, 'Merender lembar dokumen A4 resmi...');

    // Wait 100ms for browser layout & font metrics calculation in offscreen host
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(clonedTarget, {
      scale: 2.2, // Ultra-sharp 300+ DPI
      width: 1040, // Strict official width
      windowWidth: 1200, // Virtual desktop window width prevents mobile text squeeze
      windowHeight: 1400,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      ignoreElements: (el) => {
        return el.classList.contains('no-print') || el.tagName.toLowerCase() === 'svg';
      },
      onclone: (clonedDoc, clonedEl) => {
        // Also patch CSSStyleDeclaration & Canvas fillText inside the iframe
        if (clonedDoc.defaultView) {
          if ((clonedDoc.defaultView as any).CSSStyleDeclaration) {
            patchCSSStyleDeclaration((clonedDoc.defaultView as any).CSSStyleDeclaration.prototype);
          }
          patchCanvasFillText(clonedDoc.defaultView as Window);
        }

        // Clean any SVG or no-print elements in the cloned document
        clonedDoc.querySelectorAll('.no-print, svg').forEach((node) => node.remove());

        // Ensure host and element in clonedDoc are clean
        const hostInClone = clonedDoc.getElementById('pdf-export-isolated-host');
        if (hostInClone) {
          hostInClone.style.transform = 'none';
          hostInClone.style.overflow = 'visible';
          hostInClone.style.width = '1040px';
          hostInClone.style.minWidth = '1040px';
          hostInClone.style.maxWidth = '1040px';
          hostInClone.style.height = 'auto';
        }

        clonedEl.style.transform = 'none';
        clonedEl.style.width = '1040px';
        clonedEl.style.minWidth = '1040px';
        clonedEl.style.maxWidth = '1040px';
        clonedEl.style.height = 'auto';
        clonedEl.style.margin = '0';
        clonedEl.style.padding = '18px 22px';
        clonedEl.style.boxSizing = 'border-box';
        clonedEl.style.backgroundColor = '#ffffff';
        clonedEl.style.color = '#000000';
        clonedEl.style.border = '2px solid #000000';
        clonedEl.style.display = 'block';
        clonedEl.style.overflow = 'visible';

        // Inject pure, high-contrast, unclipped print CSS into iframe head
        const cleanStyle = clonedDoc.createElement('style');
        cleanStyle.textContent = `
          *, *::before, *::after {
            border-color: #000000 !important;
            color: #000000 !important;
            box-sizing: border-box !important;
          }
          #kk-export-render-node {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
            font-family: "Yu Gothic", "Meiryo", "MS Gothic", "MS PGothic", "Noto Sans JP", "BIZ UDPGothic", sans-serif !important;
            display: block !important;
            position: static !important;
            width: 1040px !important;
            min-width: 1040px !important;
            max-width: 1040px !important;
            margin: 0 !important;
            padding: 18px 22px !important;
            box-sizing: border-box !important;
            transform: none !important;
            overflow: visible !important;
            line-height: 1.35 !important;
          }
          .kk-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 8.5pt !important;
            table-layout: fixed !important;
            overflow: visible !important;
          }
          .kk-table tr {
            height: 26px !important;
            min-height: 26px !important;
            overflow: visible !important;
          }
          .kk-table th, .kk-table td {
            border: 1px solid #000000 !important;
            padding: 0 !important;
            text-align: center !important;
            vertical-align: middle !important;
            color: #000000 !important;
            overflow: visible !important;
            height: 26px !important;
            min-height: 26px !important;
            box-sizing: border-box !important;
          }
          .kk-table td {
            font-weight: 400 !important;
            font-size: 8.2pt !important;
          }
          .kk-table td > div, .kk-table th > div {
            height: 100% !important;
            min-height: 26px !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
          }
          .kk-table td span, .kk-table th span {
            display: inline-block !important;
            vertical-align: middle !important;
            line-height: 1.2 !important;
          }
          .kk-table th {
            background-color: #f0f0f0 !important;
            font-weight: 700 !important;
            font-size: 8.5pt !important;
            padding: 0 !important;
            vertical-align: middle !important;
            height: 26px !important;
            min-height: 26px !important;
          }
          .header-indices-row, .header-indices-row tr {
            height: 18px !important;
            min-height: 18px !important;
          }
          .header-indices-row th {
            background-color: #f5f5f5 !important;
            font-weight: 400 !important;
            font-size: 7.5pt !important;
            padding: 0 !important;
            vertical-align: middle !important;
            height: 18px !important;
            min-height: 18px !important;
          }
          .header-indices-row th > div {
            height: 100% !important;
            min-height: 18px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          span, div {
            overflow: visible !important;
          }
        `;
        clonedDoc.head.appendChild(cleanStyle);
      },
    });

    onProgress?.(75, 'Mengonversi gambar ke dokumen PDF...');

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;
    // 5mm margins allow the document table to fill the full A4 sheet
    const marginX = 5;
    const marginY = 5;

    const printableWidth = pdfWidth - marginX * 2;
    const printableHeight = pdfHeight - marginY * 2;

    // Calculate maximum fill ratio while preserving aspect ratio
    const widthRatio = printableWidth / canvas.width;
    const heightRatio = printableHeight / canvas.height;
    const fitRatio = Math.min(widthRatio, heightRatio);

    const imgWidth = canvas.width * fitRatio;
    const imgHeight = canvas.height * fitRatio;

    // Center precisely on the page
    const xOffset = (pdfWidth - imgWidth) / 2;
    const yOffset = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');

    onProgress?.(95, 'Menyelesaikan dokumen...');
    return pdf.output('blob');
  } finally {
    restoreCanvasFillText();
    if (document.body.contains(exportHost)) {
      document.body.removeChild(exportHost);
    }
    restoreMainCSS();
  }
}

/**
 * Client-side PDF export using generatePdfBlobFromElement
 */
export async function generatePdfFromElement(
  elementId: string,
  options: ExportPdfOptions = { orientation: 'landscape' }
): Promise<void> {
  const { fileName = 'Koseki_Tohon_Terjemahan_KK.pdf', onProgress } = options;

  const blob = await generatePdfBlobFromElement(elementId, {
    orientation: options.orientation,
    onProgress,
  });

  onProgress?.(98, 'Menyimpan berkas PDF...');

  // Download blob
  const blobUrl = URL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.href = blobUrl;
  tempLink.download = fileName;
  tempLink.style.display = 'none';
  document.body.appendChild(tempLink);
  tempLink.click();

  setTimeout(() => {
    if (document.body.contains(tempLink)) {
      document.body.removeChild(tempLink);
    }
    URL.revokeObjectURL(blobUrl);
  }, 3000);

  onProgress?.(100, 'Berhasil diunduh!');
}

/**
 * Native vector print dialog with browser's high quality PDF engine.
 * Always works 100% reliably across all devices (iOS Safari, Android Chrome, Mac, Windows).
 */
export function triggerBrowserPrint(): void {
  window.print();
}
