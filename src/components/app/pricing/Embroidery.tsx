import React, { ChangeEvent } from 'react';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

// Define the type for the embroidery data
interface EmbroideryData {
	stitchCount: string;
	costPerThousandStitches: string;
	hoopingFee: string;
	costPerFirst5000Stitches: string;
}

// Props type to define the expected props for the component
interface EmbroideryProps {
	embroideryData: EmbroideryData;
	setEmbroideryData: (data: EmbroideryData) => void;
}

const Embroidery: React.FC<EmbroideryProps> = ({
	embroideryData,
	setEmbroideryData,
}) => {
	// Function to handle changes in the form inputs
	const handlePriceChange = (
		field: keyof EmbroideryData,
		event: ChangeEvent<any>
	) => {
		// Update the specific field within the embroideryData
		const updatedData = { ...embroideryData, [field]: event.target.value };
		// Update the state in the parent component with the new data
		setEmbroideryData(updatedData);
	};

	return (
		<Table
			bordered
			hover
			className={`${styles.pricingTable} ${styles.embroideryPricesSection}`}
		>
			<thead>
				<tr>
					<th colSpan={2}>Embroidery Prices</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Minimum Stitch Count</td>
					<td>
						<Form.Control
							type='number'
							min='0.00'
							value={embroideryData.stitchCount}
							onChange={(e) => handlePriceChange('stitchCount', e)}
						/>
					</td>
				</tr>
				<tr>
					<td>Cost for first {embroideryData.stitchCount} stitches</td>
					<td>
						<div className='input-group'>
							<span className='input-group-text'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={embroideryData.costPerFirst5000Stitches}
								onChange={(e) =>
									handlePriceChange('costPerFirst5000Stitches', e)
								}
							/>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						Cost per 1,000 stitches after first {embroideryData.stitchCount}
					</td>
					<td>
						<div className='input-group'>
							<span className='input-group-text'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={embroideryData.costPerThousandStitches}
								onChange={(e) =>
									handlePriceChange('costPerThousandStitches', e)
								}
							/>
						</div>
					</td>
				</tr>
				<tr>
					<td>Hooping Fee/Piece</td>
					<td>
						<div className='input-group'>
							<span className='input-group-text'>$</span>
							<Form.Control
								type='number'
								step='0.01'
								min='0.00'
								value={embroideryData.hoopingFee}
								onChange={(e) => handlePriceChange('hoopingFee', e)}
							/>
						</div>
					</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default Embroidery;
