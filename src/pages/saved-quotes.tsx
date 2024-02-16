import type { NextPage } from 'next';
import Layout from '@/components/Layout';

// Example type for a quote, expand according to your actual data structure
interface Quote {
	id: string;
	customer: string;
	date: string;
	total: number;
}

const SavedQuotes: NextPage = () => {
	// Placeholder data for saved quotes
	const quotes: Quote[] = [
		{ id: 'Q001', customer: 'Alice Smith', date: '2024-02-14', total: 300.0 },
		{ id: 'Q002', customer: 'Bob Johnson', date: '2024-02-15', total: 450.5 },
		{ id: 'Q003', customer: 'Charlie Brown', date: '2024-02-16', total: 600.0 },
	];

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Saved Quotes</h1>
				<ul className='list-group'>
					{quotes.map((quote) => (
						<li
							key={quote.id}
							className='list-group-item'
						>
							<div className='d-flex w-100 justify-content-between'>
								<h5 className='mb-1'>Quote ID: {quote.id}</h5>
								<small>{quote.date}</small>
							</div>
							<p className='mb-1'>Customer: {quote.customer}</p>
							<p className='mb-1'>Total: ${quote.total.toFixed(2)}</p>
						</li>
					))}
				</ul>
			</div>
		</Layout>
	);
};

export default SavedQuotes;
