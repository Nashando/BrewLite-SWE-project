export function validateEnv(config: Record<string, unknown>) {
  const missing = ['DATABASE_URL', 'JWT_SECRET'].filter((k) => !config[k]);
  if (missing.length) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${missing.join(', ')}`);
  }
  return config;
}
