import { ReactNode, useState } from 'react';
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

	return (
		<div className={styles.layoutContainer}>
			{session && (
				<aside
					className={`${styles.sideNav} ${collapsed ? styles.collapsed : ''}`}
				>
					<SideNavigation
						collapsed={collapsed}
						setCollapsed={setCollapsed}
					/>
				</aside>
			)}
			<main
				className={`${styles.mainContent} ${collapsed ? styles.expanded : ''}`}
			>
				{session && <Header />}
				<div className={styles.content}>{children}</div>
				<Footer isCollapsed={collapsed} />
			</main>
		</div>
	);
};

export default Layout;
