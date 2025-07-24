import { Injectable, ConflictException } from '@nestjs/common';
import { IUserRepository } from './repositories/user.repository.interface';
import { User } from './entities/user.entity';
import { DeepPartial } from 'typeorm';

/**
 * Service responsible for managing user-related operations.
 *
 * This service provides a high-level interface for user management, implementing
 * business logic and validation rules. It uses the repository pattern to abstract
 * data access, making the service testable and database-agnostic.
 *
 * @class UsersService
 */
@Injectable()
export class UsersService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Creates a new user in the system.
   *
   * Validates that the email is unique before creating the user. The password
   * should be hashed before calling this method (handled by User entity hooks).
   *
   * @param {DeepPartial<User>} userData - Partial user data containing at minimum an email
   * @returns {Promise<User>} The newly created user entity with all fields populated
   * @throws {ConflictException} If email is not provided or user with email already exists
   * @example
   * const user = await usersService.create({
   *   email: 'user@example.com',
   *   name: 'John Doe',
   *   password: 'plainTextPassword' // Will be hashed by entity hook
   * });
   */
  async create(userData: DeepPartial<User>): Promise<User> {
    if (!userData.email) {
      throw new ConflictException('Email is required');
    }
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    return await this.userRepository.create(userData);
  }

  /**
   * Finds a user by their unique identifier.
   *
   * This method is commonly used for authorization checks and user profile retrieval.
   *
   * @param {string} id - The UUID of the user to find
   * @returns {Promise<User | null>} The user entity if found, null otherwise
   * @example
   * const user = await usersService.findById('123e4567-e89b-12d3-a456-426614174000');
   * if (!user) {
   *   throw new NotFoundException('User not found');
   * }
   */
  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  /**
   * Finds a user by their email address.
   *
   * Primarily used during authentication to retrieve user credentials. Email
   * addresses are case-insensitive in the database.
   *
   * @param {string} email - The email address to search for
   * @returns {Promise<User | null>} The user entity if found, null otherwise
   * @example
   * const user = await usersService.findByEmail('user@example.com');
   * if (user) {
   *   // Proceed with authentication
   * }
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Retrieves all users from the database.
   *
   * Use with caution in production as this returns all users without pagination.
   * Consider implementing pagination for large user bases.
   *
   * @returns {Promise<User[]>} An array of all user entities
   * @example
   * const users = await usersService.findAll();
   * console.log(`Total users: ${users.length}`);
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  /**
   * Updates an existing user's information.
   *
   * Performs a partial update, only modifying the fields provided. If password
   * is included, it will be automatically hashed by the entity hook.
   *
   * @param {string} id - The UUID of the user to update
   * @param {DeepPartial<User>} userData - Partial user data containing fields to update
   * @returns {Promise<User | null>} The updated user entity if found, null otherwise
   * @example
   * const updatedUser = await usersService.update(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   { name: 'Jane Doe', roles: [UserRole.ADMIN] }
   * );
   */
  async update(id: string, userData: DeepPartial<User>): Promise<User | null> {
    return await this.userRepository.update(id, userData);
  }

  /**
   * Deletes a user from the system.
   *
   * Performs a hard delete, permanently removing the user from the database.
   * Consider implementing soft deletes for audit trails.
   *
   * @param {string} id - The UUID of the user to delete
   * @returns {Promise<boolean>} true if the user was deleted, false if not found
   * @example
   * const wasDeleted = await usersService.delete('123e4567-e89b-12d3-a456-426614174000');
   * if (!wasDeleted) {
   *   throw new NotFoundException('User not found');
   * }
   */
  async delete(id: string): Promise<boolean> {
    return await this.userRepository.delete(id);
  }
}
