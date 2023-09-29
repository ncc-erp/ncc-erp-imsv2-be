import { AccessGuard } from '@/common/guards/access-token.guard';
import authConfig from '@/config/env.config/auth.config';
import { JwtConfigEnv } from '@/types/authorization/env';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@features/user/user.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { AccessTokenStrategy } from './strategy/accessToken.strategy';
import { RefreshTokenStrategy } from './strategy/refreshToken.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    HttpModule,
    JwtModule.register({}),
    ConfigModule.forFeature(authConfig),
  ],
  providers: [
    AuthenticationService,
    RefreshTokenStrategy,
    AccessTokenStrategy,
    {
      provide: 'JWT_REFRESH_TOKEN_SERVICE',
      useFactory: (configService: ConfigService) => {
        const jwt = configService.get<JwtConfigEnv>('auth.jwt');
        return new JwtService({
          secret: jwt.refresh.secret,
          signOptions: {
            expiresIn: jwt.refresh.expiresIn,
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'JWT_ACCESS_TOKEN_SERVICE',
      useFactory: (configService: ConfigService) => {
        const jwt = configService.get<JwtConfigEnv>('auth.jwt');
        return new JwtService({
          verifyOptions: {
            audience: jwt.audience,
            issuer: jwt.issuer,
          },
          secret: jwt.access.secret,
          signOptions: {
            expiresIn: jwt.access.expiresIn,
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: APP_GUARD,
      useClass: AccessGuard,
    },
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
