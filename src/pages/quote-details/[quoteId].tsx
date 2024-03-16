import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button, Spinner } from 'react-bootstrap';
import Layout from '@/components/Layout';
import {
	Quote,
	QuoteItem,
	VinylDetails,
	EmbroideryDetails,
	PrintingDetails,
} from '@/types/Quote';
import { Customer } from '@/types/Customer';
import {
	Price,
	PreCutVinyl,
	Embroidery,
	ArtCost,
	ScreenPrinting,
} from '@/types/Price';
import QuoteItemRow from '@/components/QuoteItemRow';
import { Company } from '@/types/Company';
import { createQuote } from '@/utils/pdfGenerator';
import styles from '@/styles/QuoteDetails.module.css';

export type SizeKey = keyof QuoteItem['sizes'];

const QuoteDetails = () => {
	const router = useRouter();
	const { data: session } = useSession();
	const { quoteId } = router.query;
	const [company, setCompany] = useState<Company | null>(null);
	const [quote, setQuote] = useState<Quote | null>(null);
	const [prices, setPrices] = useState<Price | null>(null);
	const [customer, setCustomer] = useState<Customer | null>(null);

	const [decoration, setDecoration] = useState('');
	const [colorMatches, setColorMatches] = useState('');
	const [artworkFee, setArtworkFee] = useState(0);
	const [setupFee, setSetupFee] = useState(0);
	const [deliveryDate, setDeliveryDate] = useState('');
	const [vinylFee, setVinylFee] = useState(0);
	const [embroideryFee, setEmbroideryFee] = useState(0);

	const [invoiceSubtotal, setInvoiceSubtotal] = useState(0);
	const [invoiceTotal, setInvoiceTotal] = useState(0);
	const [depositDue, setDepositDue] = useState(0);
	const [balance, setBalance] = useState(0);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch company details
	useEffect(() => {
		const fetchCompanyDetails = async () => {
			if (session) {
				const companyId = session.user.companyId;
				const response = await fetch(`/api/company/${companyId}`);
				if (response.ok) {
					const { company } = await response.json();
					setCompany(company);
				} else {
					console.error('Failed to fetch company details');
				}
			}
		};

		fetchCompanyDetails();
	}, [session]);

	useEffect(() => {
		const fetchQuoteDetails = async () => {
			if (!quoteId || typeof quoteId !== 'string') return;

			setLoading(true);
			try {
				const res = await fetch(`/api/quote/${quoteId}`);
				if (!res.ok) throw new Error('Failed to fetch quote details');

				const data: Quote = await res.json();
				setQuote(data);
			} catch (err) {
				setError('Failed to load quote details');
			} finally {
				setLoading(false);
			}
		};

		fetchQuoteDetails();
	}, [quoteId]);

	useEffect(() => {
		const fetchCustomerDetails = async (companyId: string) => {
			try {
				const res = await fetch(`/api/customers/${companyId}`);
				if (!res.ok) throw new Error('Failed to fetch customer details');

				const { customers } = await res.json();
				if (customers.length > 0) {
					setCustomer(customers[0]);
				}
			} catch (err) {
				console.error('Failed to load customer details:', err);
			}
		};

		if (quote && quote.companyId) {
			fetchCustomerDetails(quote.companyId);
		}
	}, [quote]);

	useEffect(() => {
		const fetchPrices = async (companyId: string) => {
			try {
				const res = await fetch(`/api/prices/${companyId}`);
				if (!res.ok) throw new Error('Failed to fetch prices');
				const { prices } = await res.json();
				setPrices(prices);
			} catch (error) {
				console.error('Failed to load prices:', error);
			}
		};

		if (quote && quote.companyId) {
			fetchPrices(quote.companyId);
		}
	}, [quote]);

	useEffect(() => {
		if (prices && quote && customer) {
			// Set decoration cost based on the number of colors in the printing options
			let decorationDetails = [];

			// Function to safely retrieve screen printing cost
			const getScreenPrintingCost = (colors: number): number => {
				const key = `${colors} color` as keyof ScreenPrinting;
				const costArray = prices.screenPrinting[key];
				return costArray ? parseFloat(costArray[0]) : 0;
			};

			// Calculate cost for front colors if not 0 or null
			if (quote.printingOptions.colorsFront > 0) {
				const frontCost = getScreenPrintingCost(
					quote.printingOptions.colorsFront
				);
				decorationDetails.push(
					`Front: ${quote.printingOptions.colorsFront} color(s)`
				);
			}

			// Calculate cost for back colors if not 0 or null
			if (quote.printingOptions.colorsBack > 0) {
				const backCost = getScreenPrintingCost(
					quote.printingOptions.colorsBack
				);
				decorationDetails.push(
					`Back: ${quote.printingOptions.colorsBack} color(s)`
				);
			}

			// Calculate cost for left sleeve colors if not 0 or null
			if (quote.printingOptions.colorsLeftSleeve > 0) {
				const backCost = getScreenPrintingCost(
					quote.printingOptions.colorsLeftSleeve
				);
				decorationDetails.push(
					`Left Sleeve: ${quote.printingOptions.colorsLeftSleeve} color(s)`
				);
			}

			// Calculate cost for right sleeve colors if not 0 or null
			if (quote.printingOptions.colorsRightSleeve > 0) {
				const backCost = getScreenPrintingCost(
					quote.printingOptions.colorsRightSleeve
				);
				decorationDetails.push(
					`Right Sleeve: ${quote.printingOptions.colorsRightSleeve} color(s)`
				);
			}

			// Combine the details into one string, if there are details to display
			if (decorationDetails.length > 0) {
				setDecoration(decorationDetails.join(', '));
			} else {
				setDecoration('');
			}

			// Color match cost
			if (quote.printingDetails.colorMatches > 0) {
				const colorMatchCost = calculateColorMatchCost(
					quote.printingDetails,
					prices.artCost
				);
				setColorMatches(
					`Color Matches: ${
						quote.printingDetails.colorMatches
					}, Cost: $${colorMatchCost.toFixed(2)}`
				);
			} else {
				setColorMatches('');
			}

			// Artwork fee based on printingDetails.artworkNeeded
			const artworkCost = quote.printingDetails.artworkNeeded
				? parseFloat(prices.artCost.flatFee)
				: 0;
			setArtworkFee(artworkCost);

			// Setup fee based on embroideryDetails.setupFee and screenPrintingDetails.additionalScreens
			const setupCost =
				(quote.screenPrintingDetails.newScreensNeeded
					? parseFloat(prices.screenPrinting.perScreenNew)
					: 0) +
				(quote.embroideryDetails.hoopingFeeFront
					? parseFloat(prices.embroidery.hoopingFee)
					: 0);
			setSetupFee(setupCost);

			// Calculate Vinyl and Embroidery fees
			const vinylCost = calculateVinylCost(
				quote.vinylDetails,
				prices.preCutVinyl
			);
			setVinylFee(vinylCost);

			const embroideryCost = calculateEmbroideryCost(
				quote.embroideryDetails,
				prices.embroidery
			);

			setEmbroideryFee(Number(embroideryCost) || 0);

			if (quote && quote.ModifiedAt) {
				const modifiedAt = new Date(quote.ModifiedAt);
				const deliveryDueDays = quote.printingDetails.deliveryDueDays || 0;

				// Create a new date based on the number of milliseconds in 'deliveryDueDays'
				const deliveryDueDate = new Date(
					modifiedAt.getTime() + deliveryDueDays * 24 * 60 * 60 * 1000
				);

				setDeliveryDate(deliveryDueDate.toLocaleDateString());
			}

			// Calculate subtotals and totals
			const subtotal =
				quote.summary.apparelCost +
				quote.summary.printingCost +
				quote.summary.shippingCost +
				quote.summary.taxCost +
				artworkCost +
				setupCost +
				vinylCost +
				embroideryCost;

			setInvoiceSubtotal(Number(subtotal) || 0);
			const total = subtotal; // Add other adjustments as necessary
			setInvoiceTotal(Number(total) || 0);

			// Calculate the deposit due based on the customer's deposit percentage or a default value
			const depositPercentage = customer.depositPercentage;
			const deposit = invoiceTotal * (depositPercentage / 100);
			setDepositDue(deposit);

			const balanceDue = total - deposit;
			setBalance(balanceDue);
		}
	}, [prices, quote, customer, invoiceTotal]);

	const getTotalQuantity = (sizes: QuoteItem['sizes']): number => {
		return Object.values(sizes).reduce((total, qty) => total + qty, 0);
	};

	const getItemCost = (item: QuoteItem): number => {
		const baseCost = item.standardPrice;
		let additionalCost = 0;
		Object.keys(item.sizePrices || {}).forEach((size) => {
			additionalCost +=
				item.sizePrices![size as keyof typeof item.sizePrices] *
				(item.sizes[size as SizeKey] || 0);
		});
		return baseCost + additionalCost;
	};

	const printQuote = () => {
		if (!quote) {
			console.error('No quote data available');
			return;
		}

		if (!company) {
			console.error('Company details are not available');
			return;
		}

		if (!customer) {
			console.error('Customer details are not available');
			return;
		}

		// Assume you have functions or calculations to get these values
		const decorationDetails = getDecorationDetails(quote); // Define this function based on your business logic
		const artworkFee = getArtworkFee(quote); // Define this function based on your business logic
		const setupFee = getSetupFee(quote); // Define this function based on your business logic
		const deliveryDate = getDeliveryDate(quote); // Define this function based on your business logic

		// Data for the items table in the PDF
		const itemsTableData = quote.items.map((item) => [
			item.brandAndStyle,
			item.color,
			`$${item.standardPrice.toFixed(2)}`,
			Object.entries(item.sizes)
				.map(([size, quantity]) => `${size}: ${quantity}`)
				.join(', '),
			`$${(
				item.standardPrice *
				Object.values(item.sizes).reduce((acc, qty) => acc + qty, 0)
			).toFixed(2)}`,
		]);

		const content = {
			tables: [
				{
					headers: [
						'Brand & Style',
						'Color',
						'Standard Price',
						'Sizes',
						'Subtotal',
					],
					data: itemsTableData,
				},
			],
			additionalRows: [
				{ label: 'Decoration', value: decorationDetails },
				{ label: 'Artwork Fee', value: `$${artworkFee.toFixed(2)}` },
				{ label: 'Setup Fee', value: `$${setupFee.toFixed(2)}` },
				{ label: 'Delivery Date', value: deliveryDate },
				// Add other rows as needed
			],
		};

		createQuote(
			quote,
			decoration,
			artworkFee,
			setupFee,
			deliveryDate,
			invoiceSubtotal,
			company,
			customer
		);
	};

	if (loading) return <Layout>Loading...</Layout>;
	if (error) return <Layout>Error: {error}</Layout>;
	if (!quote) return <Layout>Quote not found</Layout>;

	return (
		<Layout>
			<div className={styles.container}>
				{customer ? (
					<div className={styles.header}>
						<h1 className={styles.title}>{quote.quoteType}</h1>
						<h4>{quote.customerName}</h4>
						<p>
							<strong>Contact: </strong> {customer.contactName}
							<br />
							<strong>Address: </strong>
							{customer.address} {customer.address2} {customer.city}{' '}
							{customer.state} {customer.zip}
							<br />
							<strong>Phone: </strong> {customer.phone}
							<br />
							<strong>Email: </strong> {customer.email}
						</p>
					</div>
				) : (
					<Spinner
						animation='border'
						role='status'
					>
						<span className='visually-hidden'>Loading...</span>
					</Spinner>
				)}
				<table style={{ width: '100%', marginBottom: '20px' }}>
					<thead>
						<tr>
							<th colSpan={2}>Description</th>
							<th>Cost</th>
							<th>Quantity</th>
							<th>Subtotal</th>
							<th>Discount (%)</th>
							<th>Total</th>
							<th>Override ($)</th>
						</tr>
					</thead>
					<tbody>
						{quote.items.map((item, index) => (
							<QuoteItemRow
								key={index}
								item={item}
								getItemCost={getItemCost}
								getTotalQuantity={getTotalQuantity}
							/>
						))}
					</tbody>
				</table>
				{/* Additional details table */}
				<table
					style={{ width: '100%', marginBottom: '20px', marginTop: '20px' }}
				>
					<tbody>
						{decoration && (
							<tr>
								<td>
									<strong>Decoration</strong>
								</td>
								<td>{decoration}</td>
								<td></td>
								<td></td>
							</tr>
						)}
						{colorMatches && (
							<tr>
								<td>
									<strong>Color Matches</strong>
								</td>
								<td>{colorMatches}</td>
								<td></td>
								<td></td>
							</tr>
						)}
						{vinylFee > 0 && (
							<tr>
								<td>
									<strong>Vinyl</strong>
								</td>
								<td></td>
								<td>${(vinylFee || 0).toFixed(2)}</td>
								<td>${(vinylFee || 0).toFixed(2)}</td>
							</tr>
						)}
						{artworkFee > 0 && (
							<tr>
								<td>
									<strong>Artwork</strong>
								</td>
								<td>Artwork fee for printed design</td>
								<td>${(artworkFee || 0).toFixed(2)}</td>
								<td>${(artworkFee || 0).toFixed(2)}</td>
							</tr>
						)}
						{setupFee > 0 && (
							<tr>
								<td>
									<strong>Setup</strong>
								</td>
								<td></td>
								<td>${(setupFee || 0).toFixed(2)}</td>
								<td>${(setupFee || 0).toFixed(2)}</td>
							</tr>
						)}
						{deliveryDate && (
							<tr>
								<td>
									<strong>Delivery By</strong>
								</td>
								<td>{deliveryDate}</td>
								<td></td>
								<td></td>
							</tr>
						)}
						{embroideryFee > 0 && (
							<tr>
								<td>
									<strong>Embroidery</strong>
								</td>
								<td></td>
								<td>${(embroideryFee || 0).toFixed(2)}</td>
								<td>${(embroideryFee || 0).toFixed(2)}</td>
							</tr>
						)}
					</tbody>
					<tfoot>
						<tr>
							<td colSpan={2}></td>
							<td colSpan={1}>
								<strong>Invoice Subtotal</strong>
							</td>
							<td colSpan={1}>${(invoiceSubtotal || 0).toFixed(2)}</td>
						</tr>
						<tr>
							<td colSpan={2}></td>
							<td colSpan={1}>
								<strong>Invoice Total</strong>
							</td>
							<td colSpan={1}>${(invoiceTotal || 0).toFixed(2)}</td>
						</tr>
						<tr>
							<td colSpan={2}></td>
							<td colSpan={1}>
								<strong>Deposit Due</strong>
							</td>
							<td colSpan={1}>${(depositDue || 0).toFixed(2)}</td>
						</tr>
						<tr>
							<td colSpan={2}></td>
							<td colSpan={1}>
								<strong>Balance</strong>
							</td>
							<td colSpan={1}>${(balance || 0).toFixed(2)}</td>
						</tr>
					</tfoot>
				</table>
				<Link href={`/quote?quoteId=${quote._id}`}>
					<Button type='button'>Modify Quote</Button>
				</Link>
				<Button onClick={printQuote}>Print Quote</Button>
			</div>
		</Layout>
	);
};

