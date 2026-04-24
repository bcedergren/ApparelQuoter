type NumericInput = number | string | null | undefined;

function toNumber(value: NumericInput): number {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}
	if (typeof value === 'string') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}

// Formats a number as a currency string
export function formatCurrency(value: NumericInput): string {
	const normalized = toNumber(value);
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(normalized);
}

// Parses a currency string back to a float number
export function parseCurrency(value: NumericInput): number {
	if (value === null || value === undefined) {
		return 0;
	}
	const cleaned = String(value).replace(/[^0-9.-]+/g, '');
	const parsed = Number(cleaned);
	return Number.isFinite(parsed) ? parsed : 0;
}

type LineItem = { total?: NumericInput };

export function calculateTotal(items: LineItem[] = []): number {
	return items.reduce((sum, item) => sum + toNumber(item.total), 0);
}

export function calculateTax(amount: NumericInput, taxRate: NumericInput): number {
	const normalizedAmount = toNumber(amount);
	const normalizedRate = toNumber(taxRate);
	if (!Number.isFinite(normalizedAmount) || !Number.isFinite(normalizedRate)) {
		return 0;
	}
	return Math.round(((normalizedAmount * normalizedRate) / 100) * 100) / 100;
}
