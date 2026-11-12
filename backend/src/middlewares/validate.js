const AppError = require('../utils/error');

/**
 * Higher-order middleware to validate incoming requests.
 * Accepts a schema (e.g. Zod schema or a validator function) and target ('body', 'query', 'params').
 *
 * @param {object|Function} schema - Zod schema (with .safeParse) or validation function
 * @param {'body'|'query'|'params'} [target='body'] - Request property to validate
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    // If it is a Zod schema (has safeParse method)
    if (schema && typeof schema.safeParse === 'function') {
      const result = schema.safeParse(req[target]);
      if (!result.success) {
        const issues = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        const err = new AppError('Validation failed', 400);
        err.errors = issues;
        return next(err);
      }
      req[target] = result.data;
      return next();
    }

    // If it is a custom validator function: (data) => { errors, data }
    if (typeof schema === 'function') {
      const result = schema(req[target]);
      if (result && result.errors && result.errors.length > 0) {
        const err = new AppError('Validation failed', 400);
        err.errors = result.errors;
        return next(err);
      }
      if (result && result.data !== undefined) {
        req[target] = result.data;
      }
      return next();
    }

    return next();
  };
};

module.exports = { validate };
