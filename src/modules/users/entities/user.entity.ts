import { Entity, Column, BeforeInsert } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../dto';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column('simple-array', { default: UserRole.USER })
  roles: UserRole[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
