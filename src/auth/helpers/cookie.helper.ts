import { Response } from 'express';
import { cookieOptions } from '../config/cookie-options.config';

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie('accessToken', accessToken, cookieOptions.accessToken);
  res.cookie('refreshToken', refreshToken, cookieOptions.refreshToken);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
