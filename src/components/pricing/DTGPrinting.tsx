import React, { ChangeEvent } from 'react';
import { Table, Form, Spinner } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

type DTGPrintingProps = {
	dtgPrintingData: DTGPrintingData;
	setDTGPrintingData: (dtgPrintingData: DTGPrintingData) => void;
};

type DTGPrintingData = {
	small: string[];
	medium: string[];
	large: string[];
};

const headers = [
	'1 - 12',
	'13 - 24',
	'25 - 74',
	'75 - 149',
	'150 - 299',
	'300 - 499',
	'500+',
];

const DTGPricingComponent: React.FC<DTGPrintingProps> = ({
	dtgPrintingData,
	setDTGPrintingData,
}) => {
	if (!dtgPrintingData) {
		return (
			<div className='text-center'>
				<Spinner animation='border' />
			</div>
		);
	}

	const handleInputChange = (
		size: keyof DTGPrintingData,
		index: number,
		event: ChangeEvent<any>
	) => {
		const target = event.target as HTMLInputElement;
		const updatedPrices = [...dtgPrintingData[size]];
		updatedPrices[index] = target.value;

		setDTGPrintingData({
			...dtgPrintingData,
			[size]: updatedPrices,
		});
	};

	const renderRow = (size: keyof DTGPrintingData) => (
		<tr key={size}>
			<td>{size.charAt(0).toUpperCase() + size.slice(1)}</td>
			{dtgPrintingData[size].map((price, index) => (
				<td key={index}>
					<Form.Control
						type='text'
						value={price}
						onChange={(e) => handleInputChange(size, index, e)}
					/>
				</td>
			))}
		</tr>
	);

	return (
		<Table
			bordered
			hover
			className={`${styles.pricingTable} ${styles.dtgPrintingPricesSection}`}
		>
			<thead>
				<tr>
					<th colSpan={8}>DTG Printing Prices</th>
				</tr>
				<tr>
					<th>Size</th>
					{headers.map((header, index) => (
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

export default DTGPricingComponent;
