import Image from 'next/image';
import styles from '@/styles/Login.module.css';
import AccountLayout from '@/components/account/AccountLayout';
import LoginForm from '@/components/account/LoginForm';
import signInImage from '../../public/signIn.png';

const LoginPage = () => {
	return (
		<AccountLayout>
			<div className={styles.loginContainer}>
				<div className={styles.formImageWrapper}>
					<div className={styles.card}>
						<div
							className={`${styles.loginPage} ${styles.bgWhite} ${styles.shadowLg} ${styles.rounded} ${styles.p4} ${styles.mt4} ${styles.positionRelative}`}
						>
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
								<h3>Sign In</h3>
							</div>
							<LoginForm />
						</div>
					</div>
					<div className={styles.imageCol}>
						<Image
							src={signInImage}
							alt='Sign In Image'
							className={styles.signInImage}
							height={600}
							width={600}
						/>
					</div>
				</div>
			</div>
		</AccountLayout>
	);
};

export default LoginPage;
