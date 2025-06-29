import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from '../page-optiona.dto';
import { Roles } from 'src/constants/user-roles';

export class UserPageDto extends PageOptionsDto {
  @ApiPropertyOptional({
    default: '',
  })
  @IsOptional()
  @IsEnum(Roles)
  readonly role?: Roles;

  @ApiPropertyOptional({
    default: '',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly search?: string;
}
