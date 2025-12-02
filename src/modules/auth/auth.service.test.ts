import { AuthService } from "@modules/auth/auth.service";
import { UsersService } from "@modules/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
jest.mock("@core/database/schema-utils", () => ({
  baseSchema: {
    id: "mock-id",
    createdAt: "mock-created-at",
    updatedAt: "mock-updated-at",
    deletedAt: "mock-deleted-at",
  },
}));
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

const mockUsersService = {
  findByEmail: jest.fn(),
};
const mockJwtService = {
  sign: jest.fn(),
};
describe("AuthService", () => {
  let service: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("It should return the username (without the password) if the credentials are valid.", async () => {
      const mockUser = {
        id: "user-123",
        email: "teste@teste.com",
        password: "hash-da-senha",
        fullName: "Test User",
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validateUser("teste@teste.com", "senha123");
      expect(result).toBeDefined();
      expect(result).toHaveProperty("id", "user-123");
      expect(result).not.toHaveProperty("password");
    });

    it("It should return null if the password is incorrect.", async () => {
      const mockUser = {
        id: "user-123",
        email: "teste@teste.com",
        password: "hash-da-senha",
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.validateUser(
        "teste@teste.com",
        "senhaErrada",
      );
      expect(result).toBeNull();
    });

    it("deve retornar null se o usuário não for encontrado", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser(
        "naoexiste@teste.com",
        "senha123",
      );
      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("deve retornar um token de acesso JWT", () => {
      const user = { email: "teste@teste.com", id: "user-123" };
      const expectedToken = "token-jwt-gerado";
      mockJwtService.sign.mockReturnValue(expectedToken);
      const result = service.login(user);
      expect(result).toEqual({ access_token: expectedToken });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
    });
  });
});
