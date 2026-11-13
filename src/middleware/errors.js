'use strict';

function apiNotFound(req, res) {
  res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}` });
}

class CorsError extends Error {}

function createErrorHandler({ logger = console } = {}) {
  // Express recognizes error handlers by their four arguments, so `next` stays.
  // eslint-disable-next-line no-unused-vars
  return function errorHandler(err, req, res, next) {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Request body must be valid JSON.' });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request body is too large.' });
    }
    if (err instanceof CorsError) {
      return res.status(403).json({ error: 'Origin not allowed.' });
    }
    logger.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  };
}

module.exports = { apiNotFound, createErrorHandler, CorsError };
