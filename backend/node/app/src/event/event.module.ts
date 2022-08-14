import { Module } from '@nestjs/common';
import { EventGateway } from '@src/event/event.gateway';
import { EventInterceptor } from '@src/event/event.interceptor';
import { EventService } from '@src/event/event.service';
import { MessageStore } from '@src/event/storage/message-store';
import { SessionStore } from '@src/event/storage/session-store';

@Module({
  providers: [
    EventGateway,
    {
      provide: 'eventInterceptor',
      useClass: EventInterceptor,
    },
    EventService,
    MessageStore,
    SessionStore,
  ],
})
export class EventModule {}
