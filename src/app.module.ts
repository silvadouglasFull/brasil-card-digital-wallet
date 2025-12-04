import { DatabaseModule } from "@core/database/database.module";
import { winstonConfig } from "@core/logger/winston.config";
import { AuthModule } from "@modules/auth/auth.module";
import { UsersModule } from "@modules/users/users.module";
import { WalletModule } from "@modules/wallet/wallet.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { WinstonModule } from "nest-winston";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    WinstonModule.forRoot(winstonConfig),
    EventEmitterModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    WalletModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
