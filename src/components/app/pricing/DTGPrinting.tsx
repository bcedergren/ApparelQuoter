import React, { ChangeEvent } from 'react';
import { Table, Form } from 'react-bootstrap';
import { DTGPrinting, PrintingQuantityRange } from '@/types/Price';
import styles from '@/styles/Pricing.module.css';

interface DTGPrintingProps {
	dtgPrintingData: DTGPrinting;
	setDTGPrintingData: (data: DTGPrinting) => void;
	printingQuantityRanges: PrintingQuantityRange[];
}

const DTGPrintingComponent: React.FC<DTGPrintingProps> = ({
	dtgPrintingData,
	setDTGPrintingData,
	printingQuantityRanges,
}) => {
	const handleInputChange = (
		size: keyof DTGPrinting,
		index: number,
		event: ChangeEvent<any>
	) => {
		const updatedPrices = [...dtgPrintingData[size]];
		updatedPrices[index] = parseFloat(event.target.value).toFixed(2);
		setDTGPrintingData({ ...dtgPrintingData, [size]: updatedPrices });
	};

	const renderRow = (size: keyof DTGPrinting) => (
		<tr key={size}>
			<td>{size.charAt(0).toUpperCase() + size.slice(1)}</td>
			{dtgPrintingData[size].map((price: string, index: number) => (
				<td key={index}>
					<div className='input-group'>
						<span className='input-group-text'>$</span>
						<Form.Control
							type='number'
							step='0.01'
							min='0.00'
							value={parseFloat(price).toFixed(2)}
							onChange={(e) => handleInputChange(size, index, e)}
						/>
					</div>
				</td>
			))}
		</tr>
	);

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
					<th>Size</th>
					{printingQuantityRanges.map((range, index) => (
						<th key={index}>
							{range.start} - {range.end}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{renderRow('small')}
				{renderRow('medium')}
				{renderRow('large')}
			</tbody>
		</Table>
	);
};

export default DTGPrintingComponent;
