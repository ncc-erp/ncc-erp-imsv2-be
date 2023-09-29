export interface AuthEnv {
  google: GoogleEnv;
  jwt: JwtConfigEnv;
  publicSecretKey: string;
}

export interface GoogleEnv {
  client_id: string;
  client_secret: string;
}

export interface JwtConfigEnv {
  access: JwtSecret;
  refresh: JwtSecret;
  issuer: string;
  audience: string;
}

export interface JwtSecret {
  expiresIn: string;
  secret: string;
}
