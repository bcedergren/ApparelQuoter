import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';
import { verifyPassword } from '@/lib/password';
import { User } from '@/types/User';
import { connectToDatabase } from '@/utils/dbConnect';

type SessionUser = Omit<User, '_id' | 'password'> & {
	id: string;
	role?: string;
};

export default NextAuth({
	providers: [
		// Add authentication providers here (e.g., Google, Facebook)
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
			name: 'credentials',
			credentials: {
				email: {
					label: 'Email',
					type: 'text',
					placeholder: 'john.doe@example.com',
				},
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {
				console.log('Authorizing user with credentials:');

				if (!credentials || !credentials.email || !credentials.password) {
					return null;
				}

				const { client, db } = await connectToDatabase();

				const userDocument = await db
					.collection('User')
					.findOne({ email: credentials.email });

				if (!userDocument) {
					console.log('No user found with the email', credentials.email);
					return null;
				}

				const passwordsMatch = await verifyPassword(
					credentials.password,
					userDocument.password
				);

				if (!passwordsMatch) {
					console.log('Password is incorrect');
					return null;
				}

				console.log('User authenticated successfully:');

				const user: SessionUser = {
					id: userDocument._id.toString(), // Convert _id to string
					email: userDocument.email,
					name: userDocument.name,
					//companyId: userDocument.companyId;
				};

				client.close();
				return user;
			},
		}),
	],
});
