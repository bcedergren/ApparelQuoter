import React, { FC } from 'react';
import { Table } from 'react-bootstrap';
import styles from '@/styles/SummaryComponent.module.css';

interface SummaryProps {
	qty: number;
	avgCost: number;
	apparelCost: number;
	printingCost: number;
	shippingCost: number | null;
	taxCost: number | null;
	totalCost: number | null; // totalCost could be null as well
}

const SummaryComponent: FC<SummaryProps> = ({
	qty,
	avgCost,
	apparelCost,
	printingCost,
	shippingCost,
	taxCost,
	totalCost,
}) => {
	// Ensure all costs are numbers
	const numericShippingCost = Number(shippingCost ?? 0);
	const numericTaxCost = Number(taxCost ?? 0);
	const numericTotalCost = Number(totalCost ?? 0);

	return (
		<Table
			striped
			bordered
			hover
			className={styles.summaryMarginTop}
		>
			<thead>
				<tr>
					<th>QTY {qty}</th>
					<th>AVG COST ${avgCost.toFixed(2)}</th>
					<th>APPAREL ${apparelCost.toFixed(2)}</th>
					<th>PRINTING ${printingCost.toFixed(2)}</th>
					<th>SHIPPING ${numericShippingCost.toFixed(2)}</th>
					<th>TAX ${numericTaxCost.toFixed(2)}</th>
					<th>TOTAL ${numericTotalCost.toFixed(2)}</th>
				</tr>
			</thead>
		</Table>
	);
};

export default SummaryComponent;
