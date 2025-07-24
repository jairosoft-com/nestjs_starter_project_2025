import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/**
 * Service responsible for authentication and authorization operations.
 *
 * This service implements the core authentication logic for the application,
 * including credential validation, JWT token generation, and new user registration.
 * It integrates with the UsersService for user data access and uses bcrypt for
 * secure password hashing and comparison.
 *
 * @class AuthService
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials for authentication.
   *
   * This method is the core of the authentication process, verifying that
   * the provided credentials match a user in our system. It uses bcrypt
   * to securely compare the plain text password with the stored hash.
   *
   * @param {string} email - The user's email address
   * @param {string} password - The user's plain text password
   * @returns {Promise<Omit<User, 'password' | 'hashPassword'> | null>} User object without sensitive fields if valid, null if invalid
   * @example
   * const user = await authService.validateUser('user@example.com', 'SecurePass123!');
   * if (user) {
   *   // User is authenticated, proceed with login
   * }
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password' | 'hashPassword'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }
    return null;
  }

  /**
   * Generates a JWT access token for an authenticated user.
   *
   * Creates a JWT token containing the user's email, ID, and roles. This token
   * is used for subsequent authenticated requests to the API. The token expiration
   * is configured via the JWT module settings.
   *
   * @param {User} user - The authenticated user entity
   * @returns {{ access_token: string }} Object containing the signed JWT access token
   * @example
   * const validatedUser = await authService.validateUser(email, password);
   * if (validatedUser) {
   *   const { access_token } = authService.login(validatedUser);
   *   // Return token to client
   * }
   */
  login(user: User) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Registers a new user in the system.
   *
   * Handles the complete user registration process, including password hashing
   * and user creation. The password is automatically hashed before storage
   * using bcrypt with a cost factor defined in the User entity.
   *
   * @param {string} email - The user's email address (must be unique)
   * @param {string} password - The user's plain text password (will be hashed)
   * @param {string} name - The user's display name
   * @returns {Promise<Omit<User, 'password' | 'hashPassword'>>} The newly created user object without sensitive fields
   * @throws {ConflictException} If a user with the email already exists
   * @throws {BadRequestException} If validation fails
   * @example
   * try {
   *   const newUser = await authService.register(
   *     'newuser@example.com',
   *     'SecurePass123!',
   *     'John Doe'
   *   );
   *   // User successfully registered
   * } catch (error) {
   *   // Handle registration error
   * }
   */
  async register(email: string, password: string, name: string) {
    const user = await this.usersService.create({ email, password, name });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
