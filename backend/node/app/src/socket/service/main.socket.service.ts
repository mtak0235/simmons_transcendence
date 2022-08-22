import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { EncryptionService } from '@util/encryption.service';
import UserRepository from '@repository/user.repository';
import Users from '@entity/user.entity';
import { UserSocketService } from '@socket/service/user.socket.service';
import { UserSocketStore } from '@socket/storage/user.socket.store';
import { SocketException } from '@socket/socket.exception';
import { MainPageDto } from '@socket/dto/main.socket.dto';
import { ChannelSocketStore } from '@socket/storage/channel.socket.store';

@Injectable()
export class MainSocketService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly userRepository: UserRepository,
    private readonly userSocketService: UserSocketService,
    private readonly userSocketStore: UserSocketStore,
    private readonly channelSocketStore: ChannelSocketStore,
  ) {}

  async verifyUser(token: any): Promise<Users> {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get('authConfig.jwt'),
    });

    // todo: delete: 개발용 코드
    if (payload.type === 'dev')
      return await this.userRepository.findUser('id', 2269);

    const userId = parseInt(
      (await this.encryptionService.decrypt(payload.id)).toString(),
      10,
    );

    return await this.userRepository.findUser('id', userId);
  }

  async setClient(userInfo: Users): Promise<MainPageDto> {
    this.userSocketStore.save({
      userId: 2270,
      username: 'unknown',
      status: 'online',
      follows: [],
      blocks: [],
    }); // todo: delete: 개발용 코드

    const mainPageDto: MainPageDto = {
      me: this.userSocketStore.find(userInfo.id),
      users: this.userSocketStore.findAllInfo(userInfo.id),
      channels: this.channelSocketStore.findAllInfo(),
    };

    if (!mainPageDto.me) {
      mainPageDto.me = await this.userSocketService.connect(userInfo);
    } else {
      if (mainPageDto.me.status !== 'offline')
        if (process.env.NODE_ENV !== 'local')
          // todo: delete: 개발용 if문, 삭제 필요
          throw new SocketException('Forbidden');

      await this.userSocketService.reconnect(mainPageDto.me);
    }

    return mainPageDto;
  }
}
