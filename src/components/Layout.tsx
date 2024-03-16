import { ReactNode, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import SideNavigation from './SideNavigation';

type LayoutProps = {
	children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
	const { data: session } = useSession();
	const [collapsed, setCollapsed] = useState(false); // State to manage sidebar collapse

	return (
		<Container fluid>
			<Row>
				{session && (
					<Col
						xs={collapsed ? 1 : 3} // Adjust width when collapsed
						md={collapsed ? 1 : 2}
						lg={collapsed ? 1 : 2}
						className='d-none d-md-block bg-light'
					>
						<SideNavigation
							collapsed={collapsed}
							setCollapsed={setCollapsed}
						/>
					</Col>
				)}
				<Col
					xs={collapsed ? 11 : 9} // Adjust main content width based on collapsed state
					md={collapsed ? 11 : 10}
					lg={collapsed ? 11 : 10}
				>
					{session && (
						<div>
							<Header />
						</div>
					)}
					<div>{children}</div>
				</Col>
			</Row>
		</Container>
	);
};

export default Layout;
