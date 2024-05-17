// Headline component with CSS Module integration
import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '@/styles/Headline.module.css'; // Ensure the path is correct

const Headline: React.FC = () => {
	const router = useRouter();

	return (
		<div className={styles.headline}>
			<div className={styles.heroTextContainer}>
				<h1 className={`display-4 fw-bold mb-3 ${styles.title}`}>
					We&apos;re Creating{' '}
					<span className={styles.textPrimary}>Solutions...</span>
				</h1>
				<p className={`lead mb-5 ${styles.lead}`}>
					Launch your campaign and benefit from our expertise on designing and
					managing conversion centered bootstrap4 html page.
				</p>
				<Image
					src='/saas-2.png' // Ensure your public directory contains this image
					alt='SaaS Visual Representation'
					width={1233}
					height={618}
					className={styles.headlineImage}
				/>
			</div>
		</div>
	);
};

export default Headline;
