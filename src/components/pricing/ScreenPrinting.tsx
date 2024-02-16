import React, { ChangeEvent } from 'react';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

type ScreenPrintingPrices = {
	'1 color': string[];
	'2 colors': string[];
	'3 colors': string[];
	'4 colors': string[];
	'5 colors': string[];
	'6 colors': string[];
	'7 colors': string[];
	'8 colors': string[];
	'9 colors': string[];
	'10 colors': string[];
	'11 colors': string[];
	'12 colors': string[];
};

interface ScreenPrintingProps {
	screenPrintingData: ScreenPrintingPrices;
	setScreenPrintingData: (data: ScreenPrintingPrices) => void;
}

const ScreenPrinting: React.FC<ScreenPrintingProps> = ({
	screenPrintingData,
	setScreenPrintingData,
}) => {
	const colors = Object.keys(screenPrintingData) as Array<
		keyof ScreenPrintingPrices
	>;

	const handlePriceChange = (
		color: keyof ScreenPrintingPrices,
		index: number,
		event: ChangeEvent<any>
	) => {
		const updatedPrices = { ...screenPrintingData };
		updatedPrices[color][index] = event.target.value;
		setScreenPrintingData(updatedPrices);
	};

	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th colSpan={8}>Screen Printing</th>
				</tr>
				<tr>
					<th>Colors</th>
					<th>1 - 12</th>
					<th>13 - 24</th>
					<th>25 - 74</th>
					<th>75 - 149</th>
					<th>150 - 299</th>
					<th>300 - 499</th>
					<th>500 - 2500</th>
				</tr>
			</thead>
			<tbody>
				{colors.map((color, rowIndex) => (
					<tr key={color}>
						<td>{color}</td>
						{screenPrintingData[color].map((price, columnIndex) => (
							<td key={columnIndex}>
								<Form.Control
									type='text'
									value={price}
									onChange={(e) => handlePriceChange(color, columnIndex, e)}
								/>
							</td>
						))}
					</tr>
				))}
			</tbody>
		</Table>
	);
};

export default ScreenPrinting;
