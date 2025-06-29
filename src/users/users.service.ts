import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { validateGetById } from 'src/helpers/validateGetById';
import { PageDto } from 'src/pagination/page.dto';
import { UserDto } from './dto/user.dto';
import { UserPageDto } from 'src/pagination/user/user-page.dto';
import { PageMetaDto } from 'src/pagination/page-meta.dto';
import { Roles } from 'src/constants/user-roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(pageOptionsDto: UserPageDto): Promise<PageDto<UserDto>> {
    const { search, role, take, page, order } = pageOptionsDto;
    const skip = (page - 1) * take;
    const whereClause: FindOptionsWhere<User>[] = [];
    if (search) {
      whereClause.push({ name: search });
    }
    if (role) {
      whereClause.push({ role });
    }

    const [entities, count] = await this.userRepository.findAndCount({
      where: whereClause,
      take,
      skip,
      order: { date_of_join: order },
      relations: { subordinates: true, supervisor: true },
    });
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, item_count: count });
    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { subordinates: true, supervisor: true },
    });
    validateGetById(id, user, 'user');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const { subordinates_ids, role, ...restDto } = updateUserDto;
    const subordinates: User[] = [];
    if (role === Roles.Employee && subordinates_ids?.length) {
      throw new HttpException(
        'Cannot set subordinates for Employee',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (subordinates_ids?.length)
      for (const subordinate_id of subordinates_ids) {
        if (subordinate_id === id) {
          throw new HttpException(
            'Cannot add yourself as a subordinate',
            HttpStatus.BAD_REQUEST,
          );
        }
        const subordinate = await this.findOne(subordinate_id);
        subordinates.push(subordinate);
      }
    user.role = role;
    user.subordinates = subordinates;
    if (user.role === Roles.Employee) {
      user.subordinates = null;
    }
    return this.userRepository.save({ ...user, ...restDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.userRepository.delete(id);
    return { deleted: true };
  }
}
