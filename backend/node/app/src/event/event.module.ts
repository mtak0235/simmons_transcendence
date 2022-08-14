import { Module } from '@nestjs/common';
import { EventGateway } from '@src/event/event.gateway';
import { EventInterceptor } from '@src/event/event.interceptor';

@Module({
  providers: [
    EventGateway,
    {
      provide: 'eventInterceptor',
      useClass: EventInterceptor,
    },
  ],
})
export class EventModule {}
