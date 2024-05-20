import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			firstName: string;
			lastName: string;
			companyId: string;
			role: string;
			rememberMe: boolean;
		} & DefaultSession['user'];
		expires: string;
	}

	interface User {
		id: string;
		firstName: string;
		lastName: string;
		companyId: string;
		role: string;
		rememberMe: boolean;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string;
		firstName: string;
		lastName: string;
		companyId: string;
		role: string;
		rememberMe: boolean;
		expiration: number;
	}
}
