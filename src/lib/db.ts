import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_DB;
if (!uri) {
  console.error('CRITICAL: MONGO_DB environment variable is not set!');
}


const client = new MongoClient(uri);

let isConnected = false;

export async function connectToDatabase() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log('Connected to MongoDB');
  }
  return client.db(process.env.MONGO_DB_NAME || 'purple-path'); // specify db name
}

export { client };