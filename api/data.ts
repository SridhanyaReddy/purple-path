import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_DB;
const dbName = process.env.MONGO_DB_NAME || 'purple-path';

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error('MONGO_DB environment variable is not set');
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const { collection, action, payload } = req.body;

    if (!collection || !action) {
      return res.status(400).json({ error: 'Missing collection or action' });
    }

    const col = db.collection(collection);

    switch (action) {
      case 'find':
        const data = await col.find(payload || {}).toArray();
        return res.status(200).json(data);

      case 'insert':
        const insertRes = await col.insertOne(payload);
        return res.status(200).json(insertRes);

      case 'update':
        const { id, ...updateData } = payload;
        const updateRes = await col.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        return res.status(200).json(updateRes);

      case 'delete':
        const deleteRes = await col.deleteOne({ _id: new ObjectId(payload.id) });
        return res.status(200).json(deleteRes);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
