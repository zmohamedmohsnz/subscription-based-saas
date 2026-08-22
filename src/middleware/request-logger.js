// import modules
import { randomUUID } from 'node:crypto';
import pinoHttp from 'pino-http';
import logger from '../config/logger.js';

const requestLogger = pinoHttp({
  // reuse the configuration of our app logger.
  logger,

  // generate a unique ID for every request so we can catch
  // logs produced while handling the same request easily.
  genReqId: (_req, res) => {
    const requestId = randomUUID();

    // return the ID to clients so they can include it in bug reports.
    res.setHeader('X-Request-Id', requestId);

    return requestId;
  },

  // set the log level based on the status code.
  customLogLevel: (_req, res, err) => {
    // why check `res.err` ?
    // because status code alone can miss errors that happen
    // after a response starts as the status may remain `200`
    // while `res.err` contains an error so your config would
    // incorrectly logs it as `info`.
    //
    // why check `err` ?
    // it represents errors emitted while completing the underlying response.
    if (err || res.err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  // the default request serializer exposes more info than we need
  // and includes all the request headers that may contain sensitive
  // values such as authorization tokens so we use a custom serializer
  // to include only info we need and avoid exposing sensitive info. 
  serializers: {
    req: req => ({
      method: req.method,

      // we use `split()` to exclude query string
      // because it could contain sensitive input.
      path: req.raw?.path ?? req.url?.split('?')[0],

      // `req.ip` respects express's `trust
      // proxy` configuration when enabled.
      ip: req.raw?.ip ?? req.remoteAddress,
      userAgent: req.headers?.['user-agent']
    }),

    res: res => ({ status: res.statusCode }),

    // you don't need to provide `err` serializer because `pino-http` internally
    // does something like `const error = emittedError || res.err || ...;`
    // then passes the error through its default error serializer.
    //
    // even though we override the `req` and `res` serializers,
    // `pino-http` retains its default `err` serializer.
    //
    // without `res.err`, pino only sees `500` status and creates a generic error.
  },

  // by default, logs are written using `req.log`, include the serialized
  // request info you set. Therefore, five business logs would repeat the same
  // method, path, and other request data five times, even though that data is
  // already present in the automatic request-completion log.
  // 
  // with `quietReqLogger: true`, the request ID is the only thing
  // added to logs written through `req.log`.
  quietReqLogger: true,

  customErrorMessage: () => 'Request failed',
  customSuccessMessage: (_req, res) => {
    if (res.statusCode >= 400) return 'Request rejected';
    return 'Request completed';
  },
});

export default requestLogger; 