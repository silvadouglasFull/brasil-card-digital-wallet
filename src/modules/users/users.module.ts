import { DatabaseModule } from "@/core/database/database.module";
import { UserRepository } from "@modules/users/repositories/user.repository";
import { UsersService } from "@modules/users/users.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [DatabaseModule],
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
