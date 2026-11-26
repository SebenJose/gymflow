import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { QueryUsersDto } from './dto/query-users.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async findMe(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    return new UserResponseDto(await this.usersService.findById(user.id));
  }

  @Get()
  @Roles([UserRole.Admin, UserRole.Instructor])
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryUsersDto,
  ): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll(user, query.role);
    return users.map((user) => new UserResponseDto(user));
  }
}
