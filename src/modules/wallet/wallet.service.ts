import {
  CreateTransactionDto,
  TransactionType,
} from "@modules/wallet/dtos/create-transaction.dto";
import { DepositStrategy } from "@modules/wallet/strategies/deposit.strategy";
import { ReversalStrategy } from "@modules/wallet/strategies/reversal.strategy";
import { TransferStrategy } from "@modules/wallet/strategies/transfer.strategy";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IAccountRepository } from "./repositories/account-repository.interface";
import { ITransactionRepository } from "./repositories/transactions-repository.interface";
@Injectable()
export class WalletService {
  constructor(
    private depositStrategy: DepositStrategy,
    private transferStrategy: TransferStrategy,
    private reversalStrategy: ReversalStrategy,
    @Inject("IAccountRepository") private accountRepository: IAccountRepository,
    @Inject("ITransactionRepository")
    private transactionRepository: ITransactionRepository,
  ) {}

  async processTransaction(dto: CreateTransactionDto, userId: string) {
    switch (dto.type) {
      case TransactionType.DEPOSIT:
        return this.depositStrategy.handle(dto, userId);
      case TransactionType.TRANSFER:
        return this.transferStrategy.handle(dto, userId);
      case TransactionType.REVERSAL:
        return this.reversalStrategy.handle(dto, userId);
      default:
        throw new BadRequestException("Tipo de transação não suportado");
    }
  }
  async getBalance(userId: string) {
    const account = await this.accountRepository.findByUserId(userId);
    if (!account)
      throw new BadRequestException(
        "Conta não encontrada ou O Usuário não tem conta",
      );
    return account;
  }
  async getStatement(userId: string) {
    const account = await this.getBalance(userId);
    if (!account) throw new BadRequestException("Conta não encontrada");
    const history = await this.transactionRepository.findMany(account.id);
    if (!history) throw new BadRequestException("Histórico não encontrado");
    return history;
  }
}
