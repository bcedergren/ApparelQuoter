import React, { FC } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
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
			<h6>EMBROIDERY</h6>
			<Form>
				<Row>
					<Col>
						<Form.Group controlId='stitchesFront'>
							<Form.Label>Stitches - Front</Form.Label>
							<Form.Control
								type='number'
								value={
									embroideryDetails.stitchesFront != null
										? embroideryDetails.stitchesFront.toString()
										: ''
								}
								onChange={(e) => handleChange('stitchesFront', e.target.value)}
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Check
							type='checkbox'
							label='Hooping Fee - Front'
							checked={embroideryDetails.hoopingFeeFront}
							onChange={(e) =>
								handleChange('hoopingFeeFront', e.target.checked)
							}
						/>
					</Col>
					<Col>
						<Form.Group controlId='stitchesBack'>
							<Form.Label>Stitches - Back</Form.Label>
							<Form.Control
								type='number'
								value={
									embroideryDetails.stitchesBack != null
										? embroideryDetails.stitchesBack.toString()
										: ''
								}
								onChange={(e) => handleChange('stitchesBack', e.target.value)}
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Check
							type='checkbox'
							label='Hooping Fee - Back'
							checked={embroideryDetails.hoopingFeeBack}
							onChange={(e) => handleChange('hoopingFeeBack', e.target.checked)}
						/>
					</Col>
					<Col>
						<Form.Group controlId='stitchesLeft'>
							<Form.Label>Stitches - Left Sleeve</Form.Label>
							<Form.Control
								type='number'
								value={embroideryDetails.stitchesLeftSleeve}
								onChange={(e) =>
									handleChange('stitchesLeftSleeve', e.target.value)
								}
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Check
							type='checkbox'
							label='Hooping Fee - Left'
							checked={embroideryDetails.hoopingFeeLeftSleeve}
							onChange={(e) =>
								handleChange('hoopingFeeLeftSleeve', e.target.checked)
							}
						/>
					</Col>
					<Col>
						<Form.Group controlId='stitchesRight'>
							<Form.Label>Stitches - Right Sleeve</Form.Label>
							<Form.Control
								type='number'
								value={embroideryDetails.stitchesRightSleeve}
								onChange={(e) =>
									handleChange('stitchesRightSleeve', e.target.value)
								}
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Check
							type='checkbox'
							label='Hooping Fee - Right'
							checked={embroideryDetails.hoopingFeeRightSleeve}
							onChange={(e) =>
								handleChange('hoopingFeeRightSleeve', e.target.checked)
							}
						/>
					</Col>
				</Row>
				<Row>
					<Col>
						<Form.Group controlId='oneTimeSetupFee'>
							<Form.Label>One-time Embroidery Setup Fee</Form.Label>
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									value={embroideryDetails.setupFee}
									onChange={(e) => handleChange('setupFee', e.target.value)}
								/>
							</div>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='oneTimeArtworkFee'>
							<Form.Label>One-time Embroidery Artwork Fee</Form.Label>
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									value={embroideryDetails.artworkFee}
									onChange={(e) => handleChange('artworkFee', e.target.value)}
								/>
							</div>
						</Form.Group>
					</Col>
				</Row>
			</Form>
		</div>
	);
};

export default EmbroideryOptions;
