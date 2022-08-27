import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('authConfig.jwt'),
      });

      let userId;

      if (payload.type === 'dev') userId = parseInt(payload.id, 10);
      else
        userId = parseInt(
          (await this.encryptionService.decrypt(payload.id)).toString(),
          10,
        );

      if (isNaN(userId)) throw new UnauthorizedException();
      return await this.userRepository.findUser('id', userId);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  async setClient(userInfo: Users): Promise<MainPageDto> {
    const mainPageDto: MainPageDto = {
      me: this.userSocketStore.find(userInfo.id),
      users: this.userSocketStore.findAllInfo(userInfo.id),
      channels: this.channelSocketStore.findAllInfo(),
    };
    if (mainPageDto.me && mainPageDto.me.status !== 'offline') {
      if (process.env.NODE_ENV !== 'local') {
        // todo: delete: 개발용 if문, 삭제 필요
        throw new SocketException('Forbidden');
      }
    }
    mainPageDto.me = await this.userSocketService.connect(
      !mainPageDto.me ? userInfo : mainPageDto.me,
    );
    return mainPageDto;
  }
}
