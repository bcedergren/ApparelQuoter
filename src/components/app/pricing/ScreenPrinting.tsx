import { FC } from 'react';
import {
	ScreenPrinting as ScreenPrintingType,
	PrintingQuantityRange,
} from '@/types/Price';
import { Table } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

interface ScreenPrintingProps {
	screenPrintingData: ScreenPrintingType;
	setScreenPrintingData: (data: ScreenPrintingType) => void;
	printingQuantityRanges: PrintingQuantityRange[];
}

const ScreenPrinting: FC<ScreenPrintingProps> = ({
	screenPrintingData,
	setScreenPrintingData,
	printingQuantityRanges,
}) => {
	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th colSpan={8}>Screen Printing Prices</th>
				</tr>
				<tr>
					<th>Color</th>
					{printingQuantityRanges.map((range, index) => (
						<th key={index}>
							{range.start} - {range.end}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{Object.keys(screenPrintingData).map((color) => {
					const data = screenPrintingData[color as keyof ScreenPrintingType];
					if (Array.isArray(data)) {
						return (
							<tr key={color}>
								<td>{color}</td>
								{data.map((price, columnIndex) => (
									<td key={columnIndex}>
										<div className='input-group'>
											<span className='input-group-text'>$</span>
											<input
												type='number'
												step='0.01'
												min='0.00'
												className='form-control'
												value={price}
												onChange={(e) => {
													const updatedData = [...data];
													updatedData[columnIndex] = e.target.value;
													setScreenPrintingData({
														...screenPrintingData,
														[color]: updatedData,
													});
												}}
											/>
										</div>
									</td>
								))}
							</tr>
						);
					}
					return null; // Skip if it's not an array
				})}
			</tbody>
		</Table>
	);
};

export default ScreenPrinting;
