import {
  CreateTransactionDto,
  TransactionType,
} from "@modules/wallet/dtos/create-transaction.dto";
import { TransferStrategy } from "@modules/wallet/strategies/transfer.strategy";
import { BadRequestException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";

const mockAccountRepository = {
  findByUserId: jest.fn(),
  findFirstByAccountId: jest.fn(),
};

const mockTransactionRepository = {
  create: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe("TransferStrategy", () => {
  let strategy: TransferStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferStrategy,
        { provide: "IAccountRepository", useValue: mockAccountRepository },
        {
          provide: "ITransactionRepository",
          useValue: mockTransactionRepository,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    strategy = module.get<TransferStrategy>(TransferStrategy);
    jest.clearAllMocks();
  });

  const createDto = (
    amount = 100,
    toAccountId = "target-123",
  ): CreateTransactionDto =>
    ({
      amount,
      toAccountId,
      type: TransactionType.TRANSFER,
      description: "Teste",
    }) as CreateTransactionDto;

  describe("handle", () => {
    it("must complete a successful transfer.", async () => {
      const userId = "user-1";
      const dto = createDto(100, "target-account-id");
      const sourceAccount = { id: "source-id", balance: "500.00" };
      const targetAccount = { id: "target-account-id", balance: "10.00" };
      const newTransaction = { id: "tx-new-123" };

      mockAccountRepository.findByUserId.mockResolvedValue(sourceAccount);
      mockAccountRepository.findFirstByAccountId.mockResolvedValue(
        targetAccount,
      );
      mockTransactionRepository.create.mockResolvedValue(newTransaction);
      const result = await strategy.handle(dto, userId);
      expect(result).toEqual({
        message: "Transferência solicitada. Processando...",
        transactionId: newTransaction.id,
        status: "PROCESSING",
      });
      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        amount: "100",
        type: "TRANSFER",
        status: "PROCESSING",
        fromAccountId: sourceAccount.id,
        toAccountId: targetAccount.id,
        description: "Transferência entre usuários",
      });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        "transaction.created",
        {
          transactionId: newTransaction.id,
          amount: "100",
          accountId: sourceAccount.id,
          toAccountId: targetAccount.id,
          type: "TRANSFER",
        },
      );
    });

    it("It should throw an error if toAccountId is not provided.", async () => {
      const dto = { amount: 100 } as CreateTransactionDto;
      await expect(strategy.handle(dto, "user-1")).rejects.toThrow(
        new BadRequestException(
          "Conta de destino é obrigatória para transferências.",
        ),
      );
    });

    it("It should throw an error if the source account is not found.", async () => {
      mockAccountRepository.findByUserId.mockResolvedValue(null);

      await expect(strategy.handle(createDto(), "user-1")).rejects.toThrow(
        new BadRequestException("Conta de origem não encontrada."),
      );
    });

    it("It should throw an error if the balance is insufficient.", async () => {
      const sourceAccount = { id: "source-id", balance: "50.00" };
      mockAccountRepository.findByUserId.mockResolvedValue(sourceAccount);

      const dto = createDto(100);

      await expect(strategy.handle(dto, "user-1")).rejects.toThrow(
        new BadRequestException(
          "Saldo insuficiente para realizar a transferência.",
        ),
      );
    });

    it("It should throw an error if the destination account is not found.", async () => {
      const sourceAccount = { id: "source-id", balance: "500.00" };
      mockAccountRepository.findByUserId.mockResolvedValue(sourceAccount);
      mockAccountRepository.findFirstByAccountId.mockResolvedValue(null);

      await expect(strategy.handle(createDto(), "user-1")).rejects.toThrow(
        new BadRequestException("Conta de destino não encontrada."),
      );
    });

    it("It will throw an error if you try to transfer to the same account.", async () => {
      const accountId = "mesma-conta-id";
      const sourceAccount = { id: accountId, balance: "500.00" };
      const targetAccount = { id: accountId };

      mockAccountRepository.findByUserId.mockResolvedValue(sourceAccount);
      mockAccountRepository.findFirstByAccountId.mockResolvedValue(
        targetAccount,
      );

      await expect(
        strategy.handle(createDto(100, accountId), "user-1"),
      ).rejects.toThrow(
        new BadRequestException(
          "Não é possível transferir para a mesma conta.",
        ),
      );
    });

    it("It should throw a generic error if the transaction fails to be created in the database.", async () => {
      const sourceAccount = { id: "source-id", balance: "500.00" };
      const targetAccount = { id: "target-id" };

      mockAccountRepository.findByUserId.mockResolvedValue(sourceAccount);
      mockAccountRepository.findFirstByAccountId.mockResolvedValue(
        targetAccount,
      );

      mockTransactionRepository.create.mockResolvedValue(null);

      await expect(strategy.handle(createDto(), "user-1")).rejects.toThrow(
        new Error("Transaction not created"),
      );
    });
  });
});
