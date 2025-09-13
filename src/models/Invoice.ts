import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemType?: 'apparel' | 'printing' | 'setup' | 'shipping' | 'other';
}

export interface IInvoicePayment {
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  reference?: string;
  notes?: string;
}

export interface IInvoice extends Document {
  companyId: mongoose.Schema.Types.ObjectId;
  customerId: mongoose.Schema.Types.ObjectId;
  quoteId?: mongoose.Schema.Types.ObjectId; // Reference to original quote if applicable
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: IInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  payments: IInvoicePayment[];
  sentDate?: Date;
  paidDate?: Date;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  itemType: { 
    type: String, 
    enum: ['apparel', 'printing', 'setup', 'shipping', 'other'],
    default: 'apparel'
  }
});

const InvoicePaymentSchema = new Schema<IInvoicePayment>({
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, required: true, default: Date.now },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'check', 'credit_card', 'bank_transfer', 'other'],
    required: true
  },
  reference: { type: String },
  notes: { type: String }
});

const InvoiceSchema = new Schema<IInvoice>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  quoteId: { type: Schema.Types.ObjectId, ref: 'Quotes' },
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  items: { type: [InvoiceItemSchema], required: true },
  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  taxAmount: { type: Number, default: 0, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  balanceDue: { type: Number, required: true, min: 0 },
  notes: { type: String },
  terms: { type: String },
  payments: { type: [InvoicePaymentSchema], default: [] },
  sentDate: { type: Date },
  paidDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to calculate totals
InvoiceSchema.pre('save', function(next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate tax amount
  this.taxAmount = (this.subtotal - this.discountAmount) * (this.taxRate / 100);
  
  // Calculate total amount
  this.totalAmount = this.subtotal - this.discountAmount + this.taxAmount;
  
  // Calculate paid amount from payments
  this.paidAmount = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate balance due
  this.balanceDue = this.totalAmount - this.paidAmount;
  
  // Update status based on balance
  if (this.balanceDue <= 0 && this.paidAmount > 0) {
    this.status = 'paid';
    this.paidDate = new Date();
  } else if (this.dueDate < new Date() && this.balanceDue > 0) {
    this.status = 'overdue';
  }
  
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
InvoiceSchema.index({ companyId: 1, status: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ invoiceDate: -1 });

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
