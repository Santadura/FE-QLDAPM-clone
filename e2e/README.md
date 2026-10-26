# IIG isolated full-stack regression tests

This folder contains Playwright tests against **the real FE, Spring Boot API, and a disposable PostgreSQL DB**. Do not run these tests against production or any database containing work you want to keep: tests intentionally create classes, register availability and write attendance.

## Automatic runs

- FE PRs: `Santadura/FE-QLDAPM-clone/.github/workflows/iig-fe-e2e.yml`
- BE PRs: `Santadura/BE-QLDAPM-clone/.github/workflows/iig-be-e2e.yml`
- Both workflows run the *same* FE browser suite plus the matching backend branch when one exists; otherwise use the sibling repo's `main`.
- FE: `npm test`, `npm run build`, `npm run lint`.
- BE: `mvn test`, `npx prisma validate`.
- GitHub Actions starts BE Docker Compose, which creates a new PostgreSQL volume, deploys migrations and seeds test accounts. It then launches Vite and runs Chromium Playwright.
- On any outcome, logs, video, screenshots, trace, JUnit XML and HTML reports are uploaded under the job's **Artifacts** section (retention: 7 days).
- Runner cleanup runs `docker compose down -v` **only on its temporary CI Docker volume**, never on a developer's database.

## Coverage (initial phase)

1. Browser login works for admin, TC, CM, Teacher and CS accounts.
2. CS creates a class with two planned lessons, one in the past and one in the future.
3. Teacher and CS register recurring availability; TC and CM approve it.
4. TC assigns Teacher and CM assigns CS for the full course in single atomic operations.
5. Assigned CS becomes class manager; only assigned CS can record attendance. Teacher cannot self-mark.
6. An upcoming lesson cannot be marked early.
7. CS records past lesson attendance in a real browser, reloads, corrects it and verifies persistence.
8. Each test creates a unique class; no manually prepared QA class is needed.

## Running locally (OPTIONAL)

Use separate, disposable Docker data. In one terminal from BE repository:
```sh
docker compose up -d --build
```

From FE repository, in another terminal:
```sh
npm ci
npm install --prefix e2e
./e2e/node_modules/.bin/playwright install chromium
npm run dev -- --host 127.0.0.1
```

Then from FE:
```sh
E2E_BASE_URL=http://127.0.0.1:5173 E2E_API_URL=http://127.0.0.1:8080/api ./e2e/node_modules/.bin/playwright test --config=e2e/playwright.config.mjs
```

Seed credentials are for isolated CI only. Never reuse them in deployed environments. Never run `docker compose down -v` on the user's normal development volume unless they explicitly intend to discard it.

## Limits

Passing CI proves the implemented assertions, not that every business rule, browser layout, or user journey is bug-free. Add a regression test for every new bug. UI visual diff/baseline and dedicated multi-viewport checks can be added after the first stable green end-to-end run.
