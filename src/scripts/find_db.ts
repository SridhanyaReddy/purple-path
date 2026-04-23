import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function scan() {
  const uri = process.env.MONGO_DB;
  if (!uri) return console.log('Env missing');
  const client = new MongoClient(uri);
  await client.connect();
  
  const dbs = await client.db().admin().listDatabases();
  console.log('Found databases:', dbs.databases.map(d => d.name));
  
  for (const dbInfo of dbs.databases) {
    const db = client.db(dbInfo.name);
    const collections = await db.listCollections().toArray();
    for (const colInfo of collections) {
      const count = await db.collection(colInfo.name).countDocuments();
      if (count > 0) {
        console.log(`Database [${dbInfo.name}] -> Collection [${colInfo.name}] has ${count} items.`);
        const samples = await db.collection(colInfo.name).find().limit(1).toArray();
        console.log('Sample:', JSON.stringify(samples[0]).slice(0, 100));
      }
    }
  }
  await client.close();
}
scan();
