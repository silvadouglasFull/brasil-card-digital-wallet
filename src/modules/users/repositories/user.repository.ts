import { users } from "@modules/users/entities";
import type {
  IUserRepository,
  NewUser,
  User,
} from "@modules/users/repositories/user.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

export const DB_CONNECTION = "DB_CONNECTION";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@Inject(DB_CONNECTION) private db: ReturnType<typeof drizzle>) {}

  async create(data: NewUser): Promise<User> {
    const result = await this.db.insert(users).values(data).returning();
    return result[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result;
  }

  async findById(id: string): Promise<User | undefined> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result;
  }
  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
