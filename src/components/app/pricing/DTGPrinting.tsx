import React, { FC, ChangeEvent } from 'react';
import {
	DTGPrinting as DTGPrintingType,
	PrintingQuantityRange,
} from '@/types/Price';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

interface DTGPrintingProps {
	dtgPrintingData: DTGPrintingType;
	setDTGPrintingData: (data: DTGPrintingType) => void;
	printingQuantityRanges: PrintingQuantityRange[];
}

const DTGPrinting: FC<DTGPrintingProps> = ({
	dtgPrintingData,
	setDTGPrintingData,
	printingQuantityRanges,
}) => {
	const handleInputChange = (
		index: number,
		event: ChangeEvent<HTMLInputElement>
	) => {
		if (!dtgPrintingData.quantity) return;
		const updatedPrices = [...dtgPrintingData.quantity];
		updatedPrices[index] = parseFloat(event.target.value).toFixed(2);
		setDTGPrintingData({ ...dtgPrintingData, quantity: updatedPrices });
	};

	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th colSpan={printingQuantityRanges.length + 1}>
						DTG Printing Prices
					</th>
				</tr>
				<tr>
					<th>Quantity Range</th>
					{printingQuantityRanges.map((range, index) => (
						<th key={index}>
							{range.start} - {range.end || '∞'}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Price</td>
					{(dtgPrintingData?.quantity || []).map((price, index) => (
						<td key={index}>
							<div className='input-group'>
								<span className='input-group-text'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									className='form-control'
									value={price || ''}
									onChange={(e) =>
										handleInputChange(index, e as ChangeEvent<HTMLInputElement>)
									}
								/>
							</div>
						</td>
					))}
				</tr>
			</tbody>
		</Table>
	);
};

export default DTGPrinting;
