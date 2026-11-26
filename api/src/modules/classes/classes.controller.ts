import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { IdParam } from '../../common/decorators/id-param.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { ClassesService } from './classes.service.js';
import { ClassResponseDto } from './dto/class-response.dto.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { QueryClassesDto } from './dto/query-classes.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import type { GymClass } from './entities/gym-class.entity.js';

const STAFF = [UserRole.Instructor, UserRole.Admin];
const toResponse = (gymClass: GymClass): ClassResponseDto => new ClassResponseDto(gymClass);

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  async findAll(@Query() query: QueryClassesDto): Promise<ClassResponseDto[]> {
    return (await this.classesService.findAll(query)).map(toResponse);
  }

  @Get(':id')
  async findOne(@IdParam() id: string): Promise<ClassResponseDto> {
    return toResponse(await this.classesService.findOne(id));
  }

  @Post()
  @Roles(STAFF)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateClassDto,
  ): Promise<ClassResponseDto> {
    return toResponse(await this.classesService.create(user, dto));
  }

  @Patch(':id')
  @Roles(STAFF)
  async update(@IdParam() id: string, @Body() dto: UpdateClassDto): Promise<ClassResponseDto> {
    return toResponse(await this.classesService.update(id, dto));
  }

  @Delete(':id')
  @Roles(STAFF)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@IdParam() id: string): Promise<void> {
    return this.classesService.remove(id);
  }
}
