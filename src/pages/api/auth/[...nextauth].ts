import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/utils/dbConnect';
import { verifyPassword } from '@/lib/password';
import { CustomUser, CustomJWT, CustomSession } from '@/types/CustomUser';

export default NextAuth({
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
				console.log('Authorize credentials:', credentials);

				if (!credentials || !credentials.email || !credentials.password) {
					throw new Error('Credentials must be provided');
				}

				const { db } = await connectToDatabase();
				const userDocument = (await db
					.collection('users')
					.findOne({ email: credentials.email })) as CustomUser | null;

				if (!userDocument) {
					throw new Error('No user found with the email');
				}

				console.log('User Document:', userDocument);

				if (!userDocument.password) {
					throw new Error('User does not have a password set');
				}

				const isValid = await verifyPassword(
					credentials.password,
					userDocument.password
				);
				console.log('Password valid:', isValid);

				if (!isValid) {
					throw new Error('Password is incorrect');
				}

				return {
					id: userDocument._id.toString(),
					_id: userDocument._id.toString(),
					email: userDocument.email,
					firstName: userDocument.firstName || '',
					lastName: userDocument.lastName || '',
					companyId: userDocument.companyId?.toString() || '',
					role: userDocument.role || '',
					rememberMe: credentials.rememberMe === 'true',
					stripeCustomerId: userDocument.stripeCustomerId || '',
					isActive:
						userDocument.isActive !== null ? userDocument.isActive : false,
					subscriptionId: userDocument.subscriptionId || '',
				} as CustomUser;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
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

				const { db } = await connectToDatabase();
				const existingUser = await db
					.collection('users')
					.findOne({ email: customUser.email });

				if (!existingUser) {
					await db.collection('users').insertOne({
						email: customUser.email,
						firstName: customUser.firstName,
						lastName: customUser.lastName,
						companyId: customUser.companyId,
						role: customUser.role,
						stripeCustomerId: customUser.stripeCustomerId,
						isActive: customUser.isActive,
						subscriptionId: customUser.subscriptionId,
						createdAt: new Date(),
					});
				}
			}
			return token as CustomJWT;
		},
		async session({ session, token }) {
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
});
