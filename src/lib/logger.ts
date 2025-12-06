type Level = 'info' | 'warn' | 'error';

function log(level: Level, message: string, meta?: Record<string, any>) {
  const time = new Date().toISOString();
  const payload = meta ? { message, ...meta } : { message };
  // eslint-disable-next-line no-console
  console[level](`[${time}] ${level.toUpperCase()}`, payload);
}

export const logger = {
  info: (msg: string, meta?: Record<string, any>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, any>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, any>) => log('error', msg, meta),
};

