
import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Invoice } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onClose }) => {
  // Helper to get payment type from either 'payment' or 'type' property
  const getPaymentType = () => {
    return invoice.payment || invoice.type || 'credit';
  };

  const isCashPayment = () => {
    const paymentType = getPaymentType();
    return paymentType === 'cash';
  };

  // Helper to estimate number of pages (A4, rough estimate by item count)
  const estimatePageCount = () => {
    const itemsPerFirstPage = 8;
    const itemsPerOtherPages = 15;
    const totalItems = invoice.items.length;
    if (totalItems <= itemsPerFirstPage) return 1;
    return 1 + Math.ceil((totalItems - itemsPerFirstPage) / itemsPerOtherPages);
  };

  const pageCount = estimatePageCount();

  const handlePrint = () => {
    const printStyles = `
      @media print {
        body * { visibility: hidden; }
        .printable-content, .printable-content * { visibility: visible; }
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
        .no-print { display: none !important; }
        @page { size: A4; margin: 0; }
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
    const content = document.querySelector('.printable-content');
    if (!content) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to download the PDF');
      return;
    }
    const clonedContent = content.cloneNode(true) as HTMLElement;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${typeof invoice.id === 'string' ? invoice.id.slice(-6).toUpperCase() : String(invoice.id).slice(-6).toUpperCase()}</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.3; color: #333; padding: 15mm; font-size: 12px; }
          @page { size: A4; margin: 15mm; }
          @media print { body { margin: 0; padding: 15mm; } }
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
              setTimeout(function() { window.close(); }, 1000);
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
          <h2 className="text-2xl font-bold text-gray-900">SALES INVOICE</h2>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">SALES INVOICE</h1>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-left">
                <h2 className="text-lg font-bold text-blue-600 mb-1">{invoice.customerName}</h2>
                <p className="text-xs text-gray-600">{invoice.customerEmail}</p>
                <p className="text-xs text-gray-600">{invoice.customerPhone}</p>
              </div>
              <div className="text-right">
                {/* Company Details box at the top */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">Darshana Electricals</p>
                    <p className="text-sm text-gray-600 mt-1">0777839065 / 0772050128</p>
                    <p className="text-sm text-gray-600 mt-1">No. 76/B/2 Diyagama, Kiriwaththuduwa</p>
                    <p className="text-sm text-gray-600">dharshanaelectrical60@gmail.com</p>
                  </div>
                </div>
                
                {/* Invoice Details box below company details */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between space-x-1">
                    <span className="text-xs text-gray-600">Invoice No:</span>
                    <span className="text-sm font-bold text-blue-600">#
                      {typeof invoice.id === 'string'
                        ? invoice.id.slice(-6).toUpperCase()
                        : invoice.id !== undefined && invoice.id !== null
                          ? String(invoice.id).slice(-6).toUpperCase()
                          : '------'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between space-x-1 mt-1">
                    <span className="text-xs text-gray-600">Date:</span>
                    <span className="font-semibold text-xs">{
                      (() => {
                        const dateStr = invoice.date || (invoice as any).createdDate;
                        if (!dateStr) return '';
                        const dateObj = new Date(dateStr);
                        if (isNaN(dateObj.getTime())) return '';
                        return dateObj.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      })()
                    }</span>
                  </div>
                  {invoice.quotationId && (
                    <div className="flex items-center justify-between space-x-1 mt-1">
                      <span className="text-xs text-gray-600">Quotation Ref:</span>
                      <span className="font-semibold text-xs">{invoice.quotationId}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between space-x-1 mt-1">
                    <span className="text-xs text-gray-600">Pages:</span>
                    <span className="font-semibold text-xs">{pageCount}</span>
                  </div>
                  <div className="flex items-center justify-between space-x-1 mt-1">
                    <span className="text-xs text-gray-600">Payment:</span>
                    <span className={isCashPayment() ? 'font-bold text-emerald-600 text-xs' : 'font-bold text-orange-600 text-xs'}>
                      {isCashPayment() ? 'Cash' : 'Credit'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">Bill To:</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm text-gray-900">{invoice.customerName}</p>
              <p className="text-xs text-gray-600">{invoice.customerEmail}</p>
              {invoice.customerPhone && <p className="text-xs text-gray-600">{invoice.customerPhone}</p>}
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
                      const hasDiscountInRate = invoice.showDiscountInRate;
                      return hasDiscountInRate ? '15%' : '13%';
                    })() }}>Item Code</th>
                    <th className="border border-gray-300 px-1 py-2 text-left font-semibold text-xs" style={{ width: (() => {
                      const hasDiscountInRate = invoice.showDiscountInRate;
                      return hasDiscountInRate ? '30%' : '25%';
                    })() }}>Description</th>
                    <th className="border border-gray-300 px-1 py-2 text-center font-semibold text-xs" style={{ width: '8%' }}>Qty</th>
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: '13%' }}>Unit Price (Rs.)</th>
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: '13%' }}>
                      {invoice.showDiscountInRate ? 'Rate (Rs.)' : 'Discount (Rs.)'}
                    </th>
                    <th className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ width: (() => {
                      const hasDiscountInRate = invoice.showDiscountInRate;
                      return hasDiscountInRate ? '21%' : '15%';
                    })() }}>Net Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => {
                    const itemWithUnitPrice = item as any;
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
                        <td className="border border-gray-300 px-1 py-2 text-right text-xs">{item.mrp.toFixed(2)}</td>
                        <td className="border border-gray-300 px-1 py-2 text-right text-xs">
                          {invoice.showDiscountInRate
                            ? (itemWithUnitPrice.unitPrice !== undefined 
                                ? itemWithUnitPrice.unitPrice.toFixed(2) 
                                : (item.mrp - item.discount).toFixed(2))
                            : item.discount.toFixed(2)
                          }
                        </td>
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
                    <span className="font-semibold">Rs.{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {!invoice.showDiscountInRate && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Total Discount:</span>
                      <span className="font-semibold text-red-600">Rs.{invoice.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">Total Amount:</span>
                      <span className="font-bold text-blue-600">Rs.{invoice.total.toFixed(2)}</span>
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

export default InvoicePreview;
