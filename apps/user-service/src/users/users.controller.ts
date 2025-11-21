import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { CorrelationId, CorrelationIdInterceptor } from '@app/common';

@Controller('users')
@UseInterceptors(CorrelationIdInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.usersService.create(createUserDto, correlationId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CorrelationId() correlationId: string,
  ) {
    return this.usersService.update(id, updateUserDto, correlationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CorrelationId() correlationId: string) {
    return this.usersService.remove(id, correlationId);
  }
}
