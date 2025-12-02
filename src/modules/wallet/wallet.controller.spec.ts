import {
    CreateTransactionDto,
    TransactionType,
} from "@modules/wallet/dtos/create-transaction.dto";
import { WalletController } from "@modules/wallet/wallet.controller";
import { WalletService } from "@modules/wallet/wallet.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("WalletController", () => {
  let controller: WalletController;
  let walletService: WalletService;
  const mockWalletService = {
    processTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get<WalletService>(WalletService);

    jest.clearAllMocks();
  });

  describe("createTransaction", () => {
    it("You must call the service using the DTO and the user ID extracted from the request.", async () => {
      const dto: CreateTransactionDto = {
        amount: 50.0,
        type: TransactionType.DEPOSIT,
        toAccountId: "account-123",
      };
      const mockRequest = {
        user: { id: "user-auth-id-123" },
      };

      const expectedResult = {
        message: "Depósito solicitado",
        transactionId: "tx-1",
        status: "PROCESSING",
      };
      mockWalletService.processTransaction.mockResolvedValue(expectedResult);
      const result = await controller.createTransaction(
        dto,
        mockRequest as {
          user: { id: string };
        },
      );
      expect(result).toEqual(expectedResult);

      expect(walletService.processTransaction).toHaveBeenCalledWith(
        dto,
        "user-auth-id-123",
      );
    });

    it("must propagate errors launched by the service.", async () => {
      const dto = {
        amount: 10,
        type: TransactionType.DEPOSIT,
      } as CreateTransactionDto;
      const mockRequest = { user: { id: "user-1" } };

      const error = new Error("Erro de negócio");
      mockWalletService.processTransaction.mockRejectedValue(error);
      await expect(
        controller.createTransaction(
          dto,
          mockRequest as {
            user: { id: string };
          },
        ),
      ).rejects.toThrow(error);
    });
  });
});
