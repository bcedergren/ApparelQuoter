// components/DeliveryDueDate.tsx
import React, { FC } from 'react';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DeliveryDueDateProps {
	selectedDate: Date | null;
	onDateChange: (date: Date) => void;
}

const DeliveryDueDate: FC<DeliveryDueDateProps> = ({
	selectedDate,
	onDateChange,
}) => {
	return (
		<>
			Delivery Due Date
			<Form.Group controlId='deliveryDueDate'>
				<DatePicker
					selected={selectedDate}
					onChange={(date: Date) => onDateChange(date)}
					dateFormat='MMMM d, yyyy'
					className='form-control'
				/>
			</Form.Group>
		</>
	);
};

export default DeliveryDueDate;
