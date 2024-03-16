import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Quote } from '@/types/Quote';
import { Company } from '@/types/Company';
import { Customer } from '@/types/Customer';

interface Table {
	headers: string[];
	data: (string | number)[][];
}

interface Content {
	tables: Table[];
	additionalRows: { label: string; value: string }[];
}

interface PDFParams {
	title: string;
	customerName: string;
	content: Content;
	filenamePrefix: string;
	company: Company;
	customer: Customer;
}

// Extend the jsPDF type definition to include autoTable and lastAutoTable properties
declare module 'jspdf' {
	interface jsPDF {
		autoTable: (options: any) => jsPDF;
		lastAutoTable: {
			finalY: number;
		};
	}
}

export const createQuote = (
	quote: Quote,
	decoration: string,
	artworkFee: number,
	setupFee: number,
	deliveryDate: string,
	subtotal: number,
	company: Company,
	customer: Customer
) => {
	if (!quote) {
		console.error('No quote data available');
		return;
	}

	// Example calculations for total, depositDue, and balance
	const total = subtotal + artworkFee + setupFee;
	const depositPercentage = 50; // Assuming 50% deposit, or this could be fetched from customer/company details
	const depositDue = total * (depositPercentage / 100);
	const balance = total - depositDue;

	// Mapping quote items to table data format
	const itemsTableData = quote.items.map((item) => [
		item.brandAndStyle,
		`${item.color} - ${Object.entries(item.sizes)
			.map(([size, quantity]) => `(${quantity})${size}`)
			.join(' ')}`,
		`$${item.standardPrice.toFixed(2)}`,
		Object.values(item.sizes).reduce((acc, qty) => acc + qty, 0),
		`$${(
			item.standardPrice *
			Object.values(item.sizes).reduce((acc, qty) => acc + qty, 0)
		).toFixed(2)}`,
	]);

	const content: Content = {
		tables: [
			{
				headers: [
					'Brand & Style',
					'Color & Sizes',
					'Cost',
					'Quantity',
					'Subtotal',
				],
				data: itemsTableData,
			},
		],
		additionalRows: [
			{ label: 'Decoration', value: decoration || 'N/A' },
			{
				label: 'Artwork',
				value: `Artwork fee for printed design $${artworkFee.toFixed(2)}`,
			},
			{ label: 'Setup', value: `$${setupFee.toFixed(2)}` },
			{ label: 'Delivery By', value: deliveryDate || 'N/A' },
			{ label: 'Quote Subtotal', value: `$${subtotal.toFixed(2)}` },
			{ label: 'Quote Total', value: `$${total.toFixed(2)}` },
			{ label: 'Deposit Due', value: `$${depositDue.toFixed(2)}` },
			{ label: 'Balance', value: `$${balance.toFixed(2)}` },
		],
	};

	generatePDF({
		title: `Quote ${quote._id}`,
		customerName: quote.customerName,
		content,
		filenamePrefix: 'Quote',
		company,
		customer,
	});
};

const generatePDF = ({
	title,
	customerName,
	content,
	filenamePrefix,
	company,
	customer,
}: PDFParams) => {
	const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();

	// Company Information and Quote Title
	doc.setFontSize(10);
	doc.text(company.companyName, 20, 20);
	doc.text(company.streetAddress, 20, 25);
	doc.text(`${company.city}, ${company.state} ${company.zip}`, 20, 30);
	doc.text(`Phone: ${company.phone}`, 20, 35);
	doc.text(`Email: ${company.email}`, 20, 40);

	// Customer Information
	doc.setFontSize(10);
	doc.text(`Customer: ${customerName}`, 100, 20);
	doc.text(`${customer.address} ${customer.address2}`, 100, 25);
	doc.text(`${customer.city} ${customer.state} ${customer.zip}`, 100, 30);
	doc.text(`${customer.phone}`, 100, 35);
	doc.text(`${customer.email}`, 100, 40);

	doc.setFontSize(14);
	doc.text(title, 20, 50);

	doc.setFontSize(10);
	// Items Table
	doc.autoTable({
		head: [['Brand & Style', 'Color & Sizes', 'Cost', 'Quantity', 'Subtotal']],
		body: content.tables[0].data,
		startY: 55,
	});

	// For additional rows, specifically aligning the last four rows to the right
	let additionalStartY = doc.lastAutoTable.finalY + 10;
	content.additionalRows.forEach(
		(row: { label: string; value: string }, index: number) => {
			if (index >= content.additionalRows.length - 4) {
				// Align the last 4 rows to the right
				const rowText = `${row.label}: ${row.value}`;
				const textSize = doc.getTextWidth(rowText);
				const textPosition = pageWidth - textSize - 20; // 20 is the margin from the right side
				doc.text(rowText, textPosition, additionalStartY);
			} else {
				// For other rows, keep the original alignment
				doc.text(`${row.label}: ${row.value}`, 20, additionalStartY);
			}
			additionalStartY += 5;
		}
	);

	// Save the PDF
	const filename = `${filenamePrefix}_${customerName.replace(
		/\s+/g,
		'_'
	)}_${new Date().toLocaleDateString()}.pdf`;
	doc.save(filename);
};
