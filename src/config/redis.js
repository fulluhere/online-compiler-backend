export const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // Upstash (and most managed Redis providers) require TLS on the connection.
  // Local Redis (e.g. via WSL) does NOT use TLS, so this is opt-in via env var.
  ...(process.env.REDIS_TLS === "true" ? { tls: {} } : {}),
};