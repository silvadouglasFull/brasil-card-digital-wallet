import { baseSchema } from '@/core/database/schema-utils';
import { users } from '@/modules/users/entities';
import { decimal, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { transactionStatusEnum, transactionTypeEnum } from './enums';

export const accounts = pgTable('accounts', {
    ...baseSchema,
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    branch: varchar('branch', { length: 10 }).notNull(),
    accountNumber: varchar('account_number', { length: 20 }).unique().notNull(),
    balance: decimal('balance', { precision: 15, scale: 2 })
        .default('0.00')
        .notNull(),
});

export const transactions = pgTable('transactions', {
    ...baseSchema,
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    type: text({ enum: [...transactionTypeEnum] }),
    status: text({ enum: [...transactionStatusEnum] })
        .default('PROCESSING')
        .notNull(),
    fromAccountId: uuid('from_account_id').references(() => accounts.id),
    toAccountId: uuid('to_account_id').references(() => accounts.id),
    description: varchar('description', { length: 255 }),
});
