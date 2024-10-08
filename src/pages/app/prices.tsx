import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import Layout from '@/components/app/Layout';
import PricingComponents from '@/components/app/pricing/PricingComponents';
import { Price } from '@/types/Price';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ApiResponse {
	success: boolean;
	prices: Price;
}

const Prices: NextPage = () => {
	const { data: session, status } = useSession();
	const [priceData, setPriceData] = useState<Price | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (status === 'authenticated' && session?.user?.companyId) {
			fetchData(session.user.companyId);
		}
	}, [session, status]);

	const fetchData = async (companyId: string) => {
		setIsLoading(true);
		try {
			const url = `/api/prices/${companyId}`;
			const response = await axios.get<ApiResponse>(url);

			if (response.data.success) {
				setPriceData(response.data.prices);
			} else {
				throw new Error('Failed to fetch prices');
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error occurred';
			toast.error(errorMessage);
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			const response = await axios.post('/api/prices/update', {
				prices: priceData,
				companyId: session?.user?.companyId,
			});

			if (response.status === 200) {
				toast.success('Prices updated successfully');
			} else {
				throw new Error('Failed to update prices');
			}
		} catch (error: Error | any) {
			const errorMessage =
				error.response && error.response.data
					? error.response.data.message
					: error.message || 'Unknown error occurred';
			toast.error(`Error updating data: ${errorMessage}`);
			console.error(
				'Error updating prices:',
				error.response ? error.response.data : error.message
			);
		}
	};

	return (
		<Layout>
			<Container fluid>
				<Row>
					<Col
						md={12}
						lg={12}
						style={{ paddingLeft: 0 }}
					>
						<h1>Prices</h1>
						{isLoading && <Spinner animation='border' />}
						{priceData ? (
							<PricingComponents
								priceData={priceData}
								setPriceData={(updatedData) => setPriceData(updatedData)}
								handleSave={handleSave}
							/>
						) : (
							<div>
								{isLoading
									? 'Loading pricing data...'
									: 'No pricing data available.'}
							</div>
						)}
						{error && <div>Error: {error}</div>}
					</Col>
				</Row>
				<ToastContainer />
			</Container>
		</Layout>
	);
};

export default Prices;
