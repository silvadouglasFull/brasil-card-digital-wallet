import { accounts } from "@modules/wallet/entities";
export type NewAccount = typeof accounts.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type IAccountRepository = {
  findByUserId(userId: string): Promise<Account | undefined>;
};