export default QuoteDetails;

// Helper functions for calculating costs
function calculateVinylCost(
	vinylDetails: VinylDetails,
	prices: PreCutVinyl
): number {
	const namePrice = parseFloat(prices.names[0] || '0'); // Default to 0 if undefined
	const numberPrice = parseFloat(prices.numbers[0] || '0'); // Default to 0 if undefined

	// Calculate costs for names and numbers on both front and back
	const namesCostFront = vinylDetails.namesFront * namePrice;
	const namesCostBack = vinylDetails.namesBack * namePrice;
	const numbersCostFront = vinylDetails.numbersFront * numberPrice;
	const numbersCostBack = vinylDetails.numbersBack * numberPrice;

	// Total cost for names and numbers
	return namesCostFront + namesCostBack + numbersCostFront + numbersCostBack;
}

function calculateEmbroideryCost(
	embroideryDetails: EmbroideryDetails,
	prices: Embroidery
): number {
	const costPerThousandStitches = parseFloat(prices.costPerThousandStitches);
	const hoopingFee = parseFloat(prices.hoopingFee);

	// Calculate costs based on stitch counts and hooping fees for each part of the apparel
	const stitchesFrontCost =
		(embroideryDetails.stitchesFront / 1000) * costPerThousandStitches;
	const stitchesBackCost =
		(embroideryDetails.stitchesBack / 1000) * costPerThousandStitches;
	const stitchesLeftSleeveCost =
		(embroideryDetails.stitchesLeftSleeve / 1000) * costPerThousandStitches;
	const stitchesRightSleeveCost =
		(embroideryDetails.stitchesRightSleeve / 1000) * costPerThousandStitches;

	const hoopingFeeFront = embroideryDetails.hoopingFeeFront ? hoopingFee : 0;
	const hoopingFeeBack = embroideryDetails.hoopingFeeBack ? hoopingFee : 0;
	const hoopingFeeLeftSleeve = embroideryDetails.hoopingFeeLeftSleeve
		? hoopingFee
		: 0;
	const hoopingFeeRightSleeve = embroideryDetails.hoopingFeeRightSleeve
		? hoopingFee
		: 0;

	// Total embroidery cost including stitch counts and hooping fees for all parts
	return (
		stitchesFrontCost +
		stitchesBackCost +
		stitchesLeftSleeveCost +
		stitchesRightSleeveCost +
		hoopingFeeFront +
		hoopingFeeBack +
		hoopingFeeLeftSleeve +
		hoopingFeeRightSleeve +
		embroideryDetails.digitizingCost +
		embroideryDetails.setupFee +
		embroideryDetails.artworkFee
	);
}

function calculateColorMatchCost(
	printingDetails: PrintingDetails,
	prices: ArtCost
): number {
	// Parse the price for a single color match from the prices object
	const colorMatchPrice = parseFloat(prices.colorMatch);

	// Calculate the total color match cost based on the number of color matches in printingDetails
	const totalColorMatchCost = printingDetails.colorMatches * colorMatchPrice;

	return totalColorMatchCost;
}

// Define the functions used in printQuote here, e.g.:
function getDecorationDetails(quote: Quote): string {
	// Your logic to calculate decoration details
	return 'Decoration Details';
}

function getArtworkFee(quote: Quote): number {
	// Your logic to calculate artwork fee
	return 0;
}

function getSetupFee(quote: Quote): number {
	// Your logic to calculate setup fee
	return 0;
}

function getDeliveryDate(quote: Quote): string {
	// Your logic to determine the delivery date
	return new Date().toLocaleDateString();
}
