import { DatabaseModule } from "@/core/database/database.module";
import { TransactionAuditListener } from "@modules/wallet/listeners/transaction-audit.listener";
import { AccountRepository } from "@modules/wallet/repositories/account-repository";
import { TransactionRepository } from "@modules/wallet/repositories/transactions-repository";
import { DepositStrategy } from "@modules/wallet/strategies/deposit.strategy";
import { ReversalStrategy } from "@modules/wallet/strategies/reversal.strategy";
import { TransferStrategy } from "@modules/wallet/strategies/transfer.strategy";
import { WalletController } from "@modules/wallet/wallet.controller";
import { WalletService } from "@modules/wallet/wallet.service";
import { Module } from "@nestjs/common";
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";
@Module({
  imports: [DatabaseModule, EventEmitterModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    DepositStrategy,
    TransferStrategy,
    ReversalStrategy,
    TransactionAuditListener,
    {
      provide: "IAccountRepository",
      useClass: AccountRepository,
    },
    {
      provide: "ITransactionRepository",
      useClass: TransactionRepository,
    },
    {
      provide: "EventEmitter2",
      useClass: EventEmitter2,
    },
  ],
})
export class WalletModule {}
