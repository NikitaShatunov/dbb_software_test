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
      relations: {
        subordinates: true,
        supervisor: true,
      },
    });
    validateGetById(id, user, 'user');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const { subordinates_ids, role, ...restDto } = updateUserDto;
    const subordinates: User[] = [];
    // check if Employee is trying to set subordinates
    if (role === Roles.Employee && subordinates_ids?.length) {
      throw new HttpException(
        'Cannot set subordinates for Employee',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (subordinates_ids?.length)
      for (const subordinate_id of subordinates_ids) {
        // check if subordinates is trying to add themselves
        if (subordinate_id === id) {
          throw new HttpException(
            'Cannot add yourself as a subordinate',
            HttpStatus.BAD_REQUEST,
          );
        }
        const subordinate = await this.findOne(subordinate_id);
        // check if subordinates is trying to add their supervisor
        if (user.supervisor?.id === subordinate.id) {
          throw new HttpException(
            'Cannot add your supervisor as a subordinate',
            HttpStatus.BAD_REQUEST,
          );
        }
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

  async getUsersSalary(id: number) {
    const user = await this.findOne(id);
    //function - realization of salary calculation
    const salary = await this.calculateSalary(user, new Date());
    return salary;
  }

  async getAllUsersSalary() {
    const users = await this.userRepository.find({
      relations: { subordinates: true },
    });
    let total = 0;
    for (const user of users) {
      total += await this.calculateSalary(user, new Date());
    }
    return total;
  }

  async calculateSalary(user: User, date: Date) {
    let salary = 0;
    const years = this.calculateYearsOfWork(user, date);
    switch (user.role) {
      case Roles.Employee:
        salary =
          user.base_salary + Math.min(years * 0.03, 0.3) * user.base_salary;
        break;
      case Roles.Manager:
        // check if user has subordinates and calculate their salary
        const first_layer_salary = user.subordinates?.length
          ? await this.calculateGroupSalary(user.subordinates, date)
          : 0;
        salary =
          user.base_salary +
          Math.min(years * 0.05, 0.4) * user.base_salary +
          0.005 * first_layer_salary;
        break;
      case Roles.Sales:
        // check if user has subordinates and calculate their salary
        const all_layers_salary = await this.calculateAllLayersSalary(
          user.id,
          date,
        );
        salary =
          user.base_salary +
          Math.min(years * 0.01, 0.35) * user.base_salary +
          0.003 * all_layers_salary;
        break;
    }

    return salary;
  }
  calculateYearsOfWork(user: User, date: Date) {
    const years = date.getFullYear() - user.date_of_join.getFullYear();
    return years;
  }

  private async calculateGroupSalary(
    users: User[],
    date: Date,
  ): Promise<number> {
    const salaries = await Promise.all(
      // calculate salary for each user of first layer
      users.map((u) => this.calculateSalary(u, date)),
    );
    return salaries.reduce((sum, s) => sum + s, 0);
  }

  private async calculateAllLayersSalary(
    user_id: number,
    date: Date,
  ): Promise<number> {
    let total = 0;

    const subordinates = await this.userRepository.find({
      where: { supervisor: { id: user_id } },
    });

    for (const sub of subordinates) {
      // calculate salary for each user of all layers
      const subSalary = await this.calculateSalary(sub, date);
      total += subSalary;
      total += await this.calculateAllLayersSalary(sub.id, date);
    }

    return total;
  }
}
