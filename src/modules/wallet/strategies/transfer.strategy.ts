import { CreateTransactionDto } from "@modules/wallet/dtos/create-transaction.dto";
import { IAccountRepository } from "@modules/wallet/repositories/account-repository.interface";
import { ITransactionRepository } from "@modules/wallet/repositories/transactions-repository.interface";
import { ITransactionStrategy } from "@modules/wallet/strategies/transaction.strategy.interface";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class TransferStrategy implements ITransactionStrategy {
  private defaultStatus: string = "PROCESSING";
  private defaultType: string = "TRANSFER";
  constructor(
    @Inject("IAccountRepository") private repository: IAccountRepository,
    @Inject("ITransactionRepository")
    private transactionRepository: ITransactionRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async handle(dto: CreateTransactionDto, userId: string) {
    if (!dto.toAccountId) {
      throw new BadRequestException(
        "Conta de destino é obrigatória para transferências.",
      );
    }
    const sourceAccount = await this.repository.findByUserId(userId);

    if (!sourceAccount)
      throw new BadRequestException("Conta de origem não encontrada.");

    if (Number(sourceAccount.balance) < dto.amount) {
      throw new BadRequestException(
        "Saldo insuficiente para realizar a transferência.",
      );
    }
    const targetAccount = await this.repository.findFirstByAccountId(
      dto.toAccountId,
    );

    if (!targetAccount)
      throw new BadRequestException("Conta de destino não encontrada.");
    if (sourceAccount.id === targetAccount.id) {
      throw new BadRequestException(
        "Não é possível transferir para a mesma conta.",
      );
    }

    const newTransaction = await this.transactionRepository.create({
      amount: dto.amount.toString(),
      type: this.defaultType,
      status: this.defaultStatus,
      fromAccountId: sourceAccount.id,
      toAccountId: targetAccount.id,
      description: "Transferência entre usuários",
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
      message: "Transferência solicitada. Processando...",
      transactionId: newTransaction.id,
      status: this.defaultStatus,
    };
  }
}
