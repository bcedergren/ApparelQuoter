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
	const { data: session } = useSession();
	const [priceData, setPriceData] = useState<Price | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (session) {
			setIsLoading(true);
			const fetchData = async () => {
				try {
					const companyId = session.user.companyId;
					if (companyId) {
						const url = `/api/prices/${companyId}`;
						const response = await axios.get<ApiResponse>(url);

						if (response.data.success) {
							setPriceData(response.data.prices);
						} else {
							toast.error('Failed to fetch prices');
							setError('Failed to fetch prices');
						}
					} else {
						toast.error('No company ID found in session');
						setError('No company ID found in session');
					}
				} catch (error) {
					toast.error('Error fetching data');
					setError('Error fetching data');
				} finally {
					setIsLoading(false);
				}
			};

			fetchData();
		}
	}, [session]);

	const handleSave = async () => {
		try {
			const response = await axios.post('/api/prices/update', {
				prices: priceData,
				companyId: session?.user.companyId,
			});

			if (response.status === 200) {
				console.log('Prices updated successfully');
				toast.success('Prices updated successfully');
			} else {
				console.error('Failed to update prices');
				toast.error('Error fetching data');
			}
		} catch (error) {
			toast.error('Error updating data');
			console.error('Error updating prices:', error);
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
							<div>No pricing data available.</div>
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
