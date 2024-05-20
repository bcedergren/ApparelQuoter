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
import VinylDetails from '@/components/app/quote/VinylDetails ';
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
	| 'colorsLeftSleeve'
	| 'colorsRightSleeve';

interface ScreenPrintingDetails {
	newScreensNeeded: boolean;
	additionalScreens: number;
	colorChanges: number;
}

const initialQuoteState: Quote = {
	_id: '',
	customerName: '',
	quoteType: 'savedQuote',
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
		colorsLeftSleeve: 0,
		flashLeftSleeve: false,
		dtgDarkLeftSleeve: false,
		colorsRightSleeve: 0,
		flashRightSleeve: false,
		dtgDarkRightSleeve: false,
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
		inkType: '',
		artworkNeeded: false,
		deliveryDueDays: 0,
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

// Define default values for the quote summary to prevent undefined errors
const defaultSummary = {
	qty: 0,
	avgCost: 0,
	apparelCost: 0,
	printingCost: 0,
	shippingCost: 0,
	taxCost: 0,
	totalCost: 0,
};

const QuotePage: NextPage = () => {
	const router = useRouter();
	const { quoteId } = router.query;
	const { data: session, status } = useSession();
	const [quote, setQuote] = useState<Quote | null>(null);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [prices, setPrices] = useState<Price | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedCustomerId, setSelectedCustomerId] = useState('');
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [isQuoteModified, setIsQuoteModified] = useState(false);

	const [items, setItems] = useState<QuoteItem[]>();

	useEffect(() => {
		// Combined customer and prices fetching
		const fetchData = async () => {
			if (session) {
				try {
					const [customersRes, pricesRes] = await Promise.all([
						fetch(`/api/customers/${session.user.companyId}`),
						fetch(`/api/prices/${session.user.companyId}`),
					]);

					if (!customersRes.ok || !pricesRes.ok) {
						throw new Error('Failed to fetch data');
					}

					const customersData = await customersRes.json();
					const pricesData = await pricesRes.json();

					setCustomers(customersData.customers);
					setPrices(pricesData.prices);

					if (quoteId && typeof quoteId === 'string') {
						try {
							const quoteRes = await fetch(`/api/quote/${quoteId}`);
							if (!quoteRes.ok) {
								throw new Error('Failed to fetch quote');
							}
							const quoteData = await quoteRes.json();

							setSelectedCustomerId(quoteData.selectedCustomerId);
							setQuote(quoteData);
							setIsQuoteModified(true); // Indicate that this quote is being modified
						} catch (err) {
							console.error(err);
							setError('Failed to load quote');
						}
					} else {
						setQuote(initialQuoteState);
					}
				} catch (error) {
					console.error(error);
					setError('Failed to load data');
				} finally {
					setIsLoading(false);
				}
			}
		};

		fetchData();
	}, [quoteId, session]);

	const handleCustomerSelect = (customerId: string) => {
		setSelectedCustomerId(customerId);

		const selectedCustomer = customers.find(
			(customer) => customer._id === customerId
		);

		// Update the quote state with the selected customer's name
		setQuote((prevQuote) => {
			// If prevQuote is null, return null immediately
			if (!prevQuote) return null;

			// Now we know prevQuote is a Quote object, so we can safely spread it
			return {
				...prevQuote,
				customerName: selectedCustomer
					? selectedCustomer.companyName
					: prevQuote.customerName,
			};
		});
	};

	const handleBrandStyleQuantityChange = (updatedItems: QuoteItem[]) => {
		setQuote((prevQuote) => {
			// If prevQuote is null, initialize it with default values
			if (!prevQuote) {
				return {
					...initialQuoteState, // Use your initial state as a baseline
					items: updatedItems, // Set the updated items
				};
			}

			// If prevQuote is not null, update it as needed
			return {
				...prevQuote,
				items: updatedItems,
			};
		});
	};

	const handleBrandStylePricingChange = (updatedItems: QuoteItem[]) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			// Update the items with the new pricing information
			const updatedQuote: Quote = {
				...prevQuote,
				items: updatedItems.map((updatedItem, index) => {
					const existingItem = prevQuote.items[index];

					// Update the standardPrice for each item, preserve sizePrices unless explicitly updated
					return {
						...existingItem,
						standardPrice: updatedItem.standardPrice,
						// Only update sizePrices if they are explicitly provided in updatedItem
						sizePrices: updatedItem.sizePrices
							? { ...existingItem.sizePrices, ...updatedItem.sizePrices }
							: existingItem.sizePrices,
					};
				}),
			};

			return updatedQuote;
		});
	};

	const handleApparelAndShippingChange = (
		name: string,
		value: string | number | boolean
	) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null; // If there's no previous quote, return null

			// Update the apparelAndShipping part of the quote
			const updatedApparelAndShipping = {
				...prevQuote.apparelAndShipping, // Preserve other properties of apparelAndShipping
				[name]: value, // Update the specific property with the new value
			};

			// Return the updated quote, preserving all other properties of the quote
			return {
				...prevQuote,
				apparelAndShipping: updatedApparelAndShipping,
			};
		});
	};

	const handlePrintingOptionsChange = (
		updatedPrintingOptions: typeof initialQuoteState.printingOptions
	) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null; // If there's no previous quote, return null

			// Return the updated quote with the new printingOptions
			// while preserving all other properties of the quote
			return {
				...prevQuote,
				printingOptions: updatedPrintingOptions,
			};
		});
	};

	const handleVinylDetailsChange = (
		updatedVinylDetails: typeof initialQuoteState.vinylDetails
	) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null; // Handle the case where there is no previous quote

			// Return the updated quote with the new vinylDetails
			// and ensure all required properties are correctly defined
			return {
				...prevQuote,
				vinylDetails: updatedVinylDetails,
				customerName: prevQuote.customerName || '', // Provide a default value or preserve the existing one
			};
		});
	};

	const handlePrintingDetailsChange = (
		updatedPrintingDetails: typeof initialQuoteState.printingDetails
	) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null; // Handle the case where prevQuote is null

			return {
				...prevQuote,
				printingDetails: updatedPrintingDetails,
				customerName: prevQuote.customerName || '',
			};
		});
	};

	const handleScreenPrintingDetailsChange = (
		updatedScreenPrintingDetails: ScreenPrintingDetails
	) => {
		setQuote((prevQuote) => {
			// Early return null if prevQuote is null to avoid further processing
			if (prevQuote === null) return null;

			// Ensure prevQuote has all required properties of Quote, providing default values as necessary
			const updatedQuote: Quote = {
				...prevQuote,
				screenPrintingDetails: updatedScreenPrintingDetails,
			};

			return updatedQuote;
		});
	};

	const handleEmbroideryOptionsChange = (
		updatedEmbroideryDetails: typeof initialQuoteState.embroideryDetails
	) => {
		setQuote((prevQuote) => {
			if (prevQuote === null) {
				// If there's no previous quote, just return null
				return null;
			}

			// Construct a new quote object, ensuring all required fields are properly populated
			const updatedQuote: Quote = {
				...prevQuote,
				embroideryDetails: updatedEmbroideryDetails,
			};

			return updatedQuote;
		});
	};

	const calculatePrintingCost = useCallback(
		(quote: Quote, prices: Price): number => {
			let totalPrintingCost = 0;

			// Ensure quote and its properties are defined before proceeding
			if (!quote || !quote.printingOptions) {
				return 0;
			}

			if (!prices || !prices.screenPrinting) {
				console.error('Prices or screen printing prices are undefined');
				return totalPrintingCost;
			}

			// Loop through each printing option (Front, Back, Left Sleeve, Right Sleeve)
			(
				[
					'colorsFront',
					'colorsBack',
					'colorsLeftSleeve',
					'colorsRightSleeve',
				] as PrintingOptionKeys[]
			).forEach((option) => {
				const colorCount = quote.printingOptions?.[option] ?? 0;
				if (colorCount > 0) {
					const colorKey = `${colorCount} ${
						colorCount === 1 ? 'color' : 'colors'
					}` as keyof typeof prices.screenPrinting;
					const priceRanges = prices.screenPrinting[colorKey];

					// If priceRanges is undefined, log an error and skip this option
					if (!priceRanges) {
						console.error(
							`No pricing found for '${colorKey}'. Check your pricing structure.`
						);
						return;
					}

					// Assume first value in priceRanges array is the cost per piece for simplicity
					const costPerColorPerPiece = parseFloat(priceRanges[0]);
					totalPrintingCost += costPerColorPerPiece * colorCount;
				}
			});

			// Multiply by total quantity of items
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

			// Convert string values to numbers for calculation
			const newScreenCost = parseFloat(prices.screenPrinting.perScreenNew); // Cost for each new screen
			const colorChangeCost = parseFloat(prices.artCost.inkColorChanges); // Cost for each ink color change

			if (screenPrintingDetails?.newScreensNeeded) {
				totalCost +=
					(screenPrintingDetails?.additionalScreens ?? 0) * newScreenCost;
			}

			totalCost += (screenPrintingDetails?.colorChanges ?? 0) * colorChangeCost;

			return totalCost;
		},
		[]
	);

	const calculateQuote = useCallback(() => {
		if (!prices || !quote) return; // Ensure prices and quote are defined

		let totalApparelCost = (quote.items ?? []).reduce((acc, item) => {
			const itemCost =
				Object.values(item.sizes ?? {}).reduce(
					(sum, sizeQty) => sum + sizeQty,
					0
				) * item.standardPrice;
			return acc + itemCost;
		}, 0);

		let markupRate = 0;
		let additionalCharge = 0;

		// Apply markup based on the total apparel cost
		if (totalApparelCost < parseFloat(prices.wholesaleMarkup.lessThan)) {
			markupRate = parseFloat(prices.wholesaleMarkup.markupLessThan) / 100;
			additionalCharge = parseFloat(prices.wholesaleMarkup.andOrLessThan);
		} else if (
			totalApparelCost >= parseFloat(prices.wholesaleMarkup.betweenStart) &&
			totalApparelCost <= parseFloat(prices.wholesaleMarkup.betweenEnd)
		) {
			markupRate = parseFloat(prices.wholesaleMarkup.markupBetween) / 100;
			additionalCharge = parseFloat(prices.wholesaleMarkup.andOrBetween);
		} else if (totalApparelCost > parseFloat(prices.wholesaleMarkup.over)) {
			markupRate = parseFloat(prices.wholesaleMarkup.markupOver) / 100;
			additionalCharge = parseFloat(prices.wholesaleMarkup.andOrOver);
		}

		totalApparelCost *= markupRate + additionalCharge;

		let printingCost = calculatePrintingCost(quote, prices);
		const shippingCost = quote.apparelAndShipping?.shippingAndHandling ?? 0;

		const totalQty = (quote.items ?? []).reduce((acc, item) => {
			return (
				acc +
				Object.values(item.sizes ?? {}).reduce(
					(sum, sizeQty) => sum + sizeQty,
					0
				)
			);
		}, 0);

		if (totalQty === 0 && !quote.apparelAndShipping?.customerProvidesApparel) {
			totalApparelCost = 0;
		} else if (quote.apparelAndShipping?.customerProvidesApparel) {
			totalApparelCost = 0;
			printingCost *= 1.5; // Increase printing cost if customer provides apparel
		}

		let screenAndColorChangeCost = calculateScreenAndColorChangeCost(
			quote.screenPrintingDetails,
			prices
		);
		printingCost += screenAndColorChangeCost;

		let totalCost = totalApparelCost + printingCost + shippingCost;
		const avgCost = totalQty > 0 ? totalCost / totalQty : 0;

		// Check if there's a need to update the summary to avoid unnecessary re-renders
		const summaryNeedsUpdate =
			totalQty !== quote.summary?.qty ||
			avgCost !== quote.summary?.avgCost ||
			totalApparelCost !== quote.summary?.apparelCost ||
			printingCost !== quote.summary?.printingCost ||
			shippingCost !== quote.summary?.shippingCost ||
			totalCost !== quote.summary?.totalCost;

		if (summaryNeedsUpdate) {
			setQuote((prevQuote) =>
				prevQuote
					? {
							...prevQuote,
							summary: {
								qty: totalQty,
								avgCost,
								apparelCost: totalApparelCost,
								printingCost,
								shippingCost,
								taxCost: 0, // Adjust as necessary for tax calculation
								totalCost,
							},
					  }
					: null
			);
		}
	}, [prices, calculatePrintingCost, quote, calculateScreenAndColorChangeCost]);

	// useEffect to watch for changes in the items, printing options, and apparel/shipping details
	useEffect(() => {
		calculateQuote();
	}, [calculateQuote]);

	const handleSubmit = async () => {
		try {
			setIsLoading(true); // Use the existing isLoading state to indicate loading
			if (session?.user?.companyId && quote) {
				quote.companyId = session.user.companyId.toString();
				quote.selectedCustomerId = selectedCustomerId;

				if (quote._id) {
					quote.ModifiedAt = new Date();
				} else {
					quote.CreatedAt = new Date();
					quote.ModifiedAt = new Date();
				}

				// Clone the quote object to avoid directly mutating the state
				const quoteWithMetadata = {
					...quote,
				};

				console.log(quoteWithMetadata);

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

				// Handle success by showing the success modal
				setShowSuccessModal(true);
				if (!isQuoteModified) {
					// Only reset the quote if it's not being modified
					setQuote(initialQuoteState);
				}
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

	if (isLoading)
		return (
			<Layout>
				<Spinner animation='border' />
			</Layout>
		);
	if (error)
		return (
			<Layout>
				<Alert variant='danger'>{error}</Alert>
			</Layout>
		);

	return (
		<>
			<Modal
				show={showSuccessModal}
				onHide={() => setShowSuccessModal(false)}
				size='lg'
				aria-labelledby='contained-modal-title-vcenter'
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title id='contained-modal-title-vcenter'>
						Quote Saved Successfully
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						Your quote has been saved successfully. You can now view or edit
						this quote from the quotes list.
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => setShowSuccessModal(false)}>Close</Button>
				</Modal.Footer>
			</Modal>

			<Layout>
				<Container fluid>
					<Row>
						<Col>
							<h1>{quoteId ? 'Modify Quote' : 'Create Quote'}</h1>
							<CustomerDropdown
								customers={customers}
								selectedCustomerId={selectedCustomerId}
								onCustomerSelect={handleCustomerSelect}
							/>
							{/* Conditional rendering based on quote state */}
							{quote && (
								<>
									<BrandStyleQuantity
										items={quote.items}
										onItemsChange={handleBrandStyleQuantityChange}
									/>
									<BrandStylePricing
										items={quote.items}
										onItemsChange={handleBrandStylePricingChange}
									/>
									<ApparelAndShipping
										data={quote.apparelAndShipping}
										onChange={handleApparelAndShippingChange}
									/>
									<PrintingOptions
										options={quote.printingOptions}
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
										qty={quote?.summary?.qty ?? 0}
										avgCost={quote?.summary?.avgCost ?? 0}
										apparelCost={quote?.summary?.apparelCost ?? 0}
										printingCost={quote?.summary?.printingCost ?? 0}
										shippingCost={quote?.summary?.shippingCost ?? 0}
										taxCost={quote?.summary?.taxCost ?? 0}
										totalCost={quote?.summary?.totalCost ?? 0}
									/>
								</>
							)}
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

export default QuotePage;
