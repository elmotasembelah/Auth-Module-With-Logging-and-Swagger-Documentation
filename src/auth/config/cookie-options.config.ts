import type { CookieOptions } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const cookieOptions = {
  accessToken: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  } satisfies CookieOptions,

  refreshToken: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  } satisfies CookieOptions,
};
