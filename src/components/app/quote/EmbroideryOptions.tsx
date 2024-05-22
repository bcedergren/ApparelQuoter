import React, { FC } from 'react';
import { Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { EmbroideryDetails } from '@/types/Quote';

interface EmbroideryOptionsProps {
	embroideryDetails: EmbroideryDetails;
	onEmbroideryDetailsChange: (details: EmbroideryDetails) => void;
}

const EmbroideryOptions: FC<EmbroideryOptionsProps> = ({
	embroideryDetails = {
		stitchesFront: 0,
		stitchesBack: 0,
		hoopingFeeFront: false,
		hoopingFeeBack: false,
		stitchesLeftSleeve: 0,
		hoopingFeeLeftSleeve: false,
		stitchesRightSleeve: 0,
		hoopingFeeRightSleeve: false,
		digitizingCost: 0,
		setupFee: 0,
		artworkFee: 0,
	},
	onEmbroideryDetailsChange,
}) => {
	const handleChange = (field: keyof EmbroideryDetails, value: any) => {
		const updatedDetails = { ...embroideryDetails, [field]: value };
		onEmbroideryDetailsChange(updatedDetails);
	};

	return (
		<div>
			<h6 className='standout-header'>Embroidery</h6>
			<Form>
				<Row>
					<Col md={6}>
						<Form.Group controlId='stitchesFront'>
							<Form.Label>Stitches - Front</Form.Label>
							<InputGroup>
								<FormControl
									type='number'
									value={
										embroideryDetails.stitchesFront != null
											? embroideryDetails.stitchesFront.toString()
											: ''
									}
									onChange={(e) =>
										handleChange('stitchesFront', e.target.value)
									}
								/>
								<InputGroup.Checkbox
									checked={embroideryDetails.hoopingFeeFront}
									onChange={(e) =>
										handleChange('hoopingFeeFront', e.target.checked)
									}
									aria-label='Hooping Fee Front'
								/>
								<InputGroup.Text>Hooping Fee</InputGroup.Text>
							</InputGroup>
						</Form.Group>
					</Col>
					<Col md={6}>
						<Form.Group controlId='oneTimeSetupFee'>
							<Form.Label>One-time Embroidery Setup Fee</Form.Label>
							<InputGroup>
								<InputGroup.Text>$</InputGroup.Text>
								<FormControl
									type='number'
									value={embroideryDetails.setupFee}
									onChange={(e) => handleChange('setupFee', e.target.value)}
								/>
							</InputGroup>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col md={6}>
						<Form.Group controlId='stitchesBack'>
							<Form.Label>Stitches - Back</Form.Label>
							<InputGroup>
								<FormControl
									type='number'
									value={
										embroideryDetails.stitchesBack != null
											? embroideryDetails.stitchesBack.toString()
											: ''
									}
									onChange={(e) => handleChange('stitchesBack', e.target.value)}
								/>
								<InputGroup.Checkbox
									checked={embroideryDetails.hoopingFeeBack}
									onChange={(e) =>
										handleChange('hoopingFeeBack', e.target.checked)
									}
									aria-label='Hooping Fee Back'
								/>
								<InputGroup.Text>Hooping Fee</InputGroup.Text>
							</InputGroup>
						</Form.Group>
					</Col>
					<Col md={6}>
						<Form.Group controlId='oneTimeArtworkFee'>
							<Form.Label>One-time Embroidery Artwork Fee</Form.Label>
							<InputGroup>
								<InputGroup.Text>$</InputGroup.Text>
								<FormControl
									type='number'
									value={embroideryDetails.artworkFee}
									onChange={(e) => handleChange('artworkFee', e.target.value)}
								/>
							</InputGroup>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col md={6}>
						<Form.Group controlId='stitchesLeftSleeve'>
							<Form.Label>Stitches - Left Sleeve</Form.Label>
							<InputGroup>
								<FormControl
									type='number'
									value={
										embroideryDetails.stitchesLeftSleeve != null
											? embroideryDetails.stitchesLeftSleeve.toString()
											: ''
									}
									onChange={(e) =>
										handleChange('stitchesLeftSleeve', e.target.value)
									}
								/>
								<InputGroup.Checkbox
									checked={embroideryDetails.hoopingFeeLeftSleeve}
									onChange={(e) =>
										handleChange('hoopingFeeLeftSleeve', e.target.checked)
									}
									aria-label='Hooping Fee Left Sleeve'
								/>
								<InputGroup.Text>Hooping Fee</InputGroup.Text>
							</InputGroup>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col md={6}>
						<Form.Group controlId='stitchesRightSleeve'>
							<Form.Label>Stitches - Right Sleeve</Form.Label>
							<InputGroup>
								<FormControl
									type='number'
									value={
										embroideryDetails.stitchesRightSleeve != null
											? embroideryDetails.stitchesRightSleeve.toString()
											: ''
									}
									onChange={(e) =>
										handleChange('stitchesRightSleeve', e.target.value)
									}
								/>
								<InputGroup.Checkbox
									checked={embroideryDetails.hoopingFeeRightSleeve}
									onChange={(e) =>
										handleChange('hoopingFeeRightSleeve', e.target.checked)
									}
									aria-label='Hooping Fee Right Sleeve'
								/>
								<InputGroup.Text>Hooping Fee</InputGroup.Text>
							</InputGroup>
						</Form.Group>
					</Col>
				</Row>
			</Form>
		</div>
	);
};

export default EmbroideryOptions;
