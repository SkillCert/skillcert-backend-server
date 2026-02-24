import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // For now, we'll do basic authentication check
    // In a real implementation, you would validate JWT token here
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      // For development, allow requests without auth
      // In production, you would throw UnauthorizedException
      return true;
    }

    // Basic token validation (placeholder for JWT validation)
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        // TODO: Implement proper JWT validation
        // For now, just check if token exists
        return true;
      }
    }

    throw new UnauthorizedException('Invalid authentication token');
  }
}
