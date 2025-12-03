/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { users } from "@modules/users/entities";
import {
  DB_CONNECTION,
  UserRepository,
} from "@modules/users/repositories/user.repository";
import { NewUser } from "@modules/users/repositories/user.repository.interface";
import { Test, TestingModule } from "@nestjs/testing";
import { eq } from "drizzle-orm";

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

jest.mock("@modules/users/entities", () => ({
  users: {
    id: "field_id",
    email: "field_email",
  },
}));

describe("UserRepository", () => {
  let repository: UserRepository;
  let dbMock: any;

  beforeEach(async () => {
    dbMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn(),

      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),

      delete: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: DB_CONNECTION,
          useValue: dbMock,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("You must create a user and return the created record.", async () => {
      const newUser: NewUser = {
        email: "teste@teste.com",
        password: "hash",
        fullName: "Teste",
        document: "123",
      };
      const createdUser = { id: "user-1", ...newUser, createdAt: new Date() };
      dbMock.returning.mockResolvedValue([createdUser]);
      const result = await repository.create(newUser);
      expect(result).toEqual(createdUser);
      expect(dbMock.insert).toHaveBeenCalledWith(users);
      expect(dbMock.values).toHaveBeenCalledWith(newUser);
      expect(dbMock.returning).toHaveBeenCalled();
    });
  });

  describe("findByEmail", () => {
    it("should return a user if found.", async () => {
      const email = "teste@teste.com";
      const expectedUser = { id: "user-1", email };
      dbMock.limit.mockResolvedValue([expectedUser]);
      const result = await repository.findByEmail(email);
      expect(result).toEqual(expectedUser);
      expect(dbMock.select).toHaveBeenCalled();
      expect(dbMock.from).toHaveBeenCalledWith(users);
      expect(eq).toHaveBeenCalledWith(users.email, email);
      expect(dbMock.where).toHaveBeenCalled();
      expect(dbMock.limit).toHaveBeenCalledWith(1);
    });

    it("It should return undefined if the email is not found.", async () => {
      dbMock.limit.mockResolvedValue([]);
      const result = await repository.findByEmail("naoexiste@email.com");
      expect(result).toBeUndefined();
    });
  });

  describe("findById", () => {
    it("It should return a user if the ID is found.", async () => {
      const id = "user-123";
      const expectedUser = { id, email: "teste@teste.com" };
      dbMock.limit.mockResolvedValue([expectedUser]);
      const result = await repository.findById(id);
      expect(result).toEqual(expectedUser);
      expect(eq).toHaveBeenCalledWith(users.id, id);
      expect(dbMock.where).toHaveBeenCalled();
    });

    it("It should return undefined if the ID is not found.", async () => {
      dbMock.limit.mockResolvedValue([]);
      const result = await repository.findById("id-inexistente");
      expect(result).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("You must delete a user by ID.", async () => {
      const id = "user-123";
      dbMock.where.mockResolvedValue(undefined);
      await repository.delete(id);
      expect(dbMock.delete).toHaveBeenCalledWith(users);
      expect(eq).toHaveBeenCalledWith(users.id, id);
      expect(dbMock.where).toHaveBeenCalled();
    });
  });
});
