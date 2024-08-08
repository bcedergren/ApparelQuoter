export default function formatFields(
	obj: any,
	fields: string[],
	decimalPlaces: number
) {
	Object.keys(obj).forEach((key) => {
		if (Array.isArray(obj[key])) {
			obj[key] = obj[key].map((value: any) => {
				if (typeof value === 'object' && value !== null) {
					formatFields(value, fields, decimalPlaces);
					return value;
				} else if (fields.includes(key)) {
					return parseFloat(value).toFixed(decimalPlaces);
				}
				return value;
			});
		} else if (typeof obj[key] === 'object' && obj[key] !== null) {
			formatFields(obj[key], fields, decimalPlaces);
		} else if (
			fields.includes(key) &&
			obj[key] !== null &&
			obj[key] !== undefined
		) {
			obj[key] = parseFloat(obj[key]).toFixed(decimalPlaces);
		}
	});
}
