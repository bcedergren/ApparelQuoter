import { Table, Form } from 'react-bootstrap';
import { ChangeEvent } from 'react';
import styles from '@/styles/Pricing.module.css';

interface PrintingLocationNamesProps {
	printingLocationNames: string[]; // Data passed in from the parent component
	setPrintingLocationNames: (names: string[]) => void; // Setter function passed in from the parent component
}

const PrintingLocationNames: React.FC<PrintingLocationNamesProps> = ({
	printingLocationNames,
	setPrintingLocationNames,
}) => {
	const handleInputChange = (index: number, event: ChangeEvent<any>) => {
		const updatedNames = [...printingLocationNames]; // Create a copy of the current names
		updatedNames[index] = event.target.value; // Update the specific name
		setPrintingLocationNames(updatedNames); // Pass the updated names back to the parent component
	};

	return (
		<Table
			bordered
			hover
			className={`${styles.pricingTable} ${styles.printingLocationNamesSection}`}
		>
			<thead>
				<tr>
					<th colSpan={4}>Printing Location Names</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					{printingLocationNames.map((name, index) => (
						<td key={index}>
							Location {index + 1}
							<Form.Control
								type='text'
								value={name}
								onChange={(e) => handleInputChange(index, e)}
							/>
						</td>
					))}
				</tr>
			</tbody>
		</Table>
	);
};

export default PrintingLocationNames;
