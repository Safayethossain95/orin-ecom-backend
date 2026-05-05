const AppError = require("../utils/app-error");

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    return next(new AppError("Validation failed.", 400, details));
  }

  req.validated = result.data;
  if (result.data.body) req.body = result.data.body;
  next();
};

module.exports = validate;
