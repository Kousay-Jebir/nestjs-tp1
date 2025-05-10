import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { SkillModule } from './skill/skill.module';
import { UserModule } from './user/user.module';
import { SharedConfigModule } from 'config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import { MessageModule } from './messages/message.module';
import { SocketModule } from './socket/socket.module';
import { HistoryModule } from './history/history.module';
import { EventsModule } from './event/event.module';
import { EventEmitterModule } from '@nestjs/event-emitter';


@Module({
  imports: [
    SharedConfigModule,
    EventEmitterModule,
    TypeOrmModule.forRootAsync({
      imports: [SharedConfigModule],
      useFactory: (configService: ConfigService) => {
        const typeOrmConfig = configService.get('typeorm');

        if (!typeOrmConfig) {
          throw new Error('TypeORM configuration is missing');
        }

        return typeOrmConfig;
      },
      inject: [ConfigService],
    }),
    UserModule,
    CvModule,
    SkillModule,
    AuthModule,
    MessageModule,
    SocketModule,
    HistoryModule,
    EventsModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule { }
