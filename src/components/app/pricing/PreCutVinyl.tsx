import React, { ChangeEvent } from 'react';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

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
}

const PreCutVinyl: React.FC<PreCutVinylProps> = ({
	preCutVinylData,
	setPreCutVinylData,
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
					<th>Pre-Cut Vinyl Name & Number Prices</th>
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
