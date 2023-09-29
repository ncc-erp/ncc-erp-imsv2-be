import { SPLIT_SEPARATOR } from '@/common/constants/common.constant';

export default () => ({
  port: +process.env.PORT || 3000,
  node_env: process.env.NODE_ENV,
  allowOrigins: process.env.ALLOW_ORIGINS
    ? process.env.ALLOW_ORIGINS.split(SPLIT_SEPARATOR)
    : ['*'],
  s3ImageUrl: process.env.AWS_CLOUD_FRONT,
  s3Prefix: process.env.AWS_PREFIX,
});
