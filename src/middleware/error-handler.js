import mongoose from 'mongoose';
import ApiError from '../errors/ApiError.js';

// handle mongoose cast errors produced when a value
// can't be converted to the type required by the schema.
const translateCastError = (error) => {
  return new ApiError(`Invalid value for ${error.path}`, 400, {
    code: 'INVALID_VALUE',
    cause: error
  });
};

// handle MongoDB duplicate key errors. produced
// when a write violates a unique index.
const translateDuplicateKeyError = (error) => {
  const fields = Object.keys(error.keyPattern ?? error.keyValue ?? {});

  return new ApiError(`A resource with that value already exists`, 409, {
    code: 'DUPLICATE_VALUE',
    details: fields.length > 0 ? { fields } : undefined,
    cause: error 
  });
};

// handle mongoose validation errors produced when
// the input data doesn't satisfy schema rules.
const translateValidationError = (error) => {
  const validationErrors = Object.values(error.errors).map(validationError => ({
    field: validationError.path,
    message: validationError.message
  }));

  return new ApiError('Validation Error', 422, {
    code: 'VALIDATION_ERROR',
    details: { fields: validationErrors },
    cause: error
  })
};

// handle optimistic-concurrency conflicts produced
// when saving a document using an outdated version.
const translateVersionError = (error) => {
  return new ApiError(
    `The resource was modified by another request`, 409, {
      code: 'VERSION_CONFLICT',
      cause: error
    }
  );
};

const translateError = (error) => {
  // this is already translated
  if (error instanceof ApiError) return error;

  // Invalid JSON passed to express.json()
  if (error?.type === 'entity.parse.failed') {
    return new ApiError('Request body contains invalid JSON', 400, {
      code: 'INVALID_JSON',
      cause: error
    });
  }

  // when request body exceeded the configured body-size limit
  if (error?.type === 'entity.too.large') {
    return new ApiError('Request body is too large', 413, {
      code: 'PAYLOAD_TOO_LARGE',
      cause: error
    });
  }

  // database errors
  if (error instanceof mongoose.Error.ValidationError) return translateValidationError(error);
  if (error instanceof mongoose.Error.CastError) return translateCastError(error);
  if (error instanceof mongoose.Error.VersionError) return translateVersionError(error);
  if (error?.name === 'MongoServerError' && error.code === 11000) return translateDuplicateKeyError(error);

  return null;
};

const errorHandler = (incomingError, req, res, next) => {
  // if a response has already started, then the code tried to
  // send another request, an error is thrown. Express recommends
  // delegating to the error handler again.
  if (res.headersSent) {
    res.err = incomingError;
    return next(incomingError);
  }
  
  const error = translateError(incomingError);
  
  // log the unknown errors and the expected server-side failures.
  // we assign `res.err` with the error because `pino-http` during
  // the automatic request-completion log automatically checks
  // the `res.err` property and log it if it exists.
  if (!error || error.statusCode >= 500) {
    res.err = incomingError;
  }

  // don't expose unexpected error messages or stack traces.
  if (!error) {
    return res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong'
    });
  }

  // expose the expected errors
  return res.status(error.statusCode).json({
    status: 'error',
    ...(error.code && { code: error.code }),
    message: error.message,
    ...(error.details && { details: error.details })
  });
};

export default errorHandler;

