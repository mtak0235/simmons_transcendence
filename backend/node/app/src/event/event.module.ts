import { Module } from '@nestjs/common';
import { EventGateway } from '@event/event.gateway';
import { EventInterceptor } from '@event/event.interceptor';
import { EventService } from '@event/event.service';
// import { MessageStore } from '@event/storage/message-store';
import { UserStore } from '@event/storage/user.store';
import { ChannelStore } from '@event/storage/channelStore';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [
    EventGateway,
    {
      provide: 'eventInterceptor',
      useClass: EventInterceptor,
    },
    EventService,
    // MessageStore,
    UserStore,
    ChannelStore,
  ],
})
export class EventModule {}
