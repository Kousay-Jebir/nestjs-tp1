import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import typeormConfig from './typeorm.config';

export const SharedConfigModule = ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration, typeormConfig],
    envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
});
