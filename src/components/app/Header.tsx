import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Dropdown, Button } from 'react-bootstrap';
import {
	SlSettings,
	SlTag,
	SlBriefcase,
	SlUser,
	SlArrowDown,
} from 'react-icons/sl';
import { FaCaretDown } from 'react-icons/fa6';

import { CustomSession } from '@/types/CustomSession';
import styles from '@/styles/Header.module.css';

const Header = () => {
	const { data: sessionData, status } = useSession();
	const session = sessionData as CustomSession; // Use the extended session with type assertion
	const loading = status === 'loading';

	const [showDropdown, setShowDropdown] = useState(false);

	const toggleDropdown = () => {
		setShowDropdown((prevState) => !prevState);
	};

	const handleDropdownClick = (event: React.MouseEvent) => {
		event.stopPropagation();
	};

	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<div className={styles.welcome}>
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

				<div className={styles.nav}>
					{session && session.user.role === 'admin' && (
						<div
							className={styles.dropdownContainer}
							onClick={handleDropdownClick}
						>
							<Button
								variant='secondary'
								id='dropdown-basic'
								className={styles.navLink}
								onClick={toggleDropdown}
							>
								<SlSettings /> Settings <FaCaretDown />
							</Button>
							{showDropdown && (
								<ul className={styles.dropdownMenu}>
									<li>
										<Link
											href='/app/company'
											legacyBehavior
											passHref
										>
											<a onClick={() => setShowDropdown(false)}>
												<SlBriefcase /> <span>Company</span>
											</a>
										</Link>
									</li>
									<li>
										<Link
											href='/app/prices'
											legacyBehavior
											passHref
										>
											<a onClick={() => setShowDropdown(false)}>
												<SlTag /> <span>Prices</span>
											</a>
										</Link>
									</li>
									<li>
										<Link
											href='/app/users'
											legacyBehavior
											passHref
										>
											<a onClick={() => setShowDropdown(false)}>
												<SlUser /> <span>Users</span>
											</a>
										</Link>
									</li>
								</ul>
							)}
						</div>
					)}

					{!loading &&
						(session ? (
							<Button
								onClick={() => signOut()}
								className={styles.navLink}
							>
								Logout
							</Button>
						) : (
							<Button
								onClick={() => signIn()}
								className={styles.navLink}
							>
								Login
							</Button>
						))}
				</div>
			</div>
		</header>
	);
};

export default Header;
