import React, { useState, useEffect, FC } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { User } from '@/types/User';

interface EditUserModalProps {
	show: boolean;
	onHide: () => void;
	user: User | null;
	onUserUpdated: () => void;
}

const EditUserModal: FC<EditUserModalProps> = ({
	show,
	onHide,
	user,
	onUserUpdated,
}) => {
	const [formData, setFormData] = useState<User | null>(user);

	useEffect(() => {
		setFormData(user);
	}, [user]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (formData) {
			setFormData({ ...formData, [e.target.name]: e.target.value });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData) {
			try {
				const res = await fetch(`/api/users/${formData._id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				});
				if (res.ok) {
					onUserUpdated();
					onHide();
				}
			} catch (error) {
				console.error('Failed to update user:', error);
			}
		}
	};

	return (
		<Modal
			show={show}
			onHide={onHide}
		>
			<Modal.Header closeButton>
				<Modal.Title>Edit User</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{formData && (
					<Form onSubmit={handleSubmit}>
						<Form.Group className='mb-3'>
							<Form.Label>First Name</Form.Label>
							<Form.Control
								type='text'
								name='firstName'
								value={formData.firstName}
								onChange={handleChange}
								required
							/>
						</Form.Group>
						<Form.Group className='mb-3'>
							<Form.Label>Last Name</Form.Label>
							<Form.Control
								type='text'
								name='lastName'
								value={formData.lastName}
								onChange={handleChange}
								required
							/>
						</Form.Group>
						<Form.Group className='mb-3'>
							<Form.Label>Email</Form.Label>
							<Form.Control
								type='email'
								name='email'
								value={formData.email}
								onChange={handleChange}
								required
							/>
						</Form.Group>
						<Form.Group className='mb-3'>
							<Form.Label>Role</Form.Label>
							<Form.Control
								type='text'
								name='role'
								value={formData.role}
								onChange={handleChange}
								required
							/>
						</Form.Group>
						<Button
							variant='primary'
							type='submit'
						>
							Save Changes
						</Button>
					</Form>
				)}
			</Modal.Body>
		</Modal>
	);
};

export default EditUserModal;
