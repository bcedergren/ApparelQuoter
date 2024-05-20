import React, { FC, useState } from 'react';
import { Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { PrintingOptions } from '@/types/Quote';

interface PrintingOptionsProps {
	options: PrintingOptions;
	onOptionsChange: (options: PrintingOptions) => void;
}

const PrintingOptions: FC<PrintingOptionsProps> = ({
	options = {
		colorsFront: 0,
		colorsBack: 0,
		colorsLeftSleeve: 0,
		flashFront: false,
		dtgDarkFront: false,
		flashBack: false,
		dtgDarkBack: false,
		flashLeftSleeve: false,
		dtgDarkLeftSleeve: false,
		colorsRightSleeve: 0,
		flashRightSleeve: false,
		dtgDarkRightSleeve: false,
	},
	onOptionsChange,
}) => {
	const handleChange = (
		field: keyof PrintingOptions,
		value: number | boolean
	) => {
		onOptionsChange({
			...options,
			[field]: value,
		});
	};

	return (
		<div>
			<h6>SCREEN PRINTING, DTG & SUBLIMATION</h6>
			<Form>
				<Row>
					<Col>
						<InputGroup>
							<InputGroup.Text>Print Colors - Front</InputGroup.Text>
							<FormControl
								type='number'
								value={options.colorsFront}
								onChange={(e) =>
									handleChange('colorsFront', parseInt(e.target.value, 10))
								}
							/>
						</InputGroup>
					</Col>
				</Row>
				<Row>
					<Col>
						<InputGroup>
							<InputGroup.Checkbox
								checked={options.flashFront}
								onChange={(e) => handleChange('flashFront', e.target.checked)}
								aria-label='Flash Front'
							/>
							<InputGroup.Text>Flash</InputGroup.Text>
							<InputGroup.Checkbox
								checked={options.dtgDarkFront}
								onChange={(e) => handleChange('dtgDarkFront', e.target.checked)}
								aria-label='DTG Dark Front'
							/>
							<InputGroup.Text>DTG Dark</InputGroup.Text>
						</InputGroup>
					</Col>
				</Row>
				<Row>
					<Col>
						<InputGroup>
							<InputGroup.Text>Print Colors - Back</InputGroup.Text>
							<FormControl
								type='number'
								value={options.colorsBack}
								onChange={(e) =>
									handleChange('colorsBack', parseInt(e.target.value, 10))
								}
							/>
							<InputGroup.Checkbox
								checked={options.flashBack}
								onChange={(e) => handleChange('flashBack', e.target.checked)}
								aria-label='Flash Back'
							/>
							<InputGroup.Text>Flash</InputGroup.Text>
							<InputGroup.Checkbox
								checked={options.dtgDarkBack}
								onChange={(e) => handleChange('dtgDarkBack', e.target.checked)}
								aria-label='DTG Dark Back'
							/>
							<InputGroup.Text>DTG Dark</InputGroup.Text>
						</InputGroup>
					</Col>
					<Col>
						<InputGroup>
							<InputGroup.Text>Print Colors - Left Sleeve</InputGroup.Text>
							<FormControl
								type='number'
								value={options.colorsLeftSleeve}
								onChange={(e) =>
									handleChange('colorsLeftSleeve', parseInt(e.target.value, 10))
								}
							/>
							<InputGroup.Checkbox
								checked={options.flashLeftSleeve}
								onChange={(e) =>
									handleChange('flashLeftSleeve', e.target.checked)
								}
								aria-label='Flash Left Sleeve'
							/>
							<InputGroup.Text>Flash</InputGroup.Text>
							<InputGroup.Checkbox
								checked={options.dtgDarkLeftSleeve}
								onChange={(e) =>
									handleChange('dtgDarkLeftSleeve', e.target.checked)
								}
								aria-label='DTG Dark LeftSleeve'
							/>
							<InputGroup.Text>DTG Dark</InputGroup.Text>
						</InputGroup>
					</Col>
					<Col>
						<InputGroup>
							<InputGroup.Text>Print Colors - Right Sleeve</InputGroup.Text>
							<FormControl
								type='number'
								value={options.colorsRightSleeve}
								onChange={(e) =>
									handleChange(
										'colorsRightSleeve',
										parseInt(e.target.value, 10)
									)
								}
							/>
							<InputGroup.Checkbox
								checked={options.flashRightSleeve}
								onChange={(e) =>
									handleChange('flashRightSleeve', e.target.checked)
								}
								aria-label='Flash Right Sleeve'
							/>
							<InputGroup.Text>Flash</InputGroup.Text>
							<InputGroup.Checkbox
								checked={options.dtgDarkRightSleeve}
								onChange={(e) =>
									handleChange('dtgDarkRightSleeve', e.target.checked)
								}
								aria-label='DTG Dark Right Sleeve'
							/>
							<InputGroup.Text>DTG Dark</InputGroup.Text>
						</InputGroup>
					</Col>
				</Row>
			</Form>
		</div>
	);
};

export default PrintingOptions;
