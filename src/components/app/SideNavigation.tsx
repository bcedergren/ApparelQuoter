import Link from 'next/link';
import Image from 'next/image';
import { Nav } from 'react-bootstrap';
import { FiChevronsLeft, FiChevronsRight, FiMenu } from 'react-icons/fi';
import {
	SlBag,
	SlPeople,
	SlNote,
	SlDocs,
	SlDrawer,
	SlCalculator,
	SlNotebook,
} from 'react-icons/sl';
import styles from '@/styles/SideNavigation.module.css';
import logo from '@/../public/logo.png';
import smallLogo from '@/../public/logo-2.png'; // Assuming you have a smaller logo

interface SideNavigationProps {
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
	isMobile: boolean;
	setShowSidebar: (showSidebar: boolean) => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({
	collapsed,
	setCollapsed,
	isMobile,
	setShowSidebar,
}) => {
	const toggleCollapse = () => {
		if (isMobile) {
			setShowSidebar(false);
		} else {
			setCollapsed(!collapsed);
		}
	};

	const iconStyle = collapsed
		? { fontSize: '1.5rem' }
		: { fontSize: '1rem', marginRight: '10px' };

	return (
		<Nav
			className={`${styles.nav} flex-column ${
				collapsed ? styles.collapsed : ''
			} ${isMobile ? styles.mobileNav : ''}`}
		>
			<div className={`${styles.navHeader}`}>
				<div className={styles.logoContainer}>
					<Link
						href='/app/dashboard'
						passHref
					>
						<Image
							src={collapsed ? smallLogo : logo}
							alt='logo'
							width={collapsed ? 50 : 181}
							height={collapsed ? 50 : 36}
							priority
						/>
					</Link>
					<div>
						{isMobile ? (
							<FiMenu
								onClick={() => setShowSidebar(false)}
								className={styles.toggleIcon}
							/>
						) : collapsed ? (
							<FiChevronsRight
								onClick={toggleCollapse}
								className={styles.toggleIcon}
							/>
						) : (
							<FiChevronsLeft
								onClick={toggleCollapse}
								className={styles.toggleIcon}
							/>
						)}
					</div>
				</div>
			</div>
			<Nav.Link
				as={Link}
				href='/app/orders-board'
				passHref
				className={styles.navLink}
			>
				<div style={iconStyle}>
					<SlNotebook /> {!collapsed && 'Orders Board'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/app/customers'
				passHref
				className={styles.navLink}
			>
				<div style={iconStyle}>
					<SlPeople /> {!collapsed && 'Customers'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/app/quote'
				passHref
				className={styles.navLink}
			>
				<div style={iconStyle}>
					<SlCalculator /> {!collapsed && 'New Quote'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/app/saved-quotes'
				passHref
				className={styles.navLink}
			>
				<div style={iconStyle}>
					<SlNote /> {!collapsed && 'Saved Quotes'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/app/open-orders'
				passHref
				className={styles.navLink}
			>
				<div style={iconStyle}>
					<SlDocs /> {!collapsed && 'Open Orders'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/app/saved-orders'
				passHref
				className={styles.navLink}
			>
				<div style={iconStyle}>
					<SlBag /> {!collapsed && 'Saved Orders'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/app/completed-orders'
				passHref
				className={styles.navLink}
			>
				<div style={iconStyle}>
					<SlDrawer /> {!collapsed && 'Completed Orders'}
				</div>
			</Nav.Link>
		</Nav>
	);
};

export default SideNavigation;
