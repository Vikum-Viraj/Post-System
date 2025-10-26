export interface Product {
  id: any;
  name: string;
  code: string;
  unit: string;
  quantity: any;
  cost: any;
  mrp: any;
}

export interface QuotationItem {
  productId: string;
  productCode: string;
  productName: string;
  description: string;
  mrp: number;
  unit?: string;
  unitPrice?: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  phone: string;
  receiverCompany?: string;
  receiverAddress?: string;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  date: string;
  orderRef?: string;
  showDiscountInRate?: boolean;
}

export interface Invoice {
  id: string;
  quotationId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  receiverCompany: string;
  receiverAddress: string;
  orderRef?: string;
  type?: string;
  payment?: string;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
  showDiscountInRate?: boolean;
}
export interface Supplier {
  name: string;
  address?: string;
  itemName: string;
  itemCode: string;
  quantity: number;
  cost: number;
  totalCost: number;
}