'use client';
import { useState } from 'react';
import Pricing from '@/components/public/Pricing';
import { getStripe } from '@/lib/stripeClient';

const baseBtnStyle =
	'bg-slate-100 hover:bg-slate-200 text-black px-6 py-2 rounded-md capitalize font-bold mt-1';

export default function Page() {
	const [type, setType] = useState<string>('monthly');
	const [plan, setPlan] = useState<string>('Starter Plan');

	const handleCreateCheckoutSession = async (productId: string) => {
		const res = await fetch(`/api/stripe/checkout-session`, {
			method: 'POST',
			body: JSON.stringify({ productId }),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const checkoutSession = await res.json().then((value) => {
			return value.session;
		});

		const stripe = await getStripe();
		const { error } = await stripe!.redirectToCheckout({
			sessionId: checkoutSession.id,
		});

		if (error) {
			console.warn(error.message);
		}
	};

	return (
		<div className='m-auto w-fit flex flex-col justify-center'>
			<Pricing
				selectedPlan={{ plan, setPlan }}
				selectedType={{ type, setType }}
			/>
			<button
				className={baseBtnStyle}
				onClick={() => handleCreateCheckoutSession(plan)}
			>
				Go To Checkout
			</button>
		</div>
	);
}
