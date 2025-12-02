import { AuthService } from "@modules/auth/auth.service";
import { LoginDto } from "@modules/auth/dto/login.dto";
import { HttpStatus, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import { AuthController } from "./auth.controller";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;
  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe("login", () => {
    it("It should set the cookie and return the user's message in case of success.", async () => {
      const loginDto: LoginDto = { email: "teste@teste.com", password: "123" };
      const mockUser = { id: "1", email: "teste@teste.com" };
      const mockToken = { access_token: "token-jwt-super-seguro" };
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockReturnValue(mockToken);
      await controller.login(loginDto, mockResponse);
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "access_token",
        mockToken.access_token,
        expect.objectContaining({
          httpOnly: true,
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Login realizado com sucesso",
        user: mockUser,
      });
    });

    it("It should throw an UnauthorizedException if the credentials are invalid.", async () => {
      const loginDto: LoginDto = { email: "errado@teste.com", password: "000" };
      mockAuthService.validateUser.mockResolvedValue(null);
      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });
});
