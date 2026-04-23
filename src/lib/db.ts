import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_DB;
if (!uri) {
  console.error('CRITICAL: MONGO_DB environment variable is not set!');
}

const client = new MongoClient(uri!);

let isConnected = false;

export async function connectToDatabase() {
  if (!isConnected) {
    if (!uri) throw new Error('MONGO_DB URI is missing');
    try {
      console.log('Attempting to connect to MongoDB...');
      await client.connect();
      isConnected = true;
      console.log('✅ Connected to MongoDB successfully');
    } catch (err: any) {
      console.error('❌ MongoDB Connection Error:', err.message);
      throw err;
    }
  }
  const dbName = process.env.MONGO_DB_NAME || 'test';
  return client.db(dbName);
}

export { client };