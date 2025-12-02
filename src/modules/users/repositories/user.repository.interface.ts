import { users } from '@/modules/users/entities';

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export interface IUserRepository {
    create(data: NewUser): Promise<User>;
    findByEmail(email: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
}
