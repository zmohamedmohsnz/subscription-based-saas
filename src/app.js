// ─── Import Modules ─────────────────────────────────────────────────────────────

import express from 'express';

// ─── Create App ─────────────────────────────────────────────────────────────────

// create an express app object that we use as a request handler.
// It enhances the req and res objects and provides methods to define
// routes and middleware that control how requests are handled.
const app = express();

export default app;