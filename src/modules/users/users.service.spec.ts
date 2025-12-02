/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";

const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
};

const mockDb = {
  transaction: jest.fn((cb) =>
    cb({
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnValue({
        returning: () => [{ id: "123", password: "hash" }],
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
  });

  it("It should throw an error if the email already exists.", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "1",
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
  it("it should create user", async () => {});
});
