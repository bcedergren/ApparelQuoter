'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
	Button,
	Container,
	Row,
	Col,
	Spinner,
	Alert,
	Modal,
} from 'react-bootstrap';
import Layout from '@/components/app/Layout';
import CustomerDropdown from '@/components/app/quote/CustomerDropdown';
import BrandStyleQuantity from '@/components/app/quote/BrandStyleQuantity';
import BrandStylePricing from '@/components/app/quote/BrandStylePricing';
import ApparelAndShipping from '@/components/app/quote/ApparelShipping';
import PrintingOptions from '@/components/app/quote/PrintingOptions';
import VinylDetails from '@/components/app/quote/VinylDetails';
import PrintingDetails from '@/components/app/quote/PrintingDetails';
import ScreenPrintingDetails from '@/components/app/quote/ScreenPrintingDetails';
import EmbroideryOptions from '@/components/app/quote/EmbroideryOptions';
import SummaryComponent from '@/components/app/quote/SummaryComponent';
import { Customer } from '@/types/Customer';
import { Price } from '@/types/Price';
import { Quote, QuoteItem } from '@/types/Quote';

type PrintingOptionKeys =
	| 'colorsFront'
	| 'colorsBack'
	| 'colorsLeft'
	| 'colorsRight';

interface ScreenPrintingDetails {
	newScreensNeeded: boolean;
	additionalScreens: number;
	colorChanges: number;
}

interface Prices {
	screenPrinting: {
		perScreenNew: string;
	};
	artCost: {
		inkColorChanges: string;
	};
}

const initialQuoteState: Quote = {
	_id: '',
	customerName: '',
	quoteId: '',
	quoteType: 'savedQuotes',
	depositPercentage: 0,
	items: [
		{
			brandAndStyle: '',
			color: '',
			standardPrice: 0,
			sizes: {
				XS: 0,
				S: 0,
				M: 0,
				L: 0,
				XL: 0,
				'2XL': 0,
				'3XL': 0,
				'4XL': 0,
				'5XL': 0,
			},
		},
	],
	apparelAndShipping: {
		customerProvidesApparel: false,
		creditCardCharge: false,
		shippingAndHandling: 0,
		shippingAndHandlingTaxed: false,
	},
	printingOptions: {
		colorsFront: 0,
		flashFront: false,
		dtgDarkFront: false,
		colorsBack: 0,
		flashBack: false,
		dtgDarkBack: false,
		colorsLeft: 0,
		flashLeft: false,
		dtgDarkLeft: false,
		colorsRight: 0,
		flashRight: false,
		dtgDarkRight: false,
	},

	vinylDetails: {
		namesFront: 0,
		namesBack: 0,
		numbersFront: 0,
		numbersBack: 0,
	},
	screenPrintingDetails: {
		newScreensNeeded: false,
		additionalScreens: 0,
		colorChanges: 0,
		inkType: '',
	},
	embroideryDetails: {
		stitchesFront: 0,
		stitchesBack: 0,
		stitchesLeftSleeve: 0,
		stitchesRightSleeve: 0,
		hoopingFeeFront: false,
		hoopingFeeBack: false,
		hoopingFeeLeftSleeve: false,
		hoopingFeeRightSleeve: false,
		digitizingCost: 0,
		artworkFee: 0,
		setupFee: 0,
	},
	printingDetails: {
		colorMatches: 0,
		artworkNeeded: false,
		deliveryDueDays: 0,
		deliveryDueDate: new Date(),
	},
	summary: {
		qty: 0,
		avgCost: 0,
		apparelCost: 0,
		printingCost: 0,
		shippingCost: 0,
		taxCost: 0,
		totalCost: 0,
	},
};

