import React, { useState, useEffect, useCallback } from 'react';
import { Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import CustomerDropdown from '@/components/app/quote/CustomerDropdown';
import DeliveryDueDate from '@/components/app/quote/DeliveryDueDate';
import BrandStyleQuantity from '@/components/app/quote/BrandStyleQuantity';
import BrandStylePricing from '@/components/app/quote/BrandStylePricing';
import ApparelAndShipping from '@/components/app/quote/ApparelShipping';
import PrintingOptions from '@/components/app/quote/PrintingOptions';
import VinylDetails from '@/components/app/quote/VinylDetails';
import ScreenPrintingDetails from '@/components/app/quote/ScreenPrintingDetails';
import EmbroideryOptions from '@/components/app/quote/EmbroideryOptions';
import SummaryComponent from '@/components/app/quote/SummaryComponent';
import { Customer } from '@/types/Customer';
import { Price } from '@/types/Price';
import {
	Quote,
	QuoteItem,
	Summary,
	PrintingOptions as PrintingOptionsType,
} from '@/types/Quote';
import { Company } from '@/types/Company';
import { QuoteCalculations } from '@/utils/quoteCalculations';

interface QuoteFormProps {
	quoteId?: string | string[];
	session: any;
	customers: Customer[];
	prices: Price | null;
	company: Company | null;
	initialQuoteState: Quote;
	isQuoteModified: boolean;
	onQuoteSaved: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
	quoteId,
	session,
	customers,
	prices,
	company,
	initialQuoteState,
	isQuoteModified,
	onQuoteSaved,
}) => {
	const [quote, setQuote] = useState<Quote | null>(null);
	const [selectedCustomerId, setSelectedCustomerId] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [deliveryDays, setDeliveryDays] = useState(0);

	useEffect(() => {
		if (quoteId && typeof quoteId === 'string') {
			fetch(`/api/quote/${quoteId}`)
				.then((res) => res.json())
				.then((data) => {
					setSelectedCustomerId(data.selectedCustomerId);
					setQuote(data);
				})
				.catch((error) => {
					toast.error(`Failed to load quote: ${error}`);
				});
		} else {
			setQuote(initialQuoteState);
		}
	}, [quoteId]);

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
			const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

			setDeliveryDays(daysDiff);

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

	const handleDepositPercentageChange = (value: string) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			return {
				...prevQuote,
				depositPercentage: parseFloat(value) || 0,
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

			const updatedQuote = {
				...prevQuote,
				items: updatedItems,
			};

			const summary = QuoteCalculations.calculateSummary(updatedQuote, prices);
			return {
				...updatedQuote,
				summary,
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

			const summary = QuoteCalculations.calculateSummary(updatedQuote, prices);
			return {
				...updatedQuote,
				summary,
			};
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

			const updatedQuote = {
				...prevQuote,
				apparelAndShipping: updatedApparelAndShipping,
			};

			const summary = QuoteCalculations.calculateSummary(updatedQuote, prices);
			return {
				...updatedQuote,
				summary,
			};
		});
	};

	const handlePrintingOptionsChange = (
		updatedPrintingOptions: PrintingOptionsType
	) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			const updatedQuote = {
				...prevQuote,
				printingOptions: updatedPrintingOptions,
			};

			const summary = QuoteCalculations.calculateSummary(updatedQuote, prices);
			return {
				...updatedQuote,
				summary,
			};
		});
	};

	const handleVinylDetailsChange = (
		updatedVinylDetails: typeof initialQuoteState.vinylDetails
	) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			const updatedQuote = {
				...prevQuote,
				vinylDetails: updatedVinylDetails,
				customerName: prevQuote.customerName || '',
			};

			const summary = QuoteCalculations.calculateSummary(updatedQuote, prices);
			return {
				...updatedQuote,
				summary,
			};
		});
	};

	const handleScreenPrintingDetailsChange = (
		updatedScreenPrintingDetails: typeof initialQuoteState.screenPrintingDetails
	) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			const updatedQuote = {
				...prevQuote,
				screenPrintingDetails: {
					...prevQuote.screenPrintingDetails,
					...updatedScreenPrintingDetails,
				},
			};

			const summary = QuoteCalculations.calculateSummary(updatedQuote, prices);
			return {
				...updatedQuote,
				summary,
			};
		});
	};

	const handleEmbroideryOptionsChange = (
		updatedEmbroideryDetails: typeof initialQuoteState.embroideryDetails
	) => {
		setQuote((prevQuote) => {
			if (!prevQuote) return null;

			const updatedQuote: Quote = {
				...prevQuote,
				embroideryDetails: updatedEmbroideryDetails,
			};

			const summary = QuoteCalculations.calculateSummary(updatedQuote, prices);
			return {
				...updatedQuote,
				summary,
			};
		});
	};

	const handleSubmit = async () => {
		try {
			setIsLoading(true);

			if (!quote) {
				throw new Error('Quote data is missing.');
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

				const userId = session.user.id;
				const method = quote.quoteId ? 'PUT' : 'POST';
				const response = await fetch('/api/quotes/saveQuote', {
					method: method,
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
				onQuoteSaved();
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
			<Row className='align-items-center mb-3'>
				<Col md={3}>
					<CustomerDropdown
						customers={customers}
						selectedCustomerId={selectedCustomerId}
						onCustomerSelect={handleCustomerSelect}
					/>
				</Col>
				<Col md={3}>
					<DeliveryDueDate
						selectedDate={quote?.printingDetails?.deliveryDueDate ?? null}
						onDateChange={handleDateChange}
					/>
				</Col>
				<Col md={3}>
					<Form.Group>
						<Form.Label>Days Until Delivery</Form.Label>
						<Form.Control
							type='text'
							value={deliveryDays}
							readOnly
						/>
					</Form.Group>
				</Col>
				<Col md={3}>
					<Form.Group>
						<Form.Label>Deposit Percentage</Form.Label>
						<InputGroup>
							<Form.Control
								type='number'
								step='0.01'
								min='0'
								max='100'
								value={quote?.depositPercentage || ''}
								onChange={(e) => handleDepositPercentageChange(e.target.value)}
							/>
							<InputGroup.Text>%</InputGroup.Text>
						</InputGroup>
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
								options={quote?.printingOptions || {}}
								onOptionsChange={handlePrintingOptionsChange}
								printingLocations={prices?.printingLocationNames || []}
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
				disabled={!session}
			>
				Save Quote
			</Button>
			<ToastContainer />
		</>
	);
};

export default QuoteForm;
