import { createProxyMiddleware } from "http-proxy-middleware";
module.exports = (app) => {
  app.use(
    "/auth",
    createProxyMiddleware({
      target: "http://52.79.220.250:3001",
      changeOrigin: true,
    })
  );
};
