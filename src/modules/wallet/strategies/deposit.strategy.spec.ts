/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CreateTransactionDto } from "@modules/wallet/dtos/create-transaction.dto";
import { DepositStrategy } from "@modules/wallet/strategies/deposit.strategy";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
const mockAccountRepository = {
  findByUserId: jest.fn(),
};
const mockTransactionRepository = {
  create: jest.fn(),
};
const mockEventEmitter = {
  emit: jest.fn(),
};
describe("DepositStrategy", () => {
  let strategy: DepositStrategy;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositStrategy,
        { provide: "IAccountRepository", useValue: mockAccountRepository },
        {
          provide: "ITransactionRepository",
          useValue: mockTransactionRepository,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    strategy = module.get<DepositStrategy>(DepositStrategy);
    jest.clearAllMocks();
  });

  it("must successfully process a deposit and issue an event.", async () => {
    const userId = "user-123";
    const dto: CreateTransactionDto = {
      amount: "100.0",
      toAccountId: "account-id-ignorado-neste-dto-mas-necessario",
      description: "Teste",
      fromAccountId: "ignorada",
    } as any;

    const mockAccount = { id: "account-123", userId: userId };
    const mockTransaction = { id: "tx-999" };

    mockAccountRepository.findByUserId.mockResolvedValue(mockAccount);
    mockTransactionRepository.create.mockResolvedValue(mockTransaction);
    const result = await strategy.handle(dto, userId);
    expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(userId);

    expect(mockTransactionRepository.create).toHaveBeenCalledWith({
      amount: "100.0",
      toAccountId: mockAccount.id,
      fromAccountId: null,
      description: "Depósito via API",
    });

    expect(mockEventEmitter.emit).toHaveBeenCalledWith("transaction.created", {
      transactionId: mockTransaction.id,
      accountId: mockAccount.id,
      amount: dto.amount,
      type: "DEPOSIT",
    });

    expect(result).toEqual({
      message: "Depósito solicitado. Aguardando confirmação da auditoria.",
      transactionId: mockTransaction.id,
      status: "PROCESSING",
    });
  });

  it("It should throw an error if the account is not found.", async () => {
    mockAccountRepository.findByUserId.mockResolvedValue(null);
    const dto = { amount: 50 } as CreateTransactionDto;
    await expect(strategy.handle(dto, "user-inexistente")).rejects.toThrow(
      "Account not found",
    );
    expect(mockTransactionRepository.create).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it("It should throw an error if the transaction creation fails.", async () => {
    const mockAccount = { id: "account-123" };
    mockAccountRepository.findByUserId.mockResolvedValue(mockAccount);
    mockTransactionRepository.create.mockResolvedValue(null);
    const dto = { amount: 50 } as CreateTransactionDto;
    await expect(strategy.handle(dto, "user-123")).rejects.toThrow(
      "Transaction not created",
    );
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
});
