import { CreateTransactionDto } from "@modules/wallet/dtos/create-transaction.dto";

export interface ITransactionStrategy {
  handle(dto: CreateTransactionDto, userId: string): Promise<any>;
}
