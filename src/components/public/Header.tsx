import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import { FaSignInAlt, FaBars } from 'react-icons/fa';
import { SlSettings, SlTag, SlBriefcase, SlUser } from 'react-icons/sl';
import { CustomSession } from '@/types/CustomSession';
import Image from 'next/image';

const PublicHeader = () => {
	const { data: session } = useSession();
	const [expanded, setExpanded] = useState(false);
	const toggleNavbar = () => setExpanded(!expanded); // Toggle function

	return (
		<Navbar
			bg='light'
			expand='lg'
			expanded={expanded} // Use the expanded state to control the Navbar's toggled state
		>
			<Container>
				<Navbar.Brand href='/'>
					<Image
						src='/logo.png'
						alt='App logo'
						width={50}
						height={50}
					/>{' '}
					ApparelQuoter
				</Navbar.Brand>
				<Navbar.Toggle
					aria-controls='responsive-navbar-nav'
					onClick={toggleNavbar}
				>
					<FaBars />
				</Navbar.Toggle>
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='ms-auto'>
						<Nav.Link href='#features'>Features</Nav.Link>
						<Nav.Link href='/pricing'>Pricing</Nav.Link>
						{!session && (
							<Nav.Link onClick={() => signIn()}>
								<FaSignInAlt /> Login
							</Nav.Link>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default PublicHeader;
