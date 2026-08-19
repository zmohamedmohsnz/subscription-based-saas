// we extract all environment variables in this file to validate them in one place
// instead of make each file validate its own variables, because this mean multiple
// files may validate the same variable. So this file make us avoid this repetition.

// this import loads the variables from the `.env` file into `process.env`.
// we normally do `import something from 'some-package';`, but this is another
// type called side-effect import: this type means we don't want to import a value,
// we just want Node.js to execute that module that does a specific job. In our case,
// it loads the variables into `process.env`
import 'dotenv/config';

const validNodeEnv = new Set(['development', 'test', 'production']);
const validLogLevels = new Set(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])

const readEnum = (varName, fallbackVal, allowedValues) => {
  const value = process.env[varName] || fallbackVal;

  if (!allowedValues.has(value)) {
    throw new Error(
      `Invalid ${varName} "${value}". Expected on of: ${[...allowedValues].join(', ')}`
    );
  }

  return value;
}

const readRequired = (varName) => {
  const value = process.env[varName]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }

  return value;
}

const readPositiveInteger = (varName, fallbackValue) => {
  const rawValue = process.env[varName] || fallbackValue;
  const value = Number(rawValue);
  
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `Invalid ${varName} "${rawValue}". Expected a positive integer`
    );
  }

  return value;
}

const readOrigins = (varName) => {
  // extract origins to list
  const rawOrigins = readRequired(varName)
    .split(',')
    .map(origin => origin.trim());

  if (rawOrigins.some(origin => !origin)) {
    throw new Error(`${varName} must contain a comma-separated list of origins`);
  }

  // validate and normalize each origin
  const origins = rawOrigins.map(origin => {
    let url;

    try {
      url = new URL(origin);
    } catch {
      throw new Error(`Invalid origin "${origin}" for ${varName} env variable`);
    }

    // make sure it supports only HTTP and HTTPS and 
    // url is only an origin without a path, query, or fragment
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      throw new Error(`Invalid origin "${origin}" for ${varName} env variable`);
    }

    return url.origin;
  });

  return Object.freeze([...new Set(origins)]);
}

// there is a special validation method for `port` because we need
// to convert it to a number and verify it is a valid TCP port
const readPort = (fallbackVal) => {
  const rawPort = process.env.PORT || fallbackVal;
  const port = Number(rawPort);

  // ports are represented by 16-bit number so max is 2^16 = 65535
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT "${rawPort}". Expected an integer between 1 and 65535`
    );
  }

  return port;
}

// we declare `nodeEnv` outside `config`
// because we use it in `logLevel`
const nodeEnv = readEnum('NODE_ENV', 'production', validNodeEnv);

const config = Object.freeze({
  nodeEnv,
  port: readPort(3000),
  logLevel: readEnum(
    'LOG_LEVEL',
    nodeEnv === 'development' ? 'debug' : 'info',
    validLogLevels
  ),
  dbUri: readRequired('DB_URI'),
  allowedOrigins: readOrigins('ALLOWED_ORIGINS'),
  rateLimitMaxRequests: readPositiveInteger('RATE_LIMIT_MAX_REQ_COUNT', 100),
  rateLimitWindowTimeMinutes: readPositiveInteger('RATE_LIMIT_WINDOW_TIME_MINUTES', 30)
});

export default config;
