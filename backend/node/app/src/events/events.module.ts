import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PersistenceInterceptor } from './persistence.interceptor';
import { UserService } from './user.service';

@Module({
  providers: [
    EventsGateway,
    {
      provide: 'hello',
      useClass: PersistenceInterceptor,
    },
    UserService,
  ],
})
export class EventsModule {}
