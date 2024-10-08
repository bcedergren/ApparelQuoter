import React, { FC } from 'react';
import { Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { EmbroideryDetails } from '@/types/Quote';

interface EmbroideryOptionsProps {
	embroideryDetails: EmbroideryDetails;
	onEmbroideryDetailsChange: (details: EmbroideryDetails) => void;
	printingLocations: string[];
}

const EmbroideryOptions: FC<EmbroideryOptionsProps> = ({
	embroideryDetails = {
		stitchesFront: 0,
		stitchesBack: 0,
		hoopingFeeFront: false,
		hoopingFeeBack: false,
		stitchesLeft: 0,
		hoopingFeeLeft: false,
		stitchesRight: 0,
		hoopingFeeRight: false,
		digitizingCost: 0,
		setupFee: 0,
		artworkFee: 0,
	},
	onEmbroideryDetailsChange,
	printingLocations,
}) => {
	const handleChange = (field: keyof EmbroideryDetails, value: any) => {
		const updatedDetails = { ...embroideryDetails, [field]: value };
		onEmbroideryDetailsChange(updatedDetails);
	};

	const getLabel = (index: number, defaultLabel: string) => {
		const location = printingLocations[index];
		return location ? `Stitches - ${location}` : defaultLabel;
	};

	return (
		<div>
			<h6 className='standout-header'>Embroidery</h6>
			<Form>
				<Row>
					<Col md={6}>
						<Form.Group controlId='stitchesFront'>
							<Form.Label>{getLabel(0, 'Stitches - Front')}</Form.Label>
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
							<Form.Label>{getLabel(1, 'Stitches - Back')}</Form.Label>
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
						<Form.Group controlId='stitchesLeft'>
							<Form.Label>{getLabel(2, 'Stitches - Left')}</Form.Label>
							<InputGroup>
								<FormControl
									type='number'
									value={
										embroideryDetails.stitchesLeft != null
											? embroideryDetails.stitchesLeft.toString()
											: ''
									}
									onChange={(e) => handleChange('stitchesLeft', e.target.value)}
								/>
								<InputGroup.Checkbox
									checked={embroideryDetails.hoopingFeeLeft}
									onChange={(e) =>
										handleChange('hoopingFeeLeft', e.target.checked)
									}
									aria-label='Hooping Fee Left'
								/>
								<InputGroup.Text>Hooping Fee</InputGroup.Text>
							</InputGroup>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col md={6}>
						<Form.Group controlId='stitchesRight'>
							<Form.Label>{getLabel(3, 'Stitches - Right')}</Form.Label>
							<InputGroup>
								<FormControl
									type='number'
									value={
										embroideryDetails.stitchesRight != null
											? embroideryDetails.stitchesRight.toString()
											: ''
									}
									onChange={(e) =>
										handleChange('stitchesRight', e.target.value)
									}
								/>
								<InputGroup.Checkbox
									checked={embroideryDetails.hoopingFeeRight}
									onChange={(e) =>
										handleChange('hoopingFeeRight', e.target.checked)
									}
									aria-label='Hooping Fee Right'
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
