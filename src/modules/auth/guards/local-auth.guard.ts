import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that implements local (username/password) authentication.
 *
 * This guard is used on the login endpoint to validate user credentials
 * using the local Passport strategy before issuing a JWT token.
 *
 * @class LocalAuthGuard
 * @extends {AuthGuard('local')}
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
