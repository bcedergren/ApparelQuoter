export async function updateDatabase(
	orderId: string,
	newStatus: string,
	session: any
) {
	try {
		// Fetch the quote before updating its status
		const quoteResponse = await fetch(`/api/quotes/update/${orderId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!quoteResponse.ok) {
			throw new Error(
				`Fetching quote failed with status: ${quoteResponse.status}`
			);
		}

		const quote = await quoteResponse.json();
		const totalAmount = quote.summary.totalCost;

		// Proceed to update the quote's status
		const updateResponse = await fetch(`/api/quotes/update/${orderId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ status: newStatus }),
		});

		if (!updateResponse.ok) {
			throw new Error(`API call failed with status: ${updateResponse.status}`);
		}

		const updatedOrder = await updateResponse.json();
		const activityResponse = await fetch(`/api/activities/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				orderId,
				companyId: session.user.companyId,
				updatedBy: session.user.id,
				activityType: 'status-update',
				message: `Order ${orderId} status changed to ${newStatus} by ${session.user.name}`,
				timestamp: new Date().toISOString(),
			}),
		});

		if (!activityResponse.ok) {
			throw new Error(
				`Activity logging failed with status: ${activityResponse.status}`
			);
		}

		const activityRecord = await activityResponse.json();

		if (newStatus === 'completedOrders') {
			const salesResponse = await fetch(`/api/sales/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					orderId,
					companyId: session.user.companyId,
					salesPersonId: session.user.id,
					saleDate: new Date().toISOString(),
					totalAmount: totalAmount, // Use the total amount from the fetched quote
				}),
			});

			if (!salesResponse.ok) {
				throw new Error(
					`Sales record creation failed with status: ${salesResponse.status}`
				);
			}

			const salesRecord = await salesResponse.json();

			// Fetch the updated quote after setting it to completed
			const updatedQuoteResponse = await fetch(`/api/quotes/${orderId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!updatedQuoteResponse.ok) {
				throw new Error(
					`Fetching updated quote failed with status: ${updatedQuoteResponse.status}`
				);
			}

			const updatedQuote = await updatedQuoteResponse.json();

			// Return the updated order, activity record, and sales record
			return { updatedOrder, activityRecord, salesRecord, updatedQuote };
		}

		return { updatedOrder, activityRecord };
	} catch (error) {
		console.error('Error updating the database:', error);
		throw error;
	}
}
