import env from './env.js';

// CORS sets HTTP response headers that tell browsers which
// origins are allowed to read responses from our API.
// 
// an origin identifies where a web page comes from.
// It is something like http://localhost:5173.
//
// When a frontend calls a backend, the browser automatically sends
// the origin of the frontend `Origin: http://localhost:5173`. 
// If that origin is allowed, backend responds with some CORS headers
// like `Access-Control-Allow-Origin: http://localhost:5173`
// If the origin is not allowed, the request continues and the server
// returns its normal response, but CORS omits those headers so
// the browser prevents the frontend from reading the response.
// 
// browsers are which enforce this rule, not the backend, through a policy
// called "Same-Origin" that prevents a web page of an origin from accessing
// resources from another origin unless it lists that origin in its list of allowed origins.
//
// the evidence of our backend doesn't care and the browser who enforces this is
// postman. we can send requests to any API because postman doesn't enforce this policy. 
//
// we as a backend only required to tell the browser the allowed origins
// to call our API even though our backend doesn't care about that. 
//
// Note: using `cors()` without configuration allows any origin.

const corsOptions = {
  origin: env.allowedOrigins,

  // headers you send in the response, the browser expose some of them to
  // Frontend JS code and hide some. `Authorization` header is hidden by default
  // and we use to send JWT and so it must be exposed to the frontend code
  exposedHeaders: ['Authorization']
};

export default corsOptions;
