import React, { useState, useEffect, FC, ChangeEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Customer, FollowUpNote } from '@/types/Customer';

interface FollowUpNotesModalProps {
	show: boolean;
	onHide: () => void;
	customer?: Customer | null;
	onSave: (customerData: Customer) => void;
}

const FollowUpNotesModal: FC<FollowUpNotesModalProps> = ({
	show,
	onHide,
	customer,
	onSave,
}) => {
	const [followUpNote, setFollowUpNote] = useState<FollowUpNote>({
		date: new Date(),
		note: '',
		addedBy: '',
		addedDate: new Date(),
	});
	const [customerData, setCustomerData] = useState<Customer | null>(null);

	useEffect(() => {
		setCustomerData(customer ?? null);
	}, [customer]);

	const handleNoteChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFollowUpNote((prevNote) => ({
			...prevNote,
			[name]: name === 'date' ? new Date(value) : value,
		}));
	};

	const handleSaveNote = () => {
		if (customerData) {
			const updatedCustomer = {
				...customerData,
				followUpNotes: [...(customerData.followUpNotes || []), followUpNote],
			};
			onSave(updatedCustomer);
			setFollowUpNote({
				date: new Date(),
				note: '',
				addedBy: '',
				addedDate: new Date(),
			});
		}
	};

	const formatDate = (date: Date): string => {
		const d = new Date(date);
		const month = `0${d.getMonth() + 1}`.slice(-2);
		const day = `0${d.getDate()}`.slice(-2);
		const year = d.getFullYear();
		return `${year}-${month}-${day}`;
	};

	return (
		<Modal
			show={show}
			onHide={onHide}
		>
			<Modal.Header closeButton>
				<Modal.Title>
					Customer Notes
					<br />
					<span className='small'>
						<strong>{customer?.companyName}</strong>
					</span>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group className='form-floating mb-3'>
						<Form.Control
							as='textarea'
							id='note'
							name='note'
							placeholder='Note'
							value={followUpNote.note}
							onChange={handleNoteChange}
							style={{ height: '100px' }}
						/>
						<Form.Label htmlFor='note'>Note</Form.Label>
					</Form.Group>

					<Form.Group className='form-floating mb-3'>
						<Form.Control
							type='date'
							id='date'
							name='date'
							placeholder='Follow-Up Date'
							value={formatDate(followUpNote.date)}
							onChange={handleNoteChange}
						/>
						<Form.Label htmlFor='date'>Follow-Up Date</Form.Label>
					</Form.Group>

					<Button
						variant='primary'
						onClick={handleSaveNote}
					>
						Add Note
					</Button>

					<h5 className='mt-4'>History</h5>
					<ul>
						{customerData?.followUpNotes?.map((note, index) => (
							<li key={index}>
								<strong>{formatDate(note.date)}:</strong> {note.note}
							</li>
						))}
					</ul>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button
					variant='secondary'
					onClick={onHide}
				>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default FollowUpNotesModal;
