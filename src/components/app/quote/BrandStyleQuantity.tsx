import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Table, Modal } from 'react-bootstrap';
import { SlPlus, SlTrash } from 'react-icons/sl';
import { QuoteItem } from '@/types/Quote';

interface BrandStyleQuantityProps {
	items: QuoteItem[];
	onItemsChange: (items: QuoteItem[]) => void;
}

const sizeColumns = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const BrandStyleQuantity: FC<BrandStyleQuantityProps> = ({
	items = [],
	onItemsChange,
}) => {
	const [localQuantities, setLocalQuantities] = useState<{
		[key: string]: number;
	}>({});
	const [showModal, setShowModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<number | null>(null);

	useEffect(() => {
		const initialQuantities = items.reduce<{
			[key: string]: number;
		}>((acc, item, index) => {
			Object.keys(item.sizes).forEach((sizeKey) => {
				const sizeValue = item.sizes[sizeKey as keyof typeof item.sizes];
				acc[`${sizeKey}-${index}`] = sizeValue;
			});
			return acc;
		}, {});
		setLocalQuantities(initialQuantities);
	}, [items]);

	const updateItem = (
		index: number,
		field: keyof QuoteItem | keyof QuoteItem['sizes'],
		value: string
	) => {
		const newItems = [...items];
		const item = { ...newItems[index] };

		if (field in item.sizes) {
			item.sizes[field as keyof QuoteItem['sizes']] = Math.max(
				0,
				parseInt(value, 10)
			);
		} else {
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
		onItemsChange(updatedItems);
	};

	const handleDeleteItem = (index: number) => {
		setItemToDelete(index);
		setShowModal(true);
	};

	const confirmDeleteItem = () => {
		if (itemToDelete !== null) {
			const updatedItems = items.filter((_, idx) => idx !== itemToDelete);
			onItemsChange(updatedItems);
			setShowModal(false);
			setItemToDelete(null);
		}
	};

	const handleAddNewItem = () => {
		const newItem: QuoteItem = {
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
		};
		onItemsChange([...items, newItem]);
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
						{sizeColumns.map((size, index) => (
							<th key={`size-header-${index}`}>{size}</th>
						))}
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{items.map((item, index) => (
						<tr key={`item-row-${index}`}>
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
							{sizeColumns.map((size, sizeIndex) => (
								<td key={`item-${index}-${sizeIndex}`}>
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
							<td>
								{/* Delete button with no background */}

								<SlTrash
									style={{
										color: 'red',
										cursor: 'pointer',
										marginRight: '5px',
									}}
									size={20}
									onClick={() => handleDeleteItem(index)}
								/>
								{/* Add button, only shown for the last row */}
								{index === items.length - 1 && (
									<SlPlus
										size={20}
										style={{ color: 'green', cursor: 'pointer' }}
										onClick={() => handleAddNewItem()}
									/>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</Table>

			{/* Delete Confirmation Modal */}
			<Modal
				show={showModal}
				onHide={() => setShowModal(false)}
				backdrop='static'
				keyboard={false}
			>
				<Modal.Header closeButton>
					<Modal.Title>Confirm Deletion</Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure you want to delete this item?</Modal.Body>
				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={() => setShowModal(false)}
					>
						Cancel
					</Button>
					<Button
						variant='danger'
						onClick={confirmDeleteItem}
					>
						Delete
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default BrandStyleQuantity;
