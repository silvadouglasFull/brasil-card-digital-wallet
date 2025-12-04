import {
  CreateTransactionDto,
  TransactionType,
} from "@modules/wallet/dtos/create-transaction.dto";
import { ReversalStrategy } from "@modules/wallet/strategies/reversal.strategy";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

const mockAccountRepository = {
  findByUserId: jest.fn(),
  findFirstByAccountId: jest.fn(),
};

const mockTransactionRepository = {
  create: jest.fn(),
};
const mockAuditListener = {
  handleTransactionCreatedEvent: jest.fn().mockResolvedValue(undefined),
};

describe("ReversalStrategy", () => {
  let strategy: ReversalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReversalStrategy,
        { provide: "IAccountRepository", useValue: mockAccountRepository },
        {
          provide: "ITransactionRepository",
          useValue: mockTransactionRepository,
        },
        { provide: "TransactionAuditListener", useValue: mockAuditListener },
      ],
    }).compile();

    strategy = module.get<ReversalStrategy>(ReversalStrategy);
    jest.clearAllMocks();
  });

  const createDto = (
    amount = 50,
    toAccountId = "target-123",
  ): CreateTransactionDto =>
    ({
      amount,
      toAccountId,
      type: TransactionType.REVERSAL,
      description: "Estorno",
    }) as CreateTransactionDto;

  describe("handle", () => {
    it("must successfully process a reversal.", async () => {
      const userId = "user-1";
      const dto = createDto(100, "target-id");

      const sourceAccount = { id: "source-id", userId: "user-1" };
      const targetAccount = { id: "target-id" };
      const newTransaction = { id: "tx-rev-1" };

      mockAccountRepository.findByUserId.mockResolvedValue(sourceAccount);
      mockAccountRepository.findFirstByAccountId.mockResolvedValue(
        targetAccount,
      );
      mockTransactionRepository.create.mockResolvedValue(newTransaction);

      const result = await strategy.handle(dto, userId);

      expect(result).toEqual({
        message: "Reversão solicitada. O saldo poderá ficar negativo.",
        transactionId: "tx-rev-1",
        status: "PROCESSING",
      });
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockAccountRepository.findFirstByAccountId).toHaveBeenCalledWith(
        dto.toAccountId,
      );
      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        amount: "100",
        type: "REVERSAL",
        status: "PROCESSING",
        fromAccountId: sourceAccount.id,
        toAccountId: targetAccount.id,
        description: "Reversão administrativa/Solicitada",
      });

      expect(
        mockAuditListener.handleTransactionCreatedEvent,
      ).toHaveBeenCalledWith({
        transactionId: newTransaction.id,
        amount: "100",
        accountId: sourceAccount.id,
        toAccountId: targetAccount.id,
        type: "REVERSAL",
      });
    });

    it("It should throw an error if the source account is not found.", async () => {
      mockAccountRepository.findByUserId.mockResolvedValue(null);
      const dto = createDto();

      await expect(strategy.handle(dto, "user-1")).rejects.toThrow(
        new BadRequestException("Conta de origem não encontrada."),
      );
    });

    it("It should throw an error if the toAccountId is not provided in the DTO.", async () => {
      const sourceAccount = { id: "source-id" };
      mockAccountRepository.findByUserId.mockResolvedValue(sourceAccount);

      const dto = { amount: 100 } as CreateTransactionDto;

      await expect(strategy.handle(dto, "user-1")).rejects.toThrow(
        new BadRequestException("Conta de destino (estorno) necessária."),
      );
    });

    it("It should throw an error if the destination account is not found.", async () => {
      const sourceAccount = { id: "source-id" };
      mockAccountRepository.findByUserId.mockResolvedValue(sourceAccount);

      mockAccountRepository.findFirstByAccountId.mockResolvedValue(null);

      const dto = createDto();

      await expect(strategy.handle(dto, "user-1")).rejects.toThrow(
        new BadRequestException("Conta de destino não encontrada."),
      );
    });

    it("It should throw an error if the transaction fails to be saved.", async () => {
      const sourceAccount = { id: "source-id" };
      const targetAccount = { id: "target-id" };

      mockAccountRepository.findByUserId.mockResolvedValue(sourceAccount);
      mockAccountRepository.findFirstByAccountId.mockResolvedValue(
        targetAccount,
      );

      mockTransactionRepository.create.mockResolvedValue(null);

      const dto = createDto();

      await expect(strategy.handle(dto, "user-1")).rejects.toThrow(
        new Error("Transaction not created"),
      );

      expect(
        mockAuditListener.handleTransactionCreatedEvent,
      ).not.toHaveBeenCalled();
    });
  });
});
