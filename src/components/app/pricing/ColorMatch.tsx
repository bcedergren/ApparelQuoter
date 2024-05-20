import React, { ChangeEvent } from 'react';
import { Table, Form, Spinner } from 'react-bootstrap';

type ColorMatchProps = {
	colorMatchData: ColorMatch;
	setColorMatchData: (colorMatchData: ColorMatch) => void;
};

type ColorMatch = {
	perColor: string;
	inkColorChanges: string;
	dtgDarkGarmentMarkup: {
		small: string;
		medium: string;
		large: string;
	};
};

const ColorMatchComponent: React.FC<ColorMatchProps> = ({
	colorMatchData,
	setColorMatchData,
}) => {
	console.log(colorMatchData);

	const handleInputChange = (
		event: ChangeEvent<HTMLInputElement>,
		field: keyof ColorMatch | keyof ColorMatch['dtgDarkGarmentMarkup']
	) => {
		let updatedColorMatch;
		if (field in colorMatchData.dtgDarkGarmentMarkup) {
			updatedColorMatch = {
				...colorMatchData,
				dtgDarkGarmentMarkup: {
					...colorMatchData.dtgDarkGarmentMarkup,
					[field]: event.target.value,
				},
			};
		} else {
			updatedColorMatch = {
				...colorMatchData,
				[field]: event.target.value,
			};
		}

		setColorMatchData(updatedColorMatch);
	};

	return (
		<Table
			bordered
			hover
		>
			<thead>
				<tr>
					<th>Color Match</th>
					<th>Ink Color Changes</th>
					<th colSpan={3}>DTG Dark Garment Markup</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						{/* <Form.Control
							type='text'
							value={colorMatchData.perColor}
							onChange={(e) =>
								handleInputChange(
									e as ChangeEvent<HTMLInputElement>,
									'perColor'
								)
							}
						/> */}
					</td>
					<td>
						{/* <Form.Control
							type='text'
							value={colorMatchData.inkColorChanges}
							onChange={(e) =>
								handleInputChange(
									e as ChangeEvent<HTMLInputElement>,
									'inkColorChanges'
								)
							}
						/> */}
					</td>
					<td>
						{/* <Form.Control
							type='text'
							value={colorMatchData.dtgDarkGarmentMarkup.small}
							onChange={(e) =>
								handleInputChange(e as ChangeEvent<HTMLInputElement>, 'small')
							}
						/> */}
					</td>
					<td>
						{/* <Form.Control
							type='text'
							value={colorMatchData.dtgDarkGarmentMarkup.medium}
							onChange={(e) =>
								handleInputChange(e as ChangeEvent<HTMLInputElement>, 'medium')
							}
						/> */}
					</td>
					<td>
						{/* <Form.Control
							type='text'
							value={colorMatchData.dtgDarkGarmentMarkup.large}
							onChange={(e) =>
								handleInputChange(e as ChangeEvent<HTMLInputElement>, 'large')
							}
						/> */}
					</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default ColorMatchComponent;
