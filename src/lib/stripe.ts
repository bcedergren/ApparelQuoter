import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

let stripePromise: ReturnType<typeof loadStripe>;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: '2023-10-16',
});

export default stripe;

export const getStripe = () => {
	if (!stripePromise) {
		stripePromise = loadStripe(
			process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
		);
	}
	return stripePromise;
};
