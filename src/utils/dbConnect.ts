import { MongoClient, Db } from 'mongodb';

interface DatabaseConnection {
	client: MongoClient;
	db: Db;
}

const uri = process.env.MONGODB_URI as string;

export async function connectToDatabase(): Promise<DatabaseConnection> {
	const client = new MongoClient(uri);
	await client.connect();
	const db = client.db();

	return { client, db };
}
