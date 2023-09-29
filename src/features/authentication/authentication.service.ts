import { USER_HAS_BEEN_LOGGED_OUT } from '@/common/constants/authentication.constant';
import { UserService } from '@features/user/user.service';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { HttpException, NotFoundException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { AxiosError } from 'axios';
import { Cache } from 'cache-manager';
import { catchError, lastValueFrom, map } from 'rxjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    @Inject('JWT_ACCESS_TOKEN_SERVICE')
    private readonly jwtAccessTokenService: JwtService,
    @Inject('JWT_REFRESH_TOKEN_SERVICE')
    private readonly jwtRefreshTokenService: JwtService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(googleUserDto: LoginDto) {
    const googleToken = googleUserDto.googleAuthToken;
    const userEmail = await this.validateGoogleToken(googleToken);
    if (!userEmail) {
      throw new BadRequestException('User is not authenticated by Google');
    }

    const user = await this.validateUserByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { accessToken } = await this.createAccessToken(userEmail);
    const { refreshToken } = await this.createRefreshToken(userEmail);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateGoogleToken(googleToken: string) {
    const token = googleToken.split(' ')[1];
    const res = this.httpService
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: googleToken,
          },
        },
      )
      .pipe(map((res) => res.data))
      .pipe(
        catchError((e: AxiosError) => {
          if (e.response.status === 401) {
            throw new UnauthorizedException('Invalid token');
          }

          throw new HttpException(e.message, e.response.status);
        }),
      );

    const { email }: { email: string } = await lastValueFrom(res);

    return email;
  }

  validateUserByEmail(email: string) {
    return this.userService.findOneWhere({
      emailAddress: email ?? '',
      isDeleted: false,
      isActive: true,
    });
  }

  async createAccessToken(emailAddress: string) {
    const token = this.jwtAccessTokenService.sign({ emailAddress });

    return {
      accessToken: token,
    };
  }

  async createRefreshToken(emailAddress: string) {
    const token = this.jwtRefreshTokenService.sign({ emailAddress });

    return {
      refreshToken: token,
    };
  }

  async refresh(email: string) {
    const user = await this.validateUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const { accessToken } = await this.createAccessToken(email);
    const { refreshToken } = await this.createRefreshToken(email);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(email: string) {
    await this.cacheManager.set(email, USER_HAS_BEEN_LOGGED_OUT, 0);

    return {
      message: 'User has been logged out',
    };
  }
}