const ModifyQuote: NextPage = () => {
	const router = useRouter();
	const { quoteId } = router.query; // Get the quoteId from the URL
	const { data: session, status } = useSession();
	const [quote, setQuote] = useState<Quote>(initialQuoteState); // Initial state
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [prices, setPrices] = useState<Price | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedCustomerId, setSelectedCustomerId] = useState('');
	const [showSuccessModal, setShowSuccessModal] = useState(false);

	const printingLocations = ['Front', 'Back', 'Left', 'Right']; // Define the printing locations

	useEffect(() => {
		const fetchQuoteData = async () => {
			if (quoteId) {
				const response = await fetch(`/api/quotes/${quoteId}`);
				if (!response.ok) {
					console.error('Failed to fetch quote data');
					return;
				}
				const quoteData = await response.json();
				setQuote((prevState) => ({
					...prevState,
					...quoteData,
				}));
			}
		};

		fetchQuoteData();
	}, [quoteId]);

	useEffect(() => {
		if (status === 'authenticated' && session) {
			setIsLoading(true);

			const fetchCustomers = async () => {
				const response = await fetch(
					`/api/customers/${session.user.companyId}`
				);
				const data = await response.json();

				if (data && data.customers) {
					setCustomers(data.customers);
				}
			};

			const fetchPrices = async () => {
				const response = await fetch(`/api/prices/${session.user.companyId}`);
				const data = await response.json();
				if (data.success) {
					setPrices(data.prices);
				} else {
					console.error('Failed to fetch prices:', data);
				}
			};

			fetchCustomers();
			fetchPrices();

			setIsLoading(false);
		}
	}, [session, status]);

	const handleCustomerSelect = (customerId: string) => {
		setSelectedCustomerId(customerId);

		const selectedCustomer = customers.find(
			(customer) => customer._id === customerId
		);

		if (selectedCustomer) {
			setQuote((prevQuote) => ({
				...prevQuote,
				customerName: selectedCustomer.companyName,
			}));
		}
	};

	const handleBrandStyleQuantityChange = (updatedItems: QuoteItem[]) => {
		setQuote((prevQuote) => ({ ...prevQuote, items: updatedItems }));
	};

	const handleBrandStylePricingChange = (updatedItems: QuoteItem[]) => {
		setQuote((prevQuote) => ({ ...prevQuote, items: updatedItems }));
	};

	const handleApparelAndShippingChange = (
		name: string,
		value: string | number | boolean
	) => {
		setQuote((prevQuote) => ({
			...prevQuote,
			apparelAndShipping: {
				...prevQuote.apparelAndShipping,
				[name]: value,
			},
		}));
	};

	const handlePrintingOptionsChange = (
		updatedPrintingOptions: typeof initialQuoteState.printingOptions
	) => {
		setQuote((prevQuote) => ({
			...prevQuote,
			printingOptions: updatedPrintingOptions,
		}));
	};

	const handleVinylDetailsChange = (
		updatedVinylDetails: typeof initialQuoteState.vinylDetails
	) => {
		setQuote((prevQuote) => ({
			...prevQuote,
			vinylDetails: updatedVinylDetails,
		}));
	};

	const handlePrintingDetailsChange = (
		updatedPrintingDetails: typeof initialQuoteState.printingDetails
	) => {
		console.log(updatedPrintingDetails);
		setQuote((prevQuote) => ({
			...prevQuote,
			printingDetails: updatedPrintingDetails,
		}));
	};

	const handleScreenPrintingDetailsChange = (
		updatedScreenPrintingDetails: typeof initialQuoteState.screenPrintingDetails
	) => {
		setQuote((prevQuote) => ({
			...prevQuote,
			screenPrintingDetails: updatedScreenPrintingDetails,
		}));
	};

	const handleEmbroideryOptionsChange = (
		updatedEmbroideryDetails: typeof initialQuoteState.embroideryDetails
	) => {
		setQuote((prevQuote) => ({
			...prevQuote,
			embroideryDetails: updatedEmbroideryDetails,
		}));
	};

	const calculatePrintingCost = useCallback(
		(quote: Quote, prices: Price): number => {
			let totalPrintingCost = 0;

			if (!prices || !prices.screenPrinting) {
				console.error('Prices or screen printing prices are undefined');
				return totalPrintingCost;
			}

			(
				[
					'colorsFront',
					'colorsBack',
					'colorsLeft',
					'colorsRight',
				] as PrintingOptionKeys[]
			).forEach((option) => {
				const colorCount = quote.printingOptions[option];
				if (colorCount > 0) {
					const colorKey = `${colorCount} ${
						colorCount === 1 ? 'color' : 'colors'
					}` as keyof typeof prices.screenPrinting;
					const priceRanges = prices.screenPrinting[colorKey];

					if (!priceRanges) {
						console.error(
							`No pricing found for '${colorKey}'. Check your pricing structure.`
						);
						return;
					}

					const costPerColorPerPiece = parseFloat(priceRanges[0]);
					totalPrintingCost += costPerColorPerPiece * colorCount;
				}
			});

			const totalQty = quote.items.reduce(
				(acc, item) =>
					acc + Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0),
				0
			);
			totalPrintingCost *= totalQty;

			return totalPrintingCost;
		},
		[]
	);

	const calculateScreenAndColorChangeCost = useCallback(
		(screenPrintingDetails: ScreenPrintingDetails, prices: Price) => {
			let totalCost = 0;

			const newScreenCost = parseFloat(prices.screenPrinting.perScreenNew);
			const colorChangeCost = parseFloat(prices.artCost.inkColorChanges);

			if (screenPrintingDetails.newScreensNeeded) {
				totalCost += screenPrintingDetails.additionalScreens * newScreenCost;
			}

			totalCost += screenPrintingDetails.colorChanges * colorChangeCost;

			return totalCost;
		},
		[]
	);

	const calculateQuote = useCallback(() => {
		if (!prices) return;

		let totalApparelCost = quote.items.reduce((acc, item) => {
			const itemCost =
				Object.values(item.sizes).reduce((sum, sizeQty) => sum + sizeQty, 0) *
				item.standardPrice;
			return acc + itemCost;
		}, 0);

		let markupRate = 0;
		let additionalCharge = 0;
		const markup = (prices as Price).wholesaleMarkup;

		if (totalApparelCost < parseFloat(markup.lessThan)) {
			markupRate = parseFloat(markup.markupLessThan) / 100;
			additionalCharge = parseFloat(markup.andOrLessThan);
		} else if (
			totalApparelCost >= parseFloat(markup.betweenStart) &&
			totalApparelCost <= parseFloat(markup.betweenEnd)
		) {
			markupRate = parseFloat(markup.markupBetween) / 100;
			additionalCharge = parseFloat(markup.andOrBetween);
		} else if (totalApparelCost > parseFloat(markup.over)) {
			markupRate = parseFloat(markup.markupOver) / 100;
			additionalCharge = parseFloat(markup.andOrOver);
		}

		totalApparelCost = totalApparelCost * markupRate + additionalCharge;

		let printingCost = calculatePrintingCost(quote, prices);
		const shippingCost = quote.apparelAndShipping.shippingAndHandling;

		const totalQty = quote.items.reduce(
			(acc, item) =>
				acc +
				Object.values(item.sizes).reduce((sum, sizeQty) => sum + sizeQty, 0),
			0
		);

		if (totalQty === 0 && !quote.apparelAndShipping.customerProvidesApparel) {
			totalApparelCost = 0;
		} else if (quote.apparelAndShipping.customerProvidesApparel) {
			totalApparelCost = 0;
			printingCost = printingCost * (150 / 100);
		}

		let screenAndColorChangeCost = calculateScreenAndColorChangeCost(
			quote.screenPrintingDetails,
			prices
		);

		printingCost = printingCost + screenAndColorChangeCost;
		let totalCost = totalApparelCost + printingCost + shippingCost;
		const avgCost = totalQty > 0 ? totalCost / totalQty : 0;

		setQuote((prevQuote) => {
			const isSummaryUnchanged =
				prevQuote.summary.qty === totalQty &&
				prevQuote.summary.avgCost === avgCost &&
				prevQuote.summary.apparelCost === totalApparelCost &&
				prevQuote.summary.printingCost === printingCost &&
				prevQuote.summary.shippingCost === shippingCost &&
				prevQuote.summary.taxCost === 0 &&
				prevQuote.summary.totalCost === totalCost;

			if (!isSummaryUnchanged) {
				return {
					...prevQuote,
					summary: {
						qty: totalQty,
						avgCost,
						apparelCost: totalApparelCost,
						printingCost,
						shippingCost,
						taxCost: 0,
						totalCost,
					},
				};
			}

			return prevQuote;
		});
	}, [prices, calculatePrintingCost, quote, calculateScreenAndColorChangeCost]);

	useEffect(() => {
		calculateQuote();
	}, [calculateQuote]);

	const handleSubmit = async () => {
		try {
			setIsLoading(true);
			if (session?.user?.companyId) {
				quote.companyId = session.user.companyId.toString();
				quote.selectedCustomerId = selectedCustomerId;

				const quoteWithMetadata = {
					...quote,
					CreatedAt: new Date().toISOString(),
					ModifiedAt: new Date().toISOString(),
				};

				const response = await fetch('/api/quotes/saveQuote', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(quoteWithMetadata),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || 'Something went wrong!');
				}

				setShowSuccessModal(true);

				setQuote(initialQuoteState);
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Failed to save the quote.';
			console.error('Error saving the quote:', error);
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Modal
				show={showSuccessModal}
				onHide={() => setShowSuccessModal(false)}
			>
				<Modal.Header closeButton>
					<Modal.Title>Success!</Modal.Title>
				</Modal.Header>
				<Modal.Body>Quote has been saved successfully.</Modal.Body>
				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={() => setShowSuccessModal(false)}
					>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

			<Layout>
				<Container fluid>
					<Row>
						<Col>
							<h1>Modify Quote</h1>
							{isLoading && <Spinner animation='border' />}
							{error && <Alert variant='danger'>{error}</Alert>}
							<CustomerDropdown
								selectedCustomerId={quote.selectedCustomerId || ''}
								customers={customers}
								onCustomerSelect={handleCustomerSelect}
							/>
							<BrandStyleQuantity
								items={quote.items}
								onItemsChange={handleBrandStyleQuantityChange}
							/>
							<BrandStylePricing
								items={quote.items}
								onItemsChange={(updatedItems) => {
									setQuote((prevQuote) => ({
										...prevQuote,
										items: updatedItems,
									}));
								}}
							/>
							<ApparelAndShipping
								data={quote.apparelAndShipping}
								onChange={handleApparelAndShippingChange}
							/>
							<PrintingOptions
								options={quote.printingOptions}
								printingLocations={printingLocations}
								onOptionsChange={handlePrintingOptionsChange}
							/>
							<VinylDetails
								details={quote.vinylDetails}
								onDetailsChange={handleVinylDetailsChange}
							/>
							<PrintingDetails
								details={quote.printingDetails}
								onDetailsChange={handlePrintingDetailsChange}
							/>
							<ScreenPrintingDetails
								details={quote.screenPrintingDetails}
								onDetailsChange={handleScreenPrintingDetailsChange}
							/>
							<EmbroideryOptions
								embroideryDetails={quote.embroideryDetails}
								onEmbroideryDetailsChange={handleEmbroideryOptionsChange}
							/>
							<SummaryComponent
								qty={quote.summary.qty}
								avgCost={quote.summary.avgCost}
								apparelCost={quote.summary.apparelCost}
								printingCost={quote.summary.printingCost}
								shippingCost={quote.summary.shippingCost}
								taxCost={quote.summary.taxCost}
								totalCost={quote.summary.totalCost}
							/>
							<Button
								variant='primary'
								type='button'
								onClick={handleSubmit}
								disabled={!session || status !== 'authenticated'}
							>
								Save Quote
							</Button>
						</Col>
					</Row>
				</Container>
			</Layout>
		</>
	);
};

export default ModifyQuote;
