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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { CorrelationId, CorrelationIdInterceptor } from '@app/common';

@Controller('users')
@UseInterceptors(CorrelationIdInterceptor)
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ description: 'User created' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.usersService.create(createUserDto, correlationId);
  }

  @Get()
  @ApiOkResponse({ description: 'List users' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Get user by id' })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Update user' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
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
