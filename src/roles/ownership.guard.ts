import { Injectable, ExecutionContext, CanActivate } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "src/user/enums/role.enum";

@Injectable()
export class OwnershipOrAdminGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const paramKey = this.reflector.get<string>('ownerParam', context.getHandler()) || 'userId';
        const paramValue = request.params[paramKey];

        return user.role === Role.ADMIN || user.id === paramValue;
    }
}

