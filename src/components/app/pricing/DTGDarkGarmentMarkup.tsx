import React, { ChangeEvent } from 'react';
import { Form, Table } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';
import { DTGDarkGarmentMarkup } from '@/types/Price';

interface DTGDarkGarmentMarkupProps {
	dtgDarkGarmentMarkup: DTGDarkGarmentMarkup; // Use the same DTGDarkGarmentMarkup type here
	setDTGDarkGarmentMarkup: (dtgDarkGarmentMarkup: DTGDarkGarmentMarkup) => void;
}

const DTGDarkGarmentMarkupComponent: React.FC<DTGDarkGarmentMarkupProps> = ({
	dtgDarkGarmentMarkup,
	setDTGDarkGarmentMarkup,
}) => {
	const handleInputChange = (
		size: keyof DTGDarkGarmentMarkup,
		event: ChangeEvent<any>
	) => {
		const updatedMarkup = {
			...dtgDarkGarmentMarkup,
			[size]: event.target.value,
		};
		setDTGDarkGarmentMarkup(updatedMarkup);
	};

	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th colSpan={3}>DTG Dark Garment</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<Form.Group controlId='dtgDarkGarmentMarkupSmall'>
							<Form.Label>Small</Form.Label>
							<div className='input-group'>
								<span className='input-group-text'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={dtgDarkGarmentMarkup.small}
									onChange={(e) => handleInputChange('small', e)}
								/>
							</div>
						</Form.Group>
					</td>
					<td>
						<Form.Group controlId='dtgDarkGarmentMarkupMedium'>
							<Form.Label>Medium</Form.Label>
							<div className='input-group'>
								<span className='input-group-text'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={dtgDarkGarmentMarkup.medium}
									onChange={(e) => handleInputChange('medium', e)}
								/>
							</div>
						</Form.Group>
					</td>
					<td>
						<Form.Group controlId='dtgDarkGarmentMarkupLarge'>
							<Form.Label>Large</Form.Label>
							<div className='input-group'>
								<span className='input-group-text'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={dtgDarkGarmentMarkup.large}
									onChange={(e) => handleInputChange('large', e)}
								/>
							</div>
						</Form.Group>
					</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default DTGDarkGarmentMarkupComponent;
