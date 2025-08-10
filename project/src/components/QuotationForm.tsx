import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X, Plus, Search, Trash2 } from 'lucide-react';
import { Quotation } from '../types';
import axiosInstance from '../config/axiosConfig';

interface Product {
  id: any;
  name: string;
  code: string;
  quantity: any;
  mrp: any;
  description?: string;
}
                                        
interface QuotationItem {
  productId: string;
  productCode: string;
  productName: string;
  description: string;
  mrp: number;
  unitPrice: number;
  quantity: number;
  discount: number;
  total: number;
}

interface QuotationFormProps {
  products: Product[];
  onSubmit: (quotation: Omit<Quotation, 'id' | 'date'>) => void;
  onClose: () => void;
}

const QuotationForm: React.FC<QuotationFormProps> = ({ products, onSubmit, onClose }) => {
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    orderRef: '',
    receiverCompany: '',
    receiverAddress: '',
  });
  
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productCode: '',
    quantity: 1,
    discount: 0,
    discountPercent: '', // as string for easier input
  });
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalDiscountPercent, setTotalDiscountPercent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productError, setProductError] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef<number | null>(null);

  // Fetch products from backend as user types
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
        const allProducts: Product[] = response.data;
        const filtered = allProducts.filter(product =>
          product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // debounce
    // Cleanup
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm]);

  // Use searchResults for suggestions
  const filteredProducts = searchTerm ? searchResults : products;

  // Find selected product
  const selectedProduct = filteredProducts.find(p => p.code === currentItem.productCode);

  // Validate product code when it changes
  useEffect(() => {
    if (currentItem.productCode && !selectedProduct) {
      setProductError('Product not found');
    } else {
      setProductError('');
    }
  }, [currentItem.productCode, selectedProduct]);

  // Add item to quotation
  const addItem = () => {
    if (!selectedProduct) {
      setProductError('Please select a valid product');
      return;
    }
    if (currentItem.quantity <= 0) {
      setProductError('Quantity must be at least 1');
      return;
    }
    let discount = Number(currentItem.discount);
    // If discountPercent is set, calculate discount from percent
    if (currentItem.discountPercent) {
      const percent = parseFloat(currentItem.discountPercent);
      if (!isNaN(percent) && percent >= 0 && percent <= 100) {
        discount = (Number(selectedProduct.mrp) * Number(currentItem.quantity)) * (percent / 100);
      }
    }
    if (discount < 0) {
      setProductError('Discount cannot be negative');
      return;
    }
    if (discount > selectedProduct.mrp * currentItem.quantity) {
      setProductError('Discount cannot exceed item total');
      return;
    }

    const itemTotal = (selectedProduct.mrp * currentItem.quantity) - discount;
    const newItem: QuotationItem = {
      productId: selectedProduct.id.toString(),
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      description: selectedProduct.description || '',
      mrp: Number(selectedProduct.mrp),
      unitPrice: Number(selectedProduct.mrp),
      quantity: Number(currentItem.quantity),
      discount: discount,
      total: itemTotal,
    };

    setItems(prev => [...prev, newItem]);
    setCurrentItem({ productCode: '', quantity: 1, discount: 0, discountPercent: '' });
    setSearchTerm('');
    setProductError('');
  };

  // Remove item from quotation
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  const itemDiscounts = items.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - itemDiscounts - totalDiscount;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name) {
      alert('Please fill in all required customer fields');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item to the quotation');
      return;
    }

    const quotationData = {
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      receiverCompany: customerData.receiverCompany,
      receiverAddress: customerData.receiverAddress,
      items,
      subtotal,
      totalDiscount: itemDiscounts + totalDiscount,
      total,
      orderRef: customerData.orderRef,
    };

    // Integrate API call to create quotation
    (async () => {
      try {
        const response = await axiosInstance.post('/quotation', quotationData);
        toast.success('Quotation created successfully!');
        onSubmit(response.data);
        console.log('Quotation submitted:', response.data);
      } catch (error) {
        toast.error('Failed to create quotation. Please try again.');
        console.error('Quotation creation error:', error);
      }
    })();
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedProduct) {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Quotation notification" />
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Create Quotation</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter email address (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Ref
                  </label>
                  <input
                    type="text"
                    value={customerData.orderRef}
                    onChange={(e) => setCustomerData({ ...customerData, orderRef: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter order reference (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Company Name</label>
                  <input
                    type="text"
                    value={customerData.receiverCompany}
                    onChange={e => setCustomerData({ ...customerData, receiverCompany: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter receiver company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Address</label>
                  <input
                    type="text"
                    value={customerData.receiverAddress}
                    onChange={e => setCustomerData({ ...customerData, receiverAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter receiver address"
                  />
                </div>
                {/* Sales Person Email/Phone fields removed, now hardcoded in preview */}
              </div>
            </div>

            {/* Add Items Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Items</h3>
              
              {/* Product Search */}
              <div className="relative mb-4">
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
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                {productError && (
                  <p className="mt-1 text-sm text-red-600">{productError}</p>
                )}

                {/* Product Suggestions */}
                {searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {isLoading ? (
                      <div className="px-4 py-3 text-gray-500">Searching...</div>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                          setCurrentItem({ 
                            productCode: product.code,
                            quantity: 1,
                            discount: 0,
                            discountPercent: ''
                          });
                            setSearchTerm(product.code);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">Code: {product.code} | MRP: Rs.{Number(product.mrp).toFixed(2)}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500">No products found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Product Details Form */}
              {selectedProduct && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                    <span className="font-semibold">Rs.{Number(selectedProduct.mrp).toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({ 
                          ...currentItem, 
                          quantity: Math.max(1, Number(e.target.value)) 
                        })}
                        onKeyDown={handleKeyDown}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Rs.)</label>
                      <input
                        type="number"
                        min="0"
                        max={Number(selectedProduct.mrp) * currentItem.quantity}
                        step="0.01"
                        value={currentItem.discount}
                        onChange={(e) => {
                          const discount = Number(e.target.value);
                          const maxDiscount = Number(selectedProduct.mrp) * currentItem.quantity;
                          setCurrentItem({ 
                            ...currentItem, 
                            discount: Math.min(discount, maxDiscount),
                            discountPercent: '', // clear percent if manual
                          });
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={currentItem.discountPercent}
                        onChange={(e) => {
                          let percent = e.target.value;
                          if (percent === '' || (parseFloat(percent) >= 0 && parseFloat(percent) <= 100)) {
                            setCurrentItem({
                              ...currentItem,
                              discountPercent: percent,
                              discount: percent ? ((Number(selectedProduct.mrp) * Number(currentItem.quantity)) * (parseFloat(percent) / 100)) : currentItem.discount
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={addItem}
                        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Item</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Item Total:</span>
                    <span className="text-lg font-semibold">
                      Rs.{((Number(selectedProduct.mrp) * currentItem.quantity - (currentItem.discountPercent ? ((Number(selectedProduct.mrp) * currentItem.quantity) * (parseFloat(currentItem.discountPercent) / 100)) : currentItem.discount)).toFixed(2))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Items List - Table Format */}
            {items.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items ({items.length})</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Code</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">MRP</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Qty</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Discount</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.productCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="font-medium">{item.productName}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500">{item.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">Rs.{item.mrp.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">-Rs.{item.discount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">Rs.{item.total.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors duration-200"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Order Summary */}
            {items.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal ({items.length} items):</span>
                    <span className="font-medium">Rs.{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Item Discounts:</span>
                    <span className="text-red-600">-Rs.{itemDiscounts.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 pt-2">
                    {/* <div className="flex-1 flex items-center space-x-2">
                      <label className="font-medium text-gray-700">Additional Discount (Rs.):</label>
                      <input
                        type="number"
                        min="0"
                        max={subtotal - itemDiscounts}
                        step="0.01"
                        value={totalDiscount}
                        onChange={(e) => {
                          const discount = Number(e.target.value);
                          const maxDiscount = subtotal - itemDiscounts;
                          setTotalDiscount(Math.min(discount, maxDiscount));
                          setTotalDiscountPercent(''); // clear percent if manual
                        }}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div> */}
                    <div className="flex-1 flex items-center space-x-2 mt-2 md:mt-0">
                      <label className="font-medium text-gray-700">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={totalDiscountPercent}
                        onChange={(e) => {
                          let percent = e.target.value;
                          if (percent === '' || (parseFloat(percent) >= 0 && parseFloat(percent) <= 100)) {
                            setTotalDiscountPercent(percent);
                            setTotalDiscount(percent ? ((subtotal - itemDiscounts) * (parseFloat(percent) / 100)) : totalDiscount);
                          }
                        }}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total Amount:</span>
                      <span className="text-emerald-600">Rs.{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!customerData.name || items.length === 0}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Create Quotation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
};

export default QuotationForm;