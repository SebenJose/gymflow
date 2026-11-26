import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const NAME_MAX_LENGTH = 120;
const PASSWORD_MIN_LENGTH = 8;
// O bcrypt ignora o que passar de 72 bytes.
const PASSWORD_MAX_LENGTH = 72;

export class RegisterDto {
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres`,
  })
  name: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @IsString({ message: 'A senha deve ser um texto' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres`,
  })
  password: string;
}
