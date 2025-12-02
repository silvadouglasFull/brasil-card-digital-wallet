import { transactions } from "@modules/wallet/entities";
import type {
  ITransactionRepository,
  NewTransaction,
  TranewTransaction,
} from "@modules/wallet/repositories/transactions-repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
export const DB_CONNECTION = "DB_CONNECTION";

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  private defaultType: string = "DEPOSIT";
  private defaultStatus: string = "PROCESSING";
  constructor(@Inject(DB_CONNECTION) private db: ReturnType<typeof drizzle>) {}
  async create(
    transactionData: Pick<
      NewTransaction,
      | "amount"
      | "toAccountId"
      | "fromAccountId"
      | "description"
      | "type"
      | "status"
    >,
  ): Promise<TranewTransaction | undefined> {
    const [newTransaction] = await this.db
      .insert(transactions)
      .values({
        amount: transactionData.amount.toString(),
        type: transactionData.type || this.defaultType,
        status: transactionData.status || this.defaultStatus,
        toAccountId: transactionData.toAccountId,
        fromAccountId: null,
        description: "Depósito via API",
      })
      .returning();
    return newTransaction;
  }
}
