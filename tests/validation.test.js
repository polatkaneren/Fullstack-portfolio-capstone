'use strict';

const { validateContact, LIMITS } = require('../src/validation');

describe('validateContact', () => {
  const good = { name: 'Ada', email: 'ada@example.com', message: 'A long enough message.' };

  test('accepts a valid message', () => {
    expect(validateContact(good)).toEqual({ valid: true, errors: {}, value: good });
  });

  test.each([null, undefined, 'text', 42])('treats %p as an empty form', (input) => {
    const result = validateContact(input);
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors)).toHaveLength(3);
  });

  test('ignores non-string fields', () => {
    const result = validateContact({ name: 123, email: ['a@b.co'], message: {} });
    expect(result.errors.name).toBe('Name is required.');
    expect(result.errors.email).toBe('Email is required.');
  });

  test('rejects values over the length limits', () => {
    const result = validateContact({
      name: 'n'.repeat(LIMITS.name.max + 1),
      email: `${'e'.repeat(LIMITS.email.max)}@example.com`,
      message: 'm'.repeat(LIMITS.message.max + 1),
    });
    expect(result.errors.name).toMatch(/at most/);
    expect(result.errors.email).toBe('Enter a valid email address.');
    expect(result.errors.message).toMatch(/at most/);
  });

  test.each(['plainaddress', 'a@b', 'a b@c.com', '@example.com'])('rejects email %p', (email) => {
    expect(validateContact({ ...good, email }).errors.email).toBeDefined();
  });
});
