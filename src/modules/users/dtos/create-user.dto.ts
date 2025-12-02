import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Nome completo é obrigatório' })
    @IsString()
    @MaxLength(100)
    fullName: string;

    @IsNotEmpty({ message: 'Documento (CPF/CNPJ) é obrigatório' })
    @IsString()
    @MinLength(11)
    @MaxLength(14)
    document: string;

    @IsNotEmpty({ message: 'Email é obrigatório' })
    @IsEmail({}, { message: 'Email inválido' })
    email: string;

    @IsNotEmpty({ message: 'Senha é obrigatória' })
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    password: string;
}
