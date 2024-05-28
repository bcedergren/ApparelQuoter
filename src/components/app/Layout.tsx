import { ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/app/Header';
import SideNavigation from './SideNavigation';
import styles from '@/styles/Layout.module.css';
import Footer from './Footer';

type LayoutProps = {
	children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
	const { data: session } = useSession();
	const [collapsed, setCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [showSidebar, setShowSidebar] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		window.addEventListener('resize', handleResize);
		handleResize(); // Call initially to set the state based on current window size

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className={styles.layoutContainer}>
			{session && (
				<>
					<aside
						className={`${styles.sideNav} ${
							collapsed ? styles.collapsed : ''
						} ${isMobile && showSidebar ? styles.mobileOpen : ''}`}
					>
						<SideNavigation
							collapsed={collapsed}
							setCollapsed={setCollapsed}
							isMobile={isMobile}
							setShowSidebar={setShowSidebar}
						/>
					</aside>
					{isMobile && showSidebar && (
						<div
							className={styles.overlay}
							onClick={() => setShowSidebar(false)}
						></div>
					)}
				</>
			)}
			<main
				className={`${styles.mainContent} ${collapsed ? styles.expanded : ''} ${
					isMobile ? styles.mobileContent : ''
				}`}
			>
				{session && <Header />}
				<div className={styles.content}>{children}</div>
				<Footer isCollapsed={collapsed} />
			</main>
		</div>
	);
};

export default Layout;
