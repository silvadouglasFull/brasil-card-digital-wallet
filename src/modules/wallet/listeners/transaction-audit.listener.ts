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
    } else if (payload.type === "TRANSFER") {
      console.log(payload);
      await this.processTransfer(payload);
    } else if (payload.type === "REVERSAL") {
      await this.processReversal(payload);
    }
  }
  public async processTransfer(payload: PayloadDto) {
    await this.db.transaction(async (tx) => {
      const debitResult = await tx.execute(
        sql`UPDATE accounts 
            SET balance = balance - ${payload.amount} 
            WHERE id = ${payload.accountId} 
            AND balance >= ${payload.amount}`,
      );

      if (debitResult.rowCount === 0) {
        throw new Error("Saldo insuficiente no momento da execução.");
      }

      await tx.execute(
        sql`UPDATE accounts 
            SET balance = balance + ${payload.amount} 
            WHERE id = ${payload.toAccountId}`,
      );

      await tx
        .update(transactions)
        .set({ status: "COMPLETED", updatedAt: new Date() })
        .where(eq(transactions.id, payload.transactionId));
    });

    console.log(
      `[AUDITORIA] Transferência ${payload.transactionId} CONCLUÍDA.`,
    );
  }
  public async processDeposit(payload: PayloadDto) {
    await this.db.transaction(async (tx) => {
      await tx
        .update(transactions)
        .set({ status: "COMPLETED", updatedAt: new Date() })
        .where(eq(transactions.id, payload.transactionId));

      await tx.execute(
        sql`UPDATE accounts SET balance = balance + ${payload.amount} WHERE id = ${payload.accountId}`,
      );
    });
    console.log(`[AUDITORIA] Depósito ${payload.transactionId} APROVADO.`);
  }
  public async processReversal(payload: PayloadDto) {
    await this.db.transaction(async (tx) => {
      await tx.execute(
        sql`UPDATE accounts 
            SET balance = balance - ${payload.amount} 
            WHERE id = ${payload.accountId}`,
      );

      await tx.execute(
        sql`UPDATE accounts 
            SET balance = balance + ${payload.amount} 
            WHERE id = ${payload.toAccountId}`,
      );

      await tx
        .update(transactions)
        .set({ status: "COMPLETED", updatedAt: new Date() })
        .where(eq(transactions.id, payload.transactionId));
    });

    console.log(
      `[AUDITORIA] Reversão ${payload.transactionId} EXECUTADA (Saldo ajustado).`,
    );
  }
  public async markAsFailed(transactionId: string, reason: string) {
    await this.db
      .update(transactions)
      .set({ status: "FAILED", description: `Falha: ${reason}` })
      .where(eq(transactions.id, transactionId));
  }
}
