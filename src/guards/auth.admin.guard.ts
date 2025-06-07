import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from 'src/types/auth';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First authenticate with JWT
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) return false;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
