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
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='text'
							id='companyName'
							name='companyName'
							placeholder='Company Name'
							value={customerData.companyName}
							onChange={handleChange}
							required
						/>
						<Form.Label htmlFor='companyName'>Company Name</Form.Label>
					</Form.Group>

					{/* Contact Name */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='text'
							id='contactName'
							name='contactName'
							placeholder='Contact Name'
							value={customerData.contactName}
							onChange={handleChange}
							required
						/>
						<Form.Label htmlFor='contactName'>Contact Name</Form.Label>
					</Form.Group>

					{/* Address */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='text'
							id='address'
							name='address'
							placeholder='Address'
							value={customerData.address}
							onChange={handleChange}
						/>
						<Form.Label htmlFor='address'>Address</Form.Label>
					</Form.Group>

					{/* Address 2 */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='text'
							id='address2'
							name='address2'
							placeholder='Address 2'
							value={customerData.address2}
							onChange={handleChange}
						/>
						<Form.Label htmlFor='address2'>Address 2</Form.Label>
					</Form.Group>

					{/* City */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='text'
							id='city'
							name='city'
							placeholder='City'
							value={customerData.city}
							onChange={handleChange}
						/>
						<Form.Label htmlFor='city'>City</Form.Label>
					</Form.Group>

					{/* State */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='text'
							id='state'
							name='state'
							placeholder='State'
							value={customerData.state}
							onChange={handleChange}
						/>
						<Form.Label htmlFor='state'>State</Form.Label>
					</Form.Group>

					{/* Zip Code */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='text'
							id='zip'
							name='zip'
							placeholder='Zip Code'
							value={customerData.zip}
							onChange={handleChange}
						/>
						<Form.Label htmlFor='zip'>Zip Code</Form.Label>
					</Form.Group>

					{/* Phone */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='text'
							id='phone'
							name='phone'
							placeholder='Phone'
							value={customerData.phone}
							onChange={handleChange}
						/>
						<Form.Label htmlFor='phone'>Phone</Form.Label>
					</Form.Group>

					{/* Email */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='email'
							id='email'
							name='email'
							placeholder='Email'
							value={customerData.email}
							onChange={handleChange}
						/>
						<Form.Label htmlFor='email'>Email</Form.Label>
					</Form.Group>

					{/* Deposit Percentage */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='number'
							id='depositPercentage'
							name='depositPercentage'
							placeholder='Deposit Percentage'
							value={customerData.depositPercentage.toString()}
							onChange={handleChange}
						/>
						<Form.Label htmlFor='depositPercentage'>
							Deposit Percentage
						</Form.Label>
					</Form.Group>

					{/* Total Due (in days) */}
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='number'
							id='totalDueDays'
							name='totalDueDays'
							placeholder='Total Due (in days)'
							value={customerData.totalDueDays.toString()}
							onChange={handleChange}
						/>
						<Form.Label htmlFor='totalDueDays'>Total Due (in days)</Form.Label>
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
