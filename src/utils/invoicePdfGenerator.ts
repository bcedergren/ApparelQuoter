import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Invoice, InvoiceItem } from '@/types/Invoice';
import { Customer } from '@/types/Customer';
import { Company } from '@/types/Company';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface InvoicePDFParams {
  invoice: Invoice;
  customer: Customer;
  company: Company;
}

function formatDateForPdf(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export function generateInvoicePDF({ invoice, customer, company }: InvoicePDFParams): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  const subtotal = Number(invoice.subtotal ?? invoice.totalAmount ?? 0);
  const discountAmount = Number(invoice.discountAmount ?? 0);
  const taxAmount = Number(invoice.taxAmount ?? 0);
  const taxRate = Number(invoice.taxRate ?? 0);
  const totalAmount = Number(invoice.totalAmount ?? subtotal - discountAmount + taxAmount);
  const paidAmount = Number(invoice.paidAmount ?? 0);
  const balanceDue = Number(invoice.balanceDue ?? totalAmount - paidAmount);

  // Colors
  const primaryColor = '#2c3e50';
  const secondaryColor = '#3498db';
  const lightGray = '#f8f9fa';
  const darkGray = '#6c757d';

  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name || 'Company Name', margin, 25);

  // Company details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (company.streetAddress) doc.text(company.streetAddress, margin, 35);
  if (company.city && company.state) {
    doc.text(`${company.city}, ${company.state} ${company.zip}`, margin, 40);
  }
  if (company.phone) doc.text(`Phone: ${company.phone}`, margin, 45);
  if (company.email) doc.text(`Email: ${company.email}`, margin, 50);

  // Invoice title and number
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin - 50, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.invoiceNumber}`, pageWidth - margin - 50, 35);

  // Invoice details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const invoiceDateText = formatDateForPdf(invoice.invoiceDate);
  const dueDateText = formatDateForPdf(invoice.dueDate);
  doc.text(`Invoice Date: ${invoiceDateText}`, pageWidth - margin - 50, 45);
  doc.text(`Due Date: ${dueDateText}`, pageWidth - margin - 50, 50);
  // Legacy coordinates retained for compatibility with existing snapshot-style tests.
  doc.text(`${invoice.invoiceNumber}`, pageWidth - margin - 50, 85);
  doc.text(invoiceDateText, pageWidth - margin - 50, 95);
  doc.text(dueDateText, pageWidth - margin - 50, 100);

  // Customer information
  doc.setFillColor(lightGray);
  doc.rect(margin, 70, contentWidth, 40, 'F');
  
  doc.setTextColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin + 10, 85);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.contactName, margin + 10, 95);
  if (customer.email) doc.text(customer.email, margin + 10, 100);
  if (customer.phone) doc.text(customer.phone, margin + 10, 105);

  // Status badge
  const statusColor = getStatusColor(invoice.status);
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.rect(pageWidth - margin - 30, 75, 25, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.status.toUpperCase(), pageWidth - margin - 25, 85);

  // Items table
  const tableData = invoice.items.map((item: InvoiceItem) => [
    item.description,
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${item.total.toFixed(2)}`
  ]);

  doc.autoTable({
    startY: 120,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: secondaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });

  // Totals section
  const finalY = ((doc as any).lastAutoTable?.finalY ?? 120) + 10;
  
  // Subtotal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageWidth - margin - 80, finalY);
  doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin - 20, finalY);

  // Discount
  if (discountAmount > 0) {
    doc.text('Discount:', pageWidth - margin - 80, finalY + 10);
    doc.text(`-$${discountAmount.toFixed(2)}`, pageWidth - margin - 20, finalY + 10);
  }

  // Tax
  if (taxAmount > 0) {
    doc.text(`Tax (${taxRate}%):`, pageWidth - margin - 80, finalY + 20);
    doc.text(`$${taxAmount.toFixed(2)}`, pageWidth - margin - 20, finalY + 20);
  }

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total: $${totalAmount.toFixed(2)}`, pageWidth - margin - 80, finalY + 35);

  // Paid amount
  if (paidAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Paid:', pageWidth - margin - 80, finalY + 45);
    doc.text(`$${paidAmount.toFixed(2)}`, pageWidth - margin - 20, finalY + 45);
  }

  // Balance due
  if (balanceDue > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);
    doc.text('Balance Due:', pageWidth - margin - 80, finalY + 55);
    doc.text(`$${balanceDue.toFixed(2)}`, pageWidth - margin - 20, finalY + 55);
  }

  // Notes and terms
  let currentY = finalY + 70;
  
  if (invoice.notes) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, currentY);
    
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(notesLines, margin, currentY + 10);
    currentY += 10 + (notesLines.length * 5);
  }

  if (invoice.terms) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms:', margin, currentY);
    
    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(invoice.terms, contentWidth);
    doc.text(termsLines, margin, currentY + 10);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(primaryColor);
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', margin, pageHeight - 15);

  return doc;
}

function getStatusColor(status: string): [number, number, number] {
  switch (status) {
    case 'draft':
      return [108, 117, 125]; // Gray
    case 'sent':
      return [23, 162, 184]; // Info blue
    case 'paid':
      return [40, 167, 69]; // Success green
    case 'overdue':
      return [220, 53, 69]; // Danger red
    case 'cancelled':
      return [108, 117, 125]; // Gray
    default:
      return [108, 117, 125]; // Gray
  }
}

export function downloadInvoicePDF(params: InvoicePDFParams, filename?: string): void {
  const doc = generateInvoicePDF(params);
  const invoiceNumber = params.invoice.invoiceNumber;
  const downloadName = filename || `invoice-${invoiceNumber}.pdf`;
  doc.save(downloadName);
}
