import { DatabaseModule } from "@/core/database/database.module";
import { TransactionAuditListener } from "@modules/wallet/listeners/transaction-audit.listener";
import { DepositStrategy } from "@modules/wallet/strategies/deposit.strategy";
import { WalletController } from "@modules/wallet/wallet.controller";
import { WalletService } from "@modules/wallet/wallet.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [DatabaseModule],
  controllers: [WalletController],
  providers: [WalletService, DepositStrategy, TransactionAuditListener],
})
export class WalletModule {}
