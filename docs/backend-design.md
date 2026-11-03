# Liberation Notes — Backend Design System

## Philosophy

The backend exists to preserve and retrieve notes in a way that keeps Liberation Notes
feeling like a place rather than a data pipeline.

The guiding question for every backend decision:
**Does this route, field, or abstraction earn its existence?**

If you cannot point to a concrete frontend need that requires it right now, it does not belong.

---

## Anti-Patterns (Read First)

These are explicitly forbidden:

- Adding a service layer, repository layer, or factory pattern — this project has ≤ 5 routes
- Returning raw Mongoose documents to callers — always project to the shared `Note` type
- Leaking stack traces, Mongoose error messages, or internal details in API responses
- Accepting `position` or `rotation` from the client — these are server-assigned, always
- Any endpoint that exposes per-author aggregation, note counts per user, or anything that enables social comparison or ranking
- Using `{ strict: false }` on any Mongoose schema
- Writing `res.json()` or `res.status()` directly in a route handler — use the response helpers
- Storing anything that could identify a user beyond an IP address (and only for rate limiting, transiently)

---

## Project Structure

```
server/
  src/
    routes/          # Express Router definitions — one file per resource
    models/          # Mongoose schemas + TypeScript Document interfaces
    middleware/      # validate(), rateLimiter, errorHandler
    lib/             # respond(), respondError(), position generator, seed generator
    types/           # Server-only types (Express request augmentations if needed)
  app.ts             # Express app: registers middleware, routes, error handler — no listen()
  index.ts           # Imports app, calls app.listen() — entry point only
```

### Why `app.ts` and `index.ts` are separate

`app.ts` exports the configured Express application without binding to a port.
Test files import `app.ts` directly via `supertest` — no port conflicts, no teardown race conditions,
no need to start and kill a real server.

### Why there is no `controllers/` or `services/` directory

At MVP, handlers are small (10–20 lines each). A controller layer adds a level of
indirection without adding clarity. If a handler grows past ~30 lines, that is a signal
the route is doing too much — split the route, not the abstraction.

---

## Layering Model

Every request passes through these layers in order:

```
Request
  → Express global middleware (json parser, cors)
  → Route-specific rate limiter (write routes only)
  → validate(schema) middleware
  → Route handler
  → Mongoose model
  → respond() or respondError()
→ Response
```

Route handlers must not know about:
- Raw `req.body` before validation (by the time the handler runs, `req.body` is already typed)
- `res.json()` or `res.status()` directly
- Mongoose error shapes (`CastError`, `ValidationError`, etc.)

Each concern is isolated to its layer.

---

## The Core Checking Wrapper

### Part 1 — Request Validation (`validate` middleware)

Every write route uses a `validate(schema)` middleware factory before the handler.
The schema is a Zod object defined in the same file as the route.
If validation fails, the middleware responds immediately with `400` — the handler never runs.

**Pattern (`middleware/validate.ts`):**

```typescript
import { ZodSchema } from 'zod'
import type { Request, Response, NextFunction } from 'express'
import { respondError } from '../lib/respond'

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      respondError(res, 400, 'VALIDATION_ERROR', 'Request body is invalid')
      return
    }
    req.body = result.data  // replace body with the parsed, typed value
    next()
  }
```

**Usage in a route file:**

```typescript
router.post('/', rateLimiter, validate(createNoteSchema), async (req, res, next) => {
  // req.body is now typed and validated — no further checks needed
})
```

**Schema placement:** Define the Zod schema in the same file as the route that uses it,
directly above the route definition. Do not create a separate `schemas/` directory.

The `emotion` field must be validated against the fixed enum of 8 values from `shared/`.
The `position` and `rotation` fields must not appear in any POST body schema — they are rejected
automatically by Zod's `.strict()` or by omission.

---

### Part 2 — Response Envelope (`respond` helpers)

Every response — success or failure — goes through one of two helper functions.
No route handler calls `res.json()`, `res.send()`, or `res.status()` directly.

**Pattern (`lib/respond.ts`):**

```typescript
import type { Response } from 'express'

export const respond = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json({ ok: true, data })
}

export const respondError = (
  res: Response,
  status: number,
  code: ErrorCode,
  message: string
): void => {
  res.status(status).json({ ok: false, error: { code, message } })
}
```

**Response shape (always):**

```
// Success
{ ok: true, data: T }

// Failure
{ ok: false, error: { code: ErrorCode, message: string } }
```

**`ErrorCode` — exhaustive, add here and nowhere else:**

```typescript
export type ErrorCode =
  | 'VALIDATION_ERROR'   // Zod schema failure on request body
  | 'NOT_FOUND'          // Resource does not exist
  | 'RATE_LIMITED'       // IP exceeded write limit
  | 'INTERNAL_ERROR'     // Unexpected server error (message is always generic)
```

When `INTERNAL_ERROR` is returned, the `message` field is always the string
`"Something went wrong"` — never the real error message. Log the real error server-side.

---

## Global Error Handler

A single error-handling middleware at the bottom of `app.ts` catches everything
forwarded via `next(err)` or thrown through an `asyncHandler` wrapper.

```typescript
// Last middleware registered in app.ts
app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {
  console.error(err)
  respondError(res, 500, 'INTERNAL_ERROR', 'Something went wrong')
})
```

