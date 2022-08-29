import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class ImageService {
  private readonly s3 = new AWS.S3();

  constructor(private readonly configService: ConfigService) {
    this.s3.config.update({
      credentials: {
        accessKeyId: this.configService.get('awsConfig.uid'),
        secretAccessKey: this.configService.get('awsConfig.secret'),
      },
      region: this.configService.get('awsConfig.region'),
    });
  }

  async uploadImage(filename: string, image: Buffer) {
    await this.s3
      .upload({
        Bucket: this.configService.get('awsConfig.bucket'),
        Key: filename,
        Body: image,
      })
      .promise();
  }
}
