import { useState, useEffect, FC } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { User } from '@/types/User';
import { toast } from 'react-toastify';

const EditUserModal: FC<{
	show: boolean;
	onHide: () => void;
	user: User | null;
	onUserUpdated: () => void;
	disableRoleEdit: boolean;
}> = ({ show, onHide, user, onUserUpdated, disableRoleEdit }) => {
	const [formData, setFormData] = useState<User | null>(user);

	useEffect(() => {
		setFormData(user);
	}, [user]);

	const handleChange = (e: React.ChangeEvent<any>) => {
		const { name, value } = e.target;
		setFormData((prevData) =>
			prevData ? { ...prevData, [name]: value } : null
		);
	};

	const handleSubmit = async () => {
		if (formData) {
			try {
				const res = await fetch(`/api/users/${formData._id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				});
				if (!res.ok) {
					throw new Error('Failed to update user');
				}
				toast.success('User updated successfully');
				onUserUpdated();
				onHide();
			} catch (error) {
				toast.error('Failed to update user');
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
					<Form>
						<Form.Group className='mb-3'>
							<Form.Label>First Name</Form.Label>
							<Form.Control
								type='text'
								name='firstName'
								value={formData.firstName}
								onChange={handleChange}
							/>
						</Form.Group>
						<Form.Group className='mb-3'>
							<Form.Label>Last Name</Form.Label>
							<Form.Control
								type='text'
								name='lastName'
								value={formData.lastName}
								onChange={handleChange}
							/>
						</Form.Group>
						<Form.Group className='mb-3'>
							<Form.Label>Email</Form.Label>
							<Form.Control
								type='email'
								name='email'
								value={formData.email}
								onChange={handleChange}
							/>
						</Form.Group>
						<Form.Group className='mb-3'>
							<Form.Label>Role</Form.Label>
							<Form.Control
								as='select'
								name='role'
								value={formData.role}
								onChange={handleChange}
								disabled={disableRoleEdit}
							>
								<option value='admin'>Admin</option>
								<option value='user'>User</option>
							</Form.Control>
						</Form.Group>
					</Form>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button
					variant='secondary'
					onClick={onHide}
				>
					Cancel
				</Button>
				<Button
					variant='primary'
					onClick={handleSubmit}
				>
					Save Changes
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default EditUserModal;
