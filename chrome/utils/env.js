// tiny wrapper with default env vars
module.exports = {
  NODE_ENV: (process.env.NODE_ENV || "development"),
  PORT: (process.env.PORT || 3000),
  BASE_URL: (process.env.BASE_URL || "http://127.0.0.1:5000")
};
