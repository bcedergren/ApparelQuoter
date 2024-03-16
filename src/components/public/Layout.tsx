import { ReactNode } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PublicHeader from './Header';
import Footer from './Footer';

type LayoutProps = {
	children: ReactNode;
};

const PublicLayout = ({ children }: LayoutProps) => {
	return (
		<Container fluid>
			<PublicHeader />
			<div>{children}</div>
			<Footer />
		</Container>
	);
};

export default PublicLayout;
