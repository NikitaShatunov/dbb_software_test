import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AbstractEntityClass<T> {
  @ApiProperty({ description: 'Identifier', nullable: false })
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  'created_at': Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  'updated_at': Date;

  constructor(item: Partial<T>) {
    Object.assign(this, item);
  }
}
