/* eslint-disable @typescript-eslint/no-unsafe-return */
import { DB_CONNECTION } from "@/core/database/database.module";
import { Test, TestingModule } from "@nestjs/testing";
import { PayloadDto } from "./dto/payload.dto";
import { TransactionAuditListener } from "./transaction-audit.listener";

const mockTx = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue(true),
  execute: jest.fn().mockResolvedValue(true),
};

const mockDb = {
  transaction: jest.fn(
    async (callback: (tx: typeof mockTx) => Promise<any>) => {
      return await callback(mockTx);
    },
  ),
};

describe("TransactionAuditListener", () => {
  let listener: TransactionAuditListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionAuditListener,
        {
          provide: DB_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();
    listener = module.get<TransactionAuditListener>(TransactionAuditListener);
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("must process a DEPOSIT type transaction and update the balance.", async () => {
    const payload: PayloadDto = {
      transactionId: "tx_123",
      amount: "100.00",
      accountId: "acc_123",
      type: "DEPOSIT",
    };
    const promise = listener.handleTransactionCreatedEvent(payload);
    jest.advanceTimersByTime(2000);
    await promise;
    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.update).toHaveBeenCalled();
    expect(mockTx.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: "COMPLETED" }),
    );
    expect(mockTx.execute).toHaveBeenCalled();
  });

  it("It should not process transactions that are not DEPOSIT.", async () => {
    const payload: PayloadDto = {
      transactionId: "tx_456",
      amount: "50.00",
      accountId: "acc_456",
      type: "TRANSFER",
    };
    const promise = listener.handleTransactionCreatedEvent(payload);
    jest.advanceTimersByTime(2000);
    await promise;
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });
});
