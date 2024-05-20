import React, { FC } from 'react';
import { Table } from 'react-bootstrap';

interface SummaryProps {
	// Properties for each cost item, for example:
	qty: number;
	avgCost: number;
	apparelCost: number;
	printingCost: number;
	shippingCost: number;
	taxCost: number;
	totalCost: number;
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
	return (
		<Table
			striped
			bordered
			hover
		>
			<thead>
				<tr>
					<th>QTY {qty}</th>
					<th>AVG COST ${avgCost.toFixed(2)}</th>
					<th>APPAREL ${apparelCost.toFixed(2)}</th>
					<th>PRINTING ${printingCost.toFixed(2)}</th>
					<th>SHIPPING ${shippingCost.toFixed(2)}</th>
					<th>TAX ${taxCost.toFixed(2)}</th>
					<th>TOTAL ${totalCost.toFixed(2)}</th>
				</tr>
			</thead>
		</Table>
	);
};

export default SummaryComponent;
