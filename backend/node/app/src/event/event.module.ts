import { Module } from '@nestjs/common';
import { EventGateway } from '@src/event/event.gateway';
import { EventInterceptor } from '@src/event/event.interceptor';
import { EventService } from '@src/event/event.service';
import { MessageStore } from '@src/event/storage/message-store';
import { SessionStore } from '@src/event/storage/session-store';
import { ChannelListStore } from '@src/event/storage/channel-list-store';

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
    ChannelListStore,
  ],
})
export class EventModule {}
