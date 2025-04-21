import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';

declare global {
  namespace Express {
    interface Request {
      cookies: {
        accessToken?: string;
        refreshToken?: string;
      };
      user?: AuthenticatedUser;
    }
  }
}
