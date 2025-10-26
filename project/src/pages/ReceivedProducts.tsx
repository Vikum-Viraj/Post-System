import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../config/axiosConfig';
import SupplierForm from '../components/SupplierForm';
import EditSupplier from '../components/EditSupplier';
import { Supplier } from '../types';

const initialSample: Supplier[] = []

const ReceivedProducts: React.FC = () => {
  const [items, setItems] = useState<Supplier[]>(initialSample);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] = useState<Partial<Supplier> | null>(null);

  const fetchSupplier = async () => {
    try {
      const response = await axiosInstance.get('/suppliers');
      if (response.status === 200) {
        setItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  useEffect(() => {
    fetchSupplier();
  }, []);

  // Helper: delete supplier by id
  const deleteSupplier = async (id: any) => {
    return axiosInstance.delete(`/supplier/${id}`);
  };

  // Helper: update supplier by id
  const updateSupplier = async (id: any, data: Supplier) => {
    return axiosInstance.put(`/supplier/${id}`, data);
  };
  
  const handleAdd = () => {
    setEditingIndex(null);
    setModalInitial(null);
    setAddOpen(true);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setModalInitial(items[idx]);
    setEditOpen(true);
  };

  const handleDelete = async (idx: number) => {
    if (!confirm('Delete this received product?')) return;
    const target = items[idx];
    // If record has an id, delete from server first
    if (target && target.id) {
      try {
        await deleteSupplier(target.id);
        toast.success('Supplier deleted');
        setItems(prev => prev.filter((_, i) => i !== idx));
      } catch (err) {
        console.error('Error deleting supplier', err);
        toast.error('Failed to delete supplier');
      }
      return;
    }
    // fallback: local-only
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (data: Supplier) => {
    try {
      // Add new supplier
      if (editingIndex === null) {
        const response = await axiosInstance.post('/supplier', data);
        if (response.status === 200 || response.status === 201) {
          const saved: Supplier = response.data;
          setItems(prev => [...prev, saved]);
          toast.success('Supplier added');
        } else {
          toast.error('Failed to add supplier');
        }
      } else {
        // Update existing supplier
        const existing = items[editingIndex];
        if (existing && existing.id) {
          const response = await updateSupplier(existing.id, data);
          if (response.status === 200) {
            const updated: Supplier = response.data;
            setItems(prev => prev.map((it, i) => (i === editingIndex ? updated : it)));
            toast.success('Supplier updated');
          } else {
            toast.error('Failed to update supplier');
          }
        } else {
          // no id: update local
          setItems(prev => prev.map((it, i) => (i === editingIndex ? data : it)));
          toast.success('Supplier updated');
        }
      }
    } catch (error) {
      console.error('Error saving supplier', error);
      toast.error('Error saving supplier');
    } finally {
      setAddOpen(false);
      setEditOpen(false);
      setEditingIndex(null);
      setModalInitial(null);
    }
  };

    // Export current items to CSV
    const downloadCsv = (rows: Supplier[]) => {
      try {
        if (!rows || rows.length === 0) {
          toast.info('No data to export');
          return;
        }

        const headers = ['Supplier', 'Address', 'Item Name', 'Item Code', 'Quantity', 'Cost', 'Total Cost'];

        const escapeCsv = (v: any) => {
          if (v === null || v === undefined) return '""';
          const s = String(v);
          // double quotes inside field must be doubled per CSV rules
          const escaped = s.replace(/"/g, '""');
          return `"${escaped}"`;
        };

        const rowsText = rows.map(r => [
          escapeCsv(r.name),
          escapeCsv(r.address),
          escapeCsv(r.itemName),
          escapeCsv(r.itemCode),
          escapeCsv(r.quantity),
          escapeCsv(r.cost),
          escapeCsv(r.totalCost),
        ].join(',')).join('\n');

        const csv = `${headers.map(h => '"' + h.replace(/"/g, '""') + '"').join(',')}\n${rowsText}`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `received_products_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('CSV export started');
      } catch (err) {
        console.error('CSV export error', err);
        toast.error('Failed to export CSV');
      }
    };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Received Products</h2>
        <div>
          <div className="flex gap-2">
            <button onClick={() => downloadCsv(items)} className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-2">
              <span>Download Report</span>
            </button>
            <button onClick={handleAdd} className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
      <div className="overflow-auto">
        <table className="min-w-full">
          <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-4 py-3 text-left text-sm text-gray-800 font-semibold uppercase tracking-wide">Supplier</th>
              <th className="px-4 py-3 text-left text-sm text-gray-800 font-semibold uppercase tracking-wide">Address</th>
              <th className="px-4 py-3 text-left text-sm text-gray-800 font-semibold uppercase tracking-wide">Item</th>
              <th className="px-4 py-3 text-left text-sm text-gray-800 font-semibold uppercase tracking-wide">Code</th>
              <th className="px-4 py-3 text-left text-sm text-gray-800 font-semibold uppercase tracking-wide">Qty</th>
              <th className="px-4 py-3 text-left text-sm text-gray-800 font-semibold uppercase tracking-wide">Cost</th>
              <th className="px-4 py-3 text-left text-sm text-gray-800 font-semibold uppercase tracking-wide">Total</th>
              <th className="px-4 py-3 text-left text-sm text-gray-800 font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{it.name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{it.address}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{it.itemName}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{it.itemCode}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{it.quantity}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{it.cost}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{it.totalCost}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  <button onClick={() => handleEdit(idx)} title="Edit" className="mr-2 text-yellow-500 hover:text-yellow-700">
                    <Edit className="inline w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(idx)} title="Delete" className="text-red-600 hover:text-red-800">
                    <Trash2 className="inline w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SupplierForm isOpen={addOpen} initial={null} onClose={() => setAddOpen(false)} onSave={handleSave} />
      <EditSupplier isOpen={editOpen} supplier={modalInitial} onClose={() => setEditOpen(false)} onSave={handleSave} />
    </div>
  );
};

export default ReceivedProducts;