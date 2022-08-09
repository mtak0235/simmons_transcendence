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
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
  },
});
