// Headline component with CSS Module integration
import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '@/styles/Headline.module.css'; // Ensure the path is correct

const Headline: React.FC = () => {
	const router = useRouter();

	return (
		<div className={styles.headline}>
			<div className={styles.container}>
				<h1 className={`display-4 fw-bold mb-3 ${styles.title}`}>
					Streamline Your Apparel Business
				</h1>
				<h3 className={`lead mb-5 ${styles.lead}`}>
					Enhancing Productivity for Apparel Decorators
				</h3>
				<Image
					src='/WorkTogether.png' // Ensure your public directory contains this image
					alt='SaaS Visual Representation'
					width={800}
					height={600}
					className={styles.headlineImage}
				/>
			</div>
		</div>
	);
};

export default Headline;
