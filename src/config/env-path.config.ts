const ENV = process.env.ENV;
export const envFilePath = `.env.${ENV ?? 'local'}`;
