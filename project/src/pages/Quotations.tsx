import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Eye, ArrowRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Product, Quotation } from '../types';
import QuotationForm from '../components/QuotationForm';
import QuotationPreview from '../components/QuotationPreview';
import axiosInstance from '../config/axiosConfig';

const Quotations: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  // (Removed duplicate useState declarations)

  useEffect(() => {
    // Fetch quotations
    const fetchQuotations = async () => {
      try {
        const response = await axiosInstance.get('/quotation');
        setQuotations(response.data);
      } catch (error) {
        alert('Failed to fetch quotations');
      }
    };
    fetchQuotations();
  }, []);

  // Optionally fetch products if needed for QuotationForm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/products');
        setProducts(response.data);
      } catch (error) {
        // ignore
      }
    };
    fetchProducts();
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Quotation; direction: 'ascending' | 'descending' } | null>(null);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

  const filteredQuotations = quotations.filter(quotation => {
    const search = searchTerm.trim().toLowerCase();
    const customerName = quotation.customerName?.toLowerCase() || '';
    // Always treat id as string for search
    const idStr = (typeof quotation.id === 'string' ? quotation.id : String(quotation.id)).toLowerCase();
    // Also allow searching by last 6 digits of the id (quotation number)
    const idLast6 = idStr.slice(-6);
    return (
      customerName.includes(search) ||
      idStr.includes(search) ||
      idLast6.includes(search)
    );
  });

  const sortedQuotations = React.useMemo(() => {
    let sortableItems = [...filteredQuotations];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];
        
        // Handle special cases for complex properties
        if (sortConfig.key === 'items') {
          aValue = a.items.length;
          bValue = b.items.length;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredQuotations, sortConfig]);

  const requestSort = (key: keyof Quotation) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleAddQuotation = async (quotationData: Omit<Quotation, 'id' | 'date'>) => {
    // After adding, fetch all quotations again to ensure the list is up to date
    setShowForm(false);
    try {
      const response = await axiosInstance.get('/quotation');
      setQuotations(response.data);
    } catch (error) {
      // fallback: do nothing, keep old list
    }
  };


  const handleInvoice = async (quotation: Quotation, payment: 'cash' | 'credit') => {
    setIsSavingInvoice(true);
    // Remove id and date/createdDate from payload
    const { id, date, createdDate, ...rest } = quotation as any;
    const payload = { ...rest, payment };
    try {
      const response = await axiosInstance.post('/invoice', payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(payment === 'cash' ? 'Cash Invoice Created!' : 'Credit Invoice Created!');
      } else {
        toast.error('Failed to create invoice.');
      }
    } catch (error) {
      toast.error('Failed to create invoice.');
    } finally {
      setIsSavingInvoice(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Invoice notification" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Create and manage quotations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search quotations by customer name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('id')}
                >
                  <div className="flex items-center">
                    Quotation ID
                    {sortConfig?.key === 'id' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('customerName')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortConfig?.key === 'customerName' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig?.key === 'date' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('items')}
                >
                  <div className="flex items-center">
                    Items
                    {sortConfig?.key === 'items' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('total')}
                >
                  <div className="flex items-center justify-end">
                    Total
                    {sortConfig?.key === 'total' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedQuotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{
                      typeof quotation.id === 'string'
                        ? quotation.id.slice(-6).toUpperCase()
                        : quotation.id !== undefined && quotation.id !== null
                          ? String(quotation.id).slice(-6).toUpperCase()
                          : '------'
                    }
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="font-medium">{quotation.customerName}</div>
                    <div className="text-xs text-gray-400">{quotation.customerEmail}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {
                      (() => {
                        const dateStr = quotation.date || (quotation as any).createdDate;
                        if (!dateStr) return '';
                        const dateObj = new Date(dateStr);
                        return isNaN(dateObj.getTime())
                          ? ''
                          : dateObj.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            });
                      })()
                    }
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.items.length}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    Rs.{quotation.total.toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setPreviewQuotation(quotation)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
                        title="Preview Quotation"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleInvoice(quotation, 'cash')}
                        className="relative p-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-800 transition-colors duration-200 group"
                        title="Cash Invoice"
                        disabled={isSavingInvoice}
                      >
                        {isSavingInvoice ? (
                          <span className="loader mr-1" style={{ width: 16, height: 16, display: 'inline-block', border: '2px solid #10b981', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : null}
                        <ArrowRight className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleInvoice(quotation, 'credit')}
                        className="relative p-1 rounded bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-800 transition-colors duration-200 group"
                        title="Credit Invoice"
                        disabled={isSavingInvoice}
                      >
                        {isSavingInvoice ? (
                          <span className="loader mr-1" style={{ width: 16, height: 16, display: 'inline-block', border: '2px solid #fb923c', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : null}
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedQuotations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotations found</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first quotation to get started'}
          </p>
        </div>
      )}

      {/* Quotation Form Modal */}
      {showForm && (
        <QuotationForm
          products={products}
          onSubmit={handleAddQuotation}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Quotation Preview Modal */}
      {previewQuotation && (
        <QuotationPreview
          quotation={previewQuotation}
          onClose={() => setPreviewQuotation(null)}
        />
      )}

      {/* Loader spinner keyframes for invoice buttons */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Quotations;