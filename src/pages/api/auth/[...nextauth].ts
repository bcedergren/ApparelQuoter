/* This code snippet is setting up authentication using NextAuth in a TypeScript environment. It is
configuring authentication providers like Google, Facebook, and custom credentials provider. */
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { verifyPassword } from '@/lib/password';
import { CustomUser, CustomJWT, CustomSession } from '@/types/CustomUser';

export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60,
		updateAge: 24 * 60 * 60,
	},
	useSecureCookies: process.env.NODE_ENV === 'production',
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
		FacebookProvider({
			clientId: process.env.FACEBOOK_CLIENT_ID as string,
			clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: {
					label: 'Email',
					type: 'text',
					placeholder: 'john.doe@example.com',
				},
				password: { label: 'Password', type: 'password' },
				rememberMe: { label: 'Remember me', type: 'checkbox' },
			},
			async authorize(credentials) {
				if (!credentials || !credentials.email || !credentials.password) {
					console.error('Credentials must be provided');
					throw new Error('Credentials must be provided');
				}

				await dbConnect();
				const user = await User.findOne({ email: credentials.email });

				if (!user) {
					console.error(`No user found with the email ${credentials.email}`);
					throw new Error('No user found with the email');
				}

				if (!user.password) {
					console.error(
						`User ${credentials.email} does not have a password set`
					);
					throw new Error('User does not have a password set');
				}

				const isValid = await verifyPassword(
					credentials.password,
					user.password
				);
				if (!isValid) {
					console.error('Password is incorrect');
					throw new Error('Password is incorrect');
				}

				console.log(`User ${credentials.email} authorized successfully`);

				return {
					id: user._id.toString(),
					_id: user._id.toString(),
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					companyId: user.companyId,
					role: user.role,
					rememberMe: credentials.rememberMe === 'true',
					stripeCustomerId: user.stripeCustomerId,
					isActive: user.isActive,
					subscriptionId: user.subscriptionId,
				} as CustomUser;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				console.log('JWT callback: setting token from user');
				const customUser = user as CustomUser;
				token.id = customUser.id;
				token.email = customUser.email;
				token.firstName = customUser.firstName;
				token.lastName = customUser.lastName;
				token.companyId = customUser.companyId;
				token.role = customUser.role;
				token.rememberMe = customUser.rememberMe;
				token.stripeCustomerId = customUser.stripeCustomerId;
				token.subscriptionId = customUser.subscriptionId;
				token.isActive = customUser.isActive;
				token.expiration = customUser.rememberMe
					? Date.now() + 30 * 24 * 60 * 60 * 1000
					: Date.now() + 2 * 60 * 60 * 1000;

				await dbConnect();
				const existingUser = await User.findOne({ email: customUser.email });

				if (!existingUser) {
					console.log(`Creating new user ${customUser.email}`);
					await User.create({
						email: customUser.email,
						firstName: customUser.firstName,
						lastName: customUser.lastName,
						companyId: customUser.companyId,
						role: customUser.role,
						stripeCustomerId: customUser.stripeCustomerId,
						isActive: customUser.isActive,
						subscriptionId: customUser.subscriptionId,
					});
				} else {
					console.log(`User ${customUser.email} already exists`);
				}
			}
			return token as CustomJWT;
		},
		async session({ session, token }) {
			console.log('Session callback: setting session from token');
			const customSession = session as CustomSession;
			customSession.user.id = token.id as string;
			customSession.user.firstName = token.firstName as string;
			customSession.user.lastName = token.lastName as string;
			customSession.user.companyId = token.companyId as string;
			customSession.user.role = token.role as string;
			customSession.user.rememberMe = token.rememberMe as boolean;
			customSession.user.stripeCustomerId = token.stripeCustomerId as string;
			customSession.user.subscriptionId = token.subscriptionId as string;
			customSession.user.isActive = token.isActive as boolean;
			return customSession;
		},
	},
	pages: {
		signIn: '/login',
	},
	events: {
		async signIn(message: any) {
			console.log('User signed in:', message);
		},
		async signOut(message: any) {
			console.log('User signed out:', message);
		},
	},
};

export default NextAuth(authOptions);
