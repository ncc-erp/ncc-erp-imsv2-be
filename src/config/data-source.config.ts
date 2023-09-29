import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { envFilePath } from './env-path.config';

config({ path: envFilePath });

export const dataSourceOption: DataSourceOptions = {
  name: 'default',
  type: 'postgres',
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  logging: process.env.DB_LOGGING?.toLowerCase() === 'true',
  entities: ['dist/entities/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  subscribers: [],
  schema: process.env.DB_SCHEMA ?? 'public',
  migrationsRun: true,
};

export default new DataSource(dataSourceOption);
