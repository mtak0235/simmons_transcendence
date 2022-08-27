import { UserDto, UserInfoDto } from '@socket/dto/user.socket.dto';
import { ChannelInfoDto } from '@socket/dto/channel.socket.dto';

export interface MainPageDto {
  me: UserDto;
  users: UserInfoDto[];
  channels: ChannelInfoDto[];
}
