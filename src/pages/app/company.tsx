import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import Image from 'next/image';
import Layout from '@/components/app/Layout';
import { Company } from '@/types/Company';
import styles from '@/styles/Company.module.css';

const paymentMethodsList = [
	{ name: 'Visa', image: '/images/payment-methods/visa.png' },
	{ name: 'MasterCard', image: '/images/payment-methods/mastercard.png' },
	{ name: 'American Express', image: '/images/payment-methods/amex.png' },
	{ name: 'PayPal', image: '/images/payment-methods/paypal.png' },
	{ name: 'Discover', image: '/images/payment-methods/discover.png' },
	{ name: 'Apple Pay', image: '/images/payment-methods/applepay.png' },
	{ name: 'Google Pay', image: '/images/payment-methods/googlepay.png' },
];

const offeringsList = ['Screen Printing', 'Vinyl', 'Embroidery'];

const CompanyPage: NextPage = () => {
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const { control, handleSubmit, setValue, watch } = useForm<Company>({
		defaultValues: {
			name: '',
			streetAddress: '',
			city: '',
			state: '',
			zip: '',
			phone: '',
			fax: '',
			email: '',
			url: '',
			paymentMethods: [],
			offerings: [],
		},
	});

	const watchPaymentMethods = watch('paymentMethods', []);
	const watchOfferings = watch('offerings', []);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const companyId = session?.user?.companyId;
				if (!companyId) {
					throw new Error('Company ID not found in session');
				}

				const response = await fetch(`/api/company/${companyId}`);
				const data = await response.json();

				if (data.success) {
					const companyData = data.company as Company;
					for (const key in companyData) {
						if (companyData.hasOwnProperty(key)) {
							setValue(key as keyof Company, companyData[key as keyof Company]);
						}
					}
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
	}, [session, setValue]);

	const onSubmit = async (data: Company) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/company/update`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();
			if (result.success) {
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
						) : (
							<Form onSubmit={handleSubmit(onSubmit)}>
								{/* Company Name */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										Company Name
									</Form.Label>
									<Col md={9}>
										<Controller
											name='name'
											control={control}
											render={({ field }) => (
												<Form.Control
													type='text'
													{...field}
												/>
											)}
										/>
									</Col>
								</Form.Group>

								{/* Street Address */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										Street Address
									</Form.Label>
									<Col md={9}>
										<Controller
											name='streetAddress'
											control={control}
											render={({ field }) => (
												<Form.Control
													type='text'
													{...field}
												/>
											)}
										/>
									</Col>
								</Form.Group>

								{/* City */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										City
									</Form.Label>
									<Col md={9}>
										<Controller
											name='city'
											control={control}
											render={({ field }) => (
												<Form.Control
													type='text'
													{...field}
												/>
											)}
										/>
									</Col>
								</Form.Group>

								{/* State */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										State
									</Form.Label>
									<Col md={9}>
										<Controller
											name='state'
											control={control}
											render={({ field }) => (
												<Form.Control
													type='text'
													{...field}
												/>
											)}
										/>
									</Col>
								</Form.Group>

								{/* Zip Code */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										Zip
									</Form.Label>
									<Col md={9}>
										<Controller
											name='zip'
											control={control}
											render={({ field }) => (
												<Form.Control
													type='text'
													{...field}
												/>
											)}
										/>
									</Col>
								</Form.Group>

								{/* Phone */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										Phone
									</Form.Label>
									<Col md={9}>
										<Controller
											name='phone'
											control={control}
											render={({ field }) => (
												<Form.Control
													type='text'
													{...field}
												/>
											)}
										/>
									</Col>
								</Form.Group>

								{/* Fax (optional) */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										Fax
									</Form.Label>
									<Col md={9}>
										<Controller
											name='fax'
											control={control}
											render={({ field }) => (
												<Form.Control
													type='text'
													{...field}
												/>
											)}
										/>
									</Col>
								</Form.Group>

								{/* Email */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										Email
									</Form.Label>
									<Col md={9}>
										<Controller
											name='email'
											control={control}
											render={({ field }) => (
												<Form.Control
													type='email'
													{...field}
												/>
											)}
										/>
									</Col>
								</Form.Group>

								{/* URL (optional) */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										Website
									</Form.Label>
									<Col md={9}>
										<Controller
											name='url'
											control={control}
											render={({ field }) => (
												<Form.Control
													type='text'
													{...field}
												/>
											)}
										/>
									</Col>
								</Form.Group>

								{/* Payment Methods */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										Payment Methods
									</Form.Label>
									<Col md={9}>
										<Controller
											name='paymentMethods'
											control={control}
											render={({ field }) => (
												<div className={styles.paymentMethods}>
													{paymentMethodsList.map((method) => (
														<div
															key={method.name}
															className={styles.paymentMethod}
														>
															<Form.Check
																type='checkbox'
																id={`payment-${method.name}`}
																label={
																	<>
																		<Image
																			src={method.image}
																			alt={method.name}
																			width={73}
																			height={44}
																			className={styles.paymentMethodImage}
																		/>
																	</>
																}
																{...field}
																checked={watchPaymentMethods.includes(
																	method.name
																)}
																onChange={(e) => {
																	const checked = e.target.checked;
																	const updatedMethods = checked
																		? [...watchPaymentMethods, method.name]
																		: watchPaymentMethods.filter(
																				(item) => item !== method.name
																		  );
																	field.onChange(updatedMethods);
																}}
															/>
														</div>
													))}
												</div>
											)}
										/>
									</Col>
								</Form.Group>

								{/* Sections */}
								<Form.Group
									as={Row}
									className='mb-3 align-items-center'
								>
									<Form.Label
										column
										md={3}
										style={{ fontWeight: 'bold' }}
									>
										Offerings
									</Form.Label>
									<Col md={9}>
										<Controller
											name='offerings'
											control={control}
											render={({ field }) => (
												<div className={styles.offerings}>
													{offeringsList.map((offering) => (
														<div
															key={offering}
															className={styles.section}
														>
															<Form.Check
																type='checkbox'
																id={`offering-${offering}`}
																label={offering}
																{...field}
																checked={watchOfferings.includes(offering)}
																onChange={(e) => {
																	const checked = e.target.checked;
																	const updatedSections = checked
																		? [...watchOfferings, offering]
																		: watchOfferings.filter(
																				(item) => item !== offering
																		  );
																	field.onChange(updatedSections);
																}}
															/>
														</div>
													))}
												</div>
											)}
										/>
									</Col>
								</Form.Group>

								<Button
									className={styles.updateButton}
									variant='primary'
									type='submit'
									disabled={isLoading}
								>
									Update Company
								</Button>
							</Form>
						)}
					</Col>
				</Row>
			</Container>
		</Layout>
	);
};

export default CompanyPage;
