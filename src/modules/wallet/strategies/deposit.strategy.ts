import { CreateTransactionDto } from "@modules/wallet/dtos/create-transaction.dto";
import type { IAccountRepository } from "@modules/wallet/repositories/account-repository.interface";
import { ITransactionRepository } from "@modules/wallet/repositories/transactions-repository.interface";
import { ITransactionStrategy } from "@modules/wallet/strategies/transaction.strategy.interface";
import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
@Injectable()
export class DepositStrategy implements ITransactionStrategy {
  private defaultStatus: string = "PROCESSING";
  private defaultType: string = "DEPOSIT";
  constructor(
    @Inject("IAccountRepository") private accountRepository: IAccountRepository,
    @Inject("ITransactionRepository")
    private transactionRepository: ITransactionRepository,
    private eventEmitter: EventEmitter2,
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
    this.eventEmitter.emit("transaction.created", {
      transactionId: newTransaction.id,
      accountId: account.id,
      amount: dto.amount,
      type: this.defaultType,
    });
    return {
      message: "Depósito solicitado. Aguardando confirmação da auditoria.",
      transactionId: newTransaction.id,
      status: this.defaultStatus,
    };
  }
}
