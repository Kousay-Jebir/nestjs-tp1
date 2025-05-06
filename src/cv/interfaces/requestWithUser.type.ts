import { Request } from 'express';
import { Role } from '../../user/enums/role.enum';

export interface RequestWithUser extends Request {
  user: {
    userId: number;
    role: Role;
  };
}
