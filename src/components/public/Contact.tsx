// Contact.tsx
import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const Contact: React.FC = () => {
	return (
		<section className='contact-section py-5 bg-light'>
			<Container>
				<Row className='justify-content-center'>
					<Col lg={8}>
						<h2 className='text-center mb-4'>Get in touch!</h2>
						<p className='text-center mb-5'>
							Launch your campaign and benefit from our expertise on designing
							and managing conversion centered bootstrap4 html page.
						</p>
						<Form>
							<Row>
								<Col
									md={6}
									className='mb-3'
								>
									<Form.Group>
										<Form.Label>Your Name *</Form.Label>
										<Form.Control
											type='text'
											placeholder='First Name'
											required
										/>
									</Form.Group>
								</Col>
								<Col
									md={6}
									className='mb-3'
								>
									<Form.Group>
										<Form.Label>Your Email *</Form.Label>
										<Form.Control
											type='email'
											placeholder='Your email'
											required
										/>
									</Form.Group>
								</Col>
							</Row>
							<Form.Group className='mb-3'>
								<Form.Label>Subject</Form.Label>
								<Form.Control
									type='text'
									placeholder='Subject'
								/>
							</Form.Group>
							<Form.Group className='mb-4'>
								<Form.Label>Comments</Form.Label>
								<Form.Control
									as='textarea'
									rows={3}
									placeholder='Your Message'
								/>
							</Form.Group>
							<Button
								variant='primary'
								type='submit'
							>
								Send Message
							</Button>
						</Form>
					</Col>
				</Row>
			</Container>
		</section>
	);
};

export default Contact;
