import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PayloadDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;
  @IsString()
  @IsNotEmpty()
  amount: string;
  @IsString()
  @IsNotEmpty()
  accountId: string;
  @IsString()
  @IsNotEmpty()
  type: "DEPOSIT" | "TRANSFER" | "REVERSAL";

  @IsString()
  @IsOptional()
  toAccountId?: string;
}
