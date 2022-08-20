import { Module } from '@nestjs/common';

import { EventGateway } from '@event/event.gateway';
import { EventInterceptor } from '@event/event.interceptor';
import { EventService } from '@event/event.service';
// import { MessageStore } from '@event/storage/message-store';
import { UserStore } from '@event/storage/user.store';
import { ChannelStore } from '@event/storage/channelStore';
import { JwtModule } from '@nestjs/jwt';
import { UserEventService } from '@event/service/user.event.service';
import { MainEventService } from '@event/service/main.event.service';
import { ChannelEventService } from '@event/service/channel.event.service';

@Module({
  imports: [JwtModule],
  providers: [
    EventGateway,
    {
      provide: 'eventInterceptor',
      useClass: EventInterceptor,
    },
    MainEventService,
    UserEventService,
    ChannelEventService,
    EventService, // todo: delete: 위의 서비스로 분할 예정
    // MessageStore,
    UserStore,
    ChannelStore,
  ],
})
export class EventModule {}
