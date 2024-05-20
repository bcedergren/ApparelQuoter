import React from 'react';
import Table from 'react-bootstrap/Table';

const MyComponent: React.FC = () => {
	return (
		<Table
			striped
			bordered
			hover
			className='pricing-table'
		>
			<thead className='table-header'>
				<tr>
					<th>ART COST</th>
					<th>SALES TAX</th>
					<th>CUSTOMER HAS APPAREL</th>
					<th>NEW SCREEN SETUP</th>
				</tr>
			</thead>
			<tbody>
				<tr className='sub-header'>
					<td>First Color</td>
					<td>Rate C 0.0%</td>
					<td>Ink Markup 150%</td>
					<td>Per Screen $20.00</td>
				</tr>
				<tr>
					<td>Per Additional Color</td>
					<td>CREDIT CARD CHARGE</td>
					<td>INK CHARGES PER PIECE</td>
					<td>EXISTING SCREEN SETUP</td>
				</tr>
				<tr className='odd-row'>
					<td>Flat Fee $150.00</td>
					<td>Percentage 3.0%</td>
					<td>Glitter or Puff $0.25</td>
					<td>Per Screen $0.00</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default MyComponent;
