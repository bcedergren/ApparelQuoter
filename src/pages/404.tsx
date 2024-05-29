import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiHome } from '@mdi/js';
import { Container } from 'react-bootstrap';
import Image from 'next/image';
import _404Image from '../../public/404.png';
import styles from '@/styles/404.module.css';
import AccountLayout from '@/components/account/AccountLayout';

const Custom404 = () => {
	return (
		<AccountLayout>
			<Container className={styles.container}>
				<Image
					src={_404Image}
					alt='404 Image'
					className={styles._404Image}
					width={1200}
					height={800}
				/>
				<Link href='/'>
					<span className={styles.homeLink}>
						<Icon
							path={mdiHome}
							size={1}
							color='blue'
						/>
						Go back to Home
					</span>
				</Link>
			</Container>
		</AccountLayout>
	);
};

export default Custom404;
