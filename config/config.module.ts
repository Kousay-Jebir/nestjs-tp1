import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';

export const SharedConfigModule = ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
    envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
});
