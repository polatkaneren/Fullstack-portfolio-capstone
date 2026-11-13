'use strict';

const path = require('node:path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

const { loadConfig } = require('./config');
const defaultProjects = require('./data/projects.json');
const { createMemoryContactStore } = require('./contactStore');
const { createProjectsRouter } = require('./routes/projects');
const { createContactRouter } = require('./routes/contact');
const { apiNotFound, createErrorHandler, CorsError } = require('./middleware/errors');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function isSameOrigin(origin, req) {
  try {
    return new URL(origin).host === req.get('host');
  } catch {
    return false;
  }
}

/**
 * Builds the Express app without starting it, so tests can drive it with
 * supertest. Every dependency can be swapped through `options`.
 */
function createApp(options = {}) {
  const config = options.config || loadConfig();
  const projects = options.projects || defaultProjects;
  const contactStore = options.contactStore || createMemoryContactStore();
  const logger = options.logger || console;
  const contactLimit = options.contactRateLimit || { windowMs: 15 * 60 * 1000, limit: 5 };

  const app = express();
  app.disable('x-powered-by');
  // Behind a host's proxy (Render, Railway, Fly...) this makes req.ip the
  // visitor's address, which the rate limiter needs.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors((req, callback) => {
      const origin = req.get('origin');
      // Allow: no Origin header (curl, server-to-server), the page this server
      // serves itself (browsers still send Origin on same-origin POSTs), and
      // any origin listed in CORS_ORIGIN.
      if (!origin || isSameOrigin(origin, req) || config.corsOrigins.includes(origin)) {
        return callback(null, { origin: true });
      }
      return callback(new CorsError(`Origin ${origin} not allowed`));
    }),
  );
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/projects', createProjectsRouter(projects));
  app.use(
    '/api/contact',
    rateLimit({
      ...contactLimit,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many messages. Please try again later.' },
    }),
    createContactRouter({ store: contactStore, logger }),
  );
  app.use('/api', apiNotFound);

  app.use(express.static(PUBLIC_DIR));

  app.use(createErrorHandler({ logger }));
  return app;
}

module.exports = { createApp };
