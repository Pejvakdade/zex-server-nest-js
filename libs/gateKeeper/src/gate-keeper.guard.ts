import {
  CanActivate,
  ExecutionContext,
  forwardRef, HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {JwtService, JwtSignOptions} from '@nestjs/jwt';

@Injectable()
export class GateKeeperGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => JwtService))
        private jwtService: JwtService,
    ) { }

    public async jwtNewToken(payload: any, options?: JwtSignOptions) {
        return this.jwtService.sign(payload, options);
    }

    public jwtVerifyToken(token: string) {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET_KEY'),
            });
        } catch (error) {
            const exception: {
                [key: string]: {
                    message?: string;
                    status?: HttpStatus;
                    data?: unknown;
                };
            } = {
                'invalid signature':{
                  message: 'Invalid authorization token',
                  status: HttpStatus.UNAUTHORIZED,
                },
                'jwt expired': {
                  message: 'Authorization token has expired',
                  status: HttpStatus.UNAUTHORIZED,
                },
                'jwt malformed': {
                  message: 'Malformed authorization token',
                  status: HttpStatus.UNAUTHORIZED,
                },
                'invalid token': {
                  message: 'Malformed authorization token',
                  status: HttpStatus.UNAUTHORIZED,
                },
            };

            const errorMessage = error instanceof Error ? error.message : 'unknown';
            const exceptionDetails = exception[errorMessage];

            if (exceptionDetails) {
                throw new UnauthorizedException(exceptionDetails);
            }

            throw new UnauthorizedException(
              {
                message: 'Invalid authorization token, something went wrong with it',
                status: HttpStatus.UNAUTHORIZED,
                errorMessage,
              },
            );
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const allowedRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];

        const request = context.switchToHttp().getRequest();
        const authorization = request?.headers['authorization'];
        if (authorization) {
          const [type, token] = authorization.split(' ');
          const decodedToken = this?.jwtVerifyToken(token);
          request._id      = decodedToken?._id;
          request.userType = decodedToken?.userType;
        }

        // No roles defined = public route, skip guard
        if (!allowedRoles || allowedRoles.length === 0) {
          return true;
        }

        // const request = context.switchToHttp().getRequest();
        // const authorization = request.headers['authorization'];

        if (!authorization) {
            throw new UnauthorizedException(
              {
                message: 'Authorization header is required',
                status: HttpStatus.UNAUTHORIZED,
              },
            );
        }

        const [type, token] = authorization.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException(
              {
                message: 'Invalid authorization token',
                status: HttpStatus.UNAUTHORIZED,
              },
            );
        }

        try {
            const decodedToken = this.jwtVerifyToken(token);

            if (!decodedToken) {
                throw new UnauthorizedException({ message: 'invalid token' });
            }

            if (Number(decodedToken.exp) * 1000 < Date.now()) {

                throw new UnauthorizedException( {
                  message: 'Authorization token has expired',
                  status: HttpStatus.UNAUTHORIZED,
                })
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(decodedToken.userType)) {
              throw new UnauthorizedException( {
                message: `Access denied with ${decodedToken.userType} role. Allowed role${allowedRoles.length > 1 ? 's' : ''} are: '${allowedRoles}'`,
                status: HttpStatus.UNAUTHORIZED,
              })
            }

            request._id      = decodedToken._id;
            request.userType = decodedToken.userType;

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException(
              {
                message: 'Authorization failed',
                status: HttpStatus.UNAUTHORIZED,
              },
            );
        }
    }
}
