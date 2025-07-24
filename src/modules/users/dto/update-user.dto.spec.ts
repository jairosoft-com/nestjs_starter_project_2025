import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';
import { UserRole } from './create-user.dto';

describe('UpdateUserDto', () => {
  let dto: UpdateUserDto;

  beforeEach(() => {
    dto = new UpdateUserDto();
  });

  describe('all fields should be optional', () => {
    it('should pass with no fields provided', async () => {
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only email provided', async () => {
      dto.email = 'new@example.com';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only name provided', async () => {
      dto.name = 'New Name';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only password provided', async () => {
      dto.password = 'NewSecurePass123!';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only roles provided', async () => {
      dto.roles = [UserRole.ADMIN];
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('email validation when provided', () => {
    it('should fail if email is invalid', async () => {
      dto.email = 'invalid-email';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should pass with valid email', async () => {
      dto.email = 'valid@example.com';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('name validation when provided', () => {
    it('should fail if name is too short', async () => {
      dto.name = 'J';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should pass with valid name', async () => {
      dto.name = 'John Doe';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('password validation when provided', () => {
    it('should fail if password is too short', async () => {
      dto.password = 'Short1!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail if password is too simple', async () => {
      dto.password = 'simplepassword';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should pass with strong password', async () => {
      dto.password = 'NewSecurePass123!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('roles validation when provided', () => {
    it('should fail if roles contains invalid values', async () => {
      dto.roles = [UserRole.USER, 'invalid-role' as any];

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('roles');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should pass with valid roles', async () => {
      dto.roles = [UserRole.USER, UserRole.ADMIN];

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('multiple fields update', () => {
    it('should pass when updating multiple valid fields', async () => {
      dto.email = 'updated@example.com';
      dto.name = 'Updated Name';
      dto.roles = [UserRole.USER];

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail if any field is invalid', async () => {
      dto.email = 'invalid-email';
      dto.name = 'Valid Name';
      dto.password = 'ValidPass123!';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });
  });
});
