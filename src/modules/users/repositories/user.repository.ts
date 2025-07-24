import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from './user.repository.interface';
import { BaseAbstractRepository } from '../../../common/abstracts/base.abstract.repository';

/**
 * TypeORM implementation of the user repository.
 *
 * This repository extends the base repository to provide user-specific data access
 * methods while maintaining consistency with the repository pattern. It encapsulates
 * all database interactions for the User entity, making the data layer easily
 * testable and replaceable.
 *
 * @class TypeOrmUserRepository
 * @extends {BaseAbstractRepository<User>}
 * @implements {IUserRepository}
 */
@Injectable()
export class TypeOrmUserRepository
  extends BaseAbstractRepository<User>
  implements IUserRepository
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    protected readonly entityManager: EntityManager,
  ) {
    super(userRepository, entityManager);
  }

  /**
   * Finds a user by their email address.
   *
   * This method performs a case-insensitive email search. It's primarily used
   * during authentication and registration to check for existing users.
   *
   * @param {string} email - The email address to search for
   * @returns {Promise<User | null>} The user entity if found, null otherwise
   * @example
   * const existingUser = await userRepository.findByEmail('john.doe@example.com');
   * if (existingUser) {
   *   throw new ConflictException('Email already registered');
   * }
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }
}
