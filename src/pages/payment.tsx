import { useState } from 'react';
import { useRouter } from 'next/router';
import { getStripe } from '@/lib/stripe';
import styles from '@/styles/Payment.module.css';

const PaymentPage = () => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleCheckout = async () => {
		setLoading(true);
		const res = await fetch('/api/stripe/checkout-session', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const checkoutSession = await res.json();
		const stripe = await getStripe();
		const { error } = await stripe!.redirectToCheckout({
			sessionId: checkoutSession.id,
		});

		if (error) {
			console.error(error.message);
		}
		setLoading(false);
	};

	return (
		<div className={styles.paymentContainer}>
			<h1>Complete Your Purchase</h1>
			<div className={styles.paymentForm}>
				<button
					className={styles.paymentButton}
					onClick={handleCheckout}
					disabled={loading}
				>
					{loading ? 'Processing…' : 'Go to Checkout'}
				</button>
			</div>
		</div>
	);
};

export default PaymentPage;
