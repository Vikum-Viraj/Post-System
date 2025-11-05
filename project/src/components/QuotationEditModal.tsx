import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../config/axiosConfig';
import { X, Plus, Search } from 'lucide-react';
import { Quotation, QuotationItem } from '../types';

interface QuotationEditModalProps {
  quotation: Quotation;
  onClose: () => void;
  onSave: (updated: Quotation) => void;
}

const QuotationEditModal: React.FC<QuotationEditModalProps> = ({ quotation, onClose, onSave }) => {
  const [form, setForm] = useState({
    receiverCompany: quotation.receiverCompany || '',
    customerEmail: quotation.customerEmail || '',
    phone: quotation.customerPhone || '',
    orderRef: quotation.orderRef || '',
    customerName: quotation.customerName || '',
    receiverAddress: quotation.receiverAddress || '',
    items: quotation.items.map(item => ({ ...item })),
  });

  // --- Product search / add-item states (copied/adapted from QuotationForm)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef<number | null>(null);
  const [currentItem, setCurrentItem] = useState({ productCode: '', quantity: 1, discount: 0, discountPercent: '' });
  const [showDiscountInRate, setShowDiscountInRate] = useState(false);
  const [productError, setProductError] = useState('');

  // filtered products to show suggestions
  const filteredProducts = searchTerm ? searchResults : [];

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/products');
        const allProducts = response.data || [];
        const filtered = allProducts.filter((product: any) =>
          String(product.code).toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(product.name).toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchTerm]);

  const selectedProduct = filteredProducts.find(p => p.code === currentItem.productCode) || null;

  useEffect(() => {
    if (currentItem.productCode && !selectedProduct && !searchTerm) {
      setProductError('Product not found');
    } else if (currentItem.productCode && !selectedProduct && searchTerm && !isLoading && searchResults.length === 0) {
      setProductError('Product not found');
    } else {
      setProductError('');
    }
  }, [currentItem.productCode, selectedProduct, searchTerm, isLoading, searchResults]);

  const addItem = () => {
    if (!selectedProduct) {
      setProductError('Please select a valid product');
      return;
    }
    if (currentItem.quantity <= 0) {
      setProductError('Quantity must be at least 1');
      return;
    }

    let discount = Number(currentItem.discount) || 0;
    let unitPrice = Number(selectedProduct.mrp) || 0;
    let itemTotal = 0;

    if (currentItem.discountPercent) {
      const percent = parseFloat(currentItem.discountPercent);
      if (!isNaN(percent) && percent >= 0 && percent <= 100) {
        if (showDiscountInRate) {
          discount = Number(selectedProduct.mrp) * (percent / 100);
        } else {
          discount = (Number(selectedProduct.mrp) * Number(currentItem.quantity)) * (percent / 100);
        }
      }
    }

    if (showDiscountInRate) {
      unitPrice = Number(selectedProduct.mrp) - discount;
      itemTotal = unitPrice * currentItem.quantity;
    } else {
      itemTotal = (Number(selectedProduct.mrp) * currentItem.quantity) - discount;
    }

    const newItem: QuotationItem = {
      productId: selectedProduct.id?.toString() ?? '',
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      description: selectedProduct.description || '',
      mrp: Number(selectedProduct.mrp) || 0,
      unit: selectedProduct.unit || '',
      unitPrice: showDiscountInRate ? unitPrice : Number(selectedProduct.mrp) || 0,
      quantity: Number(currentItem.quantity),
      discount: discount,
      total: itemTotal,
    };

    setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setCurrentItem({ productCode: '', quantity: 1, discount: 0, discountPercent: '' });
    setSearchTerm('');
    setProductError('');
  };

  // Reset form state when a new quotation is received
  useEffect(() => {
    setForm({
      receiverCompany: quotation.receiverCompany || '',
      customerEmail: quotation.customerEmail || '',
      phone: quotation.customerPhone || '',
      orderRef: quotation.orderRef || '',
      customerName: quotation.customerName || '',
      receiverAddress: quotation.receiverAddress || '',
      items: quotation.items.map(item => ({ ...item })),
    });
  }, [quotation]);

  // Helper to recalculate dependent values for an item
  const recalcItem = (item: QuotationItem) => {
    const quantity = Number(item.quantity) || 0;
    const mrp = Number(item.mrp) || 0;
    const discount = Number(item.discount) || 0;
    // If discount is present, subtract from mrp
  const total = quantity * mrp - discount;
    return {
      ...item,
      quantity,
      total,
    };
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

  // Handle other item field changes (if needed)
  // ...

  // Handle form field change
  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Save handler
  const handleSave = async () => {
    // Calculate totals
    const subtotal = form.items.reduce((sum, item) => sum + (Number(item.mrp) * Number(item.quantity)), 0);
  const totalDiscount = form.items.reduce((sum, item) => sum + Number(item.discount), 0);
    const total = form.items.reduce((sum, item) => sum + Number(item.total), 0);

    // Compose updated quotation
    const updated: Quotation = {
      ...quotation,
      receiverCompany: form.receiverCompany,
      customerEmail: form.customerEmail,
      customerPhone: form.phone,
      orderRef: form.orderRef,
      customerName: form.customerName,
      receiverAddress: form.receiverAddress,
      items: form.items,
      subtotal,
      totalDiscount,
      total,
    };
    try {
      await axiosInstance.put(`/quotation/${quotation.id}`, updated);
      onSave(updated);
    } catch (err) {
      alert('Failed to update quotation.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Edit Quotation</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Form Fields */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Receiver Company Name</label>
              <input className="w-full border rounded px-2 py-1" value={form.receiverCompany} onChange={e => handleFieldChange('receiverCompany', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email Address</label>
              <input className="w-full border rounded px-2 py-1" value={form.customerEmail} onChange={e => handleFieldChange('customerEmail', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone Number</label>
              <input className="w-full border rounded px-2 py-1" value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Order Ref</label>
              <input className="w-full border rounded px-2 py-1" value={form.orderRef} onChange={e => handleFieldChange('orderRef', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Customer Name *</label>
              <input className="w-full border rounded px-2 py-1" value={form.customerName} onChange={e => handleFieldChange('customerName', e.target.value)} required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1">Receiver Address</label>
              <input className="w-full border rounded px-2 py-1" value={form.receiverAddress} onChange={e => handleFieldChange('receiverAddress', e.target.value)} />
            </div>
          </div>
          {/* Items Table */}
          <div>
            {/* Add Items (search + add) */}
            <div className="mb-4 bg-gray-50 p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900">Add Item</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Show discount in rate</span>
                  <button
                    type="button"
                    onClick={() => setShowDiscountInRate(!showDiscountInRate)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showDiscountInRate ? 'bg-emerald-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDiscountInRate ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center">
                  <Search className="h-5 w-5 absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter product code or name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentItem({ ...currentItem, productCode: e.target.value });
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
                  />
                </div>
                {productError && <p className="text-sm text-red-600 mt-1">{productError}</p>}
                {searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {isLoading ? (
                      <div className="px-4 py-2 text-gray-500">Searching...</div>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setCurrentItem({ productCode: product.code, quantity: 1, discount: 0, discountPercent: '' });
                            setSearchTerm(product.code);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">Code: {product.code} | MRP: Rs.{Number(product.mrp).toFixed(2)}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No products found</div>
                    )}
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="mt-3 bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                    <div className="font-semibold">Rs.{Number(selectedProduct.mrp).toFixed(2)}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="block text-xs text-gray-600">Quantity</label>
                      <input type="number" min="1" value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: Math.max(1, Number(e.target.value)) })} className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Discount (%)</label>
                      <input type="number" min="0" max="100" step="0.01" value={currentItem.discountPercent} onChange={e => setCurrentItem({ ...currentItem, discountPercent: e.target.value })} className="w-full border rounded px-2 py-1" />
                    </div>
                    <div className="md:col-span-2 flex items-center">
                      <button type="button" onClick={addItem} className="ml-auto bg-emerald-600 text-white px-4 py-2 rounded flex items-center gap-2"><Plus className="w-4 h-4"/> <span>Add Item</span></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">Items</h3>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-1 py-2">Code</th>
                  <th className="border px-1 py-2">Description</th>
                  <th className="border px-1 py-2">Qty</th>
                  <th className="border px-1 py-2">Unit</th>
                  <th className="border px-1 py-2">MRP</th>
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
                    <td className="border px-1 py-2">{item.discount}</td>
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

export default QuotationEditModal;
