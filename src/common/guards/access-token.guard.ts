import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isPublicRequest } from './is-public-request.utils';

@Injectable()
export class AccessGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (isPublicRequest(this.reflector, context, this.configService)) {
      return true;
    }

    return super.canActivate(context);
  }
}
