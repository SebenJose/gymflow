import { UserResponseDto } from '../../users/dto/user-response.dto.js';

export class AuthResponseDto {
  constructor(
    readonly accessToken: string,
    readonly user: UserResponseDto,
  ) {}
}
