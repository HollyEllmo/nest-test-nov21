import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new ForbiddenException('API key is not configured');
    }

    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-api-key'];

    if (provided && provided === apiKey) {
      return true;
    }

    throw new ForbiddenException('Invalid API key');
  }
}
