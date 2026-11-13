'use strict';

const request = require('supertest');
const { buildApp } = require('./helpers');

const projects = [
  { id: 'a', title: 'A', summary: 'a', tags: ['Node.js', 'Express'], featured: true },
  { id: 'b', title: 'B', summary: 'b', tags: ['CSS'], featured: false },
];

describe('GET /api/projects', () => {
  const { app } = buildApp({ projects });

  test('returns every project with a count', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({ count: 2, data: projects });
  });

  test('filters by tag, ignoring case', async () => {
    const res = await request(app).get('/api/projects').query({ tag: 'express' });
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].id).toBe('a');
  });

  test('returns an empty list for an unknown tag', async () => {
    const res = await request(app).get('/api/projects?tag=cobol');
    expect(res.body).toEqual({ count: 0, data: [] });
  });

  test('ships real project data by default', async () => {
    const res = await request(buildApp().app).get('/api/projects');
    expect(res.body.count).toBeGreaterThan(0);
    res.body.data.forEach((p) => {
      expect(p).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          summary: expect.any(String),
          tags: expect.any(Array),
        }),
      );
    });
  });
});

describe('GET /api/projects/:id', () => {
  const { app } = buildApp({ projects });

  test('returns one project', async () => {
    const res = await request(app).get('/api/projects/b');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(projects[1]);
  });

  test('returns 404 for a missing project', async () => {
    const res = await request(app).get('/api/projects/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Project not found');
  });
});
