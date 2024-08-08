import React, { ChangeEvent } from 'react';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';
import { PrintingQuantityRange } from '@/types/Price';

// Define the types for the individual prices and the overall data structure
type PreCutVinylPrice = string;

interface PreCutVinylPrices {
	names: PreCutVinylPrice[];
	numbers: PreCutVinylPrice[];
}

// Props type to define the expected props for the component
interface PreCutVinylProps {
	preCutVinylData: PreCutVinylPrices;
	setPreCutVinylData: (data: PreCutVinylPrices) => void;
	printingQuantityRanges: PrintingQuantityRange[];
}

const PreCutVinyl: React.FC<PreCutVinylProps> = ({
	preCutVinylData,
	setPreCutVinylData,
	printingQuantityRanges,
}) => {
	// Function to handle price changes
	const handlePriceChange = (
		type: 'names' | 'numbers',
		index: number,
		event: ChangeEvent<any>
	) => {
		// Update the specific type (names or numbers) within the preCutVinylData
		const updatedPrices = {
			...preCutVinylData,
			[type]: preCutVinylData[type].map((price, priceIndex) =>
				priceIndex === index ? event.target.value : price
			),
		};
		// Update the state in the parent component with the new data
		setPreCutVinylData(updatedPrices);
	};

	return (
		<Table
			bordered
			hover
			className={`${styles.pricingTable} ${styles.preCutVinylPricesSection}`}
		>
			<thead>
				<tr>
					<th colSpan={7}>Pre-Cut Vinyl Name & Number Prices</th>
				</tr>
				<tr>
					<th></th>
					{printingQuantityRanges.map((range, index) => (
						<th key={index}>
							{range.start} - {range.end}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Names</td>
					{preCutVinylData.names.map((price, index) => (
						<td key={`name-${index}`}>
							<div className='input-group'>
								<span className='input-group-text'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={price}
									onChange={(e) => handlePriceChange('names', index, e)}
								/>
							</div>
						</td>
					))}
				</tr>
				<tr>
					<td>Numbers</td>
					{preCutVinylData.numbers.map((price, index) => (
						<td key={`number-${index}`}>
							<div className='input-group'>
								<span className='input-group-text'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={price}
									onChange={(e) => handlePriceChange('numbers', index, e)}
								/>
							</div>
						</td>
					))}
				</tr>
			</tbody>
		</Table>
	);
};

export default PreCutVinyl;
