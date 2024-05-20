import { useState, useEffect, FC } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { SlPlus } from 'react-icons/sl';
import { User } from '@/types/User';
import { CustomSession } from '@/types/CustomSession';
import AddUserModal from '@/components/app/AddUserModal';
import Layout from '@/components/app/Layout';

const UsersPage: FC = () => {
	const { data: sessionData } = useSession();
	const session = sessionData as CustomSession;

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [showModal, setShowModal] = useState(false);

	const fetchUsers = async () => {
		if (session?.user?.companyId) {
			setLoading(true);
			fetch(`/api/users/${session.user.companyId}`)
				.then((res) => res.json())
				.then((data: User[]) => {
					setUsers(data);
					setLoading(false);
				})
				.catch((error: Error) => {
					console.error('Failed to fetch users:', error);
					setError('Failed to fetch users');
					setLoading(false);
				});
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [session]);

	if (!session) return <p>You need to be logged in to view this page.</p>;

	return (
		<Layout>
			<Container fluid>
				<Row>
					<Col
						md={12}
						lg={12}
						style={{ paddingLeft: 0 }}
					>
						<h1>Users</h1>
						<div className='d-flex justify-content-end'>
							<Button onClick={() => setShowModal(true)}>
								<SlPlus /> Add User
							</Button>
						</div>
						{loading ? (
							<p>Loading...</p>
						) : error ? (
							<p>Error: {error}</p>
						) : (
							<ul>
								{users.map((user) => (
									<li key={user._id}>
										{user.firstName} {user.lastName} - {user.email} {user.role}
									</li>
								))}
							</ul>
						)}
					</Col>
				</Row>
			</Container>
			<AddUserModal
				show={showModal}
				onHide={() => setShowModal(false)}
				onUserAdded={fetchUsers} // Refresh the user list after adding a user
			/>
		</Layout>
	);
};

export default UsersPage;
