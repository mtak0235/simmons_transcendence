import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { EncryptionService } from '@util/encryption.service';
import UserRepository from '@repository/user.repository';
import Users from '@entity/user.entity';
import { UserSocketService } from '@socket/service/user.socket.service';
import { UserSocketStore } from '@socket/storage/user.socket.store';
import { MainPageDto } from '@socket/dto/main.socket.dto';
import { ChannelSocketStore } from '@socket/storage/channel.socket.store';
import { MainSocketStore } from '@socket/storage/main.socket.store';
import { ClientInstance } from '@socket/socket.gateway';

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
    private readonly mainSocketStore: MainSocketStore,
  ) {}

  async verifyUser(token: any): Promise<Users> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('authConfig.jwt'),
      });

      if (payload.type !== 'access') throw new UnauthorizedException();

      return await this.userRepository.findUser('id', payload.id);
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
      // todo: delete: 개발용 if문, 삭제 필요, 조건문만 삭제해야 함
      // if (process.env.NODE_ENV !== 'local') {
      throw new InternalServerErrorException('Forbidden');
      // }
    }
    mainPageDto.me = await this.userSocketService.connect(
      !mainPageDto.me ? userInfo : mainPageDto.me,
    );
    return mainPageDto;
  }

  // todo: unsafe: client instance 정상적으로 작동 안하면 그냥 뺴자
  setSocketInstance(userId: number, client: ClientInstance): void {
    if (this.mainSocketStore.has(userId)) return;
    this.mainSocketStore.set(userId, client);
  }

  getSocketInstance(userId: number): ClientInstance {
    if (!this.mainSocketStore.has(userId))
      throw new InternalServerErrorException();
    return this.mainSocketStore.get(userId);
  }

  deleteSocketInstance(userId: number): void {
    if (!this.mainSocketStore.has(userId)) return;
    this.mainSocketStore.delete(userId);
  }
}
