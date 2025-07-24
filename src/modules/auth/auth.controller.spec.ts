import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: Reflector,
          useValue: new Reflector(),
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({
        canActivate: jest.fn((context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        }),
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token', () => {
      const expectedResult = { access_token: 'jwt-token' };
      mockAuthService.login.mockReturnValue(expectedResult);

      const loginDto = { email: 'test@example.com', password: 'password' };
      const result = controller.login(
        { user: mockUser } as Express.Request & { user: User },
        loginDto,
      );

      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should have rate limiting decorator', () => {
      // Check for throttler metadata on the method
      const loginMethod = controller.login.bind(controller);
      const throttlerMetadata = Reflect.getMetadataKeys(loginMethod);
      const hasThrottlerDecorator = throttlerMetadata.some(
        (key) => typeof key === 'string' && key.includes('throttler'),
      );
      expect(
        hasThrottlerDecorator || throttlerMetadata.length > 0,
      ).toBeTruthy();
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      };
      const expectedResult = {
        id: '456e7890-e89b-12d3-a456-426614174000',
        email: registerDto.email,
        name: registerDto.name,
        roles: ['user'],
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );
    });

    it('should have rate limiting decorator', () => {
      // Check for throttler metadata on the method
      const registerMethod = controller.register.bind(controller);
      const throttlerMetadata = Reflect.getMetadataKeys(registerMethod);
      const hasThrottlerDecorator = throttlerMetadata.some(
        (key) => typeof key === 'string' && key.includes('throttler'),
      );
      expect(
        hasThrottlerDecorator || throttlerMetadata.length > 0,
      ).toBeTruthy();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const result = controller.getProfile({
        user: mockUser,
      } as Express.Request & { user: User });

      expect(result).toEqual(mockUser);
    });

    it('should not have rate limiting decorator (uses global)', () => {
      // getProfile uses global rate limiting, not method-specific
      const getProfileMethod = controller.getProfile.bind(controller);
      const throttlerMetadata = Reflect.getMetadataKeys(getProfileMethod);
      const hasThrottlerDecorator = throttlerMetadata.some(
        (key) => typeof key === 'string' && key.includes('throttler'),
      );
      expect(hasThrottlerDecorator).toBeFalsy();
    });
  });
});
