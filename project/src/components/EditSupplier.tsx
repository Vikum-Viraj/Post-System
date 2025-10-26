import React from 'react';
import SupplierForm from './SupplierForm';
import { Supplier } from '../types';

interface Props {
  isOpen: boolean;
  supplier: Partial<Supplier> | null;
  onClose: () => void;
  onSave: (data: Supplier) => void;
}

const EditSupplier: React.FC<Props> = ({ isOpen, supplier, onClose, onSave }) => {
  // Reuse SupplierForm for edit; pass initial supplier data
  return (
    <SupplierForm isOpen={isOpen} initial={supplier} onClose={onClose} onSave={onSave} />
  );
};

export default EditSupplier;
