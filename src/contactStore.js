'use strict';

const crypto = require('node:crypto');

/**
 * In-memory store for contact messages. It keeps the newest `maxSize`
 * messages and forgets everything on restart. Swap it for a database or an
 * email service (anything with the same `add` method) to keep messages.
 */
function createMemoryContactStore({ maxSize = 500 } = {}) {
  const messages = [];

  return {
    async add(entry) {
      const saved = {
        id: crypto.randomUUID(),
        receivedAt: new Date().toISOString(),
        ...entry,
      };
      messages.push(saved);
      if (messages.length > maxSize) messages.shift();
      return saved;
    },
    all() {
      return [...messages];
    },
  };
}

module.exports = { createMemoryContactStore };
