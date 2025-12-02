/* eslint-disable @typescript-eslint/no-unused-vars */
import { accounts } from "@modules/wallet/entities";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/node-postgres";
import { CreateUserDto } from "./dtos/create-user.dto";
import { users } from "./entities";
import { DB_CONNECTION } from "./repositories/user.repository";
import {
  IUserRepository,
  User,
} from "./repositories/user.repository.interface";

@Injectable()
export class UsersService {
  constructor(
    @Inject("IUserRepository") private userRepository: IUserRepository,
    @Inject(DB_CONNECTION) private db: ReturnType<typeof drizzle>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (userExists) {
      throw new BadRequestException("Usuário já cadastrado com este e-mail.");
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    return await this.db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          ...createUserDto,
          password: hashedPassword,
          isActive: false,
        })
        .returning();
      const accountNumber = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const branch = "0001";

      await tx.insert(accounts).values({
        userId: newUser.id,
        branch: branch,
        accountNumber: accountNumber,
        balance: "0.00",
      });
      const { password, ...result } = newUser;
      return { ...result, account: { branch, accountNumber } };
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findByEmail(email);
  }
}
