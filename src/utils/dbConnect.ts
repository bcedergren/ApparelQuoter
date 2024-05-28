// src/utils/dbConnect.ts
import { MongoClient, Db } from 'mongodb';

interface DatabaseConnection {
	client: MongoClient;
	db: Db;
}

const uri = process.env.MONGODB_URI as string;
let cachedClient: MongoClient;
let cachedDb: Db;

if (!uri) {
	throw new Error(
		'Please define the MONGODB_URI environment variable inside .env.local'
	);
}

export async function connectToDatabase(): Promise<DatabaseConnection> {
	if (cachedClient && cachedDb) {
		return { client: cachedClient, db: cachedDb };
	}

	const client = new MongoClient(uri);
	await client.connect();
	const db = client.db();
	cachedClient = client;
	cachedDb = db;

	return { client, db };
}
