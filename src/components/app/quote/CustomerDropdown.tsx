import React, { FC } from 'react';
import { Form } from 'react-bootstrap';
import { Customer } from '@/types/Customer';

interface CustomerDropdownProps {
	customers: Customer[];
	selectedCustomerId: string;
	onCustomerSelect: (customerId: string) => void;
}

const CustomerDropdown: FC<CustomerDropdownProps> = ({
	customers,
	selectedCustomerId,
	onCustomerSelect,
}) => {
	return (
		<Form.Group controlId='formCustomerSelect'>
			<h6>QUOTE FOR</h6>
			<Form.Control
				as='select'
				value={selectedCustomerId}
				onChange={(e) => onCustomerSelect(e.target.value)}
			>
				<option value=''>-Select a Customer-</option>
				{customers.map((customer) => (
					<option
						key={customer._id}
						value={customer._id}
					>
						{customer.companyName}
					</option>
				))}
			</Form.Control>
		</Form.Group>
	);
};

export default CustomerDropdown;
