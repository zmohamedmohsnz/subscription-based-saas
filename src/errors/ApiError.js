// we use a custom error class for two reasons:
// 1. distinguish the expected operational errors from the unexpected ones.
// 2. add our own metadata to the errors.
class ApiError extends Error {

  constructor(message, statusCode, {
    code,
    details,
    cause,
  } = {}) {
    if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
      throw new TypeError(`Invalid error status code: ${statusCode}`);
    }

    super(message, cause === undefined ? undefined : { cause });

    // `new.target.name` avoids hardcoding 'ApiError'
    // and also supports future subclasses
    this.name = new.target.name;

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export default ApiError;

// Explain the purpose of each field
//
// - `message`: human readable explanation.
// - `statusCode`: HTTP status code.
// - `code`: describes the exact error as status code only shows the category.
// - `details`: more details about the error like validation errors.
// - `cause`: the original internal error. for logging and debugging, never return it to client.

// why we pass `cause` to `super()` ?
//
// - because `Error` supports passing the error cause and this produces error
// chain like `ApiError ... caused by ...` which is useful for logs and debugging.
// - we could manually `this.cause = cause`, but using the native mechanism provides
// better compatibility with JavaScript tooling.

// why we set `this.name` ?
//
// we can control the flow using `if (err instanceof ApiError)` and access the
// class name using `error.constructor.name` so what is the benefit of `name` ?
// the problem is that JS error formatting uses `name` property and if you didn't
// set it explicitly, the below operations will be like:
// - `console.log(error.name)` => `Error`
// - `console.log(String(error))` => `Error: Note not found`
// - `console.log(error.stack)` => it starts with `Error: Note not found`
// but with setting it, all of these operations show `ApiError` instead of `Error`.