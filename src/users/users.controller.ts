import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPageDto } from 'src/pagination/user/user-page.dto';
import { UserDto } from './dto/user.dto';
import { PageDto } from 'src/pagination/page.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() pageOptionsDto: UserPageDto): Promise<PageDto<UserDto>> {
    return this.usersService.findAll(pageOptionsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get(':id/salary')
  getUsersSalary(@Param('id') id: string) {
    return this.usersService.getUsersSalary(+id);
  }

  @Get('all/users/salary')
  getAllUsersSalary() {
    return this.usersService.getAllUsersSalary();
  }
}
