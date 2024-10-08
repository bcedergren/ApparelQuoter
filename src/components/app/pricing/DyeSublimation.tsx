import React, { FC, ChangeEvent } from 'react';
import {
	DyeSublimation as DyeSublimationType,
	PrintingQuantityRange,
} from '@/types/Price';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

interface DyeSublimationProps {
	dyeSubData: DyeSublimationType | null;
	setDyeSubData: (data: DyeSublimationType) => void;
	printingQuantityRanges: PrintingQuantityRange[];
}

const DyeSublimation: FC<DyeSublimationProps> = ({
	dyeSubData,
	setDyeSubData,
	printingQuantityRanges,
}) => {
	const handleInputChange = (
		index: number,
		event: ChangeEvent<HTMLInputElement>
	) => {
		if (!dyeSubData?.quantity) return;
		const updatedPrices = [...dyeSubData.quantity];
		updatedPrices[index] = parseFloat(event.target.value).toFixed(2);
		setDyeSubData({ ...dyeSubData, quantity: updatedPrices });
	};

	if (!dyeSubData || !dyeSubData.quantity) {
		return <div>Loading or no data available</div>;
	}

	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th colSpan={printingQuantityRanges.length + 1}>
						Dye Sublimation Prices
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
					{(dyeSubData.quantity || []).map((price, index) => (
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

export default DyeSublimation;
