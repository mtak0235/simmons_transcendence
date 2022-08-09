export default () => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  ftConfig: {
    uid: process.env.FT_API_UID,
    secret: process.env.FT_API_SECRET,
    redirectUri: process.env.FT_API_REDIRECT,
  },
  emailConfig: {
    id: process.env.EMAIL_ID,
    password: process.env.EMAIL_PASSWORD,
  },
  authConfig: {
    jwt: process.env.JWT_SECRET,
    session: process.env.SESSION_SECRET,
  },
  dbConfig: {
    username: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
  },
});
