import {
  CreateTransactionDto,
  TransactionType,
} from "@modules/wallet/dtos/create-transaction.dto";
import { DepositStrategy } from "@modules/wallet/strategies/deposit.strategy";
// Importamos a nova estratégia
import { TransferStrategy } from "@modules/wallet/strategies/transfer.strategy";
import { WalletService } from "@modules/wallet/wallet.service";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ReversalStrategy } from "./strategies/reversal.strategy";

describe("WalletService", () => {
  let service: WalletService;

  const mockDepositStrategy = {
    handle: jest.fn(),
  };
  const mockTransferStrategy = {
    handle: jest.fn(),
  };
  const mockReversalStrategy = {
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
        {
          provide: TransferStrategy,
          useValue: mockTransferStrategy,
        },
        {
          provide: ReversalStrategy,
          useValue: mockReversalStrategy,
        },
      ],
    }).compile();
    service = module.get<WalletService>(WalletService);
    jest.clearAllMocks();
  });

  describe("processTransaction", () => {
    it("should call the Deposit Strategy when the type is DEPOSIT", async () => {
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
      expect(mockTransferStrategy.handle).not.toHaveBeenCalled();
    });

    it("should call the Transfer Strategy when the type is TRANSFER", async () => {
      const userId = "user-123";
      const dto: CreateTransactionDto = {
        amount: 50,
        type: TransactionType.TRANSFER,
        toAccountId: "conta-destino-456",
        description: "Transferência teste",
      } as CreateTransactionDto;

      const expectedResult = {
        message: "Transferência solicitada",
        transactionId: "tx-2",
        status: "PROCESSING",
      };

      mockTransferStrategy.handle.mockResolvedValue(expectedResult);
      const result = await service.processTransaction(dto, userId);
      expect(result).toEqual(expectedResult);
      expect(mockTransferStrategy.handle).toHaveBeenCalledWith(dto, userId);
      expect(mockDepositStrategy.handle).not.toHaveBeenCalled();
    });

    it("should throw a BadRequestException for unsupported transaction types", async () => {
      const userId = "user-123";

      const dto = {
        type: "WITHDRAW",
        amount: 100,
      } as CreateTransactionDto;

      await expect(service.processTransaction(dto, userId)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockDepositStrategy.handle).not.toHaveBeenCalled();
      expect(mockTransferStrategy.handle).not.toHaveBeenCalled();
    });
  });
});
