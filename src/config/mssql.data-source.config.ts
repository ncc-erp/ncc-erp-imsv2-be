import { MSSQL_NAME } from '@common/constants/datasource-name.constant';
import { DataSourceOptions } from 'typeorm';

export const mssqlDataSourceOptions: DataSourceOptions = {
  name: MSSQL_NAME,
  type: 'mssql',
  host: process.env.MS_HOST,
  username: process.env.MS_USERNAME,
  password: process.env.MS_PASSWORD,
  database: process.env.MS_DBNAME,
  options: { encrypt: false },
};
