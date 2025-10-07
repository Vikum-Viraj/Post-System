import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Search, Package, Edit, Trash2, Upload } from 'lucide-react';
import { Product } from '../types';
import EditProductModal from '../components/EditProduct';
import UploadCsv from '../components/UploadCsv';
import axiosInstance from '../config/axiosConfig';


const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showUploadCsv, setShowUploadCsv] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    quantity: '',
    unit: '',
    mrp: '',
    cost: '',
  });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  // Remove delete modal state

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/products');
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };                        

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort products to show newest first (assuming products have an id that increases with time)
  // or if there's a createdAt/dateAdded field, we can sort by that
  const sortedProducts = filteredProducts.sort((a, b) => {
    // If products have a numeric id, sort by id descending (newest first)
    if (typeof a.id === 'number' && typeof b.id === 'number') {
      return b.id - a.id;
    }
    // If products have string ids, try to convert and compare
    if (a.id && b.id) {
      const aId = parseInt(String(a.id));
      const bId = parseInt(String(b.id));
      if (!isNaN(aId) && !isNaN(bId)) {
        return bId - aId;
      }
    }
    // Fallback: sort by name if ids are not comparable
    return a.name.localeCompare(b.name);
  });

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSaveEditedProduct = async (updatedProduct: Product) => {
    // Update product in backend
    try {
      const payload = {
        name: updatedProduct.name,
        code: updatedProduct.code,
        quantity: updatedProduct.quantity,
        unit: updatedProduct.unit,
        mrp: updatedProduct.mrp,
        cost: updatedProduct.cost,
      };
      const response = await axiosInstance.put(`/product/${updatedProduct.id}`, payload);
      if (response.status === 200) {
        toast.success('Product updated successfully!');
      } else {
        toast.error('Failed to update product!');
      }
    } catch (error) {
      toast.error('Error updating product!');
      console.error('Error updating product:', error);
    }
    setEditProduct(null);
    fetchProducts();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.code) {
      const productToAdd = {
        name: formData.name,
        code: formData.code,
        quantity: formData.quantity,
        unit: formData.unit,
        mrp: Number(formData.mrp || '0'),
        cost: Number(formData.cost || '0'),
      };
      try {
        const response = await axiosInstance.post('/product', productToAdd);
        if (response.status === 200) {
          setShowForm(false);
          setFormData({ name: '', code: '', quantity: '', unit: '', mrp: '', cost: '' });
          setCurrentPage(1); // Reset to first page to show the new product
          fetchProducts();
          toast.success('Product added successfully!');
        }
      } catch (error) {
        toast.error('Error adding product!');
        console.error('Error adding product:', error);
      }
    } else {
      toast.error('Please fill all required fields.');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setFormData({ name: '', code: '', quantity: '', unit: '', mrp: '', cost: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      const response = await axiosInstance.delete(`/product/${product.id}`);
      if (response.status === 200) {
        toast.success('Product deleted successfully!');
        fetchProducts();
      } else {
        toast.error('Failed to delete product!');
      }
    } catch (error) {
      toast.error('Error deleting product!');
      console.error('Error deleting product:', error);
    }
  };

  // Handle CSV upload success
  const handleCsvUploadSuccess = () => {
    setCurrentPage(1); // Reset to first page to show new products
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        aria-label="Product notification"
      />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory • Newest products first</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setShowUploadCsv(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={() => {
              // CSV download logic
              const csvRows = [];
              const headers = ['ID', 'Name', 'Code', 'Quantity', 'MRP', 'Cost'];
              csvRows.push(headers.join(','));
              products.forEach(product => {
                const row = [
                  '"' + (product.id ?? '') + '"',
                  '"' + (product.name ?? '') + '"',
                  '"' + (product.code ?? '') + '"',
                  '"' + (product.quantity ?? '') + '"',
                  '"' + (product.mrp ?? '') + '"',
                  '"' + (product.cost ?? '') + '"',
                ];
                csvRows.push(row.join(','));
              });
              const csvContent = csvRows.join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'products_report.csv';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">MRP (Rs.)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost (Rs.)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{product.code}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">Rs. {product.mrp.toFixed(2)}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                  {product.cost ? `Rs. ${Number(product.cost).toFixed(2)}` : '-'}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{product.quantity} {product.unit}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    onClick={() => setEditProduct(product)}>
                    <Edit className="h-4 w-4 inline" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteProduct(product)}
                  >
                    <Trash2 className="h-4 w-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
            </p>
          </div>
        )}
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
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
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
      </div>
        {editProduct && (
  <EditProductModal
    product={editProduct}
    onClose={() => setEditProduct(null)}
    onSave={handleSaveEditedProduct}
  />
)}
      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8" style={{ minWidth: '600px' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            
            <form id="product-form" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product code"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      MRP (Rs.) *
                    </label>
                    <input
                      type="number"
                      name="mrp"
                      value={formData.mrp}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="0"
                        step="any"
                        required
                        className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="w-1/3 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">unit</option>
                        <option value="pcs">pcs</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="mg">mg</option>
                        <option value="m">m</option>
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </form>
            <div className="flex space-x-6 pt-8 justify-end">
              <button
                type="button"
                onClick={cancelForm}
                className="px-8 py-3 border border-gray-300 text-lg text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                className="px-8 py-3 bg-blue-600 text-lg text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Csv Modal */}
      <UploadCsv
        isOpen={showUploadCsv}
        onClose={() => setShowUploadCsv(false)}
        onUploadSuccess={handleCsvUploadSuccess}
        title="Upload Products CSV"
        endpoint="/products/upload-csv"
        maxFileSize={10}
      />
    </div>
  );
};

export default Products;