import { CreateUserDto } from "@modules/users/dtos/create-user.dto";
import { UsersService } from "@modules/users/users.service";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Criar novo usuário e conta digital" })
  @ApiResponse({
    status: 201,
    description: "Usuário e conta criados com sucesso.",
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos ou usuário já existente.",
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
