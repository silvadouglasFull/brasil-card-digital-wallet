import {
  CreateTransactionDto,
  TransactionType,
} from "@modules/wallet/dtos/create-transaction.dto";
import { DepositStrategy } from "@modules/wallet/strategies/deposit.strategy";
import { TransferStrategy } from "@modules/wallet/strategies/transfer.strategy";
import { BadRequestException, Injectable } from "@nestjs/common";
@Injectable()
export class WalletService {
  constructor(
    private depositStrategy: DepositStrategy,
    private transferStrategy: TransferStrategy,
  ) {}
  async processTransaction(dto: CreateTransactionDto, userId: string) {
    switch (dto.type) {
      case TransactionType.DEPOSIT:
        return this.depositStrategy.handle(dto, userId);
      case TransactionType.TRANSFER:
        return this.transferStrategy.handle(dto, userId);
      default:
        throw new BadRequestException("Tipo de transação não suportado");
    }
  }
}
