import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/app/Layout';
import QuoteDetails from '@/components/app/QuoteDetails';
import { Company } from '@/types/Company';
import { Quote } from '@/types/Quote';
import { Price } from '@/types/Price';
import { Customer } from '@/types/Customer';
import { useSession } from 'next-auth/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QuoteCalculations } from '@/utils/quoteCalculations';

const QuoteDetailsPage = () => {
	const router = useRouter();
	const { quoteId } = router.query;
	const { data: session } = useSession();

	const [company, setCompany] = useState<Company | null>(null);
	const [quote, setQuote] = useState<Quote | null>(null);
	const [prices, setPrices] = useState<Price | null>(null);
	const [customer, setCustomer] = useState<Customer | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Additional fields for fees and totals
	const [printingFee, setPrintingFee] = useState(0);
	const [artworkFee, setArtworkFee] = useState(0);
	const [setupFee, setSetupFee] = useState(0);
	const [vinylFee, setVinylFee] = useState(0);
	const [embroideryFee, setEmbroideryFee] = useState(0);
	const [invoiceSubtotal, setInvoiceSubtotal] = useState(0);
	const [invoiceTotal, setInvoiceTotal] = useState(0);
	const [depositPercentage, setDepositPercentage] = useState(0);
	const [balance, setBalance] = useState(0);

	// Fetch company details
	useEffect(() => {
		const fetchCompanyDetails = async () => {
			if (session) {
				try {
					const companyId = session.user.companyId;
					const response = await fetch(`/api/company/${companyId}`);
					if (!response.ok) {
						toast.error('Failed to fetch company details.');
						throw new Error('Failed to fetch company details');
					}
					const data = await response.json();
					setCompany(data);
				} catch (error) {
					setError('Failed to load company details.');
					toast.error('Failed to load company details.');
					console.error(error);
				}
			}
		};
		fetchCompanyDetails();
	}, [session]);

	// Fetch quote details
	useEffect(() => {
		const fetchQuoteDetails = async () => {
			if (quoteId && typeof quoteId === 'string') {
				try {
					const response = await fetch(`/api/quote/${quoteId}`);
					if (!response.ok) {
						toast.error('Failed to fetch quote details.');
						throw new Error('Failed to fetch quote details');
					}
					const data = await response.json();
					setQuote(data);
				} catch (error) {
					setError('Failed to load quote details.');
					toast.error('Failed to load quote details.');
					console.error(error);
				}
			}
		};
		fetchQuoteDetails();
	}, [quoteId]);

	// Fetch prices
	useEffect(() => {
		const fetchPrices = async () => {
			if (quote && quote.companyId) {
				try {
					const response = await fetch(`/api/prices/${quote.companyId}`);
					const data = await response.json();

					if (data?.prices?.screenPrinting) {
						setPrices(data.prices);
					} else {
						setError('Screen printing prices not found in the API response');
						toast.error(error);
						console.error(
							'Screen printing prices not found in the API response'
						);
					}
				} catch (err: Error | any) {
					setError('Failed to load price details.');
					toast.error(error);
					console.error(error);
				}
			}
		};
		fetchPrices();
	}, [quote]);

	// Fetch customer details
	useEffect(() => {
		const fetchCustomerDetails = async () => {
			if (quote && quote.companyId) {
				try {
					const response = await fetch(`/api/customers/${quote.companyId}`);
					const data = await response.json();

					if (data.customers && data.customers.length > 0) {
						const matchingCustomer = data.customers.find(
							(customer: Customer) => customer._id === quote.selectedCustomerId
						);

						if (matchingCustomer) {
							setCustomer(matchingCustomer);
						} else {
							setError('Customer not found.');
							toast.error(error);
							setCustomer(null);
						}
					} else {
						setError('No customers found for this company.');
						toast.error(error);
						setCustomer(null);
					}
				} catch (err: Error | any) {
					setError('Failed to load customer details.');
					toast.error(error);
					console.error(error, err);
				}
			}
		};

		fetchCustomerDetails();
	}, [quote]);

	// Calculate fees and totals after fetching prices and other relevant data
	useEffect(() => {
		if (prices && quote && customer && company) {
			const apparelCost = QuoteCalculations.calculateApparelCost(quote, prices);
			const printingCost = QuoteCalculations.calculatePrintingCost(
				quote,
				prices
			);
			const shippingCost = quote.apparelAndShipping?.shippingAndHandling || 0;

			const taxCost = QuoteCalculations.calculateTaxCost(
				quote, // Pass the correct Quote object here
				company, // Pass the Company object
				apparelCost, // Pass apparelCost as number
				printingCost, // Pass printingCost as number
				shippingCost // Pass shippingCost as number
			);

			const totalCost = apparelCost + printingCost + shippingCost;

			// Set calculated values
			setInvoiceSubtotal(apparelCost + printingCost + shippingCost);
			setInvoiceTotal(totalCost);
			setDepositPercentage(quote.depositPercentage);

			setBalance(
				totalCost - (totalCost * (quote.depositPercentage || 0)) / 100
			);

			// Set printing and setup fees
			setPrintingFee(printingCost);
			setArtworkFee(
				quote.printingDetails.artworkNeeded
					? parseFloat(prices?.artCost?.flatFee || '0')
					: 0
			);
			setSetupFee(
				quote.screenPrintingDetails.newScreensNeeded
					? parseFloat(prices?.screenPrinting?.perScreenNew || '0')
					: 0
			);

			// Calculate vinyl fees using PreCutVinyl structure
			const vinylNameCost = quote.vinylDetails
				? parseFloat(prices?.preCutVinyl?.names[0] || '0') *
				  quote.vinylDetails.namesFront
				: 0;
			const vinylNumberCost = quote.vinylDetails
				? parseFloat(prices?.preCutVinyl?.numbers[0] || '0') *
				  quote.vinylDetails.numbersFront
				: 0;
			setVinylFee(vinylNameCost + vinylNumberCost);

			// Calculate embroidery fees using available properties in the Embroidery object
			const embroideryCost = quote.embroideryDetails
				? (parseFloat(prices?.embroidery?.costPerThousandStitches || '0') *
						quote.embroideryDetails.stitchesFront) /
				  1000
				: 0;
			setEmbroideryFee(embroideryCost);
		}
	}, [prices, quote, customer, company]);

	// Ensure all data is loaded before rendering
	useEffect(() => {
		if (company && quote && prices && customer) {
			setLoading(false);
		}
	}, [company, quote, prices, customer]);

	// Handling loading and error states
	if (loading || !quoteId || !quote || !prices || !company || !customer) {
		return <div>Loading...</div>;
	}
	if (error) return <div>{error}</div>;

	return (
		<Layout>
			<ToastContainer />
			<QuoteDetails
				quote={quote}
				prices={prices}
				company={company}
				customer={customer}
				artworkFee={artworkFee}
				setupFee={setupFee}
				depositPercentage={depositPercentage}
				printingFee={printingFee}
			/>
		</Layout>
	);
};

export default QuoteDetailsPage;
