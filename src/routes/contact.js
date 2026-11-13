'use strict';

const express = require('express');
const { validateContact } = require('../validation');

const THANKS = 'Thanks! Your message has been received.';

/**
 * POST /api/contact  { name, email, message }
 *   201 -> { message, id }
 *   400 -> { error, fields: { name?, email?, message? } }
 *
 * `website` is a honeypot: the frontend hides it from people, so a value
 * there means a bot filled in the form. We answer 201 so the bot learns
 * nothing, but we don't store the message.
 */
function createContactRouter({ store, logger = console }) {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
    const body = req.body || {};

    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return res.status(201).json({ message: THANKS });
    }

    const { valid, errors, value } = validateContact(body);
    if (!valid) {
      return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: errors });
    }

    try {
      const saved = await store.add(value);
      logger.info(`[contact] message ${saved.id} received`);
      return res.status(201).json({ message: THANKS, id: saved.id });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

module.exports = { createContactRouter };
