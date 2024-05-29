import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/Header.module.css';
import Image from 'next/image';

const GenericHeader = () => {
	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<div className={styles.logo}>
					<Link href='/'>
						<Image
							src='/logo.png'
							alt='logo'
							width={181}
							height={36}
						/>
					</Link>
				</div>
			</div>
		</header>
	);
};

export default GenericHeader;
