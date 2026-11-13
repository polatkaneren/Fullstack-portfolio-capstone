'use strict';

const request = require('supertest');
const { buildApp } = require('./helpers');

const valid = {
  name: '  Ada Lovelace ',
  email: 'Ada@Example.com',
  message: 'Hello, I would like to talk about a project.',
};

describe('POST /api/contact', () => {
  test('stores a valid message and returns 201', async () => {
    const { app, contactStore } = buildApp();
    const res = await request(app).post('/api/contact').send(valid);

    expect(res.status).toBe(201);
    expect(res.body.id).toEqual(expect.any(String));

    const [saved] = contactStore.all();
    expect(saved).toEqual(
      expect.objectContaining({
        id: res.body.id,
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: valid.message,
        receivedAt: expect.any(String),
      }),
    );
  });

  test('returns 400 with a message per invalid field', async () => {
    const { app, contactStore } = buildApp();
    const res = await request(app)
      .post('/api/contact')
      .send({ name: '', email: 'not-an-email', message: 'short' });

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fields).sort()).toEqual(['email', 'message', 'name']);
    expect(contactStore.all()).toHaveLength(0);
  });

  test('returns 400 for an empty body', async () => {
    const res = await request(buildApp().app).post('/api/contact').send({});
    expect(res.status).toBe(400);
    expect(res.body.fields.email).toBe('Email is required.');
  });

  test('silently drops messages that fill the honeypot', async () => {
    const { app, contactStore } = buildApp();
    const res = await request(app)
      .post('/api/contact')
      .send({ ...valid, website: 'http://spam.example' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeUndefined();
    expect(contactStore.all()).toHaveLength(0);
  });

  test('returns 400 for malformed JSON', async () => {
    const res = await request(buildApp().app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name": ');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid JSON/);
  });

  test('returns 413 for an oversized body', async () => {
    const res = await request(buildApp().app)
      .post('/api/contact')
      .send({ ...valid, message: 'x'.repeat(30_000) });
    expect(res.status).toBe(413);
  });

  test('returns 500 without leaking details when the store fails', async () => {
    const failingStore = {
      add: async () => {
        throw new Error('database password is hunter2');
      },
      all: () => [],
    };
    const res = await request(buildApp({ contactStore: failingStore }).app)
      .post('/api/contact')
      .send(valid);
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/hunter2/);
  });

  test('rate-limits repeated submissions', async () => {
    const { app } = buildApp({ contactRateLimit: { windowMs: 60_000, limit: 2 } });
    await request(app).post('/api/contact').send(valid);
    await request(app).post('/api/contact').send(valid);
    const res = await request(app).post('/api/contact').send(valid);
    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/Too many/);
  });
});
