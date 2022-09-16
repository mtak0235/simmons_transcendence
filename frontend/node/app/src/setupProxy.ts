export const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    proxy("/v0", {
      target: "http://localhost:3001",
      changeOrigin: true,
    })
  );
};
