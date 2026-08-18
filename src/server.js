// ─── Import Modules ─────────────────────────────────────────────────────────────

import env from './config/env.js';
import app from './app.js';
import logger from './config/logger.js';
import connectToDB from './config/database.js';

// ─── Handle uncaught exceptions ─────────────────────────────────────────────────

// it is an error thrown in sync code but has never handled anywhere,
// such as an error happened before express even start so global error handler
// cannot catch it or an error happened inside a callback without handling it.
// 
// this error triggers `uncaughtException` event so we can listen for it,
// log the error, and terminate the process.
// 
// we register this handler before starting the server because we don't need
// to call `server.close` and to can catch exceptions happening during app startup
// 
// we don't call `server.close` here because we want to terminate the process immediately
// as we have no idea about the error so it may leave the process in unsafe state.
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception Occurred');

  process.exit(1);
});

// ─── Connect Database ───────────────────────────────────────────────────────────

try {
  const connection = await connectToDB(env.dbUri);
  logger.info({host: connection.host }, 'MongoDB Connected');
} catch (err) {
  logger.fatal({ err }, 'Database connection failed');
  process.exit(1); // if you removed this line, server will start even if DB connection fails
}

// ─── Start Server ───────────────────────────────────────────────────────────────

// 1. a server is the thing that listens on a port and handles incoming requests.
// 2. `app.listen()` internally creates an HTTP server using the `http` module
//    and passes the express app to that server as the request handler.
// 3. behind the scenes, it's roughly: `http.createServer(app).listen(...)`. 
const port = env.port;
const server = app.listen(port, () => {
  logger.info({ port }, 'Server started');
});

// ─── Handle Unhandled Promise Rejection ─────────────────────────────────────────

// this means a promise is rejected without handling. For example, we didn't use `await`
// so express couldn't catch it and we also didn't catch it manually using `catch()` method.
//
// this error triggers `unhandledRejection` event so we can listen for it, log the error,
// then terminate the process. We do this because the app may become in unexpected state.
process.on('unhandledRejection', (err) => {
  logger.error({ err }, "Unhandled Promise Rejection");

  // `process.exit()` stops the process immediately, but `server.close()` stops accepting
  // new connections and waits for running connections to finish before terminating.
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});