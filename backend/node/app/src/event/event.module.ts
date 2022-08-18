import { Module } from '@nestjs/common';
import { EventGateway } from '@src/event/event.gateway';
import { EventInterceptor } from '@src/event/event.interceptor';
import { EventService } from '@src/event/event.service';
import { MessageStore } from '@src/event/storage/message-store';
import { UserStore } from '@src/event/storage/user.store';
import { ChannelListStore } from '@src/event/storage/channelStore';
@Module({
  providers: [
    EventGateway,
    {
      provide: 'eventInterceptor',
      useClass: EventInterceptor,
    },
    EventService,
    MessageStore,
    UserStore,
    ChannelListStore,
  ],
})
export class EventModule {}
