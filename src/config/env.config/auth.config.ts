import { AuthEnv } from '@/types/authorization/env';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'auth',
  (): AuthEnv => ({
    google: {
      client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    },
    jwt: {
      access: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      },
      refresh: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      },
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    },
    publicSecretKey: process.env.TOOL_SECURITY_CODE,
  }),
);
