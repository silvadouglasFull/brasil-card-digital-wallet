import { DatabaseModule } from "@/core/database/database.module";
import { UserRepository } from "@modules/users/repositories/user.repository";
import { TransactionAuditListener } from "@modules/wallet/listeners/transaction-audit.listener";
import { AccountRepository } from "@modules/wallet/repositories/account-repository";
import { TransactionRepository } from "@modules/wallet/repositories/transactions-repository";
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
    {
      provide: "IAccountRepository",
      useClass: AccountRepository,
    },
    {
      provide: "ITransactionRepository",
      useClass: TransactionRepository,
    },
    {
      provide: "IUserRepository",
      useClass: UserRepository,
    },
    {
      provide: "TransactionAuditListener",
      useClass: TransactionAuditListener,
    },
  ],
})
export class WalletModule {}
