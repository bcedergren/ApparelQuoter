import { Table, Form } from 'react-bootstrap';
import { ChangeEvent } from 'react';
import styles from '@/styles/Pricing.module.css';

type QuantityRange = {
	start: string;
	end: string;
};

interface PrintingQuantityRangesProps {
	quantityRanges: QuantityRange[];
	setQuantityRanges: (ranges: QuantityRange[]) => void;
}

const PrintingQuantityRanges: React.FC<PrintingQuantityRangesProps> = ({
	quantityRanges,
	setQuantityRanges,
}) => {
	const handleRangeChange = (
		index: number,
		part: 'start' | 'end',
		event: ChangeEvent<any>
	) => {
		const updatedRanges = quantityRanges.map((range, i) =>
			i === index ? { ...range, [part]: event.target.value } : range
		);
		setQuantityRanges(updatedRanges);
	};

	return (
		<Table
			bordered
			hover
			className={`${styles.pricingTable} ${styles.quantityRangesSection}`}
		>
			<thead>
				<tr>
					<th colSpan={2}>Printing Quantity Ranges</th>
				</tr>
			</thead>
			<tbody>
				{quantityRanges.map((range, index) => (
					<tr key={index}>
						<td>Quantity {index + 1}</td>
						<td>
							<Form.Control
								size='sm'
								type='number'
								min='0'
								value={range.start || ''}
								onChange={(e) => handleRangeChange(index, 'start', e)}
								style={{
									display: 'inline',
									width: 'auto',
									margin: '0 10px',
								}}
							/>
							to
							<Form.Control
								size='sm'
								type='number'
								min='0'
								value={range.end || ''}
								onChange={(e) => handleRangeChange(index, 'end', e)}
								style={{ display: 'inline', width: 'auto', margin: '0 10px' }}
							/>
						</td>
					</tr>
				))}
			</tbody>
		</Table>
	);
};

export default PrintingQuantityRanges;
