import config from '@/config/env.config/config';

export const formatImageUrl = (imageUrl: string) => {
  if (imageUrl) {
    const isValid = /\b(http|https)/.test(imageUrl);
    if (!isValid) {
      return `${config().s3ImageUrl}/${imageUrl}`;
    }
  }

  return imageUrl;
};
