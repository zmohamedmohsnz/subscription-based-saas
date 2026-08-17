// ─── Import Modules ─────────────────────────────────────────────────────────────

import env from './config/env.js';
import app from './app.js';
import logger from './config/logger.js';
import connectToDB from './config/database.js';

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
