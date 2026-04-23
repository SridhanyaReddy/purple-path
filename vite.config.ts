import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart(),
    react(),
    tailwindcss(),
  ],
  define: {
    'process.env.MONGO_DB': JSON.stringify(process.env.MONGO_DB),
    'process.env.MONGO_DB_NAME': JSON.stringify(process.env.MONGO_DB_NAME),
  }
});
