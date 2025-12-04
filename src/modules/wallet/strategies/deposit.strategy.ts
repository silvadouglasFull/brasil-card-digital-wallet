import { CreateTransactionDto } from "@modules/wallet/dtos/create-transaction.dto";
import { TransactionAuditListener } from "@modules/wallet/listeners/transaction-audit.listener";
import type { IAccountRepository } from "@modules/wallet/repositories/account-repository.interface";
import { ITransactionRepository } from "@modules/wallet/repositories/transactions-repository.interface";
import { ITransactionStrategy } from "@modules/wallet/strategies/transaction.strategy.interface";
import { Inject, Injectable } from "@nestjs/common";
@Injectable()
export class DepositStrategy implements ITransactionStrategy {
  private defaultStatus: string = "PROCESSING";
  constructor(
    @Inject("IAccountRepository") private accountRepository: IAccountRepository,
    @Inject("ITransactionRepository")
    private transactionRepository: ITransactionRepository,
    @Inject("TransactionAuditListener")
    private eventEmitter: TransactionAuditListener,
  ) {}

  async handle(dto: CreateTransactionDto, userId: string) {
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) throw new Error("Account not found");
    const newTransaction = await this.transactionRepository.create({
      amount: dto.amount.toString(),
      toAccountId: account.id,
      fromAccountId: null,
      description: "Depósito via API",
    });
    if (!newTransaction) throw new Error("Transaction not created");
    await this.eventEmitter.handleTransactionCreatedEvent({
      transactionId: newTransaction.id,
      accountId: account.id,
      amount: dto.amount.toString(),
      type: "DEPOSIT",
    });
    return {
      message: "Depósito solicitado. Aguardando confirmação da auditoria.",
      transactionId: newTransaction.id,
      status: this.defaultStatus,
    };
  }
}
