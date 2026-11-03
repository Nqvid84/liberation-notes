# Liberation Notes

An anonymous emotional space where people leave fragments of themselves.
Not a social platform. Not a feed. A *place*.

**Live Preview (GitHub Pages):** [https://nqvid84.github.io/liberation-notes/](https://nqvid84.github.io/liberation-notes/)

---

## Monorepo Layout

```
liberation-notes/
├── client/          # React + Three.js frontend (Vite + R3F)
├── server/          # Node + Express + MongoDB backend
├── shared/          # TypeScript types shared by client and server
└── docs/            # Architecture, conventions, design system
```

**Design & Architecture Docs:**
- [`docs/conventions.md`](docs/conventions.md) — Architectural patterns, 3D/2D split, and coding conventions
- [`docs/design-system.md`](docs/design-system.md) — Visual tokens, emotion palettes, typography, and motion rules
- [`docs/backend-design.md`](docs/backend-design.md) — Backend API surface, spatial bounds, and validation rules

---

## Frontend (`client/`)

The frontend is split into **Two Rendering Worlds**: a full-viewport Three.js / React Three Fiber `<Canvas>` that renders drifting 3D notes in a soft, foggy sky, and a minimal 2D React overlay anchored to the screen edges.

### Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| 3D Scene | Three.js + `@react-three/fiber` + `@react-three/drei` |
| 2D Overlay | Tailwind CSS + Framer Motion |
| State | Zustand (`noteStore`, `sceneStore`, `uiStore`) |
| Typography | Cormorant Garamond (notes) + Inter (UI controls) |

### Running the Client Locally

```bash
cd client
npm install
npm run dev
# → http://localhost:5173 (proxies /api/* to http://localhost:3001)
```

### Static / GitHub Pages Mode

When built for GitHub Pages (`npm run build:gh-pages` or with `VITE_GITHUB_PAGES=true`), the client automatically switches to **static mock mode**:
- Asset paths are prefixed with `/liberation-notes/`.
- **Zero network/API calls** are made; the scene is populated immediately from `client/src/api/mockData.ts` and new notes created during the session are stored in-memory.
- Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) to build and deploy the client to GitHub Pages.

---

## Backend (`server/`)

The backend is a minimal Express API with MongoDB. Four routes. No auth. No GraphQL. No WebSockets.

### Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express 4 |
| Database | MongoDB 7 via Mongoose |
| Validation | Zod |
| Tests | Vitest + Supertest + mongodb-memory-server |

### API Surface

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check |
| `GET` | `/api/notes` | Fetch all notes (newest first) |
| `POST` | `/api/notes` | Create a note |
| `GET` | `/api/notes/:id` | Fetch a single note |

### Server File Structure

```
server/
├── src/
│   ├── lib/
│   │   ├── asyncHandler.ts    # Async error forwarding wrapper
│   │   ├── db.ts              # MongoDB connection
│   │   ├── emotionColors.ts   # EmotionKey → hex color map
│   │   ├── position.ts        # Random 3D coordinate generator
│   │   ├── respond.ts         # respond() / respondError() helpers
│   │   └── seed.ts            # Random rotation generator
│   ├── middleware/
│   │   ├── errorHandler.ts    # Global 500 boundary
│   │   ├── rateLimiter.ts     # 5 POSTs per IP per 15 min
│   │   └── validate.ts        # Zod validation middleware factory
│   ├── models/
│   │   └── Note.ts            # Mongoose schema + toJSON transform
│   ├── routes/
│   │   ├── health.ts          # GET /api/health
│   │   ├── health.test.ts
│   │   ├── notes.ts           # GET+POST /api/notes, GET /api/notes/:id
│   │   └── notes.test.ts
│   ├── app.ts                 # Express app (no listen)
│   └── index.ts               # Entry point: env → DB → listen
├── .env.example
├── Dockerfile
└── package.json
```

---

## Running Locally (without Docker)

Requires a local MongoDB instance running on port `27017`.

**1. Install dependencies**

```bash
cd server
npm install
```

