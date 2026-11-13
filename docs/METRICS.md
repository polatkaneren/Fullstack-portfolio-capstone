# Capstone Project Quantitative Metrics Tracker

## Weekly Goals & Baselines
* **Target Commit Frequency:** 3–5 meaningful commits per active coding day.
* **Planned API Endpoints:**
  * `GET /api/projects` (Fetch portfolio projects)
  * `POST /api/contact` (Handle contact form submissions)
* **Target Test Coverage:** Minimum 70% component/unit test coverage.
* **Documentation Completion Rate:** Tracked weekly across setup, architecture, and deployment guides.

## Current Metrics (as of 11/13/2026)

| Metric | Target | Current | Status |
|---|---|---|---|
| Planned API endpoints implemented | 2 | 2 of 2 (plus `GET /api/projects/:id` and `GET /api/health`) | Met |
| Automated tests | n/a | 39 passing | n/a |
| Line coverage | ≥ 70% | 100% | Met |
| Branch coverage | ≥ 70% | 86% | Met |
| Documentation: README | Complete | Complete | Met |
| Documentation: case study | n/a | 1 published (portfolio capstone) | n/a |
| Documentation: setup guide | Complete | Not started | Open |
| Documentation: architecture guide | Complete | Not started | Open |
| Documentation: deployment guide | Complete | Not started | Open |
| Deployed live site | Live URL | Not deployed | Open |

## Weekly Progress Log
* **Week 1 (11/5–11/11):** Submitted the project proposal. Created the repository and README.
* **Week 2 (11/12–11/18):**
  * **11/12/2026:** Created this metrics tracker with goals and baselines.
  * **11/13/2026 - Backend, frontend and tests:** Built the Express server with `GET /api/projects` and `POST /api/contact`, CORS, security headers, input validation and rate limiting. Built the HTML/CSS/JS frontend, served by the same server so it calls the API at `/api` instead of a hard-coded `localhost` address. Added 38 Jest + Supertest tests, a GitHub Actions CI pipeline and a README. Testing in a real browser found a bug (the contact form was rejected by the CORS check on same-origin requests); it was fixed and a test now covers it. Development used an AI coding assistant (Claude Code), as permitted by the course syllabus.
  * **11/13/2026 - Redesign and portfolio content:** Restyled the site in navy, white and black with boxed layouts. Removed the placeholder "Sample Project" entries. Added a case study (`public/case-studies/portfolio-capstone.html`) covering the problem, constraints, architecture, decisions, the CORS bug and results, and a skills matrix that links each skill to evidence in the repository. Added a test for the case study page (39 tests).
* **Week 3 (11/19–11/25) - Planned:** Write the setup, architecture and deployment guides; deploy the site; replace sample projects with real ones; final metrics audit.
