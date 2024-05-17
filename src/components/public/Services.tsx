// Services.jsx
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import styles from '@/styles/Services.module.css';

const Services = () => {
	return (
		<section className={styles.servicesSection}>
			<div className='container'>
				<Row>
					<Col
						lg={3}
						md={6}
					>
						<Card className={`text-center ${styles.serviceCard}`}>
							<Card.Body>
								<div className={`icon mb-3 ${styles.cardIcon}`}>
									<i className='mdi mdi-airplay fea icon-ex-md'></i>
								</div>
								<Card.Title className={styles.cardTitle}>
									Consultancy
								</Card.Title>
							</Card.Body>
						</Card>
					</Col>
					<Col
						lg={3}
						md={6}
					>
						<Card className={`text-center ${styles.serviceCard}`}>
							<Card.Body>
								<div className={`icon mb-3 ${styles.cardIcon}`}>
									<i className='mdi mdi-feather fea icon-ex-md'></i>
								</div>
								<Card.Title className={styles.cardTitle}>
									UI/UX Design
								</Card.Title>
							</Card.Body>
						</Card>
					</Col>
					<Col
						lg={3}
						md={6}
					>
						<Card className={`text-center ${styles.serviceCard}`}>
							<Card.Body>
								<div className={`icon mb-3 ${styles.cardIcon}`}>
									<i className='mdi mdi-code fea icon-ex-md'></i>
								</div>
								<Card.Title className={styles.cardTitle}>
									Smart Coding
								</Card.Title>
							</Card.Body>
						</Card>
					</Col>
					<Col
						lg={3}
						md={6}
					>
						<Card className={`text-center ${styles.serviceCard}`}>
							<Card.Body>
								<div className={`icon mb-3 ${styles.cardIcon}`}>
									<i className='mdi mdi-mail fea icon-ex-md'></i>
								</div>
								<Card.Title className={styles.cardTitle}>
									Fast Support
								</Card.Title>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</div>
		</section>
	);
};

export default Services;
