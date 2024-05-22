import React from 'react';
import { IconType } from 'react-icons';
import styles from '@/styles/Card.module.css';

interface CardProps {
	title: string;
	value?: string;
	subtitle?: string;
	icon?: IconType;
	color?: string;
	children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
	title,
	value,
	subtitle,
	icon: Icon,
	color,
	children,
}) => {
	return (
		<div className={styles.card}>
			<div className={styles.header}>
				{Icon && (
					<div
						className={styles.iconWrapper}
						style={{ backgroundColor: color }}
					>
						<Icon className={styles.icon} />
					</div>
				)}
				<div className={styles.content}>
					<h4>{title}</h4>
					{value && <h2>{value}</h2>}
					{subtitle && <p>{subtitle}</p>}
				</div>
			</div>
			{children && <div className={styles.children}>{children}</div>}
		</div>
	);
};

export default Card;
