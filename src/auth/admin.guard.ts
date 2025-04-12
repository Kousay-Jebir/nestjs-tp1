import { RoleGuard } from './role.guard';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard extends RoleGuard {
  constructor() {
    super(['admin']);
  }
}
