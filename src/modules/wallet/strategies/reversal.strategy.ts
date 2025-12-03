import { CreateTransactionDto } from "@modules/wallet/dtos/create-transaction.dto";
import { IAccountRepository } from "@modules/wallet/repositories/account-repository.interface";
import { ITransactionRepository } from "@modules/wallet/repositories/transactions-repository.interface";
import { ITransactionStrategy } from "@modules/wallet/strategies/transaction.strategy.interface";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class ReversalStrategy implements ITransactionStrategy {
  private defaultType: string = "REVERSAL";
  private defaultStatus: string = "PROCESSING";
  constructor(
    @Inject("IAccountRepository") private accountRepository: IAccountRepository,
    @Inject("ITransactionRepository")
    private transactionRepository: ITransactionRepository,
    @Inject("EventEmitter2")
    private eventEmitter: EventEmitter2,
  ) {}

  async handle(dto: CreateTransactionDto, userId: string) {
    const sourceAccount = await this.accountRepository.findByUserId(userId);

    if (!sourceAccount)
      throw new BadRequestException("Conta de origem não encontrada.");

    if (!dto.toAccountId)
      throw new BadRequestException("Conta de destino (estorno) necessária.");

    const targetAccount = await this.accountRepository.findFirstByAccountId(
      dto.toAccountId,
    );

    if (!targetAccount)
      throw new BadRequestException("Conta de destino não encontrada.");

    const newTransaction = await this.transactionRepository.create({
      amount: dto.amount.toString(),
      type: this.defaultType,
      status: this.defaultStatus,
      fromAccountId: sourceAccount.id,
      toAccountId: targetAccount.id,
      description: "Reversão administrativa/Solicitada",
    });
    if (!newTransaction) throw new Error("Transaction not created");
    this.eventEmitter.emit("transaction.created", {
      transactionId: newTransaction.id,
      amount: dto.amount.toString(),
      accountId: sourceAccount.id,
      toAccountId: targetAccount.id,
      type: this.defaultType,
    });

    return {
      message: "Reversão solicitada. O saldo poderá ficar negativo.",
      transactionId: newTransaction.id,
      status: this.defaultStatus,
    };
  }
}
