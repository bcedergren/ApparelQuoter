import React, { FC, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { VinylDetails as VinylDetailsType } from '@/types/Quote';

interface VinylDetailsProps {
	details: VinylDetailsType;
	onDetailsChange: (updatedDetails: VinylDetailsType) => void;
}

const VinylDetails: FC<VinylDetailsProps> = ({
	details = { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
	onDetailsChange,
}) => {
	const handleChange = (field: keyof VinylDetailsType, value: string) => {
		const numericValue = Number(value); // Convert the input value to a number
		if (!isNaN(numericValue)) {
			// Check if the converted value is a valid number
			onDetailsChange({
				...details,
				[field]: numericValue, // Update the field with the numeric value
			});
		} else {
			// Handle the case where the input value is not a valid number
			// For example, you might want to reset the field to 0 or keep the existing value
			onDetailsChange({
				...details,
				[field]: 0, // Reset the field to 0 or some default value
			});
		}
	};

	return (
		<div>
			<h6 className='standout-header'>Vinyl</h6>
			<Form>
				<Row>
					<Col>
						<Form.Group>
							<Form.Label>Vinyl Names - Front</Form.Label>
							<Form.Control
								type='number'
								value={
									details.namesFront != null
										? details.namesFront.toString()
										: ''
								}
								onChange={(e) => handleChange('namesFront', e.target.value)}
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group>
							<Form.Label>Vinyl Names - Back</Form.Label>
							<Form.Control
								type='number'
								value={
									details.namesBack != null ? details.namesBack.toString() : ''
								}
								onChange={(e) => handleChange('namesBack', e.target.value)}
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col>
						<Form.Group>
							<Form.Label>Vinyl Numbers - Front</Form.Label>
							<Form.Control
								type='number'
								value={
									details.numbersFront != null
										? details.numbersFront.toString()
										: ''
								}
								onChange={(e) => handleChange('numbersFront', e.target.value)}
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group>
							<Form.Label>Vinyl Numbers - Back</Form.Label>
							<Form.Control
								type='number'
								value={
									details.numbersBack != null
										? details.numbersBack.toString()
										: ''
								}
								onChange={(e) => handleChange('numbersBack', e.target.value)}
							/>
						</Form.Group>
					</Col>
				</Row>
			</Form>
		</div>
	);
};

export default VinylDetails;
