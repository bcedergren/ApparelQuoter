import React, { ChangeEvent } from 'react';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

type DyeSubData = {
	small: string[];
	medium: string[];
	large: string[];
};

interface DyeSublimationProps {
	dyeSubData: DyeSubData;
	setDyeSubData: (data: DyeSubData) => void;
}

const headers = [
	'1 - 12',
	'13 - 24',
	'25 - 74',
	'75 - 149',
	'150 - 299',
	'300 - 499',
	'500+',
];

const DyeSublimation: React.FC<DyeSublimationProps> = ({
	dyeSubData,
	setDyeSubData,
}) => {
	const handleInputChange = (
		size: keyof DyeSubData,
		index: number,
		event: ChangeEvent<any>
	) => {
		const updatedSizeData = [...dyeSubData[size]];
		updatedSizeData[index] = event.target.value;

		setDyeSubData({ ...dyeSubData, [size]: updatedSizeData });
	};

	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th colSpan={8}>Dye Sublimation Prices</th>
				</tr>
				<tr>
					<th>Size</th>
					{headers.map((header, index) => (
						<th key={index}>{header}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{Object.entries(dyeSubData).map(([size, prices], sizeIndex) => (
					<tr key={size}>
						<td>{size.charAt(0).toUpperCase() + size.slice(1)}</td>
						{prices.map((price, priceIndex) => (
							<td key={priceIndex}>
								<Form.Control
									type='text'
									value={price}
									onChange={(e) =>
										handleInputChange(size as keyof DyeSubData, priceIndex, e)
									}
								/>
							</td>
						))}
					</tr>
				))}
			</tbody>
		</Table>
	);
};

export default DyeSublimation;
