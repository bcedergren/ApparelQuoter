import { ChangeEvent } from 'react';
import { Table, Form, Spinner } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

type ArtCostProps = {
	artCostData: ArtCost;
	setArtCostData: (artCostData: ArtCost) => void;
};

type ArtCost = {
	firstColor: string;
	additionalColor: string;
	flatFee: string;
	inkMarkup: string;
	inkChargesPerPiece: string;
	glitterOrPuff: string;
	perScreenNew: string;
	perScreenExisting: string;
};

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
		field: keyof ArtCost
	) => {
		const updatedArtCost = {
			...artCostData,
			[field]: event.target.value,
		};

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
					<th colSpan={3}>Art Cost</th>
					<th colSpan={1}>Customer Has Apparel</th>
					<th colSpan={1}>Ink Charges/Piece</th>
					<th colSpan={1}>New Screen Setup</th>
					<th colSpan={1}>Existing Screen Setup</th>
				</tr>
				<tr>
					<th>First Color</th>
					<th>Per Add&apos;l Color</th>
					<th>Flat Fee</th>
					<th>Ink Markup</th>
					<th>Glitter or Puff</th>
					<th>Per Screen</th>
					<th>Per Screen</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<Form.Control
							type='text'
							value={artCostData.firstColor}
							onChange={(e) =>
								handleInputChange(
									e as ChangeEvent<HTMLInputElement>,
									'firstColor'
								)
							}
						/>
					</td>
					<td>
						<Form.Control
							type='text'
							value={artCostData.additionalColor}
							onChange={(e) =>
								handleInputChange(
									e as ChangeEvent<HTMLInputElement>,
									'additionalColor'
								)
							}
						/>
					</td>
					<td>
						<Form.Control
							type='text'
							value={artCostData.flatFee}
							onChange={(e) =>
								handleInputChange(e as ChangeEvent<HTMLInputElement>, 'flatFee')
							}
						/>
					</td>
					<td>
						<Form.Control
							type='text'
							value={artCostData.inkMarkup}
							onChange={(e) =>
								handleInputChange(
									e as ChangeEvent<HTMLInputElement>,
									'inkMarkup'
								)
							}
						/>
					</td>
					<td>
						<Form.Control
							type='text'
							value={artCostData.inkChargesPerPiece}
							onChange={(e) =>
								handleInputChange(
									e as ChangeEvent<HTMLInputElement>,
									'inkChargesPerPiece'
								)
							}
						/>
					</td>

					<td>
						<Form.Control
							type='text'
							value={artCostData.perScreenNew}
							onChange={(e) =>
								handleInputChange(
									e as ChangeEvent<HTMLInputElement>,
									'perScreenNew'
								)
							}
						/>
					</td>
					<td>
						<Form.Control
							type='text'
							value={artCostData.perScreenExisting}
							onChange={(e) =>
								handleInputChange(
									e as ChangeEvent<HTMLInputElement>,
									'perScreenExisting'
								)
							}
						/>
					</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default ArtCostComponent;
