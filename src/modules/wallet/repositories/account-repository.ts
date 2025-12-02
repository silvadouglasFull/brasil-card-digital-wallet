import { accounts } from "@modules/wallet/entities";
import type {
  Account,
  IAccountRepository,
} from "@modules/wallet/repositories/account-repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

export const DB_CONNECTION = "DB_CONNECTION";

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(@Inject(DB_CONNECTION) private db: ReturnType<typeof drizzle>) {}
  async findByUserId(userId: string): Promise<Account | undefined> {
    const [result] = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);
    return result;
  }
}
