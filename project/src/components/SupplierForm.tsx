import React, { useEffect, useState } from 'react';
import { Supplier } from '../types';

interface Props {
  isOpen: boolean;
  initial?: Partial<Supplier> | null;
  onClose: () => void;
  onSave: (data: Supplier) => void;
}

const SupplierForm: React.FC<Props> = ({ isOpen, initial, onClose, onSave }) => {
  const empty: Supplier = {
    name: '',
    address: undefined,
    itemName: '',
    itemCode: '',
    quantity: 0,
    cost: 0,
    totalCost: 0,
  };

  const [form, setForm] = useState<Partial<Supplier>>(empty);

  useEffect(() => {
    if (isOpen) {
      setForm(initial ? { ...initial } : empty);
    }
  }, [isOpen, initial]);

  function change<K extends keyof Supplier>(k: K, v: string) {
    const value: any = k === 'quantity' || k === 'cost' || k === 'totalCost' ? Number(v) : v;
    const next = { ...form, [k]: value } as Partial<Supplier>;
    if (k === 'quantity' || k === 'cost') {
      const q = Number(next.quantity || 0);
      const c = Number(next.cost || 0);
      next.totalCost = q * c;
    }
    setForm(next);
  }

  const handleSave = () => {
    const payload: Supplier = {
      name: String(form.name || ''),
      address: form.address || undefined,
      itemName: String(form.itemName || ''),
      itemCode: String(form.itemCode || ''),
      quantity: Number(form.quantity || 0),
      cost: Number(form.cost || 0),
      totalCost: Number(form.totalCost || (Number(form.quantity || 0) * Number(form.cost || 0))),
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">{initial ? 'Edit Received Product' : 'Add Received Product'}</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm text-gray-700">Supplier</div>
            <input value={form.name ?? ''} onChange={e => change('name', e.target.value)} className="w-full p-2 border rounded" />
          </label>
          <label className="block">
            <div className="text-sm text-gray-700">Address</div>
            <input value={form.address ?? ''} onChange={e => change('address', e.target.value)} className="w-full p-2 border rounded" />
          </label>

          <label className="block">
            <div className="text-sm text-gray-700">Item Name</div>
            <input value={form.itemName ?? ''} onChange={e => change('itemName', e.target.value)} className="w-full p-2 border rounded" />
          </label>
          <label className="block">
            <div className="text-sm text-gray-700">Item Code</div>
            <input value={form.itemCode ?? ''} onChange={e => change('itemCode', e.target.value)} className="w-full p-2 border rounded" />
          </label>

          <label className="block">
            <div className="text-sm text-gray-700">Quantity</div>
            <input type="number" value={String(form.quantity ?? '')} onChange={e => change('quantity', e.target.value)} className="w-full p-2 border rounded" />
          </label>
          <label className="block">
            <div className="text-sm text-gray-700">Cost</div>
            <input type="number" value={String(form.cost ?? '')} onChange={e => change('cost', e.target.value)} className="w-full p-2 border rounded" />
          </label>

          <label className="block col-span-2">
            <div className="text-sm text-gray-700">Total Cost</div>
            <input type="number" value={String(form.totalCost ?? '')} onChange={e => change('totalCost', e.target.value)} className="w-full p-2 border rounded" />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default SupplierForm;
