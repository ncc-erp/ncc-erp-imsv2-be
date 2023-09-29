import { Public } from '@/common/decorators/authorization.decorator';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RefreshGuard } from '@common/guards/refresh-token.guard';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from './dto/login.dto';
import { IJwtRequestUser } from './type/jwt-request-user.type';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('OAuth')
@Controller('auth')
@ApiBearerAuth()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post('token')
  login(@Body() loginDto: LoginDto) {
    return this.authenticationService.login(loginDto);
  }

  @Public()
  @UseGuards(RefreshGuard)
  @Get('refresh')
  refresh(@Req() req: IJwtRequestUser) {
    const email = req.user.emailAddress;
    return this.authenticationService.refresh(email);
  }

  @Get('logout')
  logout(@CurrentUser('email') email: string) {
    return this.authenticationService.logout(email);
  }
}
