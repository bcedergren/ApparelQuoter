import { Session } from 'next-auth';

export interface CustomSession extends Session {
	user: {
		id: string;
		firstName: string;
		lastName: string;
		companyId: string;
		role: string;
		rememberMe: boolean;
	} & Session['user']; // Include existing session user fields
}
