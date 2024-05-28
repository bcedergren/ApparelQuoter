import React, { ChangeEvent } from 'react';
import { Table, Form, Spinner } from 'react-bootstrap';
import { DTGPrinting } from '@/types/Price'; // Assuming DTGPrinting is properly defined in your types
import styles from '@/styles/Pricing.module.css';

interface DTGPrintingProps {
	dtgPrintingData: DTGPrinting;
	setDTGPrintingData: (data: DTGPrinting) => void;
}

const DTGPrintingComponent: React.FC<DTGPrintingProps> = ({
	dtgPrintingData,
	setDTGPrintingData,
}) => {
	const handleInputChange = (
		size: keyof DTGPrinting,
		index: number,
		event: ChangeEvent<any>
	) => {
		const updatedPrices = [...dtgPrintingData[size]];
		updatedPrices[index] = event.target.value;
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
							value={price}
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
					<th colSpan={8}>DTG Printing Prices</th>
				</tr>
				<tr>
					<th>Size</th>
					{[
						'1 - 12',
						'13 - 24',
						'25 - 74',
						'75 - 149',
						'150 - 299',
						'300 - 499',
						'500+',
					].map((header, index) => (
						<th key={index}>{header}</th>
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
