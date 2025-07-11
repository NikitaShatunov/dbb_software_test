import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDate,
  Min,
} from 'class-validator';
import { Roles } from 'src/constants/user-roles';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '2023-01-01',
    description: 'Joining date of the user',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  date_of_join: Date;

  @ApiProperty({ example: 600, description: 'Base salary of the user' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  base_salary: number;

  @ApiProperty({
    example: Roles.Employee,
    enum: Roles,
    description: 'Role of the user',
  })
  @IsEnum(Roles)
  @IsNotEmpty()
  role: Roles;
}
