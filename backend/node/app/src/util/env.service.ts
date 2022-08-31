import * as Joi from 'joi';

export const envValidation = () =>
  Joi.object({
    NODE_ENV: Joi.string()
      .valid('local', 'development', 'production', 'test')
      .required(),
    // PORT: Joi.string().required(), // todo: 주석 해제 해야 함
    // API_URL: Joi.string().required(),
    // CLIENT_URL: Joi.string().required(),
    // FT_API_UID: Joi.string().required(),
    // FT_API_SECRET: Joi.string().required(),
    // FT_API_REDIRECT: Joi.string().required(),
    // SMTP_USER: Joi.string().required(),
    // SMTP_UID: Joi.string().required(),
    // SMTP_SECRET: Joi.string().required(),
    // SMTP_TOKEN: Joi.string().required(),
    // JWT_SECRET: Joi.string().required(),
    // SESSION_SECRET: Joi.string().required(),
    // DATABASE_USERNAME: Joi.string().required(),
    // DATABASE_PASSWORD: Joi.string().required(),
    // DATABASE_NAME: Joi.string().required(),
    // DATABASE_HOST: Joi.string().required(),
    // DATABASE_PORT: Joi.string().required(),
    // REDIS_HOST: Joi.string().required(),
    // REDIS_PORT: Joi.string().required(),
  });

export const envConfig = () => ({
  serverConfig: {
    port: parseInt(process.env.PORT, 10) || 3001,
    apiUrl: process.env.API_URL,
    clientUrl: process.env.CLIENT_URL,
  },
  ftConfig: {
    uid: process.env.FT_API_UID,
    secret: process.env.FT_API_SECRET,
    redirectUri: process.env.FT_API_REDIRECT,
  },
  awsConfig: {
    bucket: process.env.AWS_S3_BUCKET_NAME,
    uid: process.env.AWS_ACCESS_UID,
    secret: process.env.AWS_ACCESS_SECRET,
    region: process.env.AWS_REGION,
    defaultProfileUrl: process.env.AWS_DEFAULT_PROFILE_URL,
  },
  smtpConfig: {
    user: process.env.SMTP_USER,
    uid: process.env.SMTP_UID,
    secret: process.env.SMTP_SECRET,
    token: process.env.SMTP_TOKEN,
  },
  authConfig: {
    jwt: process.env.JWT_SECRET,
    session: process.env.SESSION_SECRET,
    crypto: process.env.CRYPTO_SECRET,
  },
  dbConfig: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
  },
  redisConfig: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
