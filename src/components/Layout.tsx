import { ReactNode } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import SideNavigation from './SideNavigation';

type LayoutProps = {
	children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
	const { data: session } = useSession();

	return (
		<Container fluid>
			<Row>
				{session && (
					<Col
						xs={3}
						md={2}
						lg={2}
						className='d-none d-md-block'
					>
						<SideNavigation />
					</Col>
				)}
				<Col
					xs={12}
					md={session ? 10 : 12}
					lg={session ? 10 : 12}
				>
					{children}
				</Col>
			</Row>
		</Container>
	);
};

export default Layout;
