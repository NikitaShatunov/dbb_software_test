import { Roles } from 'src/constants/user-roles';
import { AbstractEntityClass } from 'src/database/AbstractEntityClass';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class User extends AbstractEntityClass<User> {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  date_of_join: Date;

  @Column({ nullable: false, default: 600 })
  base_salary: number;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.Employee,
  })
  role: Roles;

  @ManyToOne(() => User, (user) => user.subordinates, { nullable: true })
  supervisor: User;

  @OneToMany(() => User, (user) => user.supervisor)
  subordinates: User[];
}
