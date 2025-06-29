import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Roles } from 'src/constants/user-roles';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Alice',
      role: Roles.Employee,
      base_salary: 600,
      date_of_join: new Date('2018-01-01'),
      supervisor: null,
      subordinates: [],
    } as User,
    {
      id: 2,
      name: 'Bob',
      role: Roles.Manager,
      base_salary: 600,
      date_of_join: new Date('2017-01-01'),
      supervisor: null,
      subordinates: [],
    } as User,
  ];

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate salary for an Employee', async () => {
    const salary = await service.calculateSalary(
      mockUsers[0],
      new Date('2024-01-01'),
    );

    // 6 years * 3% = 18% => 600 + 108 = 708
    expect(salary).toBeCloseTo(708);
  });

  it('should calculate salary for a Manager with no subordinates', async () => {
    const salary = await service.calculateSalary(
      mockUsers[1],
      new Date('2024-01-01'),
    );
    // 7 years * 5% = 35% => 600 + 210 = 810
    expect(salary).toBeCloseTo(810);
  });

  it('should return user salary by ID', async () => {
    mockRepository.findOne.mockResolvedValue(mockUsers[0]);
    const result = await service.getUsersSalary(1, new Date('2024-01-01'));
    expect(result).toBeCloseTo(708);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { subordinates: true, supervisor: true },
    });
  });

  it('should calculate total salary for all users', async () => {
    mockRepository.find.mockResolvedValue(mockUsers);
    jest
      .spyOn(service, 'calculateSalary')
      .mockImplementation(async (user: User) => {
        if (user.id === 1) return 708;
        if (user.id === 2) return 810;
        return 0;
      });

    const total = await service.getAllUsersSalary(new Date('2024-01-01'));
    expect(total).toBe(1518);
    expect(mockRepository.find).toHaveBeenCalled();
  });
});
