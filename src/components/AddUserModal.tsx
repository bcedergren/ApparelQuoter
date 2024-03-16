// components/AddUserModal.tsx

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface AddUserModalProps {
	show: boolean;
	onHide: () => void;
	onUserAdded: () => void; // Callback to refresh the user list after adding a user
}

const AddUserModal: React.FC<AddUserModalProps> = ({
	show,
	onHide,
	onUserAdded,
}) => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [role, setRole] = useState('');

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		// Assuming your session includes companyId and you have an API endpoint /api/add-user
		const response = await fetch('/api/add-user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ firstName, lastName, email, role }),
		});

		if (response.ok) {
			onUserAdded(); // Refresh the user list in the parent component
			onHide(); // Close the modal
		} else {
			// Handle errors, e.g., show an error message
		}
	};

	return (
		<Modal
			show={show}
			onHide={onHide}
		>
			<Modal.Header closeButton>
				<Modal.Title>Add New User</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					<Form.Group className='mb-3'>
						<Form.Label>First Name</Form.Label>
						<Form.Control
							type='text'
							value={firstName}
							onChange={(e: ChangeEvent<HTMLInputElement>) =>
								setFirstName(e.target.value)
							}
							required
						/>
					</Form.Group>
					<Form.Group className='mb-3'>
						<Form.Label>Last Name</Form.Label>
						<Form.Control
							type='text'
							value={lastName}
							onChange={(e: ChangeEvent<HTMLInputElement>) =>
								setLastName(e.target.value)
							}
							required
						/>
					</Form.Group>
					<Form.Group className='mb-3'>
						<Form.Label>Email</Form.Label>
						<Form.Control
							type='email'
							value={email}
							onChange={(e: ChangeEvent<HTMLInputElement>) =>
								setEmail(e.target.value)
							}
							required
						/>
					</Form.Group>
					<Form.Group className='mb-3'>
						<Form.Label>Role</Form.Label>
						<Form.Control
							type='text'
							value={role}
							onChange={(e: ChangeEvent<HTMLInputElement>) =>
								setRole(e.target.value)
							}
							required
						/>
					</Form.Group>
					<Button
						variant='primary'
						type='submit'
					>
						Add User
					</Button>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default AddUserModal;
