import { validate } from 'class-validator';
import { CreateUserDto, UserRole } from './create-user.dto';

describe('CreateUserDto', () => {
  let dto: CreateUserDto;

  beforeEach(() => {
    dto = new CreateUserDto();
  });

  describe('email validation', () => {
    it('should fail if email is not provided', async () => {
      dto.name = 'John Doe';
      dto.password = 'SecurePass123!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail if email is not valid', async () => {
      dto.email = 'invalid-email';
      dto.name = 'John Doe';
      dto.password = 'SecurePass123!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should pass with valid email', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';
      dto.password = 'SecurePass123!';

      const errors = await validate(dto);
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors).toHaveLength(0);
    });
  });

  describe('name validation', () => {
    it('should fail if name is not provided', async () => {
      dto.email = 'john@example.com';
      dto.password = 'SecurePass123!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if name is not a string', async () => {
      dto.email = 'john@example.com';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      dto.name = 123 as any;
      dto.password = 'SecurePass123!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail if name is too short', async () => {
      dto.email = 'john@example.com';
      dto.name = 'J';
      dto.password = 'SecurePass123!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should pass with valid name', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';
      dto.password = 'SecurePass123!';

      const errors = await validate(dto);
      const nameErrors = errors.filter((e) => e.property === 'name');
      expect(nameErrors).toHaveLength(0);
    });
  });

  describe('password validation', () => {
    it('should fail if password is not provided', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if password is too short', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';
      dto.password = 'Short1!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail if password is too simple', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';
      dto.password = 'simplepassword';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should pass with strong password', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';
      dto.password = 'SecurePass123!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('roles validation', () => {
    it('should allow roles to be optional', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';
      dto.password = 'SecurePass123!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail if roles is not an array', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';
      dto.password = 'SecurePass123!';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      dto.roles = 'admin' as any;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('roles');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should fail if roles contains invalid values', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';
      dto.password = 'SecurePass123!';
      dto.roles = [UserRole.ADMIN, 'invalid-role' as any];

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('roles');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should pass with valid roles', async () => {
      dto.email = 'john@example.com';
      dto.name = 'John Doe';
      dto.password = 'SecurePass123!';
      dto.roles = [UserRole.USER, UserRole.ADMIN];

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
