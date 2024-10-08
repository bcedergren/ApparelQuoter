import React from 'react';
import { Form, InputGroup, Row, Col } from 'react-bootstrap';

interface ApparelAndShippingProps {
	data: {
		customerProvidesApparel: boolean;
		creditCardCharge: boolean;
		shippingAndHandling: number;
		shippingAndHandlingTaxed: boolean;
	};
	onChange: (name: string, value: string | number | boolean) => void;
}

const ApparelAndShipping: React.FC<ApparelAndShippingProps> = ({
	data = {
		customerProvidesApparel: false, // Default value if undefined
		creditCardCharge: false, // Default value if undefined
		shippingAndHandling: 0, // Default value if undefined
		shippingAndHandlingTaxed: false, // Default value if undefined
	},
	onChange,
}) => {
	type FormControlElement =
		| HTMLInputElement
		| HTMLSelectElement
		| HTMLTextAreaElement;

	const isHTMLInputElement = (element: any): element is HTMLInputElement => {
		return element && element.type !== undefined && element.tagName === 'INPUT';
	};

	const isHTMLSelectElement = (element: any): element is HTMLSelectElement => {
		return element && element.tagName === 'SELECT';
	};

	const handleChange = (event: React.ChangeEvent<FormControlElement>) => {
		const { name, value } = event.target;
		let updatedValue: string | number | boolean = value;

		if (isHTMLInputElement(event.target)) {
			updatedValue =
				event.target.type === 'checkbox'
					? event.target.checked
					: event.target.value;
		} else if (isHTMLSelectElement(event.target)) {
			updatedValue = event.target.value;
		}

		// Convert 'yes'/'no' to boolean for shippingAndHandlingTaxed
		if (name === 'shippingAndHandlingTaxed') {
			updatedValue = value === 'yes';
		}

		// Convert 'yes'/'no' to boolean for creditCardCharge and shippingAndHandlingTaxed
		if (name === 'creditCardCharge' || name === 'shippingAndHandlingTaxed') {
			updatedValue = value === 'yes';
		}

		onChange(name, updatedValue);
	};

	return (
		<Row className='mt-3'>
			<Col md={3}>
				<Form.Group controlId='customerProvidesApparel'>
					<Form.Label>Customer Provides Apparel</Form.Label>
					<Form.Control
						as='select'
						name='customerProvidesApparel'
						value={data.customerProvidesApparel ? 'yes' : 'no'}
						onChange={handleChange}
					>
						<option value='yes'>Yes</option>
						<option value='no'>No</option>
					</Form.Control>
				</Form.Group>
			</Col>
			<Col md={3}>
				<Form.Group controlId='creditCardCharge'>
					<Form.Label>Credit Card Charge</Form.Label>
					<Form.Control
						as='select'
						name='creditCardCharge'
						value={data.creditCardCharge ? 'yes' : 'no'}
						onChange={handleChange}
					>
						<option value='yes'>Yes</option>
						<option value='no'>No</option>
					</Form.Control>
				</Form.Group>
			</Col>
			<Col md={3}>
				<Form.Group controlId='shippingAndHandling'>
					<Form.Label>Shipping & Handling</Form.Label>
					<InputGroup>
						<InputGroup.Text>$</InputGroup.Text>
						<Form.Control
							type='number'
							name='shippingAndHandling'
							value={data.shippingAndHandling}
							onChange={handleChange}
						/>
					</InputGroup>
				</Form.Group>
			</Col>
			<Col md={3}>
				<Form.Group controlId='shippingAndHandlingTaxed'>
					<Form.Label>S&H Taxed?</Form.Label>
					<Form.Control
						as='select'
						name='shippingAndHandlingTaxed'
						value={data.shippingAndHandlingTaxed ? 'yes' : 'no'}
						onChange={handleChange}
					>
						<option value='yes'>Yes</option>
						<option value='no'>No</option>
					</Form.Control>
				</Form.Group>
			</Col>
		</Row>
	);
};

export default ApparelAndShipping;
