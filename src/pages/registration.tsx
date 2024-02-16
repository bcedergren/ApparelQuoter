import React, { useState } from 'react';
import { Form, Button, Col, Row, Container } from 'react-bootstrap';

const RegistrationForm: React.FC = () => {
	const [email, setEmail] = useState('');
	const [selectedPlan, setSelectedPlan] = useState('');

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// Implementation for form submission to your API
	};

	return (
		<Container>
			<Row className='justify-content-md-center'>
				<Col md='6'>
					<Form onSubmit={handleSubmit}>
						<Form.Group controlId='formBasicEmail'>
							<Form.Label>Email address</Form.Label>
							<Form.Control
								type='email'
								placeholder='Enter email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</Form.Group>

						<fieldset>
							<Form.Group as={Row}>
								<Form.Label
									as='legend'
									column
									sm={2}
								>
									Plan
								</Form.Label>
								<Col sm={10}>
									<Form.Check
										type='radio'
										label='Basic Plan'
										name='planRadios'
										id='planBasic'
										value='plan_basic'
										onChange={(e) => setSelectedPlan(e.target.value)}
										required
									/>
									<Form.Check
										type='radio'
										label='Premium Plan'
										name='planRadios'
										id='planPremium'
										value='plan_premium'
										onChange={(e) => setSelectedPlan(e.target.value)}
										required
									/>
								</Col>
							</Form.Group>
						</fieldset>

						<Button
							variant='primary'
							type='submit'
						>
							Register
						</Button>
					</Form>
				</Col>
			</Row>
		</Container>
	);
};

export default RegistrationForm;
