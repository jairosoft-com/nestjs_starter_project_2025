import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../modules/users/dto';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockGetRequest: jest.Mock;
    let mockGetHandler: jest.Mock;
    let mockGetClass: jest.Mock;

    beforeEach(() => {
      mockGetRequest = jest.fn();
      mockGetHandler = jest.fn();
      mockGetClass = jest.fn();

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: mockGetRequest,
        }),
        getHandler: mockGetHandler,
        getClass: mockGetClass,
      } as unknown as ExecutionContext;
    });

    it('should return true if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      mockGetRequest.mockReturnValue({ user: { roles: [UserRole.USER] } });

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should return true if user has required role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);
      mockGetRequest.mockReturnValue({
        user: { roles: [UserRole.USER, UserRole.ADMIN] },
      });

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);
      mockGetRequest.mockReturnValue({ user: { roles: [UserRole.USER] } });

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(false);
    });

    it('should return false if user has no roles', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);
      mockGetRequest.mockReturnValue({ user: { roles: [] } });

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(false);
    });

    it('should return false if user is not authenticated', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);
      mockGetRequest.mockReturnValue({ user: null });

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(false);
    });

    it('should return false if user object has no roles property', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);
      mockGetRequest.mockReturnValue({ user: { id: '123' } });

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(false);
    });

    it('should check both handler and class metadata', () => {
      const handler = () => {}; // Use arrow function instead of jest.fn()
      const classRef = class TestClass {};
      mockGetHandler.mockReturnValue(handler);
      mockGetClass.mockReturnValue(classRef);

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);
      mockGetRequest.mockReturnValue({
        user: { roles: [UserRole.ADMIN] },
      });

      guard.canActivate(mockExecutionContext);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        handler,
        classRef,
      ]);
    });

    it('should return true if user has at least one of the required roles', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN, UserRole.USER]);
      mockGetRequest.mockReturnValue({ user: { roles: [UserRole.USER] } });

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should handle empty required roles array', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      mockGetRequest.mockReturnValue({ user: { roles: [UserRole.USER] } });

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });
  });
});
