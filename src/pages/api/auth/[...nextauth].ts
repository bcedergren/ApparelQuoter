import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/password';
import { connectToDatabase } from '@/utils/dbConnect';
import { User as CustomUser } from '@/types/User';

export default NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			authorization: {
				params: {
					prompt: 'consent',
					access_type: 'offline',
					response_type: 'code',
				},
			},
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
					throw new Error('Credentials must be provided');
				}

				const { db } = await connectToDatabase();

				const userDocument = (await db
					.collection('User')
					.findOne({ email: credentials.email })) as CustomUser | null;

				if (!userDocument) {
					throw new Error('No user found with the email');
				}

				const isValid = await verifyPassword(
					credentials.password,
					userDocument.password
				);
				if (!isValid) {
					throw new Error('Password is incorrect');
				}

				return {
					id: userDocument._id.toString(),
					email: userDocument.email,
					firstName: userDocument.firstName,
					lastName: userDocument.lastName,
					companyId: userDocument.companyId.toString(),
					role: userDocument.role,
					rememberMe: credentials.rememberMe === 'true', // Ensure correct type for rememberMe
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.firstName = user.firstName;
				token.lastName = user.lastName;
				token.companyId = user.companyId;
				token.role = user.role;
				token.rememberMe = user.rememberMe;
				token.expiration = user.rememberMe
					? Date.now() + 30 * 24 * 60 * 60 * 1000
					: Date.now() + 2 * 60 * 60 * 1000;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = {
				...session.user,
				id: token.id as string,
				firstName: token.firstName as string,
				lastName: token.lastName as string,
				companyId: token.companyId as string,
				role: token.role as string,
				rememberMe: token.rememberMe as boolean,
			};
			session.expires = new Date(token.expiration!).toISOString();
			return session;
		},
	},
	pages: {
		signIn: '/login',
	},
});
