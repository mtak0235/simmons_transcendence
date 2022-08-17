import { Module } from '@nestjs/common';
import { EventGateway } from '@event/event.gateway';
import { EventInterceptor } from '@event/event.interceptor';
import { EventService } from '@event/event.service';
import { MessageStore } from '@event/storage/message-store';
import { SessionStore } from '@event/storage/session-store';
import { ChannelListStore } from '@event/storage/channel-list-store';
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
