'use strict';

const { createApp } = require('./app');
const { loadConfig } = require('./config');

const config = loadConfig();
const app = createApp({ config });

const server = app.listen(config.port, () => {
  console.log(`Portfolio running at http://localhost:${config.port} (${config.nodeEnv})`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
