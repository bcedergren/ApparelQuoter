// Formats a number as a currency string
export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(value);
}

// Parses a currency string back to a float number
export function parseCurrency(value: string): number {
	return Number(value.replace(/[^0-9.-]+/g, ''));
}
