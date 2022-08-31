import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from '@user/user.service';
import { JwtAuthGuard } from '@auth/guard/jwt.guard';
import Users from '@entity/user.entity';
import UserAchievementRepository from '@repository/user.achievement.repository';
import { UserResponseDto, UserUpdateDto } from '@user/user.dto';
import { UserResponseInterceptor } from '@user/user.interceptor';

@Controller('user')
export class UserController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly userAchievementRepository: UserAchievementRepository,
  ) {}

  @Get(':userId/profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserResponseInterceptor)
  async findOneUser(
    @Param('userId', ParseIntPipe, ValidationPipe) userId: number,
    @Req() req,
  ): Promise<UserResponseDto> {
    const user: Users =
      userId === req.user.id
        ? req.user
        : await this.userService.findUserById(userId);

    return { status: 200, body: user };
  }

  @Get(':userId/achievement')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserResponseInterceptor)
  async findUserAchievement(
    @Param('userId', ValidationPipe, ParseIntPipe) userId: number,
  ): Promise<UserResponseDto> {
    return {
      status: 200,
      body: [...(await this.userAchievementRepository.findById(userId))],
    };
  }

  @Get(':userId/record')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserResponseInterceptor)
  async findUserRecord(): Promise<UserResponseDto> {
    // todo: development

    return { status: 200, body: { message: 'ok' } };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserResponseInterceptor)
  async switchTwoFactor(
    @Req() req,
    @Body(ValidationPipe) userUpdateDto: UserUpdateDto,
  ): Promise<UserResponseDto> {
    const user: Users = req.user;

    await this.userService.updateProfile(user.id, userUpdateDto);

    return { status: 200, body: { message: 'OK' } };
  }

  @Put('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserResponseInterceptor)
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    return {
      status: 200,
      body: { imageUrl: await this.userService.uploadImage(req.user.id, file) },
    };
  }

  @Delete('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserResponseInterceptor)
  async deleteImage(@Req() req): Promise<UserResponseDto> {
    const user: Users = req.user;

    await this.userService.deleteImage(user.id);
    return {
      status: 200,
      body: { imageUrl: this.configService.get('awsConfig.defaultProfileUrl') },
    };
  }
}
