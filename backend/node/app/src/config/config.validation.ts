import * as Joi from 'joi';

export default () =>
  Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .required(),
    // FT_API_UID: Joi.string().required(),
    // FT_API_SECRET: Joi.string().required(),
    // FT_API_REDIRECT: Joi.string().required(),
    // EMAIL_ID: Joi.string().required(),
    // EMAIL_PASSWORD: Joi.string().required(),
    // JWT_SECRET: Joi.string().required(),
    // SESSION_SECRET: Joi.string().required(),
    // DATABASE_USERNAME: Joi.string().required(),
    // DATABASE_PASSWORD: Joi.string().required(),
    // DATABASE_NAME: Joi.string().required(),
    // DATABASE_HOST: Joi.string().required(),
    // DATABASE_PORT: Joi.string().required(),
  });
