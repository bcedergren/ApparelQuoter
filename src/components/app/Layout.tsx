import { ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/app/Header';
import { useRouter } from 'next/router';
import SideNavigation from './SideNavigation';
import styles from '@/styles/Layout.module.css';
import Footer from './Footer';
import { useSidebar } from '@/context/SidebarContext';
import SidebarToggle from '@/components/app/SidebarToggle';


type LayoutProps = {
	children: ReactNode;
};

const MOBILE_DRAWER_WIDTH = 280;
const MOBILE_TOGGLE_WIDTH = 36;

const Layout = ({ children }: LayoutProps) => {
	const { data: session, status } = useSession();
	const { collapsed, toggleCollapse } = useSidebar();
	const [isMobile, setIsMobile] = useState(false);
	const [showSidebar, setShowSidebar] = useState(false);

	const router = useRouter();

	useEffect(() => {
		// Redirect to login if session is null
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

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
							setCollapsed={(value: boolean) => {
								if (value !== collapsed) {
									toggleCollapse();
								}
							}}
							isMobile={isMobile}
							setShowSidebar={setShowSidebar}
						/>
					</aside>
					{isMobile && (
						<SidebarToggle
							open={showSidebar}
							onToggle={setShowSidebar}
							mobileDrawerWidth={MOBILE_DRAWER_WIDTH}
							ariaLabel={showSidebar ? 'Close sidebar navigation' : 'Open sidebar navigation'}
						/>
					)}
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
				style={isMobile && !showSidebar ? { marginLeft: `${MOBILE_TOGGLE_WIDTH}px` } : undefined}
			>
				{session && <Header />}
				<div className={styles.content}>{children}</div>
				<Footer isCollapsed={collapsed} />
			</main>
		</div>
	);
};

export default Layout;