Async route handlers must either wrap their body in `try/catch` and call `next(err)` on failure,
or be wrapped in a utility like:

```typescript
// lib/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express'

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
  (req, res, next) =>
    fn(req, res, next).catch(next)
```

---

## Database Conventions (Mongoose)

### Schema rules

- Every schema is typed with a TypeScript interface: `new Schema<INoteDocument>(...)`
- Use `timestamps: true` — never set `createdAt` manually
- No `{ strict: false }` anywhere
- All fields returned in API responses must be present in the shared `Note` type
- No Mongoose virtuals at MVP
- Index only fields that appear in actual queries — do not pre-index "for the future"

### Position and rotation assignment

`position` (`[x, y, z]`) and `rotation` (`[x, y, z]`) are generated server-side at creation time,
stored in MongoDB, and returned as-is to the client forever.

- The client never sends a position or rotation
- The server never recalculates them after creation
- Once stored, they are permanent

Position generation lives in `lib/position.ts`. Volume bounds:
- `x` ∈ `[-12, 12]`
- `y` ∈ `[-6, 6]`
- `z` ∈ `[-10, 2]`

Use sufficient randomness to prevent clustering. Do not use a deterministic sequence
tied to note count — use `Math.random()` for each axis.

### Field projection (always explicit on reads)

Never return the full Mongoose document. Always use `.select()`:

```typescript
Note.find({}).select('id content emotion color position rotation isMemorial authorLabel createdAt')
```

Never return `_id` as an ObjectId — project to `id` as a string. Add a transform to the schema:

```typescript
schema.set('toJSON', {
  virtuals: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})
```

---

## Rate Limiting

Only POST routes are rate-limited. GET routes are not.

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit'
import { respondError } from '../lib/respond'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 creates per IP per window
  handler: (_req, res) => {
    respondError(res, 429, 'RATE_LIMITED', 'Too many notes. Try again later.')
  },
  standardHeaders: true,
  legacyHeaders: false,
})
```

---

## Testing Conventions

### What to test at which layer

| Layer | Test type | Tools |
|---|---|---|
| Route handlers (HTTP level) | Integration | `supertest` + `mongodb-memory-server` |
| Zod schemas (validation logic) | Unit | Vitest |
| `respond` / `respondError` helpers | Unit | Vitest |
| Position generator | Unit | Vitest |

### Rules

- **Never mock the database.** Use `mongodb-memory-server` for real Mongoose behavior.
  Mocked tests that pass while production migrations fail is a known failure mode.
- Test files live next to the thing they test: `routes/notes.test.ts`, not `tests/routes/notes.test.ts`
- Each route test covers at minimum: happy path, validation rejection (missing/wrong fields),
  and the 404 path (for routes with `:id` params)
- Do not test Mongoose's own behavior (`does .save() work`) — test your code

### MongoDB test setup pattern

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  await mongoose.connection.dropDatabase()
})
```

---

## MVP Route Surface Area

The full API at MVP is four routes. Do not add more without a concrete, current frontend need.

| Method | Path | Rate limited | Purpose |
|---|---|---|---|
| `GET` | `/api/notes` | No | Return all notes for the scene |
| `POST` | `/api/notes` | Yes (5/15min) | Create and persist a new note |
| `GET` | `/api/notes/:id` | No | Return one note for the detail panel |
| `GET` | `/api/health` | No | Liveness check — returns `{ ok: true, data: null }` |

---

## Self-Check Checklist

Run this after adding any route, model field, or middleware.

### Routes
- [ ] Every route in this file corresponds to a concrete frontend need that exists today
- [ ] No route exposes user identity, note counts per author, or popularity/ranking data
- [ ] Write routes have `validate(schema)` applied before the handler
- [ ] Write routes have `rateLimiter` applied before the handler
- [ ] No handler calls `res.json()` or `res.status()` directly

### Schemas & Validation
- [ ] Zod schema rejects missing required fields (test this explicitly)
- [ ] Zod schema does not accept `position`, `rotation`, `createdAt`, or `id` from the client
- [ ] `emotion` field validates against the 8 allowed values only
- [ ] `authorLabel` is optional and has a max-length constraint

### Responses
- [ ] Every success path calls `respond(res, data)`
- [ ] Every error path calls `respondError(res, status, code, message)`
- [ ] `INTERNAL_ERROR` responses never contain the real error message
- [ ] The shape of `data` in success responses matches the shared `Note` type exactly

### Database
- [ ] No `{ strict: false }` on any schema
- [ ] `createdAt` is not set manually anywhere
- [ ] `position` and `rotation` are generated server-side, never accepted from client
- [ ] All reads use explicit `.select()` projection
- [ ] `_id` is never returned raw — always projected to `id` as a string

### Testing
- [ ] New route has a test covering: happy path + validation rejection + 404 (if applicable)
- [ ] Tests use `mongodb-memory-server`, not mocks or stubs
- [ ] No test asserts on Mongoose internals (`__v`, ObjectId format, internal error shapes)

### Identity Gate (same question as the frontend — same project)
- [ ] Does any new field or route create a signal that could rank or compare notes?
- [ ] Could any data returned by this API be used to build a leaderboard, user profile, or popularity view?
- [ ] Does removing this route break anything in the current frontend?
