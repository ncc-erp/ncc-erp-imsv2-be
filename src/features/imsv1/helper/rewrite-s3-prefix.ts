import config from '@/config/env.config/config';

export const rewriteS3Prefix = (imageUrl: string) => {
  if (imageUrl) {
    const isValid = /^\b(http|https)/.test(imageUrl);
    if (!isValid) {
      const regex = /^\/image\//;

      return `${config().s3Prefix}/${imageUrl.replace(regex, '')}`;
    }
  }

  return imageUrl;
};
