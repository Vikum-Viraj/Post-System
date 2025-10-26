import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { X } from 'lucide-react';
import { Invoice } from '../types';

interface InvoiceEditModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSave: (updated: Invoice) => void;
}

const InvoiceEditModal: React.FC<InvoiceEditModalProps> = ({ invoice, onClose, onSave }) => {
  const [form, setForm] = useState({
    customerName: invoice.customerName || '',
    customerEmail: invoice.customerEmail || '',
    customerPhone: invoice.customerPhone || '',
    receiverCompany: invoice.receiverCompany || '',
    receiverAddress: invoice.receiverAddress || '',
    orderRef: invoice.orderRef || '',
    payment: invoice.payment || 'cash',
    items: invoice.items.map(item => ({ ...item })),
  });

  useEffect(() => {
    setForm({
      customerName: invoice.customerName || '',
      customerEmail: invoice.customerEmail || '',
      customerPhone: invoice.customerPhone || '',
      receiverCompany: invoice.receiverCompany || '',
      receiverAddress: invoice.receiverAddress || '',
      orderRef: invoice.orderRef || '',
      payment: invoice.payment || 'cash',
      items: invoice.items.map(item => ({ ...item })),
    });
  }, [invoice]);

  // Helper to recalc item total
  const recalcItem = (item: any) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const total = quantity * unitPrice;
    return { ...item, quantity, total };
  };

  // Handle item quantity change
  const handleItemQtyChange = (idx: number, value: string) => {
    setForm(prev => {
      const items = prev.items.map((item, i) =>
        i === idx ? recalcItem({ ...item, quantity: Number(value) }) : item
      );
      return { ...prev, items };
    });
  };

  // Handle other item field changes (discount, unitPrice, etc.)
  const handleItemFieldChange = (idx: number, field: string, value: string) => {
    setForm(prev => {
      const items = prev.items.map((item, i) =>
        i === idx ? recalcItem({ ...item, [field]: value }) : item
      );
      return { ...prev, items };
    });
  };

  // Handle form field change
  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Save handler
  const handleSave = async () => {
    // Calculate totals
    const subtotal = form.items.reduce((sum, item) => sum + (Number(item.unitPrice) * Number(item.quantity)), 0);
    const totalDiscount = form.items.reduce((sum, item) => sum + Number(item.discount), 0);
    const total = form.items.reduce((sum, item) => sum + Number(item.total), 0);
    // Attach previousQuantity to each item (before update)
    const itemsWithPrevQty = form.items.map(item => {
      const original = invoice.items.find(orig => orig.productId === item.productId);
      return {
        ...item,
        previousQuantity: original ? original.quantity : undefined
      };
    });
    const updated: Invoice = {
      ...invoice,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      receiverCompany: form.receiverCompany,
      receiverAddress: form.receiverAddress,
      orderRef: form.orderRef,
      payment: form.payment,
      items: itemsWithPrevQty,
      subtotal,
      totalDiscount,
      total,
    };
    try {
      await axiosInstance.put(`/invoices/${invoice.id}`, updated);
      onSave(updated);
    } catch (err) {
      alert('Failed to update invoice.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Edit Invoice</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Form Fields */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Customer Name</label>
              <input className="w-full border rounded px-2 py-1" value={form.customerName} onChange={e => handleFieldChange('customerName', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email Address</label>
              <input className="w-full border rounded px-2 py-1" value={form.customerEmail} onChange={e => handleFieldChange('customerEmail', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone Number</label>
              <input className="w-full border rounded px-2 py-1" value={form.customerPhone} onChange={e => handleFieldChange('customerPhone', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Receiver Company</label>
              <input className="w-full border rounded px-2 py-1" value={form.receiverCompany} onChange={e => handleFieldChange('receiverCompany', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Receiver Address</label>
              <input className="w-full border rounded px-2 py-1" value={form.receiverAddress} onChange={e => handleFieldChange('receiverAddress', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Order Ref</label>
              <input className="w-full border rounded px-2 py-1" value={form.orderRef} onChange={e => handleFieldChange('orderRef', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Payment</label>
              <select className="w-full border rounded px-2 py-1" value={form.payment} onChange={e => handleFieldChange('payment', e.target.value)}>
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>
          {/* Items Table */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">Items</h3>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-1 py-2">Code</th>
                  <th className="border px-1 py-2">Name</th>
                  <th className="border px-1 py-2">Qty</th>
                  <th className="border px-1 py-2">Unit</th>
                  <th className="border px-1 py-2">MRP</th>
                  <th className="border px-1 py-2">Unit Price</th>
                  <th className="border px-1 py-2">Discount</th>
                  <th className="border px-1 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border px-1 py-2">{item.productCode}</td>
                    <td className="border px-1 py-2">{item.productName}</td>
                    <td className="border px-1 py-2">
                      <input
                        type="number"
                        className="w-16 border rounded px-1 py-0.5"
                        value={item.quantity}
                        min={0}
                        onChange={e => handleItemQtyChange(idx, e.target.value)}
                      />
                    </td>
                    <td className="border px-1 py-2">{item.unit}</td>
                    <td className="border px-1 py-2">{item.mrp}</td>
                    <td className="border px-1 py-2">
                        <input
                          type="number"
                          className="w-16 border rounded px-1 py-0.5"
                          value={item.unitPrice}
                          min={0}
                          readOnly
                        />
                    </td>
                    <td className="border px-1 py-2">
                        <input
                          type="number"
                          className="w-16 border rounded px-1 py-0.5"
                          value={item.discount}
                          min={0}
                          readOnly
                        />
                    </td>
                    <td className="border px-1 py-2">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal Footer */}
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditModal;
