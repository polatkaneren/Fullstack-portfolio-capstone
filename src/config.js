'use strict';

/**
 * Central place for runtime configuration. Everything comes from environment
 * variables (see .env.example) with safe defaults for local development.
 */
function parseOrigins(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function loadConfig(env = process.env) {
  const port = Number.parseInt(env.PORT, 10);
  return {
    port: Number.isInteger(port) && port > 0 ? port : 3001,
    nodeEnv: env.NODE_ENV || 'development',
    // Origins allowed to call the API from another domain. Leave empty when the
    // frontend is served by this same server (the default setup).
    corsOrigins: parseOrigins(env.CORS_ORIGIN),
  };
}

module.exports = { loadConfig, parseOrigins };
