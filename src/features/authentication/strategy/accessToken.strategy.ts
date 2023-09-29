import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Inject } from '@nestjs/common/decorators';
import { Cache } from 'cache-manager';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { USER_HAS_BEEN_LOGGED_OUT } from '@/common/constants/authentication.constant';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthenticationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.jwt.access.secret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const currentIat = await this.cacheManager.get<number>(
      payload.emailAddress,
    );

    if (currentIat === USER_HAS_BEEN_LOGGED_OUT) {
      throw new UnauthorizedException(
        'User has been logged out and this token is no longer valid',
      );
    }

    return this.authService.validateUserByEmail(payload.emailAddress);
  }
}
