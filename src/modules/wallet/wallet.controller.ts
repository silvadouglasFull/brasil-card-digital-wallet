import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { CreateTransactionDto } from "@modules/wallet/dtos/create-transaction.dto";
import { WalletService } from "@modules/wallet/wallet.service";
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";

@Controller("wallet")
export class WalletController {
  constructor(private walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Post("transaction")
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.walletService.processTransaction(dto, req.user.id);
  }
}
