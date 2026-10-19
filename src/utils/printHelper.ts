/**
 * High-reliability printing utility for web apps and iframe environments
 */

export function printElementById(elementId: string, documentTitle: string = 'เอกสารราชการ'): boolean {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Print element #${elementId} not found, falling back to window.print()`);
    try {
      window.print();
      return true;
    } catch (err) {
      console.error('window.print failed:', err);
      return false;
    }
  }

  try {
    // Collect all stylesheets from current document
    let stylesHtml = '';
    const styleTags = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleTags.forEach((tag) => {
      stylesHtml += tag.outerHTML;
    });

    // Create an isolated printable HTML payload
    const printContent = `
      <!DOCTYPE html>
      <html lang="th">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${documentTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
          ${stylesHtml}
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              background-color: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            .print-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 0 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .print-page-sheet {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 auto !important;
              max-width: 100% !important;
              width: 100% !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${element.outerHTML}
          </div>
        </body>
      </html>
    `;

    // Strategy 1: Hidden iframe print (Works inside sandboxed iframes & cross-origin previews)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('title', 'Print Frame');

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print failed, falling back to window.print()', e);
          window.print();
        } finally {
          // Remove iframe after print dialog closes
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }
      }, 300);

      return true;
    }
  } catch (error) {
    console.error('Print utility error, falling back to window.print():', error);
  }

  // Fallback to standard window.print()
  try {
    window.print();
    return true;
  } catch (err) {
    console.error('Standard window.print failed:', err);
    return false;
  }
}

/**
 * Open printable document in a new window/tab for full-screen printing
 */
export function openPrintableTab(elementId: string, documentTitle: string = 'เอกสารราชการ'): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  let stylesHtml = '';
  const styleTags = document.querySelectorAll('style, link[rel="stylesheet"]');
  styleTags.forEach((tag) => {
    stylesHtml += tag.outerHTML;
  });

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${documentTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
        ${stylesHtml}
        <style>
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          body {
            font-family: 'Sarabun', sans-serif !important;
            background: #f8fafc;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
          }
          .no-print {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center;
          }
          .print-btn {
            background: #1d4ed8;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 14px;
            border: none;
            cursor: pointer;
          }
          .print-btn:hover {
            background: #1e40af;
          }
          .content-wrap {
            max-width: 800px;
            width: 100%;
            background: white;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            padding: 30px;
            border-radius: 12px;
          }
          @media print {
            html, body {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            .content-wrap {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 auto !important;
              max-width: 100% !important;
              width: 100% !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
          }
        </style>
      </head>
      <body>
        <div>
          <div class="no-print">
            <button class="print-btn" onclick="window.print()">🖨️ สั่งพิมพ์เอกสารนี้ (Print Now)</button>
            <button class="print-btn" style="background:#64748b" onclick="window.close()">ปิดหน้าต่าง</button>
          </div>
          <div class="content-wrap">
            ${element.innerHTML}
          </div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, '_blank');
  if (win) {
    win.focus();
  } else {
    // If popup blocked, print via iframe
    printElementById(elementId, documentTitle);
  }
}
