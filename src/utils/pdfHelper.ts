import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  quality?: number;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Exports an HTML element directly as a crisp, proportional A4 PDF
 * perfectly fitted to A4 dimensions (210mm x 297mm) without overflowing.
 */
export async function exportElementToPdf(
  elementId: string,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return false;
  }

  const {
    filename = 'official_document.pdf',
    quality = 2, // 2x scale for ultra crisp text and QR code
    orientation = 'portrait',
  } = options;

  try {
    // Clone element or temporarily adjust for pristine capture
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1024, // Consistent desktop baseline
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.border = 'none';
          clonedEl.style.margin = '0 auto';
          clonedEl.style.width = '794px'; // 210mm in pixels at 96 DPI
          clonedEl.style.maxWidth = '794px';
          clonedEl.style.padding = '24px 32px';
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    // Calculate proportional fit to guarantee single page fit if possible
    const imgWidth = pdfWidth - 10; // 5mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pdfHeight - 10) {
      // Fits on exactly 1 page
      const offsetY = (pdfHeight - imgHeight) / 2; // Center vertically
      pdf.addImage(imgData, 'JPEG', 5, Math.max(5, offsetY), imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // If content is very tall, scale to fit 1 page A4 perfectly
      const scaledWidth = ((pdfHeight - 10) * canvas.width) / canvas.height;
      const offsetX = (pdfWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'JPEG', Math.max(5, offsetX), 5, scaledWidth, pdfHeight - 10, undefined, 'FAST');
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    
    // Fallback: try html2pdf dynamic import or window.print
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [5, 5, 5, 5] as [number, number, number, number],
        filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };
      await html2pdf().set(opt).from(element).save();
      return true;
    } catch (fallbackError) {
      console.error('Fallback html2pdf error:', fallbackError);
      window.print();
      return false;
    }
  }
}