**2. Create your env file**

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/liberation-notes
PORT=3001
MONGO_ROOT_USER=admin
MONGO_ROOT_PASS=localdevpassword
```

**3. Start the dev server**

```bash
npm run dev
```

Expected output:
```
MongoDB connected
Server running on port 3001
```

**4. Verify**

```bash
curl http://localhost:3001/api/health
# → { "ok": true, "data": null }
```

---

## Running with Docker

Docker manages both MongoDB and the Node server. No local MongoDB needed.

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- Verify: `docker --version` and `docker compose version`

### First-time setup

The project root `.env` holds the credentials docker-compose uses to initialise MongoDB.
It is gitignored and must be created once:

```bash
# From the project root (liberation-notes/)
cat > .env << 'EOF'
MONGO_ROOT_USER=admin
MONGO_ROOT_PASS=localdevpassword
EOF
```

`server/.env.docker` is already committed and pre-configured with the matching credentials
and the correct internal hostname (`mongo`, not `localhost`). You do not need to edit it.

### Start the full stack

```bash
# From the project root (liberation-notes/)
docker compose up -d
```

First run pulls the `mongo:7` image (~300MB). Subsequent runs start in seconds.

Expected output:
```
✔ Container liberation-notes-mongo-1   Healthy
✔ Container liberation-notes-server-1  Started
```

The server waits for MongoDB's healthcheck to pass before starting — no race condition on cold boot.

### Verify

```bash
# Health check
curl http://localhost:3001/api/health
# → { "ok": true, "data": null }

# Create a note
curl -s -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d '{"content": "a quiet thought", "emotion": "hope"}' | python3 -m json.tool

# Read all notes
curl http://localhost:3001/api/notes
```

### Daily commands

```bash
# Start (detached)
docker compose up -d

# Stop and wipe DB (no volume = clean slate on every down)
docker compose down

# View live logs
docker compose logs -f server
docker compose logs -f mongo

# After changing server source code — rebuild then restart
docker compose build server
docker compose up -d
```

### Port reference

| Port | Service |
|---|---|
| `3001` | Node server (API) |
| `27017` | MongoDB (also exposed to host for Compass / mongosh) |

### Inspect the database directly

```bash
# Via mongosh inside the running container
docker exec -it liberation-notes-mongo-1 mongosh \
  -u admin -p localdevpassword \
  --authenticationDatabase admin \
  liberation-notes \
  --eval "db.notes.find().pretty()"

# Or connect MongoDB Compass to:
# mongodb://admin:localdevpassword@localhost:27017/?authSource=admin
```

### Two environments side by side

| | `npm run dev` | `docker compose up` |
|---|---|---|
| MongoDB | Local process | Docker container |
| `MONGODB_URI` | `localhost:27017` | `mongo:27017` (internal) |
| Env file used | `server/.env` | `server/.env.docker` |
| Code changes | Instant (tsx watch) | Rebuild image + restart |
| DB data | Persists locally | Wiped on `docker compose down` |

> **Tests always run locally** — `npm test` uses `mongodb-memory-server` and never needs Docker running.

---

## Running Tests

```bash
cd server
npm test
```

Tests use an in-memory MongoDB instance — no running database required.

```
Test Files  2 passed (2)
     Tests  20 passed (20)
```

---

## Environment Variables

| Variable | File | Used by | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | `client/.env` | Client | Optional backend origin URL in production (empty in dev to use Vite proxy) |
| `VITE_GITHUB_PAGES` | Build env | Client | Set to `true` (or use `--mode gh-pages`) to disable API calls and use static mock notes |
| `VITE_USE_MOCK` | `client/.env` | Client | Set to `true` to force local in-memory mock data without calling the backend |
| `MONGODB_URI` | `server/.env` or `server/.env.docker` | Server | Full MongoDB connection string |
| `PORT` | `server/.env` | Server | HTTP port (default: `3001`) |
| `NODE_ENV` | `server/.env.docker` | Server | Runtime environment |
| `MONGO_ROOT_USER` | `.env` (root) | docker-compose | MongoDB root username for container init |
| `MONGO_ROOT_PASS` | `.env` (root) | docker-compose | MongoDB root password for container init |
