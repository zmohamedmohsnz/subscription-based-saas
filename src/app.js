// ─── Import Modules ─────────────────────────────────────────────────────────────

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import corsOptions from './config/cors.js';
import apiLimiter from './middleware/rate-limiter.js';
import requestLogger from './middleware/request-logger.js';

// ─── Create App ─────────────────────────────────────────────────────────────────

// create an express app object that we use as a request handler.
// It enhances the req and res objects and provides methods to define
// routes and middleware that control how requests are handled.
const app = express();

// ─── GLOBAL Middleware ──────────────────────────────────────────────────────────

// this middleware does two jobs:
// 1. automatically logs each request when its response finishes.
// 2. attaches `req.log` property to `req` object so we
// can belong a log to the request since every `req.log`
// entry includes the request ID, allowing us to find
// all logs that belong to the same request.
// ex: `req.log.info('Request received');`
app.use(requestLogger);

// it improves security by setting HTTP response headers that instruct
// browsers how to handle our responses, limiting what attacker can do.
// 
// these headers help mitigate browser-based risks such as clickjacking,
// MIME-type sniffing, and some forms of cross-site scripting (XSS). 
app.use(helmet());

app.use(cors(corsOptions));
app.use('/api', apiLimiter);

// it parses JSON request bodies and stores the parsed data in `req.body`
// without it, `req.body` is undefined even though the body is JSON.
// 
// we limit the body size to protect the server from excessively large
// payloads and reduce the risk of resource-exhaustion attacks.
app.use(express.json({ limit: '10kb' }));

// it compresses response bodies before sending them to the client
// reducing the amount of data transferred over the network.
// 
// the client tells the server which compression formats it supports
// through the `Accept-Encoding` header. The middleware selects a supported
// format, sets the `Content-Encoding` response header, and compresses the
// response the client decompress the response automatically when it receives it.
//
// compression effectiveness depends on the response's content type and size.
// text and JSON usually compress well, while already-compressed content may not.
app.use(compression());

export default app;