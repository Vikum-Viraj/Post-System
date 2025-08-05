export interface Product {
  id: any;
  name: string;
  code: string;
  quantity: any;
  mrp: any;
}

export interface QuotationItem {
  productId: string;
  productCode: string;
  productName: string;
  description: string;
  mrp: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  receiverCompany?: string;
  receiverAddress?: string;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  date: string;
  orderRef?: string;
}

export interface Invoice {
  id: string;
  quotationId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type:string;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
}