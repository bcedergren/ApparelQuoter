import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import Layout from '@/components/app/Layout';
import { Company } from '@/types/Company'; // Ensure this type correctly defines the company structure

const CompanyPage: NextPage = () => {
	const { data: session } = useSession();
	const [companyInfo, setCompanyInfo] = useState<Company | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Replace 'exampleCompanyId' with the actual ID, possibly from session data
				const companyId = '65cffc8cb777ea956aa3bec4';
				const response = await fetch(`/api/company/${companyId}`);
				const data = await response.json();

				if (data.success) {
					setCompanyInfo(data.company);
				} else {
					console.error('Failed to fetch company');
				}
			} catch (error) {
				console.error('Fetching error:', error);
			} finally {
				setIsLoading(false);
			}
		};

		if (session) {
			fetchData();
		}
	}, [session]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCompanyInfo((prevInfo) =>
			prevInfo ? { ...prevInfo, [name]: value } : null
		);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!companyInfo) return;

		setIsLoading(true);
		try {
			const response = await fetch(`/api/update-company`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(companyInfo),
			});

			const data = await response.json();
			if (data.success) {
				alert('Company updated successfully!');
			} else {
				console.error('Failed to update company');
			}
		} catch (error) {
			console.error('Update error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Layout>
			<Container fluid>
				<Row>
					<Col md={12}>
						<h1>Company Information</h1>
						{isLoading ? (
							<Spinner animation='border' />
						) : companyInfo ? (
							<Form onSubmit={handleSubmit}>
								{/* Company Name */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>
										Company Name
									</Form.Label>
									<Form.Control
										type='text'
										name='companyName'
										value={companyInfo.companyName || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								{/* Street Address */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>
										Street Address
									</Form.Label>
									<Form.Control
										type='text'
										name='streetAddress'
										value={companyInfo.streetAddress || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								{/* City */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>City</Form.Label>
									<Form.Control
										type='text'
										name='city'
										value={companyInfo.city || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								{/* State */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>State</Form.Label>
									<Form.Control
										type='text'
										name='state'
										value={companyInfo.state || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								{/* Zip Code */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>Zip</Form.Label>
									<Form.Control
										type='text'
										name='zip'
										value={companyInfo.zip || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								{/* Phone */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>Phone</Form.Label>
									<Form.Control
										type='text'
										name='phone'
										value={companyInfo.phone || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								{/* Fax (optional) */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>Fax</Form.Label>
									<Form.Control
										type='text'
										name='fax'
										value={companyInfo.fax || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								{/* Email */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>Email</Form.Label>
									<Form.Control
										type='email'
										name='email'
										value={companyInfo.email || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								{/* URL (optional) */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>URL</Form.Label>
									<Form.Control
										type='url'
										name='url'
										value={companyInfo.url || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								{/* Payment Methods */}
								<Form.Group className='mb-3'>
									<Form.Label style={{ fontWeight: 'bold' }}>
										Payment Methods
									</Form.Label>
									<Form.Control
										type='text'
										name='paymentMethods'
										value={companyInfo.paymentMethods || ''}
										onChange={handleChange}
									/>
								</Form.Group>

								<Button
									variant='primary'
									type='submit'
									disabled={isLoading}
								>
									Update Company
								</Button>
							</Form>
						) : (
							<div>Company information not found</div>
						)}
					</Col>
				</Row>
			</Container>
		</Layout>
	);
};

export default CompanyPage;
