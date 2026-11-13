'use strict';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: { max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 5000 },
};

/**
 * Validates a contact form body. Returns { valid, errors, value } where
 * `value` holds the trimmed fields and `errors` maps field name -> message.
 */
function validateContact(body) {
  const input = body && typeof body === 'object' ? body : {};
  const str = (v) => (typeof v === 'string' ? v.trim() : '');

  const value = {
    name: str(input.name),
    email: str(input.email).toLowerCase(),
    message: str(input.message),
  };
  const errors = {};

  if (!value.name) {
    errors.name = 'Name is required.';
  } else if (value.name.length > LIMITS.name.max) {
    errors.name = `Name must be at most ${LIMITS.name.max} characters.`;
  }

  if (!value.email) {
    errors.email = 'Email is required.';
  } else if (value.email.length > LIMITS.email.max || !EMAIL_PATTERN.test(value.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (value.message.length < LIMITS.message.min) {
    errors.message = `Message must be at least ${LIMITS.message.min} characters.`;
  } else if (value.message.length > LIMITS.message.max) {
    errors.message = `Message must be at most ${LIMITS.message.max} characters.`;
  }

  return { valid: Object.keys(errors).length === 0, errors, value };
}

module.exports = { validateContact, LIMITS };
