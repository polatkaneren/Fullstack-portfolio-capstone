'use strict';

const { createApp } = require('../src/app');
const { createMemoryContactStore } = require('../src/contactStore');

const silentLogger = { info() {}, error() {} };

function buildApp(overrides = {}) {
  const contactStore = overrides.contactStore || createMemoryContactStore();
  const app = createApp({
    config: { port: 0, nodeEnv: 'test', corsOrigins: ['https://allowed.example'] },
    logger: silentLogger,
    contactRateLimit: { windowMs: 60_000, limit: 100 },
    ...overrides,
    contactStore,
  });
  return { app, contactStore };
}

module.exports = { buildApp, silentLogger };
