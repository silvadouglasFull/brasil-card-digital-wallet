import { IUserRepository } from "@/modules/users/repositories/user.repository.interface";
import { CreateTransactionDto } from "@modules/wallet/dtos/create-transaction.dto";
import { TransactionAuditListener } from "@modules/wallet/listeners/transaction-audit.listener";
import { IAccountRepository } from "@modules/wallet/repositories/account-repository.interface";
import { ITransactionRepository } from "@modules/wallet/repositories/transactions-repository.interface";
import { ITransactionStrategy } from "@modules/wallet/strategies/transaction.strategy.interface";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";

@Injectable()
export class TransferStrategy implements ITransactionStrategy {
  private defaultStatus: string = "PROCESSING";
  private defaultType: string = "TRANSFER";
  constructor(
    @Inject("IAccountRepository") private accountRepository: IAccountRepository,
    @Inject("ITransactionRepository")
    private transactionRepository: ITransactionRepository,
    @Inject("IUserRepository")
    private userRepository: IUserRepository,
    @Inject("TransactionAuditListener")
    private eventEmitter: TransactionAuditListener,
  ) {}
  private async getUserName(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new BadRequestException("Usuário não encontrado");
    return user.fullName;
  }
  async handle(dto: CreateTransactionDto, userId: string) {
    if (!dto.toAccountId) {
      throw new BadRequestException(
        "Conta de destino é obrigatória para transferências.",
      );
    }
    const sourceAccount = await this.accountRepository.findByUserId(userId);

    if (!sourceAccount)
      throw new BadRequestException("Conta de origem não encontrada.");

    if (Number(sourceAccount.balance) < dto.amount) {
      throw new BadRequestException(
        "Saldo insuficiente para realizar a transferência.",
      );
    }
    const targetAccount = await this.accountRepository.findFirstByAccountId(
      dto.toAccountId,
    );

    if (!targetAccount)
      throw new BadRequestException("Conta de destino não encontrada.");
    if (sourceAccount.id === targetAccount.id) {
      throw new BadRequestException(
        "Não é possível transferir para a mesma conta.",
      );
    }
    const sourceUserName = await this.getUserName(userId);
    const targetUserName = await this.getUserName(targetAccount.userId);

    const newTransaction = await this.transactionRepository.create({
      amount: dto.amount.toString(),
      type: this.defaultType,
      status: this.defaultStatus,
      fromAccountId: sourceAccount.id,
      toAccountId: targetAccount.id,
      description: `Transferência de ${sourceUserName ?? sourceAccount.accountNumber} para ${targetUserName ?? targetAccount.accountNumber}`,
    });
    if (!newTransaction) throw new Error("Transaction not created");
    await this.eventEmitter.handleTransactionCreatedEvent({
      transactionId: newTransaction.id,
      amount: dto.amount.toString(),
      accountId: sourceAccount.id,
      toAccountId: targetAccount.id,
      type: "TRANSFER",
    });

    return {
      message: "Transferência solicitada. Processando...",
      transactionId: newTransaction.id,
      status: this.defaultStatus,
    };
  }
}
