import mongoose, { Types } from 'mongoose';
import Quote from '@/models/Quote';
import Company from '@/models/Company'; // Assuming you have a Company model
import dbConnect from '@/utils/dbConnect';
import logger from '@/utils/logger'; // Import the logger
import { Company as CompanyType } from '@/types/Company';

// Define a type for the lean result with just the `_id` field
interface LeanQuote {
	_id: string;
}

// Generate the next quote ID for a given company
export const generateNextQuoteId = async (
	companyId: string
): Promise<string> => {
	// Connect to the database
	await dbConnect();
	logger.info(
		`Database connected. Generating next quote ID for company: ${companyId}`
	);

	try {
		// Convert companyId to ObjectId
		const companyObjectId = new mongoose.Types.ObjectId(companyId);

		// Fetch the company details
		const company = await getCompanyById(companyObjectId);
		if (!company) {
			throw new Error(`Company not found for ID: ${companyId}`);
		}

		// Get the last quote ID if it exists
		const lastQuoteId = await getLastQuoteId(companyObjectId);

		// Determine the next quote ID
		let nextQuoteId: string;
		if (lastQuoteId === 0) {
			// No existing quotes, use the initial format
			nextQuoteId = formatInitialQuoteId(company);
		} else {
			// Existing quotes found, generate the next sequential quote ID
			nextQuoteId = formatQuoteId(company, (lastQuoteId + 1).toString());
		}

		logger.info(`Next quote ID for company ${companyId}: ${nextQuoteId}`);
		return nextQuoteId;
	} catch (error) {
		logger.error(
			`Error generating next quote ID for company ${companyId}: ${error}`
		);
		throw new Error('Failed to generate next quote ID');
	}
};

// Get the last quote ID for a given company
export const getLastQuoteId = async (
	companyId: Types.ObjectId
): Promise<number> => {
	logger.info(`Fetching the last quote ID for company: ${companyId}`);

	try {
		const lastQuote = await Quote.findOne({ companyId })
			.sort({ _id: -1 }) // Sort in descending order to get the last one
			.select('_id')
			.lean<LeanQuote | null>(); // Use the LeanQuote type or null if not found

		const lastQuoteId = lastQuote ? parseInt(lastQuote._id, 10) : 0;
		logger.info(`Last quote ID for company ${companyId}: ${lastQuoteId}`);
		return lastQuoteId;
	} catch (error) {
		logger.error(
			`Error fetching last quote ID for company ${companyId}: ${error}`
		);
		throw new Error('Failed to fetch last quote ID');
	}
};

// Fetch the company by ID
export const getCompanyById = async (
	companyId: Types.ObjectId
): Promise<CompanyType | null> => {
	logger.info(`Fetching company details for ID: ${companyId}`);

	try {
		const company = await Company.findById(
			companyId
		).lean<CompanyType | null>();
		if (!company) {
			logger.error(`No company found for ID: ${companyId}`);
			return null;
		}
		logger.info(`Fetched company details for ID: ${companyId}`);
		return company;
	} catch (error) {
		logger.error(
			`Error fetching company details for ID ${companyId}: ${error}`
		);
		throw new Error('Failed to fetch company details');
	}
};

// Format the initial quote ID according to the company's preferred format
export const formatInitialQuoteId = (company: CompanyType): string => {
	const format = company.quoteIdFormat || '00000x'; // Default format if not specified
	const xPosition = format.indexOf('x');

	let initialQuoteId = '';

	if (xPosition !== -1) {
		// Generate initial ID with 1
		const initialPart = '1'.padStart(format.length - 1, '0'); // Exclude 'x' from the length
		initialQuoteId = format.replace('x', initialPart);
	} else {
		// Default formatting if 'x' is not found
		initialQuoteId = '1'.padStart(format.length, '0');
	}

	logger.info(
		`Initial formatted quote ID for company ${company.name}: ${initialQuoteId}`
	);
	return initialQuoteId;
};

// Format the new quote ID according to the company's preferred format
export const formatQuoteId = (
	company: CompanyType,
	newQuoteId: string
): string => {
	logger.info(`Formatting quote ID ${newQuoteId} for company ${company.name}`);

	const format = company.quoteIdFormat || '00000x'; // Default format if not specified
	const xPosition = format.indexOf('x');

	let formattedQuoteId = '';

	if (xPosition !== -1) {
		// Pad the new ID with zeros based on the position of 'x'
		const paddedPart = newQuoteId.padStart(format.length - 1, '0'); // Exclude 'x' from the length
		formattedQuoteId = format.replace('x', paddedPart);
	} else {
		// Default formatting if 'x' is not found
		formattedQuoteId = newQuoteId.padStart(format.length, '0');
	}

	logger.info(
		`Formatted quote ID for company ${company.name}: ${formattedQuoteId}`
	);
	return formattedQuoteId;
};
