import { ChangeEvent } from 'react';
import { Table, Form, Spinner } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';
import { ArtCost, ScreenPrinting } from '@/types/Price';

type ArtCostProps = {
	artCostData: ArtCost;
	screenPrintingData: ScreenPrinting;
	setArtCostData: (artCostData: ArtCost) => void;
	setScreenPrintingData: (screenPrintingData: ScreenPrinting) => void;
};

const ArtCostComponent: React.FC<ArtCostProps> = ({
	artCostData,
	screenPrintingData,
	setArtCostData,
	setScreenPrintingData,
}) => {
	if (!artCostData || !screenPrintingData) {
		return (
			<div className='text-center'>
				<Spinner animation='border' />
			</div>
		);
	}

	const handleInputChange = (
		event: ChangeEvent<HTMLInputElement>,
		field: keyof ArtCost | keyof ScreenPrinting,
		type: 'artCost' | 'screenPrinting'
	) => {
		const value = event.target.value;

		if (type === 'artCost') {
			const updatedArtCost: ArtCost = { ...artCostData };
			(updatedArtCost as any)[field] = value;
			setArtCostData(updatedArtCost);
		} else if (type === 'screenPrinting') {
			const updatedScreenPrinting: ScreenPrinting = { ...screenPrintingData };
			(updatedScreenPrinting as any)[field] = value;
			setScreenPrintingData(updatedScreenPrinting);
		}
	};

	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th colSpan={11}>Art Cost</th>
				</tr>
				<tr>
					<th>First Color</th>
					<th>Per Add&apos;l Color</th>
					<th>Flat Fee</th>
					<th>Ink Markup %</th>
					<th>Ink Charges/Piece</th>
					<th>Color Match</th>
					<th>Ink Color Changes</th>
					<th>DTG Dark Garment Markup</th>
					<th>Flash Markup</th>
					<th>New Screen Setup</th>
					<th>Existing Screen Setup</th>
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
										'firstColor',
										'artCost'
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
										'additionalColor',
										'artCost'
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
										'flatFee',
										'artCost'
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
										'inkMarkup',
										'artCost'
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
										'inkChargesPerPiece',
										'artCost'
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
										'colorMatch',
										'artCost'
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
										'inkColorChanges',
										'artCost'
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
								value={artCostData.dtgDarkGarmentMarkup || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'dtgDarkGarmentMarkup',
										'artCost'
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
								value={artCostData.flashMarkup || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'flashMarkup',
										'artCost'
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
								value={screenPrintingData.perScreenNew || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'perScreenNew',
										'screenPrinting'
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
								value={screenPrintingData.perScreenExisting || ''}
								onChange={(e) =>
									handleInputChange(
										e as ChangeEvent<HTMLInputElement>,
										'perScreenExisting',
										'screenPrinting'
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
