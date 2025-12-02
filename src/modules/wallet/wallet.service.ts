import {
    CreateTransactionDto,
    TransactionType,
} from "@modules/wallet/dtos/create-transaction.dto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { DepositStrategy } from "./strategies/deposit.strategy";
@Injectable()
export class WalletService {
  constructor(private depositStrategy: DepositStrategy) {}
  async processTransaction(dto: CreateTransactionDto, userId: string) {
    switch (dto.type) {
      case TransactionType.DEPOSIT:
        return this.depositStrategy.handle(dto, userId);
      default:
        throw new BadRequestException("Tipo de transação não suportado");
    }
  }
}
