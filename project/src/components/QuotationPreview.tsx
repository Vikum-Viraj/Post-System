import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Quotation } from '../types';

interface QuotationPreviewProps {
  quotation: Quotation;
  onClose: () => void;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ quotation, onClose }) => {
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
    // Get the content to download
    const content = document.querySelector('.printable-content');
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to download the PDF');
      return;
    }

    // Clone the content to avoid modifying the original
    const clonedContent = content.cloneNode(true) as HTMLElement;
    
    // Generate the HTML for the new window
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation #${quotation.id.slice(-6).toUpperCase()}</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.3;
            color: #333;
            padding: 15mm;
            font-size: 12px;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          @media print {
            body {
              margin: 0;
              padding: 15mm;
            }
          }
          h1 { font-size: 20px; margin-bottom: 8px; }
          h2 { font-size: 16px; margin-bottom: 4px; }
          h3 { font-size: 14px; margin-bottom: 8px; }
          p { font-size: 11px; margin-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; margin: 8px 0; }
          th, td { border: 1px solid #ddd; padding: 4px; font-size: 10px; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .font-bold { font-weight: bold; }
          .text-blue-600 { color: #2563eb; }
          .text-gray-600 { color: #6b7280; }
          .text-red-600 { color: #dc2626; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-blue-50 { background-color: #eff6ff; }
          .border-b { border-bottom: 1px solid #d1d5db; }
          .border-t { border-top: 1px solid #d1d5db; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .gap-4 { gap: 16px; }
          .gap-8 { gap: 32px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .p-3 { padding: 12px; }
          .px-1 { padding-left: 4px; padding-right: 4px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .rounded-lg { border-radius: 8px; }
          .space-y-1 > * + * { margin-top: 4px; }
          .items-end { align-items: end; }
          .justify-end { justify-content: end; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .ml-auto { margin-left: auto; }
          .w-32 { width: 128px; }
          .pt-1 { padding-top: 4px; }
          .inline-block { display: inline-block; }
          .max-w-xs { max-width: 320px; }
          .w-full { width: 100%; }
        </style>
      </head>
      <body>
        ${clonedContent.innerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
                <p className="text-xs text-gray-600">Phone: 0773145267</p>
                <p className="text-xs text-gray-600">Email: darshanaelectricals@gmail.com</p>
              </div>
              <div className="text-right">
                <div className="bg-blue-50 p-3 rounded-lg inline-block">
                  <div className="flex items-center justify-between space-x-2">
                    <span className="text-xs text-gray-600">Quotation No:</span>
                    <span className="text-sm font-bold text-blue-600">#{
                      typeof quotation.id === 'string'
                        ? quotation.id.slice(-6).toUpperCase()
                        : quotation.id !== undefined && quotation.id !== null
                          ? String(quotation.id).slice(-6).toUpperCase()
                          : '------'
                    }</span>
                  </div>
                  <div className="flex items-center justify-between space-x-2 mt-1">
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
                    <div className="flex items-center justify-between space-x-2 mt-1">
                      <span className="text-xs text-gray-600">Order Ref:</span>
                      <span className="font-semibold text-xs">{quotation.orderRef}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between space-x-2 mt-1">
                    <span className="text-xs text-gray-600">Pages:</span>
                    <span className="font-semibold text-xs">{pageCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-4">
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
                    <th className="border border-gray-300 px-1 py-2 text-left font-semibold text-xs" style={{ width: '13%' }}>Item Code</th>
                    <th className="border border-gray-300 px-1 py-2 text-left font-semibold text-xs" style={{ width: '25%' }}>Description</th>
                    <th className="border border-gray-300 px-1 py-2 text-center font-semibold text-xs" style={{ width: '8%' }}>Qty</th>
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: '13%' }}>Unit Price (Rs.)</th>
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: '13%' }}>Rate (Rs.)</th>
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: '13%' }}>Discount (Rs.)</th>
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: '15%' }}>Net Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => {
                    // Support both new and old QuotationItem (with or without unitPrice)
                    const unitPrice = (item as any).unitPrice !== undefined ? (item as any).unitPrice : item.mrp;
                    return (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="border border-gray-300 px-1 py-2 font-mono text-xs" style={{ wordWrap: 'break-word' }}>{item.productCode}</td>
                        <td className="border border-gray-300 px-1 py-2" style={{ wordWrap: 'break-word' }}>
                          <div>
                            <p className="font-medium text-xs">{item.productName}</p>
                            <p className="text-xs text-gray-600">{item.description}</p>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center text-xs">{item.quantity}</td>
                        <td className="border border-gray-300 px-1 py-2 text-right text-xs">{unitPrice.toFixed(2)}</td>
                        <td className="border border-gray-300 px-1 py-2 text-right text-xs">{item.mrp.toFixed(2)}</td>
                        <td className="border border-gray-300 px-1 py-2 text-right text-xs">{item.discount.toFixed(2)}</td>
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
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total Discount:</span>
                    <span className="font-semibold text-red-600">Rs.{quotation.totalDiscount.toFixed(2)}</span>
                  </div>
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
                <p className="text-md text-gray-800">Darshana Electricals</p>
                <p className="text-md text-gray-800">No 76/2B Diyagama,Kiriwathuduwa</p>
                <p className="text-md text-gray-800">darshanaelectricals@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreview;