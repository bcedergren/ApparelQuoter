import React, { FC } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

import { PrintingDetails as PrintingDetailsType } from '@/types/Quote';

interface PrintingDetailsProps {
	details: PrintingDetailsType;
	onDetailsChange: (details: PrintingDetailsType) => void; // Prop to handle changes
}

const PrintingDetails: FC<PrintingDetailsProps> = ({
	details = {
		colorMatches: 0,
		inkType: '',
		artworkNeeded: false,
		deliveryDueDays: 0,
		deliveryDueDate: new Date(),
	},
	onDetailsChange,
}) => {
	const handleChange = (
		field: keyof PrintingDetailsType,
		value: string | number | boolean | Date
	) => {
		onDetailsChange({
			...details,
			[field]: value,
		});
	};

	return (
		<div>
			<h6 className='standout-header'>Printing Details</h6>
			<Form>
				<Row>
					<Col
						xs={6}
						md={3}
					>
						<Form.Group controlId='colorMatches'>
							<Form.Label>No. of Color Matches</Form.Label>
							<Form.Control
								type='number'
								value={details.colorMatches}
								onChange={(e) =>
									handleChange('colorMatches', parseInt(e.target.value))
								}
							/>
						</Form.Group>
					</Col>
					<Col
						xs={6}
						md={3}
					>
						{/* <Form.Group controlId='inkType'>
							<Form.Label>Puff or Glitter Ink?</Form.Label>
							<Form.Select
								value={details.inkType}
								onChange={(e) => handleChange('inkType', e.target.value)}
							>
								<option value='No'>No</option>
								<option value='Yes'>Yes</option>
							</Form.Select>
						</Form.Group> */}
					</Col>
					<Col
						xs={6}
						md={3}
					>
						<Form.Group controlId='artworkNeeded'>
							<Form.Label>Artwork Needed?</Form.Label>
							<Form.Select
								value={details.artworkNeeded ? 'Yes' : 'No'}
								onChange={(e) =>
									handleChange('artworkNeeded', e.target.value === 'Yes')
								}
							>
								<option value='No'>No</option>
								<option value='Yes'>Yes</option>
							</Form.Select>
						</Form.Group>
					</Col>
				</Row>
			</Form>
		</div>
	);
};

export default PrintingDetails;
