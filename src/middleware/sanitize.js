const sanitizeObject = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (!value || typeof value !== "object") return value;

  return Object.entries(value).reduce((clean, [key, nestedValue]) => {
    const cleanKey = key.replace(/\$/g, "").replace(/\./g, "");
    clean[cleanKey] = sanitizeObject(nestedValue);
    return clean;
  }, {});
};

const sanitizeInPlace = (target) => {
  const clean = sanitizeObject(target);
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, clean);
};

const sanitize = (req, _res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.params) sanitizeInPlace(req.params);
  if (req.query) sanitizeInPlace(req.query);
  next();
};

module.exports = sanitize;
