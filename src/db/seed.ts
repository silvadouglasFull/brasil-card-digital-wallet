import { NewUser } from "@/modules/users/repositories/user.repository.interface";
import { NewAccount } from "@/modules/wallet/repositories/account-repository.interface";
import { NewTransaction } from "@/modules/wallet/repositories/transactions-repository.interface";
import { faker } from "@faker-js/faker";
import { users } from "@modules/users/entities";
import { accounts, transactions } from "@modules/wallet/entities";
import * as bcrypt from "bcrypt";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function main() {
  console.log("🌱 Iniciando o Seed...");

  console.log("🧹 Limpando banco de dados...");
  await db.delete(transactions);
  await db.delete(accounts);
  await db.delete(users);

  console.log("👥 Criando usuários...");
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash("123456", salt);
  const usersData: NewUser[] = [];

  for (let i = 0; i < 10; i++) {
    usersData.push({
      fullName: faker.person.fullName(),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      password: passwordHash,
      isActive: true,
    });
  }
  const createdUsers = await db.insert(users).values(usersData).returning();
  console.log("ihh Criando contas bancárias...");
  const accountsData: NewAccount[] = [];
  for (const user of createdUsers) {
    accountsData.push({
      userId: user.id,
      branch: "0001",
      accountNumber: faker.finance.accountNumber(6),
      balance: faker.finance.amount({ min: 100, max: 10000, dec: 2 }),
    });
  }

  const createdAccounts = await db
    .insert(accounts)
    .values(accountsData)
    .returning();

  console.log("💸 Gerando transações...");
  const transactionsData: NewTransaction[] = [];

  for (let i = 0; i < 50; i++) {
    const isDeposit = Math.random() > 0.5;
    const randomAccount =
      createdAccounts[Math.floor(Math.random() * createdAccounts.length)];
    if (isDeposit) {
      transactionsData.push({
        amount: faker.finance.amount({ min: 10, max: 500, dec: 2 }),
        type: "DEPOSIT",
        status: "COMPLETED",
        toAccountId: randomAccount.id,
        description: "Depósito Inicial",
      });
    } else {
      const targetAccount = createdAccounts.find(
        (acc) => acc.id !== randomAccount.id,
      );

      if (targetAccount) {
        transactionsData.push({
          amount: faker.finance.amount({ min: 10, max: 200, dec: 2 }),
          type: "TRANSFER",
          status: "COMPLETED",
          fromAccountId: randomAccount.id,
          toAccountId: targetAccount.id,
          description: `Transferência para ${faker.person.firstName()}`,
        });
      }
    }
  }

  await db.insert(transactions).values(transactionsData);

  console.log("✅ Seed finalizado com sucesso!");
  console.log(
    `✨ Criados: ${createdUsers.length} usuários e ${transactionsData.length} transações.`,
  );
  console.log("🔑 Senha padrão para todos os usuários: 123456");

  console.log(`\n📧 Use este e-mail para testar: ${createdUsers[0].email}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro ao rodar seed:", err);
  process.exit(1);
});
