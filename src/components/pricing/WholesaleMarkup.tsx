import React, { ChangeEvent } from 'react';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

type WholesaleMarkupTier = {
	lessThan: string;
	betweenStart: string;
	betweenEnd: string;
	over: string;
	markupLessThan: string;
	markupBetween: string;
	markupOver: string;
	andOrLessThan: string;
	andOrBetween: string;
	andOrOver: string;
};

type WholesaleMarkupProps = {
	wholesaleMarkupData: WholesaleMarkupTier;
	setWholesaleMarkupData: (data: WholesaleMarkupTier) => void;
};

const WholesaleMarkup: React.FC<WholesaleMarkupProps> = ({
	wholesaleMarkupData,
	setWholesaleMarkupData,
}) => {
	const handleInputChange = (
		field: keyof WholesaleMarkupTier,
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const { value } = event.target;
		setWholesaleMarkupData({
			...wholesaleMarkupData,
			[field]: value,
		});
	};

	return (
		<div className={styles.wholesaleMarkupContainer}>
			<Table
				bordered
				hover
				className={styles.pricingTable}
			>
				<thead>
					<tr>
						<th colSpan={8}>T-Shirt Wholesale Markup %</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<Form.Label>Less than</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.lessThan || ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('lessThan', e)
								}
							/>
						</td>
						<td></td>
						<td></td>
						<td>
							<Form.Label>Markup is</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.markupLessThan}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('markupLessThan', e)
								}
							/>
						</td>
						<td>
							<Form.Label>and/or</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.andOrLessThan}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('andOrLessThan', e)
								}
							/>
						</td>
					</tr>
					<tr>
						<td>
							<Form.Label>Between</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.betweenStart || ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('betweenStart', e)
								}
							/>
						</td>
						<td>
							<Form.Label>and</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.betweenEnd || ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('betweenEnd', e)
								}
							/>
						</td>
						<td>
							<Form.Label>Markup is</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.markupBetween}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('markupBetween', e)
								}
							/>
						</td>
						<td>
							<Form.Label>and/or</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.andOrBetween}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('andOrBetween', e)
								}
							/>
						</td>
					</tr>

					<tr>
						<td>
							<Form.Label>Over</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.over || ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('over', e)
								}
							/>
						</td>
						<td></td>
						<td></td>
						<td>
							<Form.Label>Markup is</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.markupOver}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('markupOver', e)
								}
							/>
						</td>
						<td>
							<Form.Label>and/or</Form.Label>
						</td>
						<td>
							<Form.Control
								type='text'
								value={wholesaleMarkupData.andOrOver}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleInputChange('andOrOver', e)
								}
							/>
						</td>
					</tr>
				</tbody>
			</Table>
		</div>
	);
};

export default WholesaleMarkup;
