import React from 'react';
import Card from './Card';
import { FaServer, FaEnvelope, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';
import styles from '@/styles/ActivityList.module.css';

interface Activity {
	activityType: string;
	message: string;
	timestamp: string; // Assuming timestamp is in ISO format
}

interface ActivityListProps {
	activities: Activity[];
}

const getActivityIcon = (activityType: string): JSX.Element => {
	switch (activityType) {
		case 'email':
			return <FaEnvelope />;
		case 'server':
			return <FaServer />;
		case 'file':
			return <FaFileAlt />;
		case 'calendar':
			return <FaCalendarAlt />;
		default:
			return <FaFileAlt />; // Default icon if activity type is unknown
	}
};

const formatTime = (timestamp: string): string => {
	const date = new Date(timestamp);
	return date.toLocaleString(); // Adjust to the desired time format
};

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => (
	<Card title='Recent Activities'>
		<ul className={styles.activitiesList}>
			{activities.map((activity, index) => (
				<li key={index}>
					{getActivityIcon(activity.activityType)} {activity.message} -{' '}
					{formatTime(activity.timestamp)}
				</li>
			))}
		</ul>
	</Card>
);

export default ActivityList;
