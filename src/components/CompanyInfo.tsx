import React from 'react';
import { Container, Row, Col, FormControl } from 'react-bootstrap';

const CompanyInfo: React.FC = () => {
	return (
		<Container className='mt-5 p-5 bg-white'>
			<Row className='border-bottom mb-4 pb-2'>
				<Col>
					<div className='text-sm'>COMPANY NAME</div>
					<FormControl
						type='text'
						defaultValue=''
						className='mb-2'
					/>
					<div className='text-sm'>FAX</div>
					<FormControl
						type='text'
						defaultValue=''
						className='mb-2'
					/>
				</Col>
				<Col>
					<div className='text-sm'>STREET ADDRESS</div>
					<FormControl
						type='text'
						defaultValue=''
						className='mb-2'
					/>
					<div className='text-sm'>EMAIL</div>
					<FormControl
						type='email'
						defaultValue=''
						className='mb-2'
					/>
				</Col>
				<Col>
					<div className='text-sm'>CITY, STATE, ZIP</div>
					<FormControl
						type='text'
						defaultValue=''
						className='mb-2'
					/>
					<div className='text-sm'>URL</div>
					<FormControl
						type='text'
						defaultValue=''
						className='mb-2'
					/>
				</Col>
				<Col>
					<div className='text-sm'>PHONE</div>
					<FormControl
						type='tel'
						defaultValue=''
						className='mb-2'
					/>
					<div className='text-sm'>PAYMENT METHODS</div>
					<FormControl
						type='text'
						defaultValue='Visa, Mastercard, Discover, Paypal'
						className='mb-2'
					/>
				</Col>
			</Row>
		</Container>
	);
};

export default CompanyInfo;
