import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SupplierForm from '../components/SupplierForm';
import { Supplier } from '../types';

const initialSample: Supplier[] = [
  { name: 'Acme Supplies', address: '123 Main St', itemName: 'Widget A', itemCode: 'W-A-001', quantity: 10, cost: 5, totalCost: 50 },
];

const ReceivedProducts: React.FC = () => {
  const [items, setItems] = useState<Supplier[]>(initialSample);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] = useState<Partial<Supplier> | null>(null);

  const handleAdd = () => {
    setEditingIndex(null);
    setModalInitial(null);
    setModalOpen(true);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setModalInitial(items[idx]);
    setModalOpen(true);
  };

  const handleDelete = (idx: number) => {
    if (!confirm('Delete this received product?')) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = (data: Supplier) => {
    if (editingIndex === null) {
      setItems(prev => [...prev, data]);
    } else {
      setItems(prev => prev.map((it, i) => (i === editingIndex ? data : it)));
    }
    setModalOpen(false);
    setEditingIndex(null);
    setModalInitial(null);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Received Products</h2>
        <div>
          <button onClick={handleAdd} className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full">
          <thead>
          <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm text-gray-900 font-medium">Supplier</th>
              <th className="px-4 py-3 text-left text-sm text-gray-900 font-medium">Address</th>
              <th className="px-4 py-3 text-left text-sm text-gray-900 font-medium">Item</th>
              <th className="px-4 py-3 text-left text-sm text-gray-900 font-medium">Code</th>
              <th className="px-4 py-3 text-left text-sm text-gray-900 font-medium">Qty</th>
              <th className="px-4 py-3 text-left text-sm text-gray-900 font-medium">Cost</th>
              <th className="px-4 py-3 text-left text-sm text-gray-900 font-medium">Total</th>
              <th className="px-4 py-3 text-left text-sm text-gray-900 font-medium">Actions</th>
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

      <SupplierForm isOpen={modalOpen} initial={modalInitial} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
};

export default ReceivedProducts;