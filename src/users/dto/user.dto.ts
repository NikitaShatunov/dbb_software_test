import { User } from '../entities/user.entity';

export class UserDto {
  name: string;
  date_of_join: Date;
  base_salary: number;
  role: string;
  subordinates: User[];
  supervisor: User;
}
