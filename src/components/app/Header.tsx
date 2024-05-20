import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Dropdown, Button } from 'react-bootstrap';
import { SlSettings, SlTag, SlBriefcase, SlUser } from 'react-icons/sl';
import { CustomSession } from '@/types/CustomSession';

const Header = () => {
	const { data: sessionData, status } = useSession();
	const session = sessionData as CustomSession; // Use the extended session with type assertion
	const loading = status === 'loading';

	return (
		<header
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				padding: '10px',
				background: '#eee',
			}}
		>
			<div>
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

			<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
				{session && session.user.role === 'admin' && (
					<Dropdown>
						<Dropdown.Toggle
							variant='secondary'
							id='dropdown-basic'
						>
							<SlSettings /> Settings
						</Dropdown.Toggle>
						<Dropdown.Menu
							style={{
								marginTop: '1px',
							}}
						>
							<Dropdown.Item as='div'>
								<Link
									href='/company'
									passHref
									style={{ textDecoration: 'none', color: 'inherit' }}
								>
									<SlBriefcase /> Company
								</Link>
							</Dropdown.Item>
							<Dropdown.Item as='div'>
								<Link
									href='/prices'
									passHref
									style={{ textDecoration: 'none', color: 'inherit' }}
								>
									<SlTag /> Prices
								</Link>
							</Dropdown.Item>
							<Dropdown.Item as='div'>
								<Link
									href='/users'
									passHref
									style={{ textDecoration: 'none', color: 'inherit' }}
								>
									<SlUser /> Users
								</Link>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				)}

				{!loading &&
					(session ? (
						<Button
							onClick={() => signOut()}
							style={{ marginLeft: '10px' }}
						>
							Logout
						</Button>
					) : (
						<button onClick={() => signIn()}>Login</button>
					))}
			</div>
		</header>
	);
};

export default Header;
