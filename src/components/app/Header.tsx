import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Navbar, Nav, NavDropdown, Modal, Button } from 'react-bootstrap';
import { SlSettings, SlTag, SlBriefcase, SlUser, SlNotebook, SlPeople, SlCalculator, SlNote, SlDocs, SlBag, SlDrawer } from 'react-icons/sl';
import { CustomSession } from '@/types/CustomUser';
import styles from '@/styles/AppHeader.module.css';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
	const { data: sessionData, status } = useSession();
	const session = sessionData as CustomSession; // Use the extended session with type assertion
	const loading = status === 'loading';
	const router = useRouter();

	const [showDropdown, setShowDropdown] = useState(false);
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [showTopNavMenu, setShowTopNavMenu] = useState(false);

	const toggleDropdown = () => {
		setShowDropdown((prevState) => !prevState);
	};

	const toggleTopNavMenu = () => {
		setShowTopNavMenu((prevState) => !prevState);
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

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 767);
		};

		handleResize(); // Set initial value
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isMobile && showTopNavMenu) {
				const target = event.target as HTMLElement;
				if (!target.closest('.mobileTopNavMenu') && !target.closest('.hamburgerToggle')) {
					setShowTopNavMenu(false);
				}
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isMobile, showTopNavMenu]);

	return (
		<>
			<Navbar
				bg='light'
				expand='lg'
				className={styles.header}
			>
				<div className={styles.headerTop}>
					<div className={styles.logoContainer}>
						<Image src="/logo.png" alt="ApparelQuoter Logo" width={181} height={36} className={styles.logo} />
					</div>
					<button 
						onClick={toggleTopNavMenu}
						className={styles.hamburgerToggle}
						aria-label="Toggle navigation menu"
					>
						<span></span>
						<span></span>
						<span></span>
					</button>
				</div>
				<Navbar.Collapse id='basic-navbar-nav' className={styles.navbarCollapse}>
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
									<NavDropdown.Item href='/app/images'>
										<span>Image Gallery</span>
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
			
			{/* Mobile Top Nav Menu */}
			{isMobile && showTopNavMenu && (
				<div className={styles.mobileTopNavMenu}>
					<div className={styles.mobileTopNavContent}>
						<div className={styles.mobileWelcome}>
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
						</div>
						
						<div className={styles.mobileTopNavLinks}>
							{session && session.user.role === 'admin' && (
								<>
									<Link href="/app/company" className={styles.mobileTopNavLink} onClick={() => setShowTopNavMenu(false)}>
										<SlBriefcase /> <span>Company</span>
									</Link>
									<Link href="/app/prices" className={styles.mobileTopNavLink} onClick={() => setShowTopNavMenu(false)}>
										<SlTag /> <span>Prices</span>
									</Link>
									<Link href="/app/users" className={styles.mobileTopNavLink} onClick={() => setShowTopNavMenu(false)}>
										<SlUser /> <span>Users</span>
									</Link>
									<Link href="/app/images" className={styles.mobileTopNavLink} onClick={() => setShowTopNavMenu(false)}>
										<span>Image Gallery</span>
									</Link>
									<div className={styles.mobileDivider}></div>
								</>
							)}
							
							<button
								onClick={() => {
									handleLogout();
									setShowTopNavMenu(false);
								}}
								className={styles.mobileTopNavLink}
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			)}

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
