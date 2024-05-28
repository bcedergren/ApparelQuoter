import { useState, useEffect, FC } from 'react';
import { useSession } from 'next-auth/react';
import {
	Container,
	Row,
	Col,
	Table,
	Modal,
	Button,
	Badge,
} from 'react-bootstrap';
import { SlPlus, SlPencil, SlTrash } from 'react-icons/sl';
import { User } from '@/types/User';
import { CustomSession } from '@/types/CustomUser';
import AddUserModal from '@/components/app/AddUserModal';
import EditUserModal from '@/components/app/EditUserModal';
import Layout from '@/components/app/Layout';
import styles from '@/styles/UsersPage.module.css';

const UsersPage: FC = () => {
	const { data: sessionData } = useSession();
	const session = sessionData as CustomSession;

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [userLimit, setUserLimit] = useState<number>(0);

	const fetchUsers = async () => {
		if (session?.user?.companyId) {
			setLoading(true);
			try {
				const res = await fetch(`/api/company-users/${session.user.companyId}`);
				const data: User[] = await res.json();
				setUsers(data);
			} catch (error) {
				console.error('Failed to fetch users:', error);
				setError('Failed to fetch users');
			} finally {
				setLoading(false);
			}
		}
	};

	// const fetchUsers = async () => {
	// 	if (session?.user?.companyId) {
	// 		setLoading(true);
	// 		try {
	// 			const res = await fetch(`/api/users/${session.user.companyId}`);
	// 			const data: User[] = await res.json();
	// 			setUsers(data);

	// 			Fetch plan details to get user limit
	// 			const planRes = await fetch(`/api/plans/${session.user.companyId}`);
	// 			const planData = await planRes.json();
	// 			setUserLimit(planData.userLimit);
	// 		} catch (error) {
	// 			console.error('Failed to fetch users or plan details:', error);
	// 			setError('Failed to fetch users or plan details');
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	}
	// };

	useEffect(() => {
		fetchUsers();
	}, [session]);

	const handleEdit = (user: User) => {
		setSelectedUser(user);
		setShowEditModal(true);
	};

	const handleDelete = (user: User) => {
		setSelectedUser(user);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (selectedUser) {
			try {
				await fetch(`/api/users/${selectedUser._id}`, { method: 'DELETE' });
				setUsers(users.filter((user) => user._id !== selectedUser._id));
				setShowDeleteModal(false);
				setSelectedUser(null);
			} catch (error) {
				console.error('Failed to delete user:', error);
				setError('Failed to delete user');
			}
		}
	};

	if (!session) return <p>You need to be logged in to view this page.</p>;

	return (
		<Layout>
			<Container fluid>
				<Row>
					<Col
						md={12}
						lg={12}
						className={styles.pageTitle}
					>
						<h1>
							Users{' '}
							<span className={styles.badge}>
								{users.length}/{userLimit}
							</span>
						</h1>
						<Button
							onClick={() => setShowAddModal(true)}
							className={styles.addUserButton}
						>
							<SlPlus className='icon' /> Add User
						</Button>
					</Col>
				</Row>
				<Row>
					<Col md={12}>
						{loading ? (
							<p>Loading...</p>
						) : error ? (
							<p>Error: {error}</p>
						) : (
							<Table
								bordered
								hover
								className={styles.table}
							>
								<thead>
									<tr>
										<th>First Name</th>
										<th>Last Name</th>
										<th>Email</th>
										<th>Role</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{users.map((user) => (
										<tr key={user._id}>
											<td>{user.firstName}</td>
											<td>{user.lastName}</td>
											<td>{user.email}</td>
											<td>{user.role}</td>
											<td>
												<SlPencil
													onClick={() => handleEdit(user)}
													className={styles.editIcon}
												/>
												<SlTrash
													onClick={() => handleDelete(user)}
													className={`${styles.editIcon} ${styles.deleteIcon}`}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						)}
					</Col>
				</Row>
			</Container>
			<AddUserModal
				show={showAddModal}
				onHide={() => setShowAddModal(false)}
				onUserAdded={fetchUsers}
			/>
			<EditUserModal
				show={showEditModal}
				onHide={() => setShowEditModal(false)}
				user={selectedUser}
				onUserUpdated={fetchUsers}
			/>
			<Modal
				show={showDeleteModal}
				onHide={() => setShowDeleteModal(false)}
			>
				<Modal.Header closeButton>
					<Modal.Title>Confirm Delete</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Are you sure you want to delete {selectedUser?.firstName}{' '}
					{selectedUser?.lastName}?
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={() => setShowDeleteModal(false)}
					>
						Cancel
					</Button>
					<Button
						variant='danger'
						onClick={confirmDelete}
					>
						Delete
					</Button>
				</Modal.Footer>
			</Modal>
		</Layout>
	);
};

export default UsersPage;
