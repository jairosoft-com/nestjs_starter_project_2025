import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method || 'UNKNOWN';
    const url = request.url || 'UNKNOWN';
    const ip = request.ip || 'UNKNOWN';

    // Ensure headers object exists
    if (!request.headers) {
      request.headers = {};
    }

    // Generate or use existing request ID
    const existingId = request.headers['x-request-id'];
    const requestId = typeof existingId === 'string' ? existingId : uuidv4();
    request.headers['x-request-id'] = requestId;

    const controller = context.getClass().name;
    const handler = context.getHandler().name;

    const now = Date.now();

    // Log incoming request
    this.logger.log(
      `[${requestId}] ${method} ${url} - ${controller}.${handler} - ${ip}`,
    );

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        const statusCode = response.statusCode || 200;

        // Log successful response
        this.logger.log(
          `[${requestId}] ${method} ${url} - ${statusCode} - ${responseTime}ms`,
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;

        // Log error response
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.log(
          `[${requestId}] ${method} ${url} - Error: ${errorMessage} - ${responseTime}ms`,
        );

        throw error;
      }),
    );
  }
}
