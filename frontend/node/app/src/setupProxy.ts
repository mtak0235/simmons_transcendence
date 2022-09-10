export const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    proxy("/v0", {
      target: "http://52.79.220.250:3001/v0",
      changeOrigin: true,
    })
  );
};
