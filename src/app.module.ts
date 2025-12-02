import { DatabaseModule } from "@core/database/database.module";
import { AuthModule } from "@modules/auth/auth.module";
import { UsersModule } from "@modules/users/users.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
