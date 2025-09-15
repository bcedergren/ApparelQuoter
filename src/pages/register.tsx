import { Elements } from '@stripe/react-stripe-js';
import Image from 'next/image';
import AccountLayout from '@/components/account/AccountLayout';
import RegistrationForm from '@/components/account/RegistrationForm';
import { getStripe } from '@/lib/stripeClient';
import styles from '@/styles/Register.module.css';
import registerImage from '../../public/signUp.png';

const RegistrationPage = () => {
	return (
		<AccountLayout>
			<div className={styles.registerContainer}>
				<div className={styles.formImageWrapper}>
					<div className={styles.card}>
						<div
							className={`${styles.loginPage} ${styles.bgWhite} ${styles.shadowLg} ${styles.rounded} ${styles.p4} ${styles.mt4} ${styles.positionRelative}`}
						>
							{' '}
							<div className={styles.textCenter}>
								<Image
									src='/logo.png'
									alt='logo'
									className={styles.logo}
									height={50}
									width={200}
								/>
							</div>
							<div className={styles.textCenter}>
								<h3
									className={`${styles.marginBottom} ${styles.paddingBottom}`}
								>
									Sign Up
								</h3>
							</div>
							<Elements stripe={getStripe()}>
								<RegistrationForm />
							</Elements>
						</div>
					</div>
					<div className={styles.imageCol}>
						<Image
							src={registerImage}
							alt='Register Image'
							className={styles.registerImage}
							height={600}
							width={600}
						/>
					</div>
				</div>
			</div>
		</AccountLayout>
	);
};

export default RegistrationPage;
