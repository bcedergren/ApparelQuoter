import { Session } from 'next-auth';

// Extend the built-in session/user types to include the custom user fields
export interface CustomSession extends Session {
	user: {
		id: string;
		firstName: string;
		lastName: string;
		companyId: string;
		role: string;
	} & Session['user']; // Include existing session user fields
}
