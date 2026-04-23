import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

// Local API Middleware for development
const localApiPlugin = () => ({
  name: 'local-api-bridge',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url?.startsWith('/api/data') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { collection, action, payload } = JSON.parse(body);
            const client = new MongoClient(process.env.MONGO_DB!);
            await client.connect();
            const db = client.db(process.env.MONGO_DB_NAME || 'purple-path');
            const col = db.collection(collection);

            let result;
            switch (action) {
              case 'find':
                result = await col.find(payload || {}).toArray();
                break;
              case 'insert':
                result = await col.insertOne(payload);
                break;
              case 'update':
                const { id, ...updateData } = payload;
                result = await col.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
                break;
              case 'delete':
                result = await col.deleteOne({ _id: new ObjectId(payload.id) });
                break;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            await client.close();
          } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    tailwindcss(),
    localApiPlugin(),
  ],
  define: {
    'process.env.MONGO_DB': JSON.stringify(process.env.MONGO_DB),
    'process.env.MONGO_DB_NAME': JSON.stringify(process.env.MONGO_DB_NAME),
  }
});
