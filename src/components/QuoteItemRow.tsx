import React, { useState, useEffect } from 'react';
import { QuoteItem } from '@/types/Quote'; // Ensure this path matches your actual file structure

interface QuoteItemRowProps {
	item: QuoteItem;
	getItemCost: (item: QuoteItem) => number;
	getTotalQuantity: (sizes: QuoteItem['sizes']) => number;
}

const QuoteItemRow: React.FC<QuoteItemRowProps> = ({
	item,
	getItemCost,
	getTotalQuantity,
}) => {
	const itemQuantity = getTotalQuantity(item.sizes);
	const [discount, setDiscount] = useState<number>(0);
	const [override, setOverride] = useState<number | null>(null);
	const [finalTotal, setFinalTotal] = useState<number>(0);
	const [newItemCost, setNewItemCost] = useState<number>(0);

	// Filter sizes to only include those with a quantity greater than 0
	const sizes = Object.entries(item.sizes)
		.filter(([_, qty]) => qty > 0)
		.map(([size, qty]) => `${size}(${qty})`)
		.join(', ');

	useEffect(() => {
		const baseItemCost = getItemCost(item);
		const baseSubtotal = itemQuantity * baseItemCost;
		const discountedSubtotal = baseSubtotal * (1 - discount / 100);
		const updatedFinalTotal = override !== null ? override : discountedSubtotal;

		setFinalTotal(updatedFinalTotal);
		setNewItemCost(updatedFinalTotal / itemQuantity);
	}, [item, discount, override, getItemCost, itemQuantity]);

	return (
		<>
			<tr>
				<td>
					<strong>Brand & Style</strong>
				</td>
				<td>{item.brandAndStyle}</td>
				<td>${newItemCost.toFixed(2)}</td>
				<td>{itemQuantity}</td>
				<td>${(itemQuantity * newItemCost).toFixed(2)}</td>
				<td>
					<input
						type='number'
						value={discount}
						onChange={(e) => setDiscount(Number(e.target.value))}
						style={{ width: '80px' }}
					/>{' '}
					%
				</td>
				<td>${finalTotal.toFixed(2)}</td>
				<td>
					$
					<input
						type='number'
						value={override ?? ''}
						onChange={(e) =>
							setOverride(e.target.value ? Number(e.target.value) : null)
						}
						style={{ width: '80px' }}
					/>
				</td>
			</tr>
			{sizes && (
				<tr>
					<td>
						<strong>Color & Sizes</strong>
					</td>
					<td colSpan={7}>
						{item.color} - {sizes}
					</td>
				</tr>
			)}
			<tr style={{ height: '20px' }}></tr>
		</>
	);
};

export default QuoteItemRow;
