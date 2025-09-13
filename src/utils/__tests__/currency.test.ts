import { formatCurrency, parseCurrency, calculateTotal, calculateTax } from '../currency';

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1000.50)).toBe('$1,000.50');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
      expect(formatCurrency(-1000)).toBe('-$1,000.00');
    });

    it('should handle decimal places correctly', () => {
      expect(formatCurrency(100.1)).toBe('$100.10');
      expect(formatCurrency(100.12)).toBe('$100.12');
      expect(formatCurrency(100.123)).toBe('$100.12');
      expect(formatCurrency(100.126)).toBe('$100.13');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(0.0)).toBe('$0.00');
    });

    it('should handle string inputs', () => {
      expect(formatCurrency('100')).toBe('$100.00');
      expect(formatCurrency('100.50')).toBe('$100.50');
    });

    it('should handle invalid inputs', () => {
      expect(formatCurrency(NaN)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency('invalid')).toBe('$0.00');
    });
  });

  describe('parseCurrency', () => {
    it('should parse currency strings correctly', () => {
      expect(parseCurrency('$100.00')).toBe(100);
      expect(parseCurrency('$1,000.00')).toBe(1000);
      expect(parseCurrency('$1,000.50')).toBe(1000.50);
      expect(parseCurrency('$0.00')).toBe(0);
    });

    it('should parse negative currency strings', () => {
      expect(parseCurrency('-$100.00')).toBe(-100);
      expect(parseCurrency('-$1,000.00')).toBe(-1000);
    });

    it('should parse numbers without currency symbols', () => {
      expect(parseCurrency('100.00')).toBe(100);
      expect(parseCurrency('1,000.00')).toBe(1000);
      expect(parseCurrency('1000')).toBe(1000);
    });

    it('should handle various formats', () => {
      expect(parseCurrency('100')).toBe(100);
      expect(parseCurrency('100.5')).toBe(100.5);
      expect(parseCurrency('1,000')).toBe(1000);
      expect(parseCurrency('1,000.50')).toBe(1000.50);
    });

    it('should handle invalid inputs', () => {
      expect(parseCurrency('invalid')).toBe(0);
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency(null)).toBe(0);
      expect(parseCurrency(undefined)).toBe(0);
    });

    it('should handle empty strings', () => {
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency(' ')).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total for items array', () => {
      const items = [
        { quantity: 2, unitPrice: 100, total: 200 },
        { quantity: 1, unitPrice: 150, total: 150 },
        { quantity: 3, unitPrice: 50, total: 150 }
      ];

      expect(calculateTotal(items)).toBe(500);
    });

    it('should handle empty items array', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('should handle items with zero values', () => {
      const items = [
        { quantity: 0, unitPrice: 100, total: 0 },
        { quantity: 1, unitPrice: 0, total: 0 },
        { quantity: 2, unitPrice: 50, total: 100 }
      ];

      expect(calculateTotal(items)).toBe(100);
    });

    it('should handle items with decimal values', () => {
      const items = [
        { quantity: 1, unitPrice: 99.99, total: 99.99 },
        { quantity: 2, unitPrice: 50.50, total: 101.00 }
      ];

      expect(calculateTotal(items)).toBe(200.99);
    });

    it('should handle items with negative values', () => {
      const items = [
        { quantity: 1, unitPrice: 100, total: 100 },
        { quantity: 1, unitPrice: -50, total: -50 }
      ];

      expect(calculateTotal(items)).toBe(50);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly', () => {
      expect(calculateTax(100, 8.5)).toBe(8.5);
      expect(calculateTax(1000, 10)).toBe(100);
      expect(calculateTax(100, 0)).toBe(0);
    });

    it('should handle decimal tax rates', () => {
      expect(calculateTax(100, 8.25)).toBe(8.25);
      expect(calculateTax(200, 7.5)).toBe(15);
    });

    it('should handle zero amounts', () => {
      expect(calculateTax(0, 8.5)).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(calculateTax(-100, 8.5)).toBe(-8.5);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateTax(100, 8.333)).toBe(8.33);
      expect(calculateTax(100, 8.336)).toBe(8.34);
    });

    it('should handle string inputs', () => {
      expect(calculateTax('100', '8.5')).toBe(8.5);
      expect(calculateTax(100, '8.5')).toBe(8.5);
    });

    it('should handle invalid inputs', () => {
      expect(calculateTax(NaN, 8.5)).toBe(0);
      expect(calculateTax(100, NaN)).toBe(0);
      expect(calculateTax('invalid', 8.5)).toBe(0);
      expect(calculateTax(100, 'invalid')).toBe(0);
    });
  });
});
