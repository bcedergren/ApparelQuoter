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

const WholesaleMarkupComponent: React.FC<WholesaleMarkupProps> = ({
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
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									min='0.00'
									value={wholesaleMarkupData.lessThan || ''}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('lessThan', e)
									}
								/>
							</div>
						</td>
						<td></td>
						<td></td>
						<td>
							<Form.Label>Markup is</Form.Label>
						</td>
						<td>
							<div className='percentage-input'>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={wholesaleMarkupData.markupLessThan}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('markupLessThan', e)
									}
								/>
								<span className='percentage-symbol'>%</span>
							</div>
						</td>
						<td>
							<Form.Label>and/or</Form.Label>
						</td>
						<td>
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={wholesaleMarkupData.andOrLessThan}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('andOrLessThan', e)
									}
								/>
							</div>
						</td>
					</tr>
					<tr>
						<td>
							<Form.Label>Between</Form.Label>
						</td>
						<td>
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									min='0.00'
									value={wholesaleMarkupData.betweenStart || ''}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('betweenStart', e)
									}
								/>
							</div>
						</td>
						<td>
							<Form.Label>and</Form.Label>
						</td>
						<td>
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									min='0.00'
									value={wholesaleMarkupData.betweenEnd || ''}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('betweenEnd', e)
									}
								/>
							</div>
						</td>
						<td>
							<Form.Label>Markup is</Form.Label>
						</td>
						<td>
							<div className='percentage-input'>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={wholesaleMarkupData.markupBetween}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('markupBetween', e)
									}
								/>
								<span className='percentage-symbol'>%</span>
							</div>
						</td>
						<td>
							<Form.Label>and/or</Form.Label>
						</td>
						<td>
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={wholesaleMarkupData.andOrBetween}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('andOrBetween', e)
									}
								/>
							</div>
						</td>
					</tr>
					<tr>
						<td>
							<Form.Label>Over</Form.Label>
						</td>
						<td>
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									min='0.00'
									value={wholesaleMarkupData.over || ''}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('over', e)
									}
								/>
							</div>
						</td>
						<td></td>
						<td></td>
						<td>
							<Form.Label>Markup is</Form.Label>
						</td>
						<td>
							<div className='percentage-input'>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={wholesaleMarkupData.markupOver}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('markupOver', e)
									}
								/>
								<span className='percentage-symbol'>%</span>
							</div>
						</td>
						<td>
							<Form.Label>and/or</Form.Label>
						</td>
						<td>
							<div className='currency-input'>
								<span className='currency-symbol'>$</span>
								<Form.Control
									type='number'
									step='0.01'
									min='0.00'
									value={wholesaleMarkupData.andOrOver}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange('andOrOver', e)
									}
								/>
							</div>
						</td>
					</tr>
				</tbody>
			</Table>
		</div>
	);
};

export default WholesaleMarkupComponent;
