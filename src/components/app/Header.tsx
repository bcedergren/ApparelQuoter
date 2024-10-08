import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Navbar, Nav, NavDropdown, Modal, Button } from 'react-bootstrap';
import { SlSettings, SlTag, SlBriefcase, SlUser } from 'react-icons/sl';
import { CustomSession } from '@/types/CustomUser';
import styles from '@/styles/AppHeader.module.css';

const Header = () => {
	const { data: sessionData, status } = useSession();
	const session = sessionData as CustomSession; // Use the extended session with type assertion
	const loading = status === 'loading';
	const router = useRouter();

	const [showDropdown, setShowDropdown] = useState(false);
	const [showLogoutModal, setShowLogoutModal] = useState(false);

	const toggleDropdown = () => {
		setShowDropdown((prevState) => !prevState);
	};

	const handleDropdownClick = (event: React.MouseEvent) => {
		event.stopPropagation();
	};

	const handleLogout = () => {
		setShowLogoutModal(true);
	};

	const confirmLogout = async () => {
		await signOut();
		setShowLogoutModal(false);
		router.push('/login');
	};

	const cancelLogout = () => {
		setShowLogoutModal(false);
	};

	useEffect(() => {
		// Redirect to login if session is null
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router, session]);

	return (
		<>
			<Navbar
				bg='light'
				expand='lg'
				className={styles.header}
			>
				<Navbar.Toggle aria-controls='basic-navbar-nav' />
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className={styles.welcome}>
						<Nav.Item>
							{session ? (
								<>
									<span>
										Welcome, {session.user?.firstName} {session.user?.lastName}!
									</span>
									{session.user?.email && <span> ({session.user.email})</span>}
								</>
							) : (
								<span>Please log in</span>
							)}
						</Nav.Item>
					</Nav>
					<Nav className={styles.headerButtons}>
						{session ? (
							<>
								{session.user.role === 'admin' && (
									<NavDropdown
										title={
											<span>
												<SlSettings /> Settings
											</span>
										}
										id='basic-nav-dropdown'
										show={showDropdown}
										onMouseEnter={toggleDropdown}
										onMouseLeave={toggleDropdown}
										className={styles.navLink}
									>
										<NavDropdown.Item href='/app/company'>
											<SlBriefcase /> <span>Company</span>
										</NavDropdown.Item>
										<NavDropdown.Item href='/app/prices'>
											<SlTag /> <span>Prices</span>
										</NavDropdown.Item>
										<NavDropdown.Item href='/app/users'>
											<SlUser /> <span>Users</span>
										</NavDropdown.Item>
									</NavDropdown>
								)}
								<Nav.Item className='ml-3'>
									<Button
										onClick={handleLogout}
										className={styles.navLink}
									>
										Logout
									</Button>
								</Nav.Item>
							</>
						) : (
							<Nav.Item className='ml-auto'>
								<Button
									onClick={() => signIn()}
									className={styles.navLink}
								>
									Login
								</Button>
							</Nav.Item>
						)}
					</Nav>
				</Navbar.Collapse>
			</Navbar>

			<Modal
				show={showLogoutModal}
				onHide={cancelLogout}
			>
				<Modal.Header closeButton>
					<Modal.Title>Confirm Logout</Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure you want to logout?</Modal.Body>
				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={cancelLogout}
					>
						Cancel
					</Button>
					<Button
						variant='primary'
						onClick={confirmLogout}
					>
						Logout
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default Header;
