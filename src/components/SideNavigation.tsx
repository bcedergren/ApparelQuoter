import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Nav } from 'react-bootstrap';
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6';
import {
	SlBag,
	SlPeople,
	SlNote,
	SlDocs,
	SlFolder,
	SlDrawer,
	SlDoc,
	SlCalculator,
} from 'react-icons/sl';

import logo from '@/../public/logo.png';

interface SideNavigationProps {
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ setCollapsed }) => {
	const [collapsed, setLocalCollapsed] = useState(() => {
		const savedCollapsedState = localStorage.getItem('sideNavCollapsed');
		return savedCollapsedState ? JSON.parse(savedCollapsedState) : false;
	});

	const toggleCollapse = () => {
		const newCollapsedState = !collapsed;
		setLocalCollapsed(newCollapsedState);
		localStorage.setItem('sideNavCollapsed', JSON.stringify(newCollapsedState));
		setCollapsed(newCollapsedState);
	};

	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === 'sideNavCollapsed') {
				setLocalCollapsed(event.newValue === 'true');
			}
		};

		window.addEventListener('storage', handleStorageChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);

	const iconStyle = collapsed ? { fontSize: '1.5rem' } : { fontSize: '1rem' };

	return (
		<Nav
			className='flex-column bg-light'
			style={{
				minHeight: '100vh',
				width: collapsed ? '80px' : '250px',
				transition: 'width 0.3s',
				padding: '20px',
			}}
		>
			<div className='text-center mb-4'>
				<Link
					href='/'
					passHref
				>
					<Image
						src={logo}
						alt='logo'
						width={50}
						height={50}
						priority
					/>
				</Link>
				<div>
					{collapsed ? (
						<FaAnglesRight
							onClick={toggleCollapse}
							style={{ cursor: 'pointer', marginTop: '10px' }}
						/>
					) : (
						<>
							<h3>Apparel Quoter</h3>
							<FaAnglesLeft
								onClick={toggleCollapse}
								style={{ cursor: 'pointer' }}
							/>
						</>
					)}
				</div>
			</div>
			<Nav.Link
				as={Link}
				href='/customers'
				passHref
			>
				<div style={iconStyle}>
					<SlPeople /> {!collapsed && 'Customers'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/quote'
				passHref
			>
				<div style={iconStyle}>
					<SlCalculator /> {!collapsed && 'Quote'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/saved-quotes'
				passHref
			>
				<div style={iconStyle}>
					<SlNote /> {!collapsed && 'Saved Quotes'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/open-orders'
				passHref
			>
				<div style={iconStyle}>
					<SlDocs /> {!collapsed && 'Open Orders'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/saved-orders'
				passHref
			>
				<div style={iconStyle}>
					<SlBag /> {!collapsed && 'Saved Orders'}
				</div>
			</Nav.Link>

			<Nav.Link
				as={Link}
				href='/completed-orders'
				passHref
			>
				<div style={iconStyle}>
					<SlDrawer /> {!collapsed && 'Completed Orders'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/receipt'
				passHref
			>
				<div style={iconStyle}>
					<SlDoc /> {!collapsed && 'Receipt'}
				</div>
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/invoice'
				passHref
			>
				<div style={iconStyle}>
					<SlFolder /> {!collapsed && 'Invoice'}
				</div>
			</Nav.Link>
		</Nav>
	);
};

export default SideNavigation;
