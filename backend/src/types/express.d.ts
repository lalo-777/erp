import { UserMySQL } from '../models/mysql/UserMySQL';

declare global {
  namespace Express {
    interface Request {
      user?: UserMySQL;
      userId?: string;
    }
  }
}
