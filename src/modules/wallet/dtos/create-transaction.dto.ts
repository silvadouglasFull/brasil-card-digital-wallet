import { TransactionType } from "@modules/wallet/dtos/types";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from "class-validator";

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;
  @IsEnum(TransactionType)
  type: TransactionType;
  @IsOptional()
  @IsUUID()
  toAccountId?: string;
}
export { TransactionType };
