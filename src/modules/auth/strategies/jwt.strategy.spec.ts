import { PayloadDto } from "@modules/auth/strategies/dto/payload.dto";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "JWT_SECRET") {
        return "segredo-de-teste";
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it("must be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("It should return an object with an ID and email based on the payload.", () => {
      const payload: PayloadDto = {
        sub: "user-123",
        email: "teste@teste.com",
      } as unknown as PayloadDto;
      const result = strategy.validate(payload);
      expect(result).toEqual({
        id: "user-123",
        email: "teste@teste.com",
      });
    });
  });
});
