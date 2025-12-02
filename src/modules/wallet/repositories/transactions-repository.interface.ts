import { transactions } from "@modules/wallet/entities";
export type NewTransaction = typeof transactions.$inferInsert;
export type TranewTransaction = typeof transactions.$inferSelect;
export type ITransactionRepository = {
  create(transaction: NewTransaction): Promise<TranewTransaction | undefined>;
};
