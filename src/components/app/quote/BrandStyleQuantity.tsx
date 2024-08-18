import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { SlPlus } from 'react-icons/sl';
import { QuoteItem, SizeKey } from '@/types/Quote';

interface BrandStyleQuantityProps {
	items: QuoteItem[];
	onItemsChange: (items: QuoteItem[]) => void;
}

const sizeColumns = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
type LocalQuantitiesType = { [key: string]: number };

const BrandStyleQuantity: FC<BrandStyleQuantityProps> = ({
	items = [],
	onItemsChange,
}) => {
	const [localQuantities, setLocalQuantities] = useState<{
		[key: string]: number;
	}>({});

	useEffect(() => {
		const initialQuantities = items.reduce<LocalQuantitiesType>(
			(acc, item, index) => {
				Object.keys(item.sizes).forEach((sizeKey) => {
					const sizeValue = item.sizes[sizeKey as keyof typeof item.sizes];
					acc[`${sizeKey}-${index}`] = sizeValue;
				});
				return acc;
			},
			{}
		);

		// Shallow comparison function for object properties
		const objectsAreSame = (x: LocalQuantitiesType, y: LocalQuantitiesType) => {
			const keysX = Object.keys(x);
			const keysY = Object.keys(y);
			if (keysX.length !== keysY.length) return false;

			for (let key of keysX) {
				if (x[key] !== y[key]) {
					return false;
				}
			}
			return true;
		};

		// Only update state if initialQuantities actually differs from localQuantities
		if (!objectsAreSame(localQuantities, initialQuantities)) {
			setLocalQuantities(initialQuantities);
		}
	}, [items, localQuantities]); // Include localQuantities in the dependency array

	const updateItem = (
		index: number,
		field: keyof QuoteItem | keyof QuoteItem['sizes'],
		value: string
	) => {
		//console.log(`Updating item ${index}, field: ${field}, value: ${value}`);
		const newItems = [...items];
		const item = { ...newItems[index] };

		if (field in item.sizes) {
			//console.log(`Updating size quantity for ${field}`);
			item.sizes[field as keyof QuoteItem['sizes']] = Math.max(
				0,
				parseInt(value, 10)
			);
		} else {
			//console.log(`Updating other field ${field}`);
			(item[field as keyof Omit<QuoteItem, 'sizes'>] as any) = value;
		}

		newItems[index] = item;
		onItemsChange(newItems);
	};

	const handleQuantityChange = (
		index: number,
		sizeKey: string,
		newQuantity: number
	) => {
		const updatedItems = items.map((item, idx) => {
			if (idx === index) {
				return {
					...item,
					sizes: {
						...item.sizes,
						[sizeKey]: newQuantity,
					},
				};
			}
			return item;
		});

		// Call the handler passed from the parent component with the updated items array
		onItemsChange(updatedItems);
	};

	return (
		<>
			<h6 className='standout-header'>Brand & Style</h6>
			<Table
				striped
				bordered
				hover
			>
				<thead>
					<tr>
						<th style={{ width: '25%' }}>Brand & Style</th>
						<th style={{ width: '10%' }}>Color</th>
						{sizeColumns.map((size) => (
							<th key={size}>{size}</th>
						))}
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{items &&
						items.map((item, index) => (
							<tr key={index}>
								<td>
									<Form.Control
										type='text'
										placeholder='Enter brand and style'
										value={item.brandAndStyle}
										onChange={(e) =>
											updateItem(index, 'brandAndStyle', e.target.value)
										}
									/>
								</td>
								<td>
									<Form.Control
										type='text'
										value={item.color}
										onChange={(e) => updateItem(index, 'color', e.target.value)}
									/>
								</td>
								{sizeColumns.map((size) => (
									<td key={`${index}-${size}`}>
										<Form.Control
											type='number'
											min='0'
											value={item.sizes[size as keyof QuoteItem['sizes']] ?? ''}
											onChange={(e) =>
												handleQuantityChange(
													index,
													size as keyof QuoteItem['sizes'],
													Number(e.target.value)
												)
											}
										/>
									</td>
								))}
								{index === items.length - 1 && (
									<td>
										<Button
											variant='outline-primary'
											onClick={() =>
												onItemsChange([
													...items,
													{
														brandAndStyle: '',
														color: '',
														standardPrice: 0,
														sizes: {
															XS: 0,
															S: 0,
															M: 0,
															L: 0,
															XL: 0,
															'2XL': 0,
															'3XL': 0,
															'4XL': 0,
															'5XL': 0,
														},
													} as QuoteItem,
												])
											}
										>
											<SlPlus />
										</Button>
									</td>
								)}
							</tr>
						))}
				</tbody>
			</Table>
		</>
	);
};

export default BrandStyleQuantity;
