// pino is a logging tool that offers logging levels,
// structured logging info, and configurable logging.
import pino from 'pino';
import os from 'node:os';

const logLevel = process.env.LOG_LEVEL || 'info';
const env = process.env.NODE_ENV || 'production';

const logger = pino({
  // set the min log level can be recorded.
  // Any level below it will be ignored.
  // levels: trace < debug < info < warn < error < fatal
  // if we set it `info`, `trace` and `debug` will be ignored.
  // common: `debug` for development, `info` for production.
  level: logLevel,

  // fields inside `base` are added to every log entry
  // pino automatically includes `pid` and `hostname` by default
  // when you provide your own `base`, you're replacing those defaults
  base: {
    // pid and hostname identify the app instance that produced the log
    // pid is the id of the currently running Node.js process
    // hostname is the name of the machine (or container) running that process
    // if three copies of your API are running, this tells you precisely which
    // process and machine experienced the failure. They are not important for local project
    pid: process.pid,
    hostname: os.hostname(),
    app: 'subscription-based-note-management-saas',
    env
  },

  // use ISO timestamps instead of Unix timestamps.
  // (2026-01-01T10:00:00.000Z instead of 1710000000000)
  timestamp: pino.stdTimeFunctions.isoTime,

  // print json in pretty format for non production env
  ...(env !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  })
});

export default logger;
