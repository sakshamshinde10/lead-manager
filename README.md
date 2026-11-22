# Lead Manager

A small full-stack web app for a sales person to record leads (people who might become customers) and track how far each one has progressed. Each user signs up and sees only their own leads.

**Live demo:** https://lead-manager-topaz-seven.vercel.app
The API runs on Render's free plan, so the first request after a quiet period can take up to a minute while it wakes up.

You can log in with the demo account `demo@leadmanager.test` / `Demo@12345` (it has 30 sample leads), or create your own.

## What it does

The required features:

- Add a lead: name, email, phone, company, source (dropdown) and status (New, Contacted, Qualified, Lost)
- Show all leads in a table with the status clearly visible
- Edit a lead and update its status
- Delete a lead, with a confirmation step
- Search by name and filter by status
- Validation on both the frontend and the backend (valid email, required fields)

Optional extras I chose:

- Signup and login, so every user has their own leads
- A dashboard with the number of leads per status
- Automated API tests

Also added: an **Export to Excel** button that downloads the leads currently shown, and a seed script with 30 sample leads for trying the app.

Not done: pagination and sorting (the other optional extra).

## Tech stack and why

| Part | Choice | Why |
| --- | --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Hook Form, GSAP | React and Vite are quick to build with. Tailwind keeps the colours and fonts in one place. GSAP handles the animations. |
| Backend | Node.js, Express 5 | A small REST API. Express 5 passes errors from async handlers on automatically. |
| Database | MongoDB with Mongoose | A lead is naturally one document, and Mongoose gives a schema and indexes. |
| Validation | Zod, on both sides | The browser gives instant feedback, and the server checks again because it cannot trust the browser. |
| Auth | JWT and bcrypt | Stateless login. Passwords are stored only as bcrypt hashes. |
| Tests | Jest, Supertest, in-memory MongoDB | Tests run against a throw-away database and never touch real data. |

## Run it locally

You need Node.js 20 or newer and a MongoDB connection string (local MongoDB or a free Atlas cluster).

**1. API**

```bash
cd server
npm install
cp .env.example .env     # on Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Fill in `server/.env` before starting:

| Variable | Meaning |
| --- | --- |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A long random string (at least 16 characters) used to sign login tokens |
| `PORT` | Port for the API (default 5000) |
| `CLIENT_ORIGIN` | The frontend's address, allowed through CORS (default `http://localhost:5173`) |
| `DNS_SERVERS` | Optional. Only if Atlas fails with `querySrv ECONNREFUSED`, for example `8.8.8.8,1.1.1.1` |

**2. Frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` requests to the API on port 5000.

**3. Optional: sample data**

```bash
cd server
npm run seed
```

This creates the demo account above with 30 leads. It only replaces that account's own leads. A ready-made Excel file with the same leads is in `sample-data/`.

## Tests

```bash
cd server
npm test
```

108 tests (API tests with Supertest plus unit tests), about 98% statement coverage. They need no database or `.env`. Use `npm test` rather than calling `jest` directly, because the script adds `--experimental-vm-modules`, which the in-memory database needs.

The frontend has `npm run lint` and `npm run build`, but no automated tests.

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
| GET | `/api/leads/export?search=&status=` | Download leads as an Excel file |
| GET | `/api/health` | Check the API is up |

## Database design

MongoDB, with two collections. One user has many leads, and each lead stores the id of the user who owns it.

```
users                                  leads
-----                                  -----
_id            ObjectId                _id         ObjectId
name           String (max 100)        owner       ObjectId  -> users._id (required)
email          String, unique          name        String (max 100)
passwordHash   String (bcrypt)         email       String, lowercase (max 254)
createdAt      Date                    phone       String, optional (max 20)
updatedAt      Date                    company     String, optional (max 100)
                                       source      Website | Referral | LinkedIn | Cold Call | Event | Other
                                       status      New | Contacted | Qualified | Lost (default New)
                                       createdAt, updatedAt
```

**Why this shape**

- **Two collections, with a reference.** A lead is not nested inside a user, so a user with thousands of leads never produces one huge document. The `owner` field is how each user sees only their own leads: every lead query filters by it.
- **Fixed lists live in one place.** The allowed statuses and sources are defined once on the server and used by the model, the validation and the dropdowns.
- **The password is never stored.** Only the bcrypt hash is, and it is hidden from query results by default.
- **Emails are lowercased** so `A@x.com` and `a@x.com` are the same account.

**Indexes**

| Collection | Index | What it is for |
| --- | --- | --- |
| users | `email` (unique) | Fast login lookup, and no two accounts with the same email |
| leads | `owner`, `email` (unique) | Stops a user saving the same lead email twice, and returns a clean 409 |
| leads | `owner`, `createdAt` (descending) | Listing a user's leads, newest first |
| leads | `owner`, `status` | Filtering by status and counting leads per status for the dashboard |

## Design decisions

- **Ownership is enforced in every query.** Each lead query filters by the logged-in user's id. Another user's lead returns 404, not 403, so it does not reveal that the lead exists.
- **Duplicate emails are blocked by the database.** A unique index on owner and email returns a clean 409, even if two requests arrive at once.
- **One error format.** Every failure returns `{ message, errors? }`, and server-side field errors show under the right form field.
- **Passwords.** New passwords need 8+ characters, a number and a special character. Login does not apply those rules, so older accounts can still sign in.
- **Search is escaped.** The search text is treated as plain text, not as a pattern.
- **Smooth search.** Typing is debounced, and an older request is cancelled so a slow response cannot replace a newer one.
- **Accessibility.** The add/edit panel and the delete confirmation use the native `<dialog>` element (focus trap and Esc for free). Status is always shown as text, not colour alone. Animations are turned off for users who prefer reduced motion.

## Deployment

The frontend is on Vercel (root `client`, environment variable `VITE_API_URL` set to the API's address) and the API is on Render (root `server`, build `npm install`, start `npm start`, with `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` and `NODE_ENV=production` set). In MongoDB Atlas, network access has to allow Render's changing IP addresses.

## Assumptions

- A lead needs a name, an email and a source. Phone and company are optional.
- An email must be unique per user, not across all users.
- Statuses and sources are fixed lists defined on the server.
- Leads are private to the user who created them. There are no teams or roles.

## What I would improve with more time

- Pagination and sorting for large lead lists
- Frontend tests (for example Vitest and Testing Library)
- Rate limiting on login and signup, and a password reset flow
- Store the token in an httpOnly cookie instead of `localStorage`
- Run the tests automatically on every push

## A note on AI tools

I used an AI assistant while building this. I went through each part and can explain how it works.
