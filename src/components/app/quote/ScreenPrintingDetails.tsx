import React, { FC } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ScreenPrintingDetails as ScreenPrintingDetailsType } from '@/types/Quote';

interface ScreenPrintingDetailsProps {
	details: ScreenPrintingDetailsType;
	onDetailsChange: (updatedDetails: ScreenPrintingDetailsType) => void;
}

const ScreenPrintingDetails: FC<ScreenPrintingDetailsProps> = ({
	details = { newScreensNeeded: false, additionalScreens: 0, colorChanges: 0 },
	onDetailsChange,
}) => {
	const handleChange = (
		field: keyof ScreenPrintingDetailsType,
		value: string | number | boolean
	) => {
		onDetailsChange({
			...details,
			[field]: value,
		});
	};

	return (
		<>
			<h6 className='standout-header'>Screen Printing Details</h6>
			<Form>
				<Row>
					<Col>
						<Form.Group controlId='newScreensNeeded'>
							<Form.Label>New Screens Needed?</Form.Label>
							<Form.Select
								value={details.newScreensNeeded ? 'Yes' : 'No'}
								onChange={(e) => {
									const value = e.target.value === 'Yes';
									handleChange('newScreensNeeded', value);
								}}
							>
								<option value='No'>No</option>
								<option value='Yes'>Yes</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='additionalScreens'>
							<Form.Label>No. of Additional New Screens</Form.Label>
							<Form.Control
								type='number'
								value={details.additionalScreens}
								onChange={(e) =>
									handleChange(
										'additionalScreens',
										parseInt(e.target.value, 10)
									)
								}
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='colorChanges'>
							<Form.Label>No. of Color Changes</Form.Label>
							<Form.Control
								type='number'
								value={details.colorChanges}
								onChange={(e) =>
									handleChange('colorChanges', parseInt(e.target.value, 10))
								}
							/>
						</Form.Group>
					</Col>
				</Row>
			</Form>
		</>
	);
};

export default ScreenPrintingDetails;
