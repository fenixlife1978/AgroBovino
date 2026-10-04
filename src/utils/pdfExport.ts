import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportPdfOptions {
  fileName?: string;
  reportTitle?: string;
  farmName?: string;
}

/**
 * Exports an HTML element as a multi-page high-quality PDF document.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions = {}
): Promise<boolean> {
  try {
    const {
      fileName = `Informe-Tecnico-${new Date().toISOString().split('T')[0]}.pdf`,
    } = options;

    // Save initial element styles to restore later if modified
    const originalBg = element.style.backgroundColor;
    
    // Ensure element has white background for clean PDF rendering
    element.style.backgroundColor = '#ffffff';

    // Render HTML element to high-DPI canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x for sharp retina text and borders
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    // Restore original background
    element.style.backgroundColor = originalBg;

    const imgData = canvas.toDataURL('image/png', 1.0);

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10; // 10mm margin
    const contentWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    const pageContentHeight = pageHeight - margin * 2;

    let heightLeft = imgHeight;
    let position = margin;
    let page = 1;

    // First page
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      position,
      contentWidth,
      imgHeight,
      undefined,
      'FAST'
    );
    heightLeft -= pageContentHeight;

    // Subsequent pages if document height exceeds single A4 page
    while (heightLeft > 0) {
      position = margin - page * pageContentHeight;
      pdf.addPage('a4', 'portrait');
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        contentWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= pageContentHeight;
      page++;
    }

    // Save and trigger automatic direct download
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error al generar el archivo PDF:', error);
    return false;
  }
}
