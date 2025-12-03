import { DatabaseModule } from "@/core/database/database.module";
import { TransactionAuditListener } from "@modules/wallet/listeners/transaction-audit.listener";
import { DepositStrategy } from "@modules/wallet/strategies/deposit.strategy";
import { ReversalStrategy } from "@modules/wallet/strategies/reversal.strategy";
import { TransferStrategy } from "@modules/wallet/strategies/transfer.strategy";
import { WalletController } from "@modules/wallet/wallet.controller";
import { WalletService } from "@modules/wallet/wallet.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [DatabaseModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    DepositStrategy,
    TransferStrategy,
    ReversalStrategy,
    TransactionAuditListener,
  ],
})
export class WalletModule {}
