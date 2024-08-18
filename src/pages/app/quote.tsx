import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Container, Row, Col } from 'react-bootstrap';
import Layout from '@/components/app/Layout';
import QuoteForm from '@/components/app/quote/QuoteForm';
import { Customer } from '@/types/Customer';
import { Price } from '@/types/Price';
import { Quote } from '@/types/Quote';
import { Company } from '@/types/Company';
import { ToastContainer, toast } from 'react-toastify';
import { initialQuoteState } from '@/utils/initialQuoteState';

const QuotePage: NextPage = () => {
	const router = useRouter();
	const { quoteId } = router.query;
	const { data: session, status } = useSession();
	const [quote, setQuote] = useState<Quote | null>(initialQuoteState);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [prices, setPrices] = useState<Price | null>(null);
	const [company, setCompany] = useState<Company | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isQuoteModified, setIsQuoteModified] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			if (session) {
				try {
					const [customersRes, pricesRes, companyRes] = await Promise.all([
						fetch(`/api/customers/${session.user.companyId}`),
						fetch(`/api/prices/${session.user.companyId}`),
						fetch(`/api/company/${session.user.companyId}`),
					]);

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
				} catch (error) {
					toast.error(`Failed to load data: ${error}`);
				} finally {
					setIsLoading(false);
				}
			}
		};

		fetchData();
	}, [quoteId, session]);

	return (
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
						<QuoteForm
							quoteId={quoteId}
							session={session}
							customers={customers}
							prices={prices}
							company={company}
							initialQuoteState={initialQuoteState}
							isQuoteModified={isQuoteModified}
							onQuoteSaved={() => router.push('/quotes')}
						/>
					</Col>
				</Row>
			</Container>
		</Layout>
	);
};

export default QuotePage;
