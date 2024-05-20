import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
	Container,
	Row,
	Col,
	Button,
	Alert,
	Spinner,
	Table,
} from 'react-bootstrap';
import { SlPlus, SlPencil, SlTrash } from 'react-icons/sl';
import Layout from '@/components/Layout';
import AddEditCustomerModal from '@/components/AddEditCustomerModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Customer } from '@/types/Customer';

const Customers: NextPage = () => {
	const { data: session, status } = useSession();
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [showAddEditModal, setShowAddEditModal] = useState(false);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const fetchCustomers = async () => {
		if (status !== 'authenticated' || !session?.user?.companyId) {
			console.error(
				'Session or companyId not found. Unable to fetch customers.'
			);
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`/api/customers/${session.user.companyId}`);
			if (!response.ok) throw new Error('Failed to fetch customers.');
			const data = await response.json();

			setCustomers(data.customers);
			setError(null); // Clear any previous errors
		} catch (error) {
			setError(error instanceof Error ? error.message : 'An error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (status === 'authenticated' && session.user.companyId) {
			fetchCustomers();
		}
	}, [session, status]);

	const handleAddCustomer = () => {
		setSelectedCustomer(null);
		setShowAddEditModal(true);
	};

	const handleSaveCustomer = async (customerData: Customer) => {
		if (status !== 'authenticated' || !session?.user?.companyId) {
			setError('Session not found. Unable to save customer.');
			return;
		}

		const customerDataWithCompanyId = {
			...customerData,
			companyId: session.user.companyId,
		};
		const apiUrl = customerData._id
			? `/api/customers/update/${customerData._id}`
			: '/api/customers/add';
		const method = customerData._id ? 'PUT' : 'POST';

		setIsLoading(true);
		try {
			const response = await fetch(apiUrl, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(customerDataWithCompanyId),
			});

			const responseData = await response.json();
			if (response.ok) {
				setSuccessMessage('Customer saved successfully.');
				fetchCustomers(); // Refresh the customer list
			} else {
				throw new Error(responseData.message || 'Failed to save customer.');
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : 'An error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditCustomer = (customer: Customer) => {
		setSelectedCustomer(customer);
		setShowAddEditModal(true);
	};

	const handleDeleteCustomer = (customer: Customer) => {
		setSelectedCustomer(customer);
		setShowDeleteConfirmation(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedCustomer) return;

		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/customers/delete/${selectedCustomer._id}`,
				{ method: 'DELETE' }
			);

			if (response.ok) {
				setCustomers(customers.filter((c) => c._id !== selectedCustomer._id));
				setSuccessMessage('Customer deleted successfully.');
			} else {
				throw new Error('Failed to delete customer.');
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : 'An error occurred');
		} finally {
			setIsLoading(false);
			setShowDeleteConfirmation(false);
		}
	};

	return (
		<Layout>
			<Container fluid>
				<Row className='align-items-center mb-4'>
					<Col>
						<h1>Customers</h1>
					</Col>
					<Col className='text-end'>
						<Button
							variant='primary'
							onClick={handleAddCustomer}
							disabled={isLoading}
						>
							<SlPlus /> Add Customer
						</Button>
					</Col>
				</Row>

				{error && <Alert variant='danger'>{error}</Alert>}
				{successMessage && <Alert variant='success'>{successMessage}</Alert>}

				{isLoading ? (
					<Spinner animation='border' />
				) : customers.length > 0 ? (
					<Table
						striped
						bordered
						hover
					>
						<thead>
							<tr>
								<th>Company Name</th>
								<th>Contact Name</th>
								<th>Email</th>
								<th>Phone</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{customers.map((customer) => (
								<tr key={customer._id}>
									<td>{customer.companyName}</td>
									<td>{customer.contactName}</td>
									<td>{customer.email}</td>
									<td>{customer.phone}</td>
									<td>
										<Button
											variant='info'
											size='sm'
											onClick={() => handleEditCustomer(customer)}
											disabled={isLoading}
										>
											<SlPencil /> Edit
										</Button>{' '}
										<Button
											variant='danger'
											size='sm'
											onClick={() => handleDeleteCustomer(customer)}
											disabled={isLoading}
										>
											<SlTrash /> Delete
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				) : (
					<p>No customers found.</p>
				)}

				{showAddEditModal && (
					<AddEditCustomerModal
						show={showAddEditModal}
						onHide={() => setShowAddEditModal(false)}
						customer={selectedCustomer}
						onSave={handleSaveCustomer}
					/>
				)}

				{showDeleteConfirmation && (
					<DeleteConfirmationModal
						show={showDeleteConfirmation}
						onHide={() => setShowDeleteConfirmation(false)}
						onConfirm={handleConfirmDelete}
						title='Confirm Deletion'
						body='Are you sure you want to delete this customer? This action cannot be undone.'
					/>
				)}
			</Container>
		</Layout>
	);
};

export default Customers;
