import React, { ChangeEvent } from 'react';
import { Table, Form } from 'react-bootstrap';
import { ScreenPrinting } from '@/types/Price';
import styles from '@/styles/Pricing.module.css';

interface ScreenPrintingProps {
	screenPrintingData: ScreenPrinting;
	setScreenPrintingData: (data: ScreenPrinting) => void;
}

const ScreenPrintingComponent: React.FC<ScreenPrintingProps> = ({
	screenPrintingData,
	setScreenPrintingData,
}) => {
	const colors = Object.keys(screenPrintingData).filter(
		(key) => key !== 'perScreenNew' && key !== 'perScreenExisting'
	) as Array<keyof Omit<ScreenPrinting, 'perScreenNew' | 'perScreenExisting'>>;

	const handlePriceChange = (
		color: keyof Omit<ScreenPrinting, 'perScreenNew' | 'perScreenExisting'>,
		index: number,
		event: ChangeEvent<any>
	) => {
		const updatedPrices = [...screenPrintingData[color]];
		updatedPrices[index] = event.target.value;
		setScreenPrintingData({ ...screenPrintingData, [color]: updatedPrices });
	};

	const handleInputChange = (
		field: 'perScreenNew' | 'perScreenExisting',
		event: ChangeEvent<any>
	) => {
		setScreenPrintingData({
			...screenPrintingData,
			[field]: event.target.value,
		});
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
				{colors.map((color) => (
					<tr key={color}>
						<td>{color}</td>
						{screenPrintingData[color].map((price, columnIndex) => (
							<td key={columnIndex}>
								<div className='currency-input'>
									<span className='currency-symbol'>$</span>
									<Form.Control
										type='number'
										step='0.01'
										min='0.00'
										value={price || ''}
										onChange={(e) => handlePriceChange(color, columnIndex, e)}
									/>
								</div>
							</td>
						))}
					</tr>
				))}
				<tr>
					<td>Per Screen New</td>
					<td colSpan={7}>
						<div className='currency-input'>
							<span className='currency-symbol'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={screenPrintingData.perScreenNew || ''}
								onChange={(e) => handleInputChange('perScreenNew', e)}
							/>
						</div>
					</td>
				</tr>
				<tr>
					<td>Per Screen Existing</td>
					<td colSpan={7}>
						<div className='currency-input'>
							<span className='currency-symbol'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={screenPrintingData.perScreenExisting || ''}
								onChange={(e) => handleInputChange('perScreenExisting', e)}
							/>
						</div>
					</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default ScreenPrintingComponent;
