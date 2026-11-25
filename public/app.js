'use strict';

(function () {
  const apiBase = (document.querySelector('meta[name="api-base"]')?.content || '').replace(/\/$/, '');
  const api = (path) => `${apiBase}/api${path}`;

  // Build elements with textContent (never innerHTML) so project data or
  // server messages can't inject HTML into the page.
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'text') node.textContent = value;
      else node.setAttribute(key, value);
    });
    children.forEach((child) => node.append(child));
    return node;
  }

  /* ---------- Projects ---------- */

  const list = document.getElementById('project-list');
  const statusEl = document.getElementById('projects-status');
  const filtersEl = document.getElementById('filters');
  let allProjects = [];
  let activeTag = null;

  function renderCard(project) {
    const header = [];
    if (project.featured) header.push(el('span', { class: 'badge mono', text: 'Featured' }));
    header.push(el('h3', { text: project.title }));
    header.push(el('p', { text: project.summary }));

    const tags = el('ul', { class: 'tags', 'aria-label': 'Technologies' },
      project.tags.map((tag) => el('li', { text: tag })));

    const links = [];
    if (project.caseStudyUrl) links.push(el('a', { href: project.caseStudyUrl, text: 'Case study' }));
    if (project.liveUrl) links.push(el('a', { href: project.liveUrl, text: 'Live site' }));
    if (project.repoUrl) links.push(el('a', { href: project.repoUrl, text: 'Source code' }));
    const footer = [tags];
    if (links.length) footer.push(el('div', { class: 'links' }, links));

    const card = project.featured
      ? el('article', { class: 'card card-featured' }, [
          el('div', { class: 'card-main' }, header),
          el('div', { class: 'card-side' }, footer),
        ])
      : el('article', { class: 'card' }, [...header, ...footer]);

    return el('li', project.featured ? { class: 'is-featured' } : {}, [card]);
  }

  function renderProjects() {
    const visible = activeTag
      ? allProjects.filter((p) => p.tags.includes(activeTag))
      : allProjects;
    list.replaceChildren(...visible.map(renderCard));
    statusEl.textContent = visible.length ? '' : 'No projects to show yet.';
  }

  function renderFilters() {
    // Filtering a single project is pointless, so only show filters for 2+.
    if (allProjects.length < 2) {
      filtersEl.replaceChildren();
      return;
    }
    const tags = [...new Set(allProjects.flatMap((p) => p.tags))].sort();
    const buttons = [null, ...tags].map((tag) => {
      const button = el('button', {
        type: 'button',
        class: 'filter',
        'aria-pressed': String(tag === activeTag),
        text: tag || 'All',
      });
      button.addEventListener('click', () => {
        activeTag = tag;
        renderFilters();
        renderProjects();
      });
      return button;
    });
    filtersEl.replaceChildren(...buttons);
  }

  async function loadProjects() {
    try {
      const res = await fetch(api('/projects'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      allProjects = body.data;
      renderFilters();
      renderProjects();
    } catch (err) {
      statusEl.textContent = 'Could not load projects. Please refresh the page to try again.';
      console.error('Failed to load projects', err);
    }
  }

  /* ---------- Contact form ---------- */

  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const fields = ['name', 'email', 'message'];

  function setFieldErrors(errors = {}) {
    fields.forEach((field) => {
      const input = form.elements[field];
      const message = errors[field] || '';
      document.getElementById(`${field}-error`).textContent = message;
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', `${field}-error`);
      } else {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
    });
  }

  function setFormStatus(text, kind) {
    formStatus.textContent = text;
    formStatus.className = `form-status ${kind || ''}`.trim();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    const payload = Object.fromEntries(new FormData(form));

    setFieldErrors();
    setFormStatus('Sending…');
    submit.disabled = true;

    try {
      const res = await fetch(api('/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        form.reset();
        setFormStatus(body.message || 'Message sent.', 'success');
      } else {
        setFieldErrors(body.fields);
        setFormStatus(body.error || 'Something went wrong. Please try again.', 'error');
        const firstInvalid = fields.find((f) => body.fields && body.fields[f]);
        if (firstInvalid) form.elements[firstInvalid].focus();
      }
    } catch (err) {
      setFormStatus('Network error. Check your connection and try again.', 'error');
    } finally {
      submit.disabled = false;
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
  loadProjects();
})();
