/* eslint-disable @typescript-eslint/no-unsafe-return */
import { UsersService } from "@/modules/users/users.service";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
jest.mock("bcrypt", () => ({
  genSalt: jest.fn().mockResolvedValue("salsicha"),
  hash: jest.fn().mockResolvedValue("senha-hash-mock"),
}));

const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
};

const mockDb = {
  transaction: jest.fn((cb) =>
    cb({
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnValue({
        returning: () => [
          {
            id: "user-123",
            password: "senha-hash-mock",
            email: "teste@teste.com",
            doc: "538.244.870-12",
          },
        ],
      }),
    }),
  ),
};

describe("UsersService", () => {
  let service: UsersService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: "IUserRepository", useValue: mockUserRepository },
        { provide: "DB_CONNECTION", useValue: mockDb },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it("It should throw an error if the email already exists.", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "123",
      email: "teste@teste.com",
    });
    await expect(
      service.create({
        email: "teste@teste.com",
        password: "123",
        fullName: "Teste",
        document: "123",
      }),
    ).rejects.toThrow(BadRequestException);
  });
  it("It should throw an error if the document already exists.", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "123",
      document: "538.244.870-12",
    });
    await expect(
      service.create({
        email: "teste@teste.com",
        password: "123",
        fullName: "Teste",
        document: "538.244.870-12",
      }),
    ).rejects.toThrow(BadRequestException);
  });
  it("should create a user and an account successfully", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(undefined);
    const createUserDto = {
      email: "novo@teste.com",
      password: "123",
      fullName: "Novo Usuario",
      document: "99988877700",
    };
    const result = await service.create(createUserDto);
    expect(result).toHaveProperty("id", "user-123");
    expect(result).not.toHaveProperty("password");
    expect(result).toHaveProperty("account");
    expect(result.account).toHaveProperty("branch", "0001");
    expect(result.account).toHaveProperty("accountNumber");
    expect(mockDb.transaction).toHaveBeenCalled();
  });
});
