import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';

import { AppModule } from '@src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3001;

  passport.serializeUser((user, done) => {
    if (user) done(null, user);
    else done('error', false);
  });
  passport.deserializeUser((user, done) => {
    if (user) done(null, user);
    else done('error', false);
  });

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
