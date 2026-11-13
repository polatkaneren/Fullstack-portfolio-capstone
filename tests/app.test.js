'use strict';

const request = require('supertest');
const { buildApp } = require('./helpers');
const { loadConfig, parseOrigins } = require('../src/config');
const { createMemoryContactStore } = require('../src/contactStore');

describe('app', () => {
  const { app } = buildApp();

  test('GET /api/health reports ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('unknown API routes return JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No API route/);
  });

  test('serves the frontend', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<title>.*Portfolio<\/title>/);
  });

  test('serves the case study page', async () => {
    const res = await request(app).get('/case-studies/portfolio-capstone.html');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<h1>Building a documented full-stack portfolio/);
  });

  test('sets security headers and hides the framework', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('allows configured CORS origins', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://allowed.example');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://allowed.example');
  });

  test('allows the page served by this server to POST (same origin)', async () => {
    const res = await request(app)
      .post('/api/contact')
      .set('Host', 'portfolio.example')
      .set('Origin', 'https://portfolio.example')
      .send({ name: 'Ada', email: 'ada@example.com', message: 'Same-origin message.' });
    expect(res.status).toBe(201);
  });

  test('rejects a malformed Origin header', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'not a url');
    expect(res.status).toBe(403);
  });

  test('rejects other CORS origins', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(res.status).toBe(403);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('config', () => {
  test('uses defaults when nothing is set', () => {
    expect(loadConfig({})).toEqual({ port: 3001, nodeEnv: 'development', corsOrigins: [] });
  });

  test('reads values from the environment', () => {
    expect(
      loadConfig({ PORT: '8080', NODE_ENV: 'production', CORS_ORIGIN: 'https://a.com, https://b.com' }),
    ).toEqual({ port: 8080, nodeEnv: 'production', corsOrigins: ['https://a.com', 'https://b.com'] });
  });

  test('falls back to the default port for bad values', () => {
    expect(loadConfig({ PORT: 'abc' }).port).toBe(3001);
    expect(loadConfig({ PORT: '-1' }).port).toBe(3001);
  });

  test('parseOrigins drops empty entries', () => {
    expect(parseOrigins(' , https://a.com ,')).toEqual(['https://a.com']);
  });
});

describe('memory contact store', () => {
  test('keeps only the newest messages', async () => {
    const store = createMemoryContactStore({ maxSize: 2 });
    await store.add({ n: 1 });
    await store.add({ n: 2 });
    await store.add({ n: 3 });
    expect(store.all().map((m) => m.n)).toEqual([2, 3]);
  });
});
