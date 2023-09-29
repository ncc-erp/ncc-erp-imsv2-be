import { Reflector } from '@nestjs/core';
import {
  PUBLIC_SECURITY,
  SECRET_KEY_HEADER,
  SECURITY_CODE_HEADER,
  SKIP_AUTH,
} from '@common/constants/author.constant';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const isPublicRequest = (
  reflector: Reflector,
  context: ExecutionContext,
  configService: ConfigService,
) => {
  const skipAuth = reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (skipAuth) return true;

  // Call by other tools
  const checkSecurityCode = reflector.getAllAndOverride<boolean>(
    PUBLIC_SECURITY,
    [context.getHandler(), context.getClass()],
  );

  if (checkSecurityCode) {
    const publicSecretKey = configService.get('auth.publicSecretKey');
    const { headers } = context.switchToHttp().getRequest();
    let securityCodeHeader = headers[SECURITY_CODE_HEADER.toLowerCase()];
    if (!securityCodeHeader) {
      securityCodeHeader = headers[SECRET_KEY_HEADER.toLowerCase()];
    }

    if (publicSecretKey !== securityCodeHeader) {
      throw new ForbiddenException(
        `SecretCode ${securityCodeHeader} does not match!`,
      );
    }

    return true;
  }
};
