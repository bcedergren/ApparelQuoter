import React, { useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Layout from '@/components/app/Layout';
import CustomerDropdown from '@/components/app/quote/CustomerDropdown';
import DeliveryDueDate from '@/components/app/quote/DeliveryDueDate';
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
import { Company } from '@/types/Company';

type PrintingOptionKeys =
	| 'colorsFront'
	| 'colorsBack'
	| 'colorsLeftSleeve'
	| 'colorsRightSleeve';

interface ScreenPrintingDetails {
	newScreensNeeded: boolean;
	additionalScreens: number;
	colorChanges: number;
	inkType: string;
}

const initialQuoteState: Quote = {
	_id: '',
	customerName: '',
	quoteType: 'savedQuotes',
	depositPercentage: 0,
	items: [
		{
			quoteType: 'savedQuotes',
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
		inkType: 'None',
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
	const [company, setCompany] = useState<Company | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedCustomerId, setSelectedCustomerId] = useState('');
	const [isQuoteModified, setIsQuoteModified] = useState(false);
	const [deliveryDays, setDeliveryDays] = useState(0);

	useEffect(() => {
		const fetchData = async () => {
			if (session) {
				try {
					const [customersRes, pricesRes, companyRes] = await Promise.all([
						fetch(`/api/customers/${session.user.companyId}`),
						fetch(`/api/prices/${session.user.companyId}`),
						fetch(`/api/company/${session.user.companyId}`),
					]);

					if (!customersRes) {
						toast.error('Failed to fetch customer data');
						throw new Error('Failed to fetch customer data');
					}

					if (!pricesRes) {
						toast.error('Failed to fetch prices');
						throw new Error('Failed to fetch prices');
					}

					if (!companyRes) {
						toast.error('Failed to fetch company data');
						throw new Error('Failed to fetch company data');
					}

					if (!customersRes.ok || !pricesRes.ok || !companyRes.ok) {
						toast.error('Failed to fetch data');
						throw new Error('Failed to fetch data');
					}

					const customersData = await customersRes.json();
					const pricesData = await pricesRes.json();
					const companyData = await companyRes.json();

					setCustomers(customersData.customers);
					setPrices(pricesData.prices);
					setCompany(companyData.company);

					if (quoteId && typeof quoteId === 'string') {
						try {
							const quoteRes = await fetch(`/api/quote/${quoteId}`);
							if (!quoteRes.ok) {
								toast.error('Failed to fetch quote');
								throw new Error('Failed to fetch quote');
							}
							const quoteData = await quoteRes.json();

							setSelectedCustomerId(quoteData.selectedCustomerId);
							setQuote(quoteData);
							setIsQuoteModified(true);
						} catch (err) {
							console.error(err);
							toast.error(`Failed to load quote: ${err}`);
						}
					} else {
						setQuote(initialQuoteState);
					}
				} catch (error) {
					toast.error(`Failed to load data: ${error}`);
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

		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			return {
				...prevQuote,
				customerName: selectedCustomer
					? selectedCustomer.companyName
					: prevQuote.customerName,
			};
		});
	};

	const handleDateChange = (date: Date) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			const currentDate = new Date();
			const timeDiff = date.getTime() - currentDate.getTime();
			const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Calculate days difference

			setDeliveryDays(daysDiff); // Set the calculated days to state

			return {
				...prevQuote,
				printingDetails: {
					...prevQuote.printingDetails,
					deliveryDueDate: date,
					deliveryDueDays: daysDiff,
				},
			};
		});
	};

	const handleBrandStyleQuantityChange = (updatedItems: QuoteItem[]) => {
		setQuote((prevQuote) => {
			if (!prevQuote) {
				return {
					...initialQuoteState,
					items: updatedItems,
				};
			}

			return {
				...prevQuote,
				items: updatedItems,
			};
		});
	};

	const handleBrandStylePricingChange = (updatedItems: QuoteItem[]) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			const updatedQuote: Quote = {
				...prevQuote,
				items: updatedItems.map((updatedItem, index) => {
					const existingItem = prevQuote.items[index];
					return {
						...existingItem,
						standardPrice: updatedItem.standardPrice,
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
			if (!prevQuote) return null;

			const updatedApparelAndShipping = {
				...prevQuote.apparelAndShipping,
				[name]: value,
			};

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
			if (!prevQuote) return null;

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
			if (!prevQuote) return null;

			return {
				...prevQuote,
				vinylDetails: updatedVinylDetails,
				customerName: prevQuote.customerName || '',
			};
		});
	};

	// const handleInkTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	const { value } = e.target;
	// 	setQuote((prevQuote) => {
	// 		if (!prevQuote) return null;
	// 		return {
	// 			...prevQuote,
	// 			printingDetails: {
	// 				...prevQuote.printingDetails,
	// 				inkType: value,
	// 			},
	// 		};
	// 	});
	// };

	const handleScreenPrintingDetailsChange = (
		updatedScreenPrintingDetails: ScreenPrintingDetails
	) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			const updatedQuote: Quote = {
				...prevQuote,
				screenPrintingDetails: {
					...prevQuote.screenPrintingDetails,
					...updatedScreenPrintingDetails,
				},
			};

			return updatedQuote;
		});
	};

	const handleEmbroideryOptionsChange = (
		updatedEmbroideryDetails: typeof initialQuoteState.embroideryDetails
	) => {
		setQuote((prevQuote) => {
			if (prevQuote === null) {
				return null;
			}

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

			if (!quote || !quote.printingOptions) {
				return 0;
			}

			if (!prices || !prices.screenPrinting) {
				toast.error('Prices or screen printing prices are undefined');
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
				const colorCount = quote.printingOptions?.[option] ?? 0;
				if (colorCount > 0) {
					const colorKey = `${colorCount} ${
						colorCount === 1 ? 'color' : 'colors'
					}` as keyof typeof prices.screenPrinting;
					const priceRanges = prices.screenPrinting[colorKey];

					if (!priceRanges) {
						toast.error(
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
		if (!prices || !quote) return;

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
			printingCost *= 1.5;
		}

		let screenAndColorChangeCost = calculateScreenAndColorChangeCost(
			quote.screenPrintingDetails,
			prices
		);
		printingCost += screenAndColorChangeCost;

		let totalCost = totalApparelCost + printingCost + shippingCost;
		const avgCost = totalQty > 0 ? totalCost / totalQty : 0;

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
								taxCost: 0,
								totalCost,
							},
					  }
					: null
			);
		}
	}, [prices, calculatePrintingCost, quote, calculateScreenAndColorChangeCost]);

	useEffect(() => {
		calculateQuote();
	}, [calculateQuote]);

	const handleSubmit = async () => {
		try {
			setIsLoading(true);

			if (!quote) {
				throw new Error('Quote data is missing.');
			}

			for (let i = 0; i < quote.items.length; i++) {
				if (!quote.items[i].quoteType) {
					throw new Error(`quoteType is required for item at index ${i}`);
				}
			}

			if (!quote.screenPrintingDetails.inkType) {
				throw new Error('inkType is required in screenPrintingDetails');
			}

			if (session?.user?.companyId) {
				quote.companyId = session.user.companyId.toString();
				quote.selectedCustomerId = selectedCustomerId;

				if (quote._id) {
					quote.ModifiedAt = new Date();
				} else {
					quote.CreatedAt = new Date();
					quote.ModifiedAt = new Date();
				}

				// Include the user information
				const userId = session.user.id;

				const response = await fetch('/api/quotes/saveQuote', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ ...quote, userId }),
				});

				if (!response.ok) {
					throw new Error('Failed to save the quote.');
				}

				toast.success('Quote Saved Successfully');
				if (!isQuoteModified) {
					setQuote(initialQuoteState);
				}
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Failed to save the quote.';
			toast.error(`Error saving the quote: ${message}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Layout>
				<Container
					fluid
					className='mb-5'
				>
					<Row>
						<Col>
							<h1 className='standout-header'>
								{quoteId ? 'Modify Quote' : 'Create Quote'}
							</h1>
							<Row className='align-items-center mb-3'>
								<Col md={6}>
									<CustomerDropdown
										customers={customers}
										selectedCustomerId={selectedCustomerId}
										onCustomerSelect={handleCustomerSelect}
									/>
								</Col>
								<Col md={2}>
									<DeliveryDueDate
										selectedDate={
											quote?.printingDetails?.deliveryDueDate ?? null
										}
										onDateChange={handleDateChange}
									/>
								</Col>
								<Col md={4}>
									<Form.Group>
										<Form.Label>Days Until Delivery</Form.Label>
										<Form.Control
											type='text'
											value={deliveryDays}
											readOnly
										/>
									</Form.Group>
								</Col>
							</Row>
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

									{company?.offerings.includes('Screen Printing') && (
										<>
											<ScreenPrintingDetails
												details={quote.screenPrintingDetails}
												onDetailsChange={handleScreenPrintingDetailsChange}
											/>
											<PrintingOptions
												options={quote.printingOptions}
												onOptionsChange={handlePrintingOptionsChange}
											/>
										</>
									)}
									{company?.offerings.includes('Vinyl') && (
										<VinylDetails
											details={quote.vinylDetails}
											onDetailsChange={handleVinylDetailsChange}
										/>
									)}
									{company?.offerings.includes('Embroidery') && (
										<EmbroideryOptions
											embroideryDetails={quote.embroideryDetails}
											onEmbroideryDetailsChange={handleEmbroideryOptionsChange}
										/>
									)}

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
				<ToastContainer />
			</Layout>
		</>
	);
};

export default QuotePage;
