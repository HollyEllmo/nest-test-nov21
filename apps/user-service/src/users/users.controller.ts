import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponseDto, UsersListResponseDto } from './dto/user-response.dto';
import { CorrelationId, CorrelationIdInterceptor } from '@app/common';

@Controller('users')
@UseInterceptors(CorrelationIdInterceptor)
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ description: 'User created', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.usersService.create(createUserDto, correlationId);
  }

  @Get()
  @ApiOkResponse({ description: 'List users', type: UsersListResponseDto })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Get user by id', type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Update user', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.usersService.update(id, updateUserDto, correlationId);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Soft delete user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  remove(@Param('id') id: string, @CorrelationId() correlationId: string) {
    return this.usersService.remove(id, correlationId);
  }
}
