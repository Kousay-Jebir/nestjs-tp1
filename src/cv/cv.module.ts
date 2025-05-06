import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Cv2Controller } from './cv2.controller';
import { AuthMiddleware } from 'src/auth/middleware/auth.middleware';
import { UserModule } from 'src/user/user.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cv]), UserModule, EventsModule],
  controllers: [CvController, Cv2Controller],
  providers: [CvService],
})
export class CvModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(Cv2Controller);
  }
}
