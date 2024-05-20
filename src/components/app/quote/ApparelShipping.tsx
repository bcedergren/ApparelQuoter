import React, { FC } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ApparelAndShipping as ApparelAndShippingType } from '@/types/Quote';

interface ApparelAndShippingProps {
	data: ApparelAndShippingType;
	onChange: (name: string, value: string | number | boolean) => void;
}

const ApparelAndShipping: FC<ApparelAndShippingProps> = ({
	data = {
		customerProvidesApparel: false,
		creditCardCharge: false,
		shippingAndHandling: 0,
		shippingAndHandlingTaxed: false,
	},
	onChange,
}) => {
	const handleSelectChange = (name: string, value: string) => {
		// Convert 'Yes'/'No' to boolean, otherwise keep as string
		const isBooleanValue = value === 'Yes' || value === 'No';
		onChange(name, isBooleanValue ? value === 'Yes' : value);
	};

	const handleNumberChange = (name: string, value: string) => {
		// Convert string to number; use 0 as fallback
		const numberValue = parseFloat(value) || 0;
		onChange(name, numberValue);
	};

	return (
		<>
			<h6>APPAREL & SHIPPING</h6>
			<Form>
				<Row>
					<Col>
						<Form.Group controlId='customerProvidesApparel'>
							<Form.Label>Customer Provides Apparel</Form.Label>
							<Form.Select
								value={data.customerProvidesApparel ? 'Yes' : 'No'}
								onChange={(e) =>
									handleSelectChange('customerProvidesApparel', e.target.value)
								}
							>
								<option value='No'>No</option>
								<option value='Yes'>Yes</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='creditCardCharge'>
							<Form.Label>Credit Card Charge</Form.Label>
							<Form.Select
								value={data.creditCardCharge ? 'Yes' : 'No'}
								onChange={(e) =>
									handleSelectChange('creditCardCharge', e.target.value)
								}
							>
								<option value='No'>No</option>
								<option value='Yes'>Yes</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='shippingAndHandling'>
							<Form.Label>Shipping & Handling</Form.Label>
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min={0}
									value={data.shippingAndHandling}
									onChange={(e) =>
										handleNumberChange('shippingAndHandling', e.target.value)
									}
								/>
							</div>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='shippingAndHandlingTaxed'>
							<Form.Label>S&H Taxed?</Form.Label>
							<Form.Select
								value={data.shippingAndHandlingTaxed ? 'Yes' : 'No'}
								onChange={(e) =>
									handleSelectChange('shippingAndHandlingTaxed', e.target.value)
								}
							>
								<option value='No'>No</option>
								<option value='Yes'>Yes</option>
							</Form.Select>
						</Form.Group>
					</Col>
				</Row>
			</Form>
		</>
	);
};

export default ApparelAndShipping;
