import { ConfigModule } from '@nestjs/config';
import envConfig from '@config/config.env';
import envValidation from '@config/config.validation';

export default () =>
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath:
      process.env.NODE_ENV === 'development'
        ? '.env.dev'
        : process.env.NODE_ENV === 'production'
        ? '.env.prod'
        : '.env.test',
    load: [envConfig],
    validationSchema: envValidation(),
  });
