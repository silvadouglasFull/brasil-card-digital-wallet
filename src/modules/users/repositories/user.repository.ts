import type {
    IUserRepository,
    NewUser,
    User,
} from '@/modules/users/repositories/user.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres'; // Ou sua config de provider
import { users } from '../entities';

// Nota: Em um setup real NestJS, injetaríamos o DB Provider.
// Aqui simplificamos assumindo uma conexão disponível ou injetada.
export const DB_CONNECTION = 'DB_CONNECTION';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(@Inject(DB_CONNECTION) private db: ReturnType<typeof drizzle>) { }

    async create(data: NewUser): Promise<User> {
        const result = await this.db.insert(users).values(data).returning();
        return result[0];
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const result = await this.db.query.users.findFirst({
            where: eq(users.email, email),
        });
        return result;
    }

    async findById(id: string): Promise<User | undefined> {
        const result = await this.db.query.users.findFirst({
            where: eq(users.id, id),
        });
        return result;
    }
}
