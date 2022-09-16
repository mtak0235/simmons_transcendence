import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as Yaml from 'yamljs';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';

import { AppModule } from '@src/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3001;
  const document = Yaml.load(__dirname + '/../swagger.yaml');
  SwaggerModule.setup('api', app, document);

  passport.serializeUser((user, done) => {
    if (user) done(null, user);
    else done('error', false);
  });
  passport.deserializeUser((user, done) => {
    if (user) done(null, user);
    else done('error', false);
  });

  app.setGlobalPrefix('v0');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors({ origin: '*', credentials: true });
  app.use(
    session({
      secret: 'simmons_transcendence',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());

  await app.listen(port, () => {
    console.log(`======= ENV: ${process.env.NODE_ENV} =======`);
    console.log(`🚀 App listening on the port ${port}`);
  });
}
bootstrap();
