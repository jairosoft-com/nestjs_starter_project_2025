import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, Logger, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Test } from '@nestjs/testing';
import { Request } from 'express';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockLogger: jest.SpyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    mockLogger = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    let mockExecutionContext: ExecutionContext;
    let mockRequest: Partial<Request>;
    let mockNext: CallHandler;

    beforeEach(() => {
      mockRequest = {
        method: 'GET',
        url: '/api/users',
        headers: {},
        ip: '127.0.0.1',
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue({
            statusCode: 200,
          }),
        }),
        getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
        getHandler: jest.fn().mockReturnValue({ name: 'testMethod' }),
      } as unknown as ExecutionContext;

      mockNext = {
        handle: jest.fn(),
      };
    });

    it('should log request details on entry', (done) => {
      (mockNext.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      interceptor.intercept(mockExecutionContext, mockNext).subscribe(() => {
        expect(mockLogger).toHaveBeenCalledWith(
          expect.stringContaining('GET /api/users'),
        );
        expect(mockLogger).toHaveBeenCalledWith(
          expect.stringContaining('TestController.testMethod'),
        );
        done();
      });
    });

    it('should generate and attach request ID to headers', (done) => {
      (mockNext.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      interceptor.intercept(mockExecutionContext, mockNext).subscribe(() => {
        expect(mockRequest.headers).toHaveProperty('x-request-id');
        expect(mockRequest.headers?.['x-request-id']).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
        done();
      });
    });

    it('should use existing request ID if present', (done) => {
      const existingRequestId = '12345678-1234-1234-1234-123456789012';
      if (mockRequest.headers)
        mockRequest.headers['x-request-id'] = existingRequestId;
      (mockNext.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      interceptor.intercept(mockExecutionContext, mockNext).subscribe(() => {
        expect(mockRequest.headers?.['x-request-id']).toBe(existingRequestId);
        done();
      });
    });

    it('should log response time and status on success', (done) => {
      const mockResponse = { statusCode: 200 };
      mockExecutionContext.switchToHttp().getResponse = jest
        .fn()
        .mockReturnValue(mockResponse);
      (mockNext.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      interceptor.intercept(mockExecutionContext, mockNext).subscribe(() => {
        expect(mockLogger).toHaveBeenCalledWith(
          expect.stringMatching(/GET \/api\/users - 200 - \d+ms/),
        );
        done();
      });
    });

    it('should log error on failure', (done) => {
      const error = new Error('Test error');
      (mockNext.handle as jest.Mock).mockReturnValue(throwError(() => error));

      interceptor.intercept(mockExecutionContext, mockNext).subscribe({
        error: (err) => {
          expect(mockLogger).toHaveBeenCalledWith(
            expect.stringContaining('Error: Test error'),
          );
          expect(err).toBe(error);
          done();
        },
      });
    });

    it('should include request ID in all logs', (done) => {
      (mockNext.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      // Clear previous logs before testing
      mockLogger.mockClear();

      interceptor.intercept(mockExecutionContext, mockNext).subscribe(() => {
        const calls = mockLogger.mock.calls as unknown[][];
        expect(calls.length).toBeGreaterThan(0);

        // Filter only logs from our interceptor (containing URL)
        const interceptorLogs = calls.filter((call) => {
          const logMessage = call[0];
          return (
            typeof logMessage === 'string' && logMessage.includes('/api/users')
          );
        });

        expect(interceptorLogs.length).toBeGreaterThan(0);
        interceptorLogs.forEach((call) => {
          const logMessage = call[0];
          if (typeof logMessage === 'string') {
            expect(logMessage).toMatch(/\[[\w-]+\]/); // Check for request ID pattern
          }
        });
        done();
      });
    });

    it('should log client IP address', (done) => {
      (mockNext.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      interceptor.intercept(mockExecutionContext, mockNext).subscribe(() => {
        expect(mockLogger).toHaveBeenCalledWith(
          expect.stringContaining('127.0.0.1'),
        );
        done();
      });
    });

    it('should handle missing request properties gracefully', (done) => {
      mockRequest = {};
      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue(mockRequest);
      (mockNext.handle as jest.Mock).mockReturnValue(of({ data: 'test' }));

      interceptor.intercept(mockExecutionContext, mockNext).subscribe(() => {
        expect(mockLogger).toHaveBeenCalled();
        expect(mockRequest.headers).toBeDefined();
        done();
      });
    });
  });
});
