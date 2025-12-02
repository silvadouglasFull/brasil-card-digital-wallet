import {
    CreateTransactionDto,
    TransactionType,
} from "@modules/wallet/dtos/create-transaction.dto";
import { DepositStrategy } from "@modules/wallet/strategies/deposit.strategy";
import { WalletService } from "@modules/wallet/wallet.service";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

describe("WalletService", () => {
  let service: WalletService;
  const mockDepositStrategy = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: DepositStrategy,
          useValue: mockDepositStrategy,
        },
      ],
    }).compile();
    service = module.get<WalletService>(WalletService);
    jest.clearAllMocks();
  });

  describe("processTransaction", () => {
    it("You should call the Deposit Strategy when the type is DEPOSIT.", async () => {
      const userId = "user-123";
      const dto: CreateTransactionDto = {
        amount: 100,
        type: TransactionType.DEPOSIT,
        toAccountId: "conta-1",
        description: "Depósito teste",
      } as CreateTransactionDto;

      const expectedResult = {
        message: "Sucesso",
        transactionId: "tx-1",
        status: "PROCESSING",
      };

      mockDepositStrategy.handle.mockResolvedValue(expectedResult);
      const result = await service.processTransaction(dto, userId);
      expect(result).toEqual(expectedResult);
      expect(mockDepositStrategy.handle).toHaveBeenCalledWith(dto, userId);
    });

    it("It should throw a BadRequestException for unsupported transaction types.", async () => {
      const userId = "user-123";
      const dto = {
        type: "TRANSFER",
        amount: 100,
      } as CreateTransactionDto;
      await expect(service.processTransaction(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDepositStrategy.handle).not.toHaveBeenCalled();
    });
  });
});
