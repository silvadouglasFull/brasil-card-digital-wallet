/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { transactions } from "@modules/wallet/entities";
import {
  DB_CONNECTION,
  TransactionRepository,
} from "@modules/wallet/repositories/transactions-repository";
import { Test, TestingModule } from "@nestjs/testing";

jest.mock("@modules/wallet/entities", () => ({
  transactions: {
    name: "transactions_table",
  },
}));

describe("TransactionRepository", () => {
  let repository: TransactionRepository;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepository,
        {
          provide: DB_CONNECTION,
          useValue: dbMock,
        },
      ],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar uma transação aplicando valores padrão quando description e fromAccountId não são informados", async () => {
      // ARRANGE
      const inputData = {
        amount: "150.5",
        toAccountId: "account-123",
        fromAccountId: undefined,
        description: undefined,
      } as any;

      const mockCreatedTransaction = {
        id: "tx-uuid-123",
        amount: "150.5",
        type: "DEPOSIT",
        status: "PROCESSING",
        createdAt: new Date(),
        toAccountId: "account-123",
        description: "Depósito via API",
        fromAccountId: null,
      };

      dbMock.returning.mockResolvedValue([mockCreatedTransaction]);

      const result = await repository.create(inputData);

      expect(result).toEqual(mockCreatedTransaction);

      expect(dbMock.insert).toHaveBeenCalledWith(transactions);

      expect(dbMock.values).toHaveBeenCalledWith({
        amount: "150.5",
        type: "DEPOSIT",
        status: "PROCESSING",
        toAccountId: "account-123",
        fromAccountId: null,
        description: "Depósito via API",
      });
    });
  });
});
