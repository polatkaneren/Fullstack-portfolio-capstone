'use strict';

const express = require('express');

/**
 * GET /api/projects          -> all projects (optionally ?tag=Express)
 * GET /api/projects/:id      -> one project, or 404
 */
function createProjectsRouter(projects) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const tag = typeof req.query.tag === 'string' ? req.query.tag.trim().toLowerCase() : '';
    const data = tag
      ? projects.filter((p) => p.tags.some((t) => t.toLowerCase() === tag))
      : projects;
    res.json({ count: data.length, data });
  });

  router.get('/:id', (req, res) => {
    const project = projects.find((p) => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json({ data: project });
  });

  return router;
}

module.exports = { createProjectsRouter };
