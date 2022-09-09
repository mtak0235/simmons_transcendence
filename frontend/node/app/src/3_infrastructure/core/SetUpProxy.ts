export const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app: { use: (arg0: any) => void }) {
  app.use(
    createProxyMiddleware("/v0", {
      target: "http://52.79.220.250:3001",
      changeOrigin: true,
    })
  );
};
