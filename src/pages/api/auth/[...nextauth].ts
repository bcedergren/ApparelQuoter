import NextAuth, { User as NextAuthUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/password';
import { connectToDatabase } from '@/utils/dbConnect';
import { User } from '@/types/User';
import { CustomSession } from '@/types/CustomSession';

// Extend the NextAuth User type
interface CustomUser extends NextAuthUser {
	id: string;
	firstName: string;
	lastName: string;
	companyId: string;
	role: string;
}

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
			},
			async authorize(credentials) {
				if (!credentials || !credentials.email || !credentials.password) {
					throw new Error('Credentials must be provided');
				}

				const { db } = await connectToDatabase();

				const userDocument = (await db
					.collection('User')
					.findOne({ email: credentials.email })) as User | null;

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

				// Return user object for JWT
				return {
					id: userDocument._id.toString(), // Ensure _id is a string
					email: userDocument.email,
					firstName: userDocument.firstName,
					lastName: userDocument.lastName,
					companyId: userDocument.companyId.toString(), // Ensure companyId is a string
					role: userDocument.role,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			const customUser = user as CustomUser; // Now using CustomUser for type assertion
			if (customUser) {
				token.id = customUser.id;
				token.email = customUser.email;
				token.firstName = customUser.firstName;
				token.lastName = customUser.lastName;
				token.companyId = customUser.companyId;
				token.role = customUser.role;
			}
			return token;
		},
		async session({ session, token }) {
			const customSession = session as CustomSession;
			customSession.user.id = token.id as string;
			customSession.user.firstName = token.firstName as string;
			customSession.user.lastName = token.lastName as string;
			customSession.user.companyId = token.companyId as string;
			customSession.user.role = token.role as string;

			return customSession; // Return the augmented session object
		},
	},
	pages: {
		signIn: '/login',
		// Add other custom pages if needed
	},
	// Other NextAuth options...
});
