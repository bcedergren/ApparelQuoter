import React, { useState, useEffect } from 'react';
import { QuoteItem } from '@/types/Quote';
import { Price } from '@/types/Price';
import { QuoteCalculations } from '@/utils/quoteCalculations';
import styles from '@/styles/QuoteDetails.module.css';

interface QuoteItemRowProps {
	item: QuoteItem;
	prices: Price;
	onFinalTotalChange: (index: number, finalTotal: number) => void;
	index: number;
}

const QuoteItemRow: React.FC<QuoteItemRowProps> = ({
	item,
	prices,
	onFinalTotalChange,
	index,
}) => {
	const [discount, setDiscount] = useState<number>(0);
	const [override, setOverride] = useState<number | null>(null);
	const [finalTotal, setFinalTotal] = useState<number>(0);
	const [newItemCost, setNewItemCost] = useState<number>(0);

	// Use the utility functions
	const itemQuantity = QuoteCalculations.getItemQuantity(item.sizes);
	const baseItemCost = QuoteCalculations.calculateBaseItemCost(
		item,
		itemQuantity,
		prices
	);

	useEffect(() => {
		// Calculate total amount based on wholesale price, quantity, and discount
		const baseSubtotal = itemQuantity * baseItemCost;
		const discountedSubtotal = baseSubtotal * (1 - discount / 100);

		// If override exists, use it to replace the total for the row, otherwise use the calculated subtotal
		const updatedFinalTotal = override !== null ? override : discountedSubtotal;
		setFinalTotal(updatedFinalTotal);

		// Set new item cost only if no override, otherwise item cost will match the override's total divided by the item quantity
		if (override !== null) {
			setNewItemCost(override / itemQuantity);
		} else {
			setNewItemCost(discountedSubtotal / itemQuantity);
		}

		// Inform parent about the updated final total
		onFinalTotalChange(index, updatedFinalTotal);
	}, [discount, override, itemQuantity, baseItemCost, index]);

	const formattedSizes = Object.entries(item.sizes)
		.filter(([, qty]) => qty > 0)
		.map(([size, qty]) => `(${qty})${size}`)
		.join(' ');

	return (
		<>
			<tr className={styles.itemRow}>
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
			<tr>
				<td>
					<strong>Color & Sizes</strong>
				</td>
				<td colSpan={7}>
					{item.color} - {formattedSizes}
				</td>
			</tr>
		</>
	);
};

export default QuoteItemRow;
