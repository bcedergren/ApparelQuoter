import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/Header.module.css';
import Image from 'next/image';

const Header = () => {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => {
		if (window.innerWidth <= 768) {
			setDropdownOpen((prevState) => !prevState);
		}
	};

	const closeDropdown = () => {
		setDropdownOpen(false);
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (
			dropdownRef.current &&
			!dropdownRef.current.contains(event.target as Node)
		) {
			closeDropdown();
		}
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 768) {
				setDropdownOpen(false);
			}
		};

		window.addEventListener('resize', handleResize);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<div className={styles.logo}>
					<Link href='/'>
						<Image
							src='/logo.png'
							alt='logo'
							width={181}
							height={36}
						/>
					</Link>
				</div>
				<div
					className={styles.hamburger}
					onClick={toggleDropdown}
				>
					<div></div>
					<div></div>
					<div></div>
				</div>
				<nav className={styles.nav}>
					<ScrollLink
						to='home'
						smooth={true}
						duration={500}
						className={styles.navLink}
					>
						Home
					</ScrollLink>
					<ScrollLink
						to='features'
						smooth={true}
						duration={500}
						className={styles.navLink}
					>
						Features
					</ScrollLink>
					<ScrollLink
						to='pricing'
						smooth={true}
						duration={500}
						className={styles.navLink}
					>
						Pricing
					</ScrollLink>
					<ScrollLink
						to='contact'
						smooth={true}
						duration={500}
						className={styles.navLink}
					>
						Contact
					</ScrollLink>
					<Link
						href='/login'
						className={styles.navLink}
					>
						Login
					</Link>
				</nav>
				{dropdownOpen && (
					<div
						ref={dropdownRef}
						className={`${styles.navDropdown} ${
							dropdownOpen ? styles.show : ''
						}`}
					>
						<ScrollLink
							to='home'
							smooth={true}
							duration={500}
							className={styles.navLink}
							onClick={closeDropdown}
						>
							Home
						</ScrollLink>
						<ScrollLink
							to='features'
							smooth={true}
							duration={500}
							className={styles.navLink}
							onClick={closeDropdown}
						>
							Features
						</ScrollLink>
						<ScrollLink
							to='pricing'
							smooth={true}
							duration={500}
							className={styles.navLink}
							onClick={closeDropdown}
						>
							Pricing
						</ScrollLink>
						<ScrollLink
							to='contact'
							smooth={true}
							duration={500}
							className={styles.navLink}
							onClick={closeDropdown}
						>
							Contact
						</ScrollLink>
						<Link href='/login'>
							<div
								className={styles.loginButton}
								onClick={closeDropdown}
							>
								Login
							</div>
						</Link>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
