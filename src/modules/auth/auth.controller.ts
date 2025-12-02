import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const { access_token } = await this.authService.login(user);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600 * 1000,
    });

    return res.status(HttpStatus.OK).json({
      message: "Login realizado com sucesso",
      user,
    });
  }
}
