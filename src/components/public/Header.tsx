import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

const PublicHeader: React.FC = () => {
	const { data: session } = useSession();
	const [expanded, setExpanded] = useState<boolean>(false);

	const toggleNavbar = () => setExpanded(!expanded);

	return (
		<Navbar
			bg='light'
			expand='lg'
			expanded={expanded}
			className={`${styles.headerContainer} sticky-top`} // Apply custom styles
		>
			<Container>
				<Navbar.Brand href='/'>
					<h3>ApparelQuoter</h3>
				</Navbar.Brand>
				<Navbar.Toggle
					aria-controls='responsive-navbar-nav'
					onClick={toggleNavbar}
					className={styles.navToggle} // Apply custom styles
				/>
				<Navbar.Collapse
					id='responsive-navbar-nav'
					className={expanded ? styles.navExpanded : ''}
				>
					<Nav className='ms-auto'>
						<Nav.Link
							href='#home'
							className={styles.navLink}
						>
							Home
						</Nav.Link>
						<Nav.Link
							href='#service'
							className={styles.navLink}
						>
							Services
						</Nav.Link>
						<Nav.Link
							href='#pricing'
							className={styles.navLink}
						>
							Pricing
						</Nav.Link>
						<Nav.Link
							href='#review'
							className={styles.navLink}
						>
							Testimonials
						</Nav.Link>
						<Nav.Link
							href='#contact'
							className={styles.navLink}
						>
							Contact
						</Nav.Link>
						{!session && (
							<Nav.Link
								onClick={() => signIn()}
								className={styles.navLink}
							>
								Login
							</Nav.Link>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default PublicHeader;
