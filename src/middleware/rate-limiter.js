import { rateLimit } from 'express-rate-limit';
import env from '../config/env.js';

// it limits requests an IP can send within a specific period.
// so it helps in mitigate basic DoS and brute-force attacks.
// 
// when an IP sends its first request, a time window starts for
// that IP. if it was at 10 o'clock and the window lasts one hour,
// so the window duration is 10 to 11 and if the window has a limit
// of 100 requests, means that IP can make at most 100 requests
// before the window resets at 11:00.
//
// this middleware adds `rateLimit` property automatically to 
// `req` object so you can reach the rate limiter info in the code.
//
// it also sends rate-limit response headers so clients can know
// info like window duration, time until reset,remaining requests,
// and max requests per window. `draft-8` enables the newest header
// format supported by the package.
const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowTimeMinutes * 60 * 1000,
  limit: env.rateLimitMaxRequests,
  standardHeaders: 'draft-8', // enable modern headers.
  legacyHeaders: false, // disable old non-standard headers

  // the default handler sends this below response with 429
  // status code which means "too many requests".
  message: {
    status: 'fail',
    message: 'Too many requests. Please try again later.'
  }
});

export default apiLimiter;