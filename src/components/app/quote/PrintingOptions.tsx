import React, { FC } from 'react';
import { Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { PrintingOptions as PrintingOptionsType } from '@/types/Quote';

interface PrintingOptionsProps {
	options: PrintingOptionsType;
	onOptionsChange: (options: PrintingOptionsType) => void;
	printingLocations: string[];
}

const PrintingOptions: FC<PrintingOptionsProps> = ({
	options = {
		colorsFront: 0,
		colorsBack: 0,
		colorsLeft: 0,
		flashFront: false,
		dtgDarkFront: false,
		flashBack: false,
		dtgDarkBack: false,
		flashLeft: false,
		dtgDarkLeft: false,
		colorsRight: 0,
		flashRight: false,
		dtgDarkRight: false,
	},
	onOptionsChange,
	printingLocations,
}) => {
	const handleChange = (
		field: keyof PrintingOptionsType,
		value: number | boolean
	) => {
		onOptionsChange({
			...options,
			[field]: value,
		});
	};

	return (
		<div>
			<h6 className='standout-header'>Screen Printing Colors</h6>
			<Form>
				<Row>
					<Col>
						<InputGroup>
							<InputGroup.Text>
								Print Colors - {printingLocations[0]}
							</InputGroup.Text>
							<FormControl
								type='number'
								value={options.colorsFront}
								onChange={(e) =>
									handleChange('colorsFront', parseInt(e.target.value, 10))
								}
							/>
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
							<InputGroup.Text>
								Print Colors - {printingLocations[1]}
							</InputGroup.Text>
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
				</Row>
				<Row>
					<Col>
						<InputGroup>
							<InputGroup.Text>
								Print Colors - {printingLocations[2]}
							</InputGroup.Text>
							<FormControl
								type='number'
								value={options.colorsLeft}
								onChange={(e) =>
									handleChange('colorsLeft', parseInt(e.target.value, 10))
								}
							/>
							<InputGroup.Checkbox
								checked={options.flashLeft}
								onChange={(e) => handleChange('flashLeft', e.target.checked)}
								aria-label='Flash Left'
							/>
							<InputGroup.Text>Flash</InputGroup.Text>
							<InputGroup.Checkbox
								checked={options.dtgDarkLeft}
								onChange={(e) => handleChange('dtgDarkLeft', e.target.checked)}
								aria-label='DTG Dark Left'
							/>
							<InputGroup.Text>DTG Dark</InputGroup.Text>
						</InputGroup>
					</Col>
				</Row>
				<Row>
					<Col>
						<InputGroup>
							<InputGroup.Text>
								Print Colors - {printingLocations[3]}
							</InputGroup.Text>
							<FormControl
								type='number'
								value={options.colorsRight}
								onChange={(e) =>
									handleChange('colorsRight', parseInt(e.target.value, 10))
								}
							/>
							<InputGroup.Checkbox
								checked={options.flashRight}
								onChange={(e) => handleChange('flashRight', e.target.checked)}
								aria-label='Flash Right'
							/>
							<InputGroup.Text>Flash</InputGroup.Text>
							<InputGroup.Checkbox
								checked={options.dtgDarkRight}
								onChange={(e) => handleChange('dtgDarkRight', e.target.checked)}
								aria-label='DTG Dark Right'
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
