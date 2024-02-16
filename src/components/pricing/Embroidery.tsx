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
							type='text'
							value={embroideryData.stitchCount}
							onChange={(e) => handlePriceChange('stitchCount', e)}
						/>
					</td>
				</tr>
				<tr>
					<td>Cost per 1,000 stitches after first 5,000</td>
					<td>
						<Form.Control
							type='text'
							value={embroideryData.costPerThousandStitches}
							onChange={(e) => handlePriceChange('costPerThousandStitches', e)}
						/>
					</td>
				</tr>
				<tr>
					<td>Hooping Fee/Piece</td>
					<td>
						<Form.Control
							type='text'
							value={embroideryData.hoopingFee}
							onChange={(e) => handlePriceChange('hoopingFee', e)}
						/>
					</td>
				</tr>
				<tr>
					<td>Cost for first 5,000 stitches</td>
					<td>
						<Form.Control
							type='text'
							value={embroideryData.costPerFirst5000Stitches}
							onChange={(e) => handlePriceChange('costPerFirst5000Stitches', e)}
						/>
					</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default Embroidery;
