import { ChangeEvent } from 'react';
import { Table, Form, Spinner } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';
import { ArtCost } from '@/types/Price';

type ArtCostProps = {
	artCostData: ArtCost;
	setArtCostData: (artCostData: ArtCost) => void;
};

type NestedKeys = 'colorMatch';

const ArtCostComponent: React.FC<ArtCostProps> = ({
	artCostData,
	setArtCostData,
}) => {
	if (!artCostData) {
		return (
			<div className='text-center'>
				<Spinner animation='border' />
			</div>
		);
	}

	const handleInputChange = (
		event: ChangeEvent<HTMLInputElement>,
		field: keyof ArtCost | NestedKeys,
		subField?: keyof ArtCost['colorMatch']
	) => {
		const value = event.target.value;

		// Create a new updated object based on the field type
		const updatedArtCost: ArtCost = { ...artCostData };

		if (subField && field === 'colorMatch') {
			// Update nested object field
			(updatedArtCost[field] as any)[subField] = value;
		} else {
			// Update top-level field
			(updatedArtCost as any)[field] = value;
		}

		setArtCostData(updatedArtCost);
	};

	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th colSpan={7}>Art Cost</th>
				</tr>
				<tr>
					<th>First Color</th>
					<th>Per Add&apos;l Color</th>
					<th>Flat Fee</th>
					<th>Ink Markup %</th>
					<th>Ink Charges/Piece</th>
					<th>Color Match</th>
					<th>Ink Color Changes</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<div className='input-group'>
							<span className='input-group-text'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={artCostData.firstColor || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'firstColor'
									)
								}
							/>
						</div>
					</td>
					<td>
						<div className='input-group'>
							<span className='input-group-text'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={artCostData.additionalColor || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'additionalColor'
									)
								}
							/>
						</div>
					</td>
					<td>
						<div className='input-group'>
							<span className='input-group-text'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={artCostData.flatFee || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'flatFee'
									)
								}
							/>
						</div>
					</td>
					<td>
						<div className='input-group'>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={artCostData.inkMarkup || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'inkMarkup'
									)
								}
							/>
							<span className='input-group-text'>%</span>
						</div>
					</td>
					<td>
						<div className='input-group'>
							<span className='input-group-text'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={artCostData.inkChargesPerPiece || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'inkChargesPerPiece'
									)
								}
							/>
						</div>
					</td>
					<td>
						<div className='input-group'>
							<span className='input-group-text'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={artCostData.colorMatch || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'colorMatch'
									)
								}
							/>
						</div>
					</td>
					<td>
						<div className='input-group'>
							<span className='input-group-text'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={artCostData.inkColorChanges || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'inkColorChanges'
									)
								}
							/>
						</div>
					</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default ArtCostComponent;
