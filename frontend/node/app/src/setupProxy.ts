export const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    proxy("/v0", {
      target: "http://10.19.230.83:3001/v0",
      changeOrigin: true,
    })
  );
};
