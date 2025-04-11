import { SetMetadata } from '@nestjs/common';
export const OwnerParam = (param: string) => SetMetadata('ownerParam', param);
