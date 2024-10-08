import React, { FC, useEffect, useRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import {
	PrintingDetails as PrintingDetailsType,
	ScreenPrintingDetails as ScreenPrintingDetailsType,
	PrintingOptions,
} from '@/types/Quote';

interface PrintingDetailsProps {
	printingDetails: PrintingDetailsType;
	screenPrintingDetails: ScreenPrintingDetailsType;
	printingOptions: PrintingOptions;
	onDetailsChange: (updatedDetails: {
		printingDetails: PrintingDetailsType;
		screenPrintingDetails: ScreenPrintingDetailsType;
	}) => void;
}

const PrintingDetails: FC<PrintingDetailsProps> = ({
	printingDetails,
	screenPrintingDetails,
	printingOptions,
	onDetailsChange,
}) => {
	const initialRender = useRef(true);

	useEffect(() => {
		if (initialRender.current) {
			initialRender.current = false;
			return; // Skip the first render to prevent unnecessary updates
		}

		const calculateColorChanges = () => {
			let colorChangeCount = 0;

			const locations = [
				'colorsFront',
				'colorsBack',
				'colorsLeft',
				'colorsRight',
			] as const;

			const uniqueColors = new Set<number>();
			locations.forEach((location) => {
				const colorCount = printingOptions[location];
				if (colorCount > 0) {
					uniqueColors.add(colorCount);
				}
			});

			colorChangeCount = uniqueColors.size - 1;

			// Only update if the color changes value is different
			if (screenPrintingDetails.colorChanges !== colorChangeCount) {
				onDetailsChange({
					printingDetails,
					screenPrintingDetails: {
						...screenPrintingDetails,
						colorChanges: colorChangeCount >= 0 ? colorChangeCount : 0,
					},
				});
			}
		};

		calculateColorChanges();
	}, [printingOptions]);

	const handlePrintingDetailsChange = <K extends keyof PrintingDetailsType>(
		field: K,
		value: PrintingDetailsType[K]
	) => {
		const updatedDetails = {
			printingDetails: { ...printingDetails, [field]: value },
			screenPrintingDetails: { ...screenPrintingDetails },
		};
		onDetailsChange(updatedDetails);
	};

	const handleScreenPrintingDetailsChange = <
		K extends keyof ScreenPrintingDetailsType
	>(
		field: K,
		value: ScreenPrintingDetailsType[K]
	) => {
		const updatedDetails = {
			printingDetails: { ...printingDetails },
			screenPrintingDetails: { ...screenPrintingDetails, [field]: value },
		};
		onDetailsChange(updatedDetails);
	};

	return (
		<>
			<h6 className='standout-header'>Printing Details</h6>
			<Form>
				<Row>
					<Col
						xs={6}
						md={4}
					>
						<Form.Group controlId='colorMatches'>
							<Form.Label>No. of Color Matches</Form.Label>
							<Form.Control
								type='number'
								min={0}
								value={printingDetails.colorMatches}
								onChange={(e) =>
									handlePrintingDetailsChange(
										'colorMatches',
										parseInt(e.target.value)
									)
								}
							/>
						</Form.Group>
					</Col>
					<Col
						xs={6}
						md={4}
					>
						<Form.Group controlId='artworkNeeded'>
							<Form.Label>Artwork Needed?</Form.Label>
							<Form.Select
								value={printingDetails.artworkNeeded ? 'Yes' : 'No'}
								onChange={(e) =>
									handlePrintingDetailsChange(
										'artworkNeeded',
										e.target.value === 'Yes'
									)
								}
							>
								<option value='No'>No</option>
								<option value='Yes'>Yes</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col
						xs={6}
						md={4}
					>
						<Form.Group controlId='additionalScreens'>
							<Form.Label>No. of New Screens</Form.Label>
							<Form.Control
								type='number'
								min={0}
								value={screenPrintingDetails.additionalScreens || 0}
								onChange={(e) =>
									handleScreenPrintingDetailsChange(
										'additionalScreens',
										parseInt(e.target.value, 10)
									)
								}
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col
						xs={6}
						md={4}
					>
						<Form.Group controlId='colorChanges'>
							<Form.Label>No. of Color Changes</Form.Label>
							<Form.Control
								type='number'
								min={0}
								value={screenPrintingDetails.colorChanges || 0}
								onChange={(e) =>
									handleScreenPrintingDetailsChange(
										'colorChanges',
										parseInt(e.target.value, 10)
									)
								}
							/>
						</Form.Group>
					</Col>
					<Col
						xs={6}
						md={4}
					>
						<Form.Group controlId='existingScreens'>
							<Form.Label>No. of Existing Screens</Form.Label>
							<Form.Control
								type='number'
								min={0}
								value={screenPrintingDetails.existingScreens || 0}
								onChange={(e) =>
									handleScreenPrintingDetailsChange(
										'existingScreens',
										parseInt(e.target.value, 10)
									)
								}
							/>
						</Form.Group>
					</Col>
					<Col
						xs={6}
						md={4}
					>
						<Form.Group controlId='inkType'>
							<Form.Label>Ink Type</Form.Label>
							<Form.Select
								value={screenPrintingDetails.inkType || 'None'}
								onChange={(e) =>
									handleScreenPrintingDetailsChange('inkType', e.target.value)
								}
							>
								<option value='Standard'>Standard</option>
								<option value='Puff'>Puff</option>
								<option value='Glitter'>Glitter</option>
							</Form.Select>
						</Form.Group>
					</Col>
				</Row>
			</Form>
		</>
	);
};

export default PrintingDetails;
