import React, { ChangeEvent } from 'react';
import { Table, Form } from 'react-bootstrap';
import styles from '@/styles/Pricing.module.css';

type WholesaleWebsite = {
	name: string;
	url: string;
	apiKey: string;
};

interface WholesaleWebsitesProps {
	websites: WholesaleWebsite[];
	setWebsites: (websites: WholesaleWebsite[]) => void;
}

const WholesaleWebsites: React.FC<WholesaleWebsitesProps> = ({
	websites,
	setWebsites,
}) => {
	const handleInputChange = (
		index: number,
		field: keyof WholesaleWebsite,
		event: ChangeEvent<any>
	) => {
		const updatedWebsites = [...websites];
		updatedWebsites[index] = {
			...updatedWebsites[index],
			[field]: event.target.value,
		};
		setWebsites(updatedWebsites);
	};

	return (
		<Table
			bordered
			hover
			className={styles.pricingTable}
		>
			<thead>
				<tr>
					<th>Name</th>
					<th>URL</th>
					<th>API Key</th>
				</tr>
			</thead>
			<tbody>
				{websites.map((website, index) => (
					<tr key={index}>
						<td>
							<Form.Control
								type='text'
								value={website.name}
								onChange={(e) => handleInputChange(index, 'name', e)}
							/>
						</td>
						<td>
							<Form.Control
								type='text'
								value={website.url}
								onChange={(e) => handleInputChange(index, 'url', e)}
							/>
						</td>
						<td>
							<Form.Control
								type='text'
								value={website.apiKey}
								onChange={(e) => handleInputChange(index, 'apiKey', e)}
							/>
						</td>
					</tr>
				))}
			</tbody>
		</Table>
	);
};

export default WholesaleWebsites;
