import { DatabaseModule } from "@/core/database/database.module";
import { UserRepository } from "@modules/users/repositories/user.repository";
import { UsersController } from "@modules/users/users.controller";
import { UsersService } from "@modules/users/users.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: "IUserRepository",
      useClass: UserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
