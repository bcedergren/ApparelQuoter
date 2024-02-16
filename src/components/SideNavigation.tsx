import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Nav } from 'react-bootstrap';
import {
	FaTag,
	FaUsers,
	FaSave,
	FaReceipt,
	FaClipboardList,
	FaRegListAlt,
	FaFileInvoice,
	FaQuoteRight,
	FaBars,
} from 'react-icons/fa';

import logo from '@/../public/logo.png'; // Make sure the path is correct for your project structure

const SideNavigation = () => {
	const [collapsed, setCollapsed] = useState(false);

	const toggleCollapse = () => setCollapsed(!collapsed);

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
				{!collapsed && <h3>Apparel Quoter</h3>}
				<FaBars
					onClick={toggleCollapse}
					style={{ cursor: 'pointer', marginTop: collapsed ? '10px' : '0px' }}
				/>
			</div>
			<Nav.Link
				as={Link}
				href='/prices'
				passHref
			>
				<FaTag /> {!collapsed && 'Prices'}
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/customers'
				passHref
			>
				<FaUsers /> {!collapsed && 'Customers'}
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/saved-orders'
				passHref
			>
				<FaSave /> {!collapsed && 'Saved Orders'}
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/saved-quotes'
				passHref
			>
				<FaSave /> {!collapsed && 'Saved Quotes'}
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/receipt'
				passHref
			>
				<FaReceipt /> {!collapsed && 'Receipt'}
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/completed-orders'
				passHref
			>
				<FaClipboardList /> {!collapsed && 'Completed Orders'}
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/open-orders'
				passHref
			>
				<FaRegListAlt /> {!collapsed && 'Open Orders'}
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/invoice'
				passHref
			>
				<FaFileInvoice /> {!collapsed && 'Invoice'}
			</Nav.Link>
			<Nav.Link
				as={Link}
				href='/quote'
				passHref
			>
				<FaQuoteRight /> {!collapsed && 'Quote'}
			</Nav.Link>
		</Nav>
	);
};

export default SideNavigation;
