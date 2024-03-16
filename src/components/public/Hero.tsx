import React from 'react';
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import styles from '@/styles/Home.module.css'; // Adjust the import path to where your styles are located

const Hero = () => {
	const router = useRouter();

	return (
		<div className={styles.hero}>
			<div className={styles.heroTextContainer}>
				<h1 className='text-3xl md:text-5xl text-white font-bold mb-4'>
					Transform Your Apparel Decorating Business
				</h1>
				<p className='text-xl md:text-2xl text-white mb-5'>
					Discover the ultimate tool for screen printers and embroiderers.
				</p>
				<Button
					variant='primary'
					className='mt-2 mb-2'
					onClick={() => router.push('/register')}
				>
					Try for free today!
				</Button>
			</div>
		</div>
	);
};

export default Hero;
