import { FC } from 'react';
import {
	DyeSublimation as DyeSublimationType,
	PrintingQuantityRange,
} from '@/types/Price';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

interface DyeSublimationProps {
	dyeSubData: DyeSublimationType;
	setDyeSubData: (data: DyeSublimationType) => void;
	printingQuantityRanges: PrintingQuantityRange[];
}

const DyeSublimation: FC<DyeSublimationProps> = ({
	dyeSubData,
	setDyeSubData,
	printingQuantityRanges,
}) => {
	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th colSpan={printingQuantityRanges.length + 1}>
						Dye Sublimation Prices
					</th>
				</tr>
				<tr>
					<th>Size</th>
					{printingQuantityRanges.map((range, index) => (
						<th key={index}>
							{range.start} - {range.end}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{Object.keys(dyeSubData).map((size) => {
					const prices = dyeSubData[size as keyof DyeSublimationType];
					if (Array.isArray(prices)) {
						return (
							<tr key={size}>
								<td>{size.charAt(0).toUpperCase() + size.slice(1)}</td>
								{prices.map((price, priceIndex) => (
									<td key={priceIndex}>
										<div className='input-group'>
											<span className='input-group-text'>$</span>
											<Form.Control
												type='number'
												step='0.01'
												min='0.00'
												className='form-control'
												value={price}
												onChange={(e) => {
													const updatedPrices = [...prices];
													updatedPrices[priceIndex] = e.target.value;
													setDyeSubData({
														...dyeSubData,
														[size]: updatedPrices,
													});
												}}
											/>
										</div>
									</td>
								))}
							</tr>
						);
					}
					return null; // Skip if it's not an array
				})}
			</tbody>
		</Table>
	);
};

export default DyeSublimation;
