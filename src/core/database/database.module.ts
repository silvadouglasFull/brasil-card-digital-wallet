import * as userSchema from "@modules/users/entities";
import * as schema from "@modules/wallet/entities";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const DB_CONNECTION = "DB_CONNECTION";

@Global()
@Module({
  providers: [
    {
      provide: DB_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>("DATABASE_URL");
        const pool = new Pool({
          connectionString,
        });

        return drizzle(pool, { schema: { ...schema, ...userSchema } });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DB_CONNECTION],
})
export class DatabaseModule {}
