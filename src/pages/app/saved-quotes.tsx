import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { Modal } from 'react-bootstrap';
import { Quote } from '@/types/Quote';
import Layout from '@/components/app/Layout';

const SavedQuotes: NextPage = () => {
	const { data: session, status } = useSession();
	const [quotes, setQuotes] = useState<Quote[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchQuotes = async () => {
			try {
				if (status === 'authenticated' && session?.user?.companyId) {
					const companyId = session?.user?.companyId;
					const response = await fetch(
						`/api/quotes/${companyId}?quoteType=savedQuotes`
					);
					if (!response.ok) {
						throw new Error('Failed to fetch quotes');
					}
					const data = await response.json();
					setQuotes(data.quotes);
				}
			} catch (err) {
				setError('Failed to load quotes');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchQuotes();
	}, [session, status]);

	const sendToOrders = async (quoteId: string) => {
		try {
			const response = await fetch(`/api/order/${quoteId}`, {
				method: 'POST', // or another method if your API requires
			});

			if (!response.ok) {
				throw new Error('Failed to send quote to orders');
			}

			// Handle successful sending here (e.g., show a notification)
			alert('Quote successfully sent to orders');
		} catch (err) {
			console.error(err);
			// Handle error (e.g., show an error notification)
			alert('Failed to send quote to orders');
		}
	};

	const deleteQuote = async () => {
		if (!selectedQuoteId) return; // Just a safety check

		try {
			const response = await fetch(`/api/quotes/${selectedQuoteId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to delete quote');
			}

			setQuotes(quotes.filter((quote) => quote._id !== selectedQuoteId));
			alert('Quote successfully deleted');
		} catch (err) {
			console.error(err);
			alert('Failed to delete quote');
		} finally {
			setIsModalOpen(false); // Close the modal
			setSelectedQuoteId(null); // Reset the selected quote ID
		}
	};

	const openModal = (quoteId: string) => {
		setSelectedQuoteId(quoteId);
		setIsModalOpen(true);
	};

	if (loading) {
		return <Layout>Loading...</Layout>;
	}

	if (error) {
		return (
			<Layout>
				<div>Error: {error}</div>
			</Layout>
		);
	}

	return (
		<Layout>
			{/* Confirmation Modal */}
			{isModalOpen && (
				<Modal
					show={isModalOpen}
					onHide={() => setIsModalOpen(false)}
				>
					<Modal.Header closeButton>
						<Modal.Title>Confirm Deletion</Modal.Title>
					</Modal.Header>
					<Modal.Body>Are you sure you want to delete this quote?</Modal.Body>
					<Modal.Footer>
						<button
							className='btn btn-secondary'
							onClick={() => setIsModalOpen(false)}
						>
							Cancel
						</button>
						<button
							className='btn btn-danger'
							onClick={deleteQuote}
						>
							Delete
						</button>
					</Modal.Footer>
				</Modal>
			)}
			<div className='container mt-5'>
				<h1>Saved Quotes</h1>
				{quotes.length > 0 ? (
					<ul className='list-group'>
						{quotes.map((quote) => (
							<li
								key={quote._id}
								className='list-group-item'
							>
								{/* Make Quote ID a clickable link to quote-details */}
								<Link
									href={`/quote-details/${quote._id}`}
									className='text-decoration-none'
								>
									<h5 className='mb-1'>Quote ID: {quote._id}</h5>
								</Link>
								{/* Display the date underneath the Quote ID */}
								{quote.CreatedAt && (
									<small className='d-block'>
										{new Date(quote.CreatedAt).toLocaleDateString()}
									</small>
								)}{' '}
								<p className='mb-1'>Customer: {quote.customerName}</p>
								<p className='mb-1'>
									Total: ${quote.summary.totalCost.toFixed(2)}
								</p>
								<div className='d-flex justify-content-between'>
									<button
										className='btn btn-primary'
										onClick={() => sendToOrders(quote._id)}
									>
										Send to Orders
									</button>
									<button
										className='btn btn-danger'
										onClick={() => openModal(quote._id)}
									>
										Delete Quote
									</button>
								</div>
							</li>
						))}
					</ul>
				) : (
					<p>There are no saved quotes</p>
				)}
			</div>
		</Layout>
	);
};

export default SavedQuotes;
