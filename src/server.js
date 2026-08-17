// ─── Import Modules ─────────────────────────────────────────────────────────────

// this import loads the variables from the `.env` file into `process.env`.
// we normally do `import something from 'some-package';`, but this is another
// type called side-effect import: this type means we don't want to import a value,
// we just want Node.js to execute that module that does a specific job. In our case,
// it loads the variables into `process.env`
import 'dotenv/config';
import app from './app.js';
import logger from './config/logger.js';

// ─── Start Server ───────────────────────────────────────────────────────────────

// 1. a server is the thing that listens on a port and handles incoming requests.
// 2. `app.listen()` internally creates an HTTP server using the `http` module
//    and passes the express app to that server as the request handler.
// 3. behind the scenes, it's roughly: `http.createServer(app).listen(...)`. 
const port = +process.env.PORT || 3000;
const server = app.listen(port, () => {
  logger.info({ port }, 'Server started');
});
