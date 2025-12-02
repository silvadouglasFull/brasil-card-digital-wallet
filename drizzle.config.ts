import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { ENV } from 'env';

export default defineConfig({
    out: './drizzle',
    schema: './src/modules/**/entities/index.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: ENV.DATABASE_URL,
        ssl: false,
    },
});
