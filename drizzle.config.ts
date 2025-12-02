import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { ENV } from 'env';

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: ENV.DATABASE_URL,
        ssl: false,
    },
});
