export interface Invoice {
  _id: string;
  companyId: string;
  customerId: string;
  quoteId?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  payments: InvoicePayment[];
  sentDate?: Date;
  paidDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemType?: 'apparel' | 'printing' | 'setup' | 'shipping' | 'other';
}

export interface InvoicePayment {
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  reference?: string;
  notes?: string;
}

export interface CreateInvoiceRequest {
  customerId: string;
  quoteId?: string;
  invoiceDate: Date;
  dueDate: Date;
  items: Omit<InvoiceItem, 'total'>[];
  taxRate: number;
  discountAmount: number;
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceRequest {
  invoiceDate?: Date;
  dueDate?: Date;
  items?: Omit<InvoiceItem, 'total'>[];
  taxRate?: number;
  discountAmount?: number;
  notes?: string;
  terms?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export interface AddPaymentRequest {
  amount: number;
  paymentMethod: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  reference?: string;
  notes?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  companyId: string;
  headerText?: string;
  footerText?: string;
  terms?: string;
  logoUrl?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
