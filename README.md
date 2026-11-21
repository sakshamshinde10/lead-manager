# Lead Manager

A small full-stack web app for a sales user to capture and track leads. Each person signs up, then adds, searches, edits and deletes their own leads, with live counts per status on a dashboard.

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Hook Form, GSAP
- **Backend:** Node.js, Express 5, Mongoose
- **Database:** MongoDB (works with a local server or MongoDB Atlas)
- **Validation:** Zod on both the frontend and the backend
- **Auth:** JWT. Every user sees only their own leads
- **Tests:** Jest, Supertest and an in-memory MongoDB (92 API tests, about 96% coverage)

## Features

- Signup and login, with the token kept in the browser and expired sessions handled
- Add, view, edit and delete leads. Delete asks for confirmation first
- Search by name and filter by status (New, Contacted, Qualified, Lost)
- Dashboard cards with the total and per-status counts
- Validation on both sides. Server errors (for example a duplicate email) show under the right field
- Responsive layout: a table on desktop, cards on phones
- Accessible dialogs, text-labelled status badges, and `prefers-reduced-motion` support

## Run it locally

You need Node.js 20 or newer and a MongoDB connection string (a local MongoDB or a free Atlas cluster).

**1. Start the API**

```bash
cd server
npm install
cp .env.example .env     # on Windows PowerShell: Copy-Item .env.example .env
```

Open `server/.env` and fill in the values:

| Variable | Meaning |
| --- | --- |
| `PORT` | Port for the API (default 5000) |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A long random string (at least 16 characters) used to sign login tokens |
| `CLIENT_ORIGIN` | Where the frontend runs (default `http://localhost:5173`), allowed through CORS |
| `DNS_SERVERS` | Optional. Only set it (for example `8.8.8.8,1.1.1.1`) if Atlas fails with `querySrv ECONNREFUSED` |

The real `.env` is git-ignored. `.env.example` only documents the names.

```bash
npm run dev
```

**2. Start the frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. In development, Vite forwards `/api` requests to the API on port 5000, so no extra frontend configuration is needed.

## Run the tests

```bash
cd server
npm test
npm run test:coverage
```

The tests start their own in-memory MongoDB, so they need no database and never touch real data. The `npm test` script passes `--experimental-vm-modules`, which the in-memory database needs, so use the script rather than calling `jest` directly.

The frontend has a linter (`npm run lint`) and a production build (`npm run build`) in `client`. It has no automated tests yet.

## API

All lead routes need an `Authorization: Bearer <token>` header.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account, returns a token |
| POST | `/api/auth/login` | Log in, returns a token |
| GET | `/api/auth/me` | The current user |
| GET | `/api/leads?search=&status=` | List your leads, newest first |
| POST | `/api/leads` | Create a lead |
| PATCH | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead |
| GET | `/api/leads/stats` | Counts per status |
| GET | `/api/leads/options` | Allowed statuses and sources |

## Project layout

```
server/
  src/
    config/        env validation, database connection
    models/        User and Lead schemas
    controllers/   request handlers
    middleware/    auth, validation, error handling
    validators/    Zod schemas
    routes/
  tests/           API tests and unit tests
client/
  src/
    pages/         Login, Signup, Leads, NotFound
    components/    UI pieces (dialogs, table, stat cards, form fields)
    hooks/         useLeads, useDebounce, useAuth
    context/       auth state
    lib/           API helper, schemas, formatting, motion setup
```

## Technical choices and why

- **Zod on both sides.** The server never trusts the browser, and the browser gives instant feedback. Unknown fields are dropped, so a client cannot write fields it should not.
- **Ownership is enforced in the query.** Every lead query filters by `owner: req.userId`. A lead that belongs to someone else returns 404, not 403, so its existence is not revealed.
- **Passwords and tokens.** Passwords are hashed with bcrypt. Tokens are signed JWTs that expire after 7 days.
- **Indexes match the queries.** There is a unique index on owner and email, which prevents duplicates and returns a clean 409. Other indexes cover listing by date and filtering by status.
- **Search is escaped.** The search text is regex-escaped, so characters like `.` or `(` cannot break the query or be abused.
- **One place for errors.** A shared `AppError` and one error handler give every failure the same JSON shape.
- **Native `<dialog>` for the drawer and confirmation.** The browser provides the focus trap, Esc to close and the backdrop. GSAP only adds movement.
- **Speed.** Routes are lazy-loaded, the toast library loads on demand, and vendor code is split into separate chunks. Search is debounced by 300 ms, and an older in-flight request is cancelled so a slow response can never overwrite a newer one.
- **Contrast.** White text on the orange brand colour measured about 3.1:1, which fails accessibility guidance, so orange buttons use dark text (about 5.4:1).

## Assumptions

- A lead has a name and an email. Phone and company are optional.
- Email must be unique per user, not across all users.
- Statuses and sources are fixed lists defined on the server and sent to the frontend, so they stay in one place.
- Leads are private to the user who created them. There are no shared teams or roles.

## Not included, and what I would do next

- **Pagination.** The list is not paginated, and the table shows up to 20 rows. With many leads I would add server-side pagination.
- **Deployment.** The app is set up to run locally. I would host the API and the frontend, and add an HTTPS-only cookie option for the token.
- **Frontend tests.** I would add Vitest and Testing Library for the form and the leads page.
- **Security extras.** I would add rate limiting on login and signup, and password reset.
- **Token storage.** The token is kept in `localStorage`, which is simple but readable by injected scripts. An httpOnly cookie would be safer.
