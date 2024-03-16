import React, { useState, useEffect, FC, ChangeEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Customer } from '@/types/Customer';

interface AddEditCustomerModalProps {
	show: boolean;
	onHide: () => void;
	customer?: Customer | null;
	onSave: (customerData: Customer) => void;
}

const AddEditCustomerModal: FC<AddEditCustomerModalProps> = ({
	show,
	onHide,
	customer,
	onSave,
}) => {
	const initialCustomerState: Customer = {
		companyName: '',
		contactName: '',
		address: '',
		address2: '',
		city: '',
		state: '',
		zip: '',
		phone: '',
		email: '',
		depositPercentage: 0,
		totalDueDays: 0,
	};

	const [customerData, setCustomerData] =
		useState<Customer>(initialCustomerState);

	useEffect(() => {
		setCustomerData(customer ?? initialCustomerState);
	}, [customer]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		let newValue: any = value;

		// For numeric fields, ensure the value is a number. If not, default to 0
		if (name === 'depositPercentage' || name === 'totalDueDays') {
			const parsedValue = parseInt(value, 10);
			newValue = isNaN(parsedValue) ? 0 : parsedValue; // Use 0 or another appropriate default value
		}

		setCustomerData((prevData) => ({
			...prevData,
			[name]: newValue,
		}));
	};

	const handleSubmit = () => {
		onSave(customerData);
		onHide(); // Close the modal after saving
	};

	return (
		<Modal
			show={show}
			onHide={onHide}
		>
			<Modal.Header closeButton>
				<Modal.Title>{customer ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					{/* Company Name */}
					<Form.Group className='mb-3'>
						<Form.Label>Company Name</Form.Label>
						<Form.Control
							type='text'
							name='companyName'
							value={customerData.companyName}
							onChange={handleChange}
							required
						/>
					</Form.Group>

					{/* Contact Name */}
					<Form.Group className='mb-3'>
						<Form.Label>Contact Name</Form.Label>
						<Form.Control
							type='text'
							name='contactName'
							value={customerData.contactName}
							onChange={handleChange}
							required
						/>
					</Form.Group>

					{/* Address */}
					<Form.Group className='mb-3'>
						<Form.Label>Address</Form.Label>
						<Form.Control
							type='text'
							name='address'
							value={customerData.address}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Address 2 */}
					<Form.Group className='mb-3'>
						<Form.Label>Address 2</Form.Label>
						<Form.Control
							type='text'
							name='address2'
							value={customerData.address2}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* City */}
					<Form.Group className='mb-3'>
						<Form.Label>City</Form.Label>
						<Form.Control
							type='text'
							name='city'
							value={customerData.city}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* State */}
					<Form.Group className='mb-3'>
						<Form.Label>State</Form.Label>
						<Form.Control
							type='text'
							name='state'
							value={customerData.state}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Zip Code */}
					<Form.Group className='mb-3'>
						<Form.Label>Zip Code</Form.Label>
						<Form.Control
							type='text'
							name='zip'
							value={customerData.zip}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Phone */}
					<Form.Group className='mb-3'>
						<Form.Label>Phone</Form.Label>
						<Form.Control
							type='text'
							name='phone'
							value={customerData.phone}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Email */}
					<Form.Group className='mb-3'>
						<Form.Label>Email</Form.Label>
						<Form.Control
							type='email'
							name='email'
							value={customerData.email}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Deposit Percentage */}
					<Form.Group className='mb-3'>
						<Form.Label>Deposit Percentage</Form.Label>
						<Form.Control
							type='number'
							name='depositPercentage'
							value={customerData.depositPercentage.toString()}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Total Due (in days) */}
					<Form.Group className='mb-3'>
						<Form.Label>Total Due (in days)</Form.Label>
						<Form.Control
							type='number'
							name='totalDueDays'
							value={customerData.totalDueDays.toString()}
							onChange={handleChange}
						/>
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button
					variant='secondary'
					onClick={onHide}
				>
					Close
				</Button>
				<Button
					variant='primary'
					onClick={handleSubmit}
				>
					{customer ? 'Save Changes' : 'Add Customer'}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default AddEditCustomerModal;
