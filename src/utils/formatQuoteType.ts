// Utility function to format and singularize quote type
export const formatQuoteType = (quoteType: string): string => {
	const pluralToSingular: { [key: string]: string } = {
		Orders: 'Order',
		Quotes: 'Quote',
		// Add more mappings as needed
	};

	// Insert spaces before capital letters in the middle of the string
	const spacedQuoteType = quoteType.replace(/([a-z])([A-Z])/g, '$1 $2');

	return spacedQuoteType
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
		.map(
			(word, index, array) =>
				index === array.length - 1 ? pluralToSingular[word] || word : word // Convert last word to singular if needed
		)
		.join(' ');
};

// Utility function to capitalize and format the column header
export const formatColumnHeader = (columnId: string): string => {
	// Insert a space before all caps and capitalize the first letter
	return (
		columnId
			// Replace camelCase with space and split into words
			.replace(/([A-Z])/g, ' $1')
			// Trim the result to remove any leading space if columnId was starting with an uppercase letter
			.trim()
			// Capitalize the first letter of each word
			.split(' ')
			.map(
				(word: string) =>
					word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
			)
			.join(' ')
	);
};
