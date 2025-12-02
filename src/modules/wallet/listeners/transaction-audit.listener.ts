import { DB_CONNECTION } from "@/core/database/database.module";
import { transactions } from "@modules/wallet/entities";
import { PayloadDto } from "@modules/wallet/listeners/dto/payload.dto";
import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

@Injectable()
export class TransactionAuditListener {
  constructor(@Inject(DB_CONNECTION) private db: ReturnType<typeof drizzle>) {}
  @OnEvent("transaction.created")
  async handleTransactionCreatedEvent(payload: PayloadDto) {
    console.log(`[AUDITORIA] Analisando transação ${payload.transactionId}...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (payload.type === "DEPOSIT") {
      await this.db.transaction(async (tx) => {
        await tx
          .update(transactions)
          .set({ status: "COMPLETED", updatedAt: new Date() })
          .where(eq(transactions.id, payload.transactionId));

        await tx.execute(
          sql`UPDATE accounts SET balance = balance + ${payload.amount} WHERE id = ${payload.accountId}`,
        );
      });
      console.log(`[AUDITORIA] Transação ${payload.transactionId} APROVADA.`);
    }
  }
}
