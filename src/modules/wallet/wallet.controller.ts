import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { CreateTransactionDto } from "@modules/wallet/dtos/create-transaction.dto";
import { WalletService } from "@modules/wallet/wallet.service";
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Wallet")
@ApiBearerAuth()
@Controller("wallet")
export class WalletController {
  constructor(private walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Post("transaction")
  @ApiOperation({ summary: "Criar uma transação (Depósito/Transferência)" })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.walletService.processTransaction(dto, req.user.id);
  }
}
