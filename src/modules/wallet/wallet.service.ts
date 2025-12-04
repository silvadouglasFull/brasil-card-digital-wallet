import {
  CreateTransactionDto,
  TransactionType,
} from "@modules/wallet/dtos/create-transaction.dto";
import { IAccountRepository } from "@modules/wallet/repositories/account-repository.interface";
import { ITransactionRepository } from "@modules/wallet/repositories/transactions-repository.interface";
import { DepositStrategy } from "@modules/wallet/strategies/deposit.strategy";
import { ReversalStrategy } from "@modules/wallet/strategies/reversal.strategy";
import { TransferStrategy } from "@modules/wallet/strategies/transfer.strategy";
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    private depositStrategy: DepositStrategy,
    private transferStrategy: TransferStrategy,
    private reversalStrategy: ReversalStrategy,
    @Inject("IAccountRepository") private accountRepository: IAccountRepository,
    @Inject("ITransactionRepository")
    private transactionRepository: ITransactionRepository,
  ) {}

  async processTransaction(dto: CreateTransactionDto, userId: string) {
    this.logger.log(`Iniciando transação... ${JSON.stringify(dto)}`);
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
    const statement = await this.transactionRepository.findMany(account.id);
    if (!statement) throw new BadRequestException("Histórico não encontrado");
    return statement;
  }
  async getHistory(userId: string) {
    const account = await this.getBalance(userId);
    if (!account) throw new BadRequestException("Conta não encontrada");
    const history = await this.transactionRepository.findHistoryByAccountId(
      account.id,
    );
    if (!history) throw new BadRequestException("Histórico não encontrado");
    return history;
  }
}
