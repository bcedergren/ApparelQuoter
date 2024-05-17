// Footer.tsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ChevronUp } from 'react-bootstrap-icons';
import styles from '@/styles/Footer.module.css'; // Adjust the import path as necessary

const Footer: React.FC = () => {
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	return (
		<footer className={styles.footerContainer}>
			<Container>
				<Row className='justify-content-center'>
					<Col
						lg={7}
						className='mb-3 text-center'
					>
						<div
							onClick={scrollToTop}
							className={styles.upArrow}
						>
							<ChevronUp size={30} />
						</div>
					</Col>
				</Row>
				<Row className='justify-content-center'>
					<Col
						lg={7}
						className='mb-3 text-center'
					>
						{' '}
						<h3>ApparelQuoter</h3>
						<p className={styles.footerText}>
							Launch your campaign and benefit from our expertise on designing
							and managing conversion centered bootstrap4 html page.
						</p>
						<ul className={styles.socialIcon}>
							{/* Social Icons */}
							<li className='list-inline-item'>
								<a
									href='#'
									className={styles.socialLink}
								>
									<i className='mdi mdi-facebook'></i>
								</a>
							</li>
							{/* Additional social icons */}
						</ul>
					</Col>
				</Row>
				<Row className='justify-content-center'>
					<Col
						xs={12}
						className='text-center'
					>
						<p className={styles.footerText}>
							© {new Date().getFullYear()}{' '}
							<span className='text-reset'>ApparelQuoter</span>. All rights
							reserved.
						</p>
					</Col>
				</Row>
			</Container>
		</footer>
	);
};

export default Footer;
