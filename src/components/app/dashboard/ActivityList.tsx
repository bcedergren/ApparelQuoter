import React from 'react';
import Card from './Card';
import { FaServer, FaEnvelope, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';
import styles from '@/styles/ActivityList.module.css';

const ActivityList: React.FC = () => (
	<Card title='Recent Activities'>
		<ul className={styles.activitiesList}>
			<li>
				<FaServer /> Updated Server Logs - Just Now
			</li>
			<li>
				<FaEnvelope /> Send Mail to HR and Admin - 2 min ago
			</li>
			<li>
				<FaFileAlt /> Backup Files EOD - 14:00
			</li>
			<li>
				<FaCalendarAlt /> Collect documents from Sara - 16:00
			</li>
			<li>
				<FaCalendarAlt /> Conference call with Marketing Manager - 17:00
			</li>
			<li>
				<FaServer /> Rebooted Server - 17:00
			</li>
			<li>
				<FaFileAlt /> Send contract details to Freelancer - 18:00
			</li>
			<li>
				<FaServer /> Server down for maintenance - 19:00
			</li>
		</ul>
	</Card>
);

export default ActivityList;
