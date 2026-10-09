# IIG Learning System Frontend

React + Vite frontend for the IIG Learning System.

## Backend integration

Student Management and Class Management are connected to the Spring Boot API in
`Santadura/BE-QLDAPM-clone`.

Create a local environment file:

```bash
cp .env.example .env
```

Default API URL:

```properties
VITE_API_URL=http://localhost:8080/api
```

Start the backend first, including PostgreSQL migration and seed, then run:

```bash
npm install
npm run dev
```

The seeded development accounts use password `123456`, including:

- `admin`
- `teacher001`
- `cs001`

The authenticated backend role controls the available sidebar routes and data
scope. The old client-side role switcher is intentionally disabled for the real
JWT workflow.

## Integrated workflow

The following flows now use backend APIs and persisted PostgreSQL data:

- login with JWT
- Student list/detail/create/update/delete/status
- Student course targets
- Class list/detail/create/update/status
- Student eligibility and ClassStudent roster changes
- Assignment and Exam lifecycle
- StudentResult grading and feedback
- Admin support override for an existing StaffSchedule

Availability, normal TC/CM scheduling, payroll and statistics remain separate
follow-up integrations.
