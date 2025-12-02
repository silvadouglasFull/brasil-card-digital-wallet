/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { accounts } from "@modules/wallet/entities";
import { Test, TestingModule } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { AccountRepository, DB_CONNECTION } from "./account-repository";

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

jest.mock("@modules/wallet/entities", () => ({
  accounts: {
    userId: "field_user_id",
  },
}));

describe("AccountRepository", () => {
  let repository: AccountRepository;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountRepository,
        {
          provide: DB_CONNECTION,
          useValue: dbMock,
        },
      ],
    }).compile();

    repository = module.get<AccountRepository>(AccountRepository);
    jest.clearAllMocks();
  });

  describe("findByUserId", () => {
    it("It should return an account if found.", async () => {
      const userId = "user-123";
      const expectedAccount = {
        id: "account-1",
        userId: userId,
        balance: "100.00",
      };
      dbMock.limit.mockResolvedValue([expectedAccount]);
      const result = await repository.findByUserId(userId);
      expect(result).toEqual(expectedAccount);
      expect(dbMock.select).toHaveBeenCalled();
      expect(dbMock.from).toHaveBeenCalledWith(accounts);
      expect(eq).toHaveBeenCalledWith(accounts.userId, userId);
      expect(dbMock.where).toHaveBeenCalled();
      expect(dbMock.limit).toHaveBeenCalledWith(1);
    });
    it("It should return undefined if no account is found.", async () => {
      const userId = "user-inexistente";
      dbMock.limit.mockResolvedValue([]);
      const result = await repository.findByUserId(userId);
      expect(result).toBeUndefined();
    });
  });
});
