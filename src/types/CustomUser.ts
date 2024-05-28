import { Session } from 'next-auth';
import { User as NextAuthUser } from 'next-auth';
import { JWT as NextAuthJWT } from 'next-auth/jwt';

export interface CustomUser extends NextAuthUser {
	id: string;
	_id: string;
	firstName: string;
	lastName: string;
	companyId: string;
	password?: string;
	role: string;
	rememberMe: boolean;
	stripeCustomerId: string;
	isActive: boolean;
	subscriptionId: string;
}

export interface CustomJWT extends NextAuthJWT {
	id: string;
	firstName: string;
	lastName: string;
	companyId: string;
	role: string;
	rememberMe: boolean;
	stripeCustomerId?: string;
	isActive: boolean;
	subscriptionId: string;
	expiration: number;
}

export interface CustomSession extends Session {
	user: {
		id: string;
		firstName: string;
		lastName: string;
		companyId: string;
		role: string;
		rememberMe: boolean;
		stripeCustomerId: string;
		isActive: boolean;
		subscriptionId: string;
	} & Session['user'];
}
