import React, { FC, useState, useEffect } from 'react';
import { Form, Table, InputGroup, FormControl } from 'react-bootstrap';
import { QuoteItem, SizeKey } from '@/types/Quote';

interface BrandStylePricingProps {
	items: QuoteItem[];
	onItemsChange: (items: QuoteItem[]) => void;
}

const extendedSizeColumns = ['2XL', '3XL', '4XL', '5XL'];

const BrandStylePricing: FC<BrandStylePricingProps> = ({
	items,
	onItemsChange,
}) => {
	// Local state for managing extended sizes prices input by user
	const [localPrices, setLocalPrices] = useState<{ [key: string]: number }>({});

	useEffect(() => {
		const initialPrices = items.reduce<{ [key: string]: number }>(
			(acc, item, index) => {
				extendedSizeColumns.forEach((size) => {
					const priceKey = `${size}-${index}`;
					// Only use standardPrice if an explicit price for the size is not set
					acc[priceKey] =
						item.sizePrices && item.sizePrices[size] !== undefined
							? item.sizePrices[size]
							: 0; // Use 0 or any other default value for uninitialized extended sizes
				});
				return acc;
			},
			{}
		);
		setLocalPrices(initialPrices);
	}, [items]);

	const handleStandardPricingChange = (index: number, value: string) => {
		const updatedItems = items.map((item, idx) => {
			if (idx === index) {
				return { ...item, standardPrice: parseFloat(value) || 0 };
			}
			return item;
		});

		// Use the provided function to update the items array in the parent component's state
		onItemsChange(updatedItems);
	};

	const handleExtendedPricingChange = (
		index: number,
		size: SizeKey,
		value: string
	) => {
		const newValue = parseFloat(value) || 0; // Default to 0 if the input is not a number
		setLocalPrices((currentPrices) => ({
			...currentPrices,
			[`${size}-${index}`]: newValue,
		}));

		// Update the corresponding item's sizePrices
		const updatedItems = [...items];
		const itemToUpdate = updatedItems[index];
		if (!itemToUpdate.sizePrices) {
			itemToUpdate.sizePrices = {};
		}
		itemToUpdate.sizePrices[size] = newValue;

		onItemsChange(updatedItems);
	};

	return (
		<Table
			striped
			bordered
			hover
		>
			<thead>
				<tr>
					<th style={{ width: '25%' }}>&nbsp;</th>
					<th style={{ width: '10%' }}>&nbsp;</th>
					<th style={{ width: '10%' }}>XS-XL</th>
					{extendedSizeColumns.map((size) => (
						<th key={size}>{size}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{items.map((item, index) => (
					<tr key={index}>
						<td>{item.brandAndStyle}</td>
						<td>{item.color}</td>
						<td>
							<InputGroup>
								<InputGroup.Text>$</InputGroup.Text>
								<FormControl
									type='number'
									step='0.01'
									min='0.00'
									value={item.standardPrice.toString()} // Ensure the value is a string
									onChange={(e) =>
										handleStandardPricingChange(index, e.target.value)
									}
								/>
							</InputGroup>
						</td>
						{extendedSizeColumns.map((size) => (
							<td key={`${index}-${size}`}>
								<InputGroup>
									<InputGroup.Text>$</InputGroup.Text>
									<FormControl
										type='number'
										step='0.01'
										min='0'
										name={`${size}-${index}`}
										value={(localPrices[`${size}-${index}`] ?? 0).toString()}
										onChange={(e) =>
											handleExtendedPricingChange(
												index,
												size as SizeKey,
												e.target.value
											)
										}
									/>
								</InputGroup>
							</td>
						))}
					</tr>
				))}
			</tbody>
		</Table>
	);
};

export default BrandStylePricing;
