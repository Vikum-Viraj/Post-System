import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../config/axiosConfig';
import { Search, Receipt, Eye } from 'lucide-react';
import { Invoice as BaseInvoice } from '../types';

type Invoice = BaseInvoice & {
  payment?: string;
};
import InvoicePreview from '../components/InvoicePreview';
import InvoiceEditModal from '../components/InvoiceEditModal';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axiosInstance.get('/invoices');
        setInvoices(response.data);
        console.log('Fetched invoices:', response.data);
      } catch (error) {
        // Optionally handle error
      }
    };
    fetchInvoices();
  }, []);

  // Sorting logic
  type InvoiceSortKey = keyof Invoice | 'createdDate';
  const [sortConfig, setSortConfig] = useState<{ key: InvoiceSortKey; direction: 'ascending' | 'descending' }>({ key: 'createdDate', direction: 'descending' });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredInvoices = invoices.filter(invoice => {
    const search = searchTerm.trim().toLowerCase();
    const customerName = invoice.customerName?.toLowerCase() || '';
    const idStr = (typeof invoice.id === 'string' ? invoice.id : String(invoice.id)).toLowerCase();
    const matchesSearch = customerName.includes(search) || idStr.includes(search);
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedInvoices = React.useMemo(() => {
    let sortableItems = [...filteredInvoices];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        if (sortConfig.key === 'createdDate') {
          aValue = (a as any).createdDate || a.date;
          bValue = (b as any).createdDate || b.date;
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        } else {
          aValue = a[sortConfig.key as keyof Invoice];
          bValue = b[sortConfig.key as keyof Invoice];
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
  }, [filteredInvoices, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedInvoices.length / pageSize);
  const paginatedInvoices = sortedInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const requestSort = (key: InvoiceSortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Payment type color
  const getPaymentColor = (payment: string) => {
    if (payment === 'cash') return 'bg-emerald-100 text-emerald-800';
    if (payment === 'credit') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-2">Track and manage your invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices by customer name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Stats Cards: Only Cash and Credit */}
      {/* <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cash Invoices</p>
              <p className="text-2xl font-bold text-emerald-600">
                {invoices.filter(i => i.type === 'cash').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credit Invoices</p>
              <p className="text-2xl font-bold text-orange-600">
                {invoices.filter(i => i.type === 'credit').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div> */}

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('createdDate')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig?.key === 'createdDate' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{typeof invoice.id === 'string' ? invoice.id.slice(-6).toUpperCase() : String(invoice.id).slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {
                      (() => {
                        const dateStr = invoice.date || (invoice as any).createdDate;
                        if (!dateStr) return '';
                        const dateObj = new Date(dateStr);
                        if (isNaN(dateObj.getTime())) return '';
                        return dateObj.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                      })()
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.items.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentColor(invoice.payment ?? '')}`}>
                      <span className="capitalize">{invoice.payment === 'cash' ? 'Cash' : invoice.payment === 'credit' ? 'Credit' : invoice.payment}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    Rs.{invoice.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
                        onClick={() => setPreviewInvoice(invoice)}
                        title="Preview Invoice"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditInvoice(invoice)}
                        className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors duration-200"
                        title="Edit Invoice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.726z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center space-x-2 mt-2 px-2 pb-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Next
          </button>
        </div>
      )}

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Invoices will appear here when you convert quotations to invoices'
            }
          </p>
        </div>
      )}
    {/* Invoice Preview Modal */}
    {previewInvoice && (
      <InvoicePreview invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />
    )}
    {/* Invoice Edit Modal */}
    {editInvoice && (
      <InvoiceEditModal
        invoice={editInvoice}
        onClose={() => setEditInvoice(null)}
        onSave={updated => {
          setInvoices(inv => inv.map(i => i.id === updated.id ? updated : i));
          setEditInvoice(null);
          toast.success('Invoice updated successfully!');
        }}
      />
    )}
    <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
  </div>
  );
};

export default Invoices;