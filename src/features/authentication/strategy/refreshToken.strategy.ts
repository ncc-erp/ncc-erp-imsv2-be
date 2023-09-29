import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Inject } from '@nestjs/common/decorators';
import { Cache } from 'cache-manager';
import { BadRequestException } from '@nestjs/common/exceptions';
import { USER_HAS_BEEN_LOGGED_OUT } from '@/common/constants/authentication.constant';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.jwt.refresh.secret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const { iat, exp, emailAddress } = payload;

    const currentIat = await this.cacheManager.get<number | undefined>(
      emailAddress,
    );

    if (currentIat === USER_HAS_BEEN_LOGGED_OUT) {
      throw new BadRequestException(
        'User has been logged out and this token is no longer valid',
      );
    }

    const remainingTime = exp * 1000 - Date.now();
    const cacheExpireTime = remainingTime > 0 ? remainingTime : 1;

    if (currentIat && iat <= currentIat)
      throw new BadRequestException('Refresh token is not valid anymore');

    await this.cacheManager.set(emailAddress, iat, cacheExpireTime);
    return payload;
  }
}
