// FeatureCard.tsx
import Image from 'next/image';
import React from 'react';
import { Col, Card } from 'react-bootstrap';

interface FeatureCardProps {
	icon: string;
	title: string;
	description: string;
	imgSrc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
	icon,
	title,
	description,
	imgSrc,
}) => {
	return (
		<Col
			lg={4}
			md={6}
			className='mt-4 pt-2'
		>
			<Card className='feature text-center border-0'>
				<Card.Body className='p-4'>
					<div className='icon text-primary mb-4'>
						<i className={`uim ${icon} fea icon-ex-md`}></i>
					</div>
					<Card.Title className='title text-dark'>{title}</Card.Title>
					<Card.Text className='text-muted'>{description}</Card.Text>
				</Card.Body>
				<Image
					src={imgSrc}
					alt=''
					className='img-fluid d-block mx-auto'
				/>
			</Card>
		</Col>
	);
};

export default FeatureCard;
