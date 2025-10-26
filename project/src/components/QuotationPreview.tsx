import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Quotation } from '../types';

interface QuotationPreviewProps {
  quotation: Quotation;
  onClose: () => void;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ quotation, onClose }) => {
  console.log('Rendering QuotationPreview with quotation:', quotation);
  // Helper to estimate number of pages (A4, rough estimate by item count)
  const estimatePageCount = () => {
    // 1st page: header + customer info + 8 items, then 15 items per page
    const itemsPerFirstPage = 8;
    const itemsPerOtherPages = 15;
    const totalItems = quotation.items.length;
    if (totalItems <= itemsPerFirstPage) return 1;
    return 1 + Math.ceil((totalItems - itemsPerFirstPage) / itemsPerOtherPages);
  };

  const pageCount = estimatePageCount();

  const handlePrint = () => {
    // Add print styles dynamically
    const printStyles = `
      @media print {
        body * {
          visibility: hidden;
        }
        .printable-content, .printable-content * {
          visibility: visible;
        }
        .printable-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 15mm !important;
          box-sizing: border-box;
          font-size: 12px !important;
        }
        .no-print {
          display: none !important;
        }
        /* Allow table to break across pages and repeat thead on each page */
        table { page-break-inside: auto; border-collapse: collapse; }
        tr    { page-break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }

        @page {
          size: A4;
          margin: 0;
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);
    
    setTimeout(() => {
      window.print();
      document.head.removeChild(styleSheet);
    }, 100);
  };

  const handleDownload = () => {
    const items = (quotation.items || []).slice();

    const hasDiscountInRate = quotation.showDiscountInRate || items.some((it: any) => (it as any).unitPrice !== undefined && (it as any).unitPrice !== (it as any).mrp);

    const renderRow = (item: any) => {
      const hasUnitPrice = item.unitPrice !== undefined && item.unitPrice !== item.mrp;
      const showDiscountCol = !(quotation.showDiscountInRate || hasUnitPrice);
      const rateCell = (quotation.showDiscountInRate || hasUnitPrice)
        ? (item.unitPrice !== undefined ? item.unitPrice.toFixed(2) : (item.mrp - item.discount).toFixed(2))
        : (item.quantity * item.mrp).toFixed(2);

      return (
        '<tr>' +
        `<td style="border:1px solid #e5e7eb;padding:6px;">${item.productCode || ''}</td>` +
        `<td style="border:1px solid #e5e7eb;padding:6px;">${(item.productName || '') + (item.description ? ('<div style=\"font-size:10px;color:#6b7280;\">' + item.description + '</div>') : '')}</td>` +
        `<td style="border:1px solid #e5e7eb;padding:6px;text-align:center;">${item.quantity}${item.unit ? ' ' + item.unit : ''}</td>` +
        `<td style="border:1px solid #e5e7eb;padding:6px;text-align:right;">${item.mrp.toFixed(2)}</td>` +
        `<td style="border:1px solid #e5e7eb;padding:6px;text-align:right;">${rateCell}</td>` +
        (showDiscountCol ? `<td style="border:1px solid #e5e7eb;padding:6px;text-align:right;">${item.discount.toFixed(2)}</td>` : '') +
        `<td style="border:1px solid #e5e7eb;padding:6px;text-align:right;">${item.total.toFixed(2)}</td>` +
        '</tr>'
      );
    };

    const tableHeaderHtml = `
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="border:1px solid #e5e7eb;padding:6px;text-align:left;width:12%;">Item Code</th>
          <th style="border:1px solid #e5e7eb;padding:6px;text-align:left;width:40%;">Description</th>
          <th style="border:1px solid #e5e7eb;padding:6px;text-align:center;width:8%;">Qty</th>
          <th style="border:1px solid #e5e7eb;padding:6px;text-align:right;width:10%;">Unit Price (Rs.)</th>
          <th style="border:1px solid #e5e7eb;padding:6px;text-align:right;width:10%;">Rate (Rs.)</th>
          ${hasDiscountInRate ? '' : '<th style="border:1px solid #e5e7eb;padding:6px;text-align:right;width:10%;">Discount (Rs.)</th>'}
          <th style="border:1px solid #e5e7eb;padding:6px;text-align:right;width:10%;">Net Amount (Rs.)</th>
        </tr>
      </thead>
    `;

    const allRowsHtml = items.map(renderRow).join('');

    const headerHtmlFirst = `
      <div style="text-align:left;margin-bottom:8px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">
        <h1 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 8px 0;text-align:center;">SALES QUOTATION</h1>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-top:6px;">
          <div style="text-align:left;flex:1;">
            <h2 style="font-size:14px;color:#1e40af;margin:0 0 4px 0;">${quotation.receiverCompany || 'Your Company Name'}</h2>
            <div style="font-size:10px;color:#6b7280;line-height:1.2;margin-bottom:8px;">${quotation.receiverAddress ? (quotation.receiverAddress + '<br/>') : ''}${quotation.phone ? (quotation.phone + '<br/>') : ''}${quotation.customerEmail ? quotation.customerEmail : ''}</div>
            
            <div style="background:#f8fafc;padding:2px;border-radius:6px;display:inline-block;margin-top:32px">
            <div style="font-weight:700;font-size:12px;margin-bottom:6px;">Bill To:</div>
              <div style="font-weight:600;font-size:11px;color:#0f172a;">${quotation.customerName || ''}</div>
              <div style="font-size:10px;color:#6b7280;line-height:1.2;">${quotation.customerEmail || ''}${quotation.customerPhone ? ('<br/>' + quotation.customerPhone) : ''}</div>
            </div>
          </div>
          <div style="flex:0 0 320px;text-align:right;">
            <div style="background:#f8fafc;padding:8px;border-radius:8px;margin-bottom:8px;display:inline-block;text-align:right;">
              <div style="font-weight:700;color:#0f172a;">Dharshana Electricals</div>
              <div style="font-size:10px;color:#6b7280;margin-top:6px;line-height:1.2;">0777839065 / 0772050128<br/>No. 76/2/B Diyagama, Kiriwaththuduwa<br/>dharshanaelectrical60@gmail.com</div>
            </div>
              <div style="background:#eff6ff;padding:8px;border-radius:8px;display:inline-block;text-align:right;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <div style="font-size:11px;color:#475569;">Quotation No:</div>
                  <div style="font-weight:700;color:#1e40af;">#${typeof quotation.id === 'string' ? quotation.id.slice(-6).toUpperCase() : quotation.id !== undefined && quotation.id !== null ? String(quotation.id).slice(-6).toUpperCase() : '------'}</div>
                </div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#475569;line-height:1.2;">
                <div style="text-align:left;">Date:</div><div style="text-align:right;">${(() => { const dateStr = quotation.date || (quotation as any).createdDate; if (!dateStr) return ''; const dateObj = new Date(dateStr); return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); })()}</div>
              </div>
              ${quotation.orderRef ? (`<div style="margin-top:4px;font-size:10px;color:#475569;display:flex;justify-content:space-between;"><div style="text-align:left;">Order Ref:</div><div style="text-align:right;">${quotation.orderRef}</div></div>`) : ''}
              <div style="margin-top:4px;font-size:10px;color:#475569;display:flex;justify-content:space-between;"><div style="text-align:left;">Pages:</div><div style="text-align:right;">${pageCount}</div></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const totalsHtml = `
      <div style="display:block;margin-top:8px;clear:both;">
        <div style="float:right;width:240px;background:#f8fafc;padding:8px;border-radius:6px;">
          <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;"><div>Subtotal:</div><div>Rs.${quotation.subtotal.toFixed(2)}</div></div>
          ${hasDiscountInRate ? '' : `<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;color:#dc2626;"><div>Total Discount:</div><div>Rs.${quotation.totalDiscount.toFixed(2)}</div></div>`}
          <div style="border-top:1px solid #e5e7eb;padding-top:6px;display:flex;justify-content:space-between;font-weight:700;"><div>Total Amount:</div><div>Rs.${quotation.total.toFixed(2)}</div></div>
        </div>
      </div>
    `;

    const finalHtml = `<!DOCTYPE html>
      <html>
      <head>
        <title>Quotation</title>
        <meta charset="utf-8">
        <style>
          *{margin:0;padding:0;box-sizing:border-box;}
          html,body{height:100%;}
          @page{size:A4;margin:0;}
          body{font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif; background: #fff; margin:0;}
          .page{width:210mm; min-height:297mm; padding:12mm; box-sizing:border-box; display:block;}
          @media print {
            .page { page-break-after:always; break-after:page; }
            /* Prevent an extra blank page by disabling the forced break on the last page */
            .page:last-child { page-break-after: auto; break-after: auto; }
            table{page-break-inside:auto; border-collapse:collapse;}
            thead{display:table-header-group;}
            tfoot{display:table-footer-group;}
            tr{page-break-inside:avoid;}
            body, table, th, td, p, span { font-size:10px; }
            th, td{border:1px solid #ddd; padding:3px; vertical-align:top;}
            -webkit-print-color-adjust:exact;
          }
        </style>
      </head>
      <body>
        <div id="pages-root"></div>
        <table id="rows-master" style="visibility:hidden;position:absolute;left:-9999px;top:0;width:100%;border-collapse:collapse;">
          ${tableHeaderHtml}
          <tbody>
            ${allRowsHtml}
          </tbody>
        </table>
        <script>
          (function(){
            const HEADER_HTML_FIRST = ${JSON.stringify(headerHtmlFirst)};
            const TABLE_HEADER_HTML = ${JSON.stringify(tableHeaderHtml)};
            const TOTALS_HTML = ${JSON.stringify(totalsHtml)};

            const pagesRoot = document.getElementById('pages-root');
            const master = document.getElementById('rows-master');
            const rows = Array.from(master.querySelectorAll('tbody > tr'));

            function createPage(isFirst){
              const page = document.createElement('div');
              page.className = 'page';
              // build inner with optional header and a table with header and empty tbody
              page.innerHTML = (isFirst ? HEADER_HTML_FIRST : '') + '<div><div style="font-weight:700;margin-bottom:6px;">Items:</div><table style="width:100%;border-collapse:collapse;table-layout:fixed;">' + TABLE_HEADER_HTML + '<tbody></tbody></table></div>';
              pagesRoot.appendChild(page);
              return page;
            }

            let currentPage = createPage(true);

            for(let r of rows){
              const tbody = currentPage.querySelector('tbody');
              tbody.appendChild(r.cloneNode(true));
              // If overflow, move last row to new page
              if (currentPage.scrollHeight > currentPage.clientHeight) {
                tbody.removeChild(tbody.lastElementChild);
                currentPage = createPage(false);
                currentPage.querySelector('tbody').appendChild(r.cloneNode(true));
              }
            }

            // append totals to last page
            const lastPage = pagesRoot.lastElementChild;
            if (lastPage) {
              lastPage.insertAdjacentHTML('beforeend', TOTALS_HTML);
            }

            setTimeout(function(){ try{ window.print(); }catch(e){console.error(e);} }, 300);
          })();
        </script>
      </body>
      </html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('Please allow popups to download the PDF'); return; }
    win.document.write(finalHtml);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="no-print flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Quotation Preview</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Download PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              title="Print"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* A4 Format Content */}
        <div className="printable-content p-4 bg-white" style={{ maxWidth: '100%', margin: '0 auto' }}>
          {/* Header */}
          <div className="text-center mb-4 border-b-2 border-gray-300 pb-3">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">SALES QUOTATION</h1>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-left">
                <h2 className="text-lg font-bold text-blue-600 mb-1">{quotation.receiverCompany || 'Your Company Name'}</h2>
                <p className="text-xs text-gray-600">{quotation.receiverAddress || '123 Business Street'}</p>
                <p className="text-xs text-gray-600">{quotation.phone}</p>
                <p className="text-xs text-gray-600">{quotation.customerEmail}</p>
              </div>
              <div className="text-right">
                {/* Company Details box at the top */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">Dharshana Electricals</p>
                    <p className="text-sm text-gray-600 mt-1">0777839065 / 0772050128</p>
                    <p className="text-sm text-gray-600 mt-1">No. 76/2/B Diyagama, Kiriwaththuduwa</p>
                    <p className="text-sm text-gray-600">dharshanaelectrical60@gmail.com</p>
                  </div>
                </div>
                
                {/* Quotation Details box below company details */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between space-x-1">
                    <span className="text-xs text-gray-600">Quotation No:</span>
                    <span className="text-sm font-bold text-blue-600">#{
                      typeof quotation.id === 'string'
                        ? quotation.id.slice(-6).toUpperCase()
                        : quotation.id !== undefined && quotation.id !== null
                          ? String(quotation.id).slice(-6).toUpperCase()
                          : '------'
                    }</span>
                  </div>
                  <div className="flex items-center justify-between space-x-1 mt-1">
                    <span className="text-xs text-gray-600">Date:</span>
                    <span className="font-semibold text-xs">{
                      (() => {
                        const dateStr = quotation.date || (quotation as any).createdDate;
                        if (!dateStr) return '';
                        const dateObj = new Date(dateStr);
                        return dateObj.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      })()
                    }</span>
                  </div>
                  {quotation.orderRef && (
                    <div className="flex items-center justify-between space-x-1 mt-1">
                      <span className="text-xs text-gray-600">Order Ref:</span>
                      <span className="font-semibold text-xs">{quotation.orderRef}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between space-x-1 mt-1">
                    <span className="text-xs text-gray-600">Pages:</span>
                    <span className="font-semibold text-xs">{pageCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="">
            <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">Bill To:</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm text-gray-900">{quotation.customerName}</p>
              <p className="text-xs text-gray-600">{quotation.customerEmail}</p>
              {quotation.customerPhone && <p className="text-xs text-gray-600">{quotation.customerPhone}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">Items:</h3>
            <div className="w-full">
              <table className="w-full border-collapse border border-gray-300" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-1 py-2 text-left font-semibold text-xs" style={{ width: (() => {
                      const hasDiscountInRate = quotation.showDiscountInRate || 
                        quotation.items.some(item => {
                          const itemWithUnitPrice = item as any;
                          return itemWithUnitPrice.unitPrice !== undefined && itemWithUnitPrice.unitPrice !== item.mrp;
                        });
                      return hasDiscountInRate ? '15%' : '13%';
                    })() }}>Item Code</th>
                    <th className="border border-gray-300 px-1 py-2 text-left font-semibold text-xs" style={{ width: (() => {
                      const hasDiscountInRate = quotation.showDiscountInRate || 
                        quotation.items.some(item => {
                          const itemWithUnitPrice = item as any;
                          return itemWithUnitPrice.unitPrice !== undefined && itemWithUnitPrice.unitPrice !== item.mrp;
                        });
                      return hasDiscountInRate ? '30%' : '25%';
                    })() }}>Description</th>
                    <th className="border border-gray-300 px-1 py-2 text-center font-semibold text-xs" style={{ width: '8%' }}>Qty</th>
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: '13%' }}>Unit Price (Rs.)</th>
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: '13%' }}>Rate (Rs.)</th>
                    {(() => {
                      // Check if any item has unitPrice different from mrp (indicates toggle was enabled)
                      const hasDiscountInRate = quotation.showDiscountInRate || 
                        quotation.items.some(item => {
                          const itemWithUnitPrice = item as any;
                          return itemWithUnitPrice.unitPrice !== undefined && itemWithUnitPrice.unitPrice !== item.mrp;
                        });
                      return !hasDiscountInRate;
                    })() && (
                      <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: '13%' }}>Discount (Rs.)</th>
                    )}
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: (() => {
                      const hasDiscountInRate = quotation.showDiscountInRate || 
                        quotation.items.some(item => {
                          const itemWithUnitPrice = item as any;
                          return itemWithUnitPrice.unitPrice !== undefined && itemWithUnitPrice.unitPrice !== item.mrp;
                        });
                      return hasDiscountInRate ? '21%' : '15%';
                    })() }}>Net Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => {
                    return (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="border border-gray-300 px-1 py-2 font-mono text-xs" style={{ wordWrap: 'break-word' }}>{item.productCode}</td>
                        <td className="border border-gray-300 px-1 py-2" style={{ wordWrap: 'break-word' }}>
                          <div>
                            <p className="font-medium text-xs">{item.productName}</p>
                            <p className="text-xs text-gray-600">{item.description}</p>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center text-xs">{item.quantity}{item.unit ? ` ${item.unit}` : ''}</td>
                        <td className="border border-gray-300 px-1 py-2 text-right text-xs">{item.mrp.toFixed(2)}</td>
                        <td className="border border-gray-300 px-1 py-2 text-right text-xs">
                          {(() => {
                            // Check if toggle was enabled - either showDiscountInRate exists or unitPrice differs from mrp
                            const itemWithUnitPrice = item as any;
                            const toggleEnabled = quotation.showDiscountInRate || 
                              (itemWithUnitPrice.unitPrice !== undefined && itemWithUnitPrice.unitPrice !== item.mrp);
                            
                            if (toggleEnabled) {
                              // Show discounted price per unit (Rate per unit after discount)
                              return itemWithUnitPrice.unitPrice !== undefined ? itemWithUnitPrice.unitPrice.toFixed(2) : (item.mrp - item.discount).toFixed(2);
                            } else {
                              // Show total rate (Quantity × Unit Price)
                              return (item.quantity * item.mrp).toFixed(2);
                            }
                          })()}
                        </td>
                        {(() => {
                          const itemWithUnitPrice = item as any;
                          const toggleEnabled = quotation.showDiscountInRate || 
                            (itemWithUnitPrice.unitPrice !== undefined && itemWithUnitPrice.unitPrice !== item.mrp);
                          return !toggleEnabled;
                        })() && (
                          <td className="border border-gray-300 px-1 py-2 text-right text-xs">{item.discount.toFixed(2)}</td>
                        )}
                        <td className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs">{item.total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-4">
            <div className="w-full max-w-xs">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">Rs.{quotation.subtotal.toFixed(2)}</span>
                  </div>
                  {(() => {
                    // Check if any item has unitPrice different from mrp (indicates toggle was enabled)
                    const hasDiscountInRate = quotation.showDiscountInRate || 
                      quotation.items.some(item => {
                        const itemWithUnitPrice = item as any;
                        return itemWithUnitPrice.unitPrice !== undefined && itemWithUnitPrice.unitPrice !== item.mrp;
                      });
                    return !hasDiscountInRate;
                  })() && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Total Discount:</span>
                      <span className="font-semibold text-red-600">Rs.{quotation.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">Total Amount:</span>
                      <span className="font-bold text-blue-600">Rs.{quotation.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-3 mt-4">
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <p className="text-sm text-gray-600 italic">Thank you for your business!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreview;