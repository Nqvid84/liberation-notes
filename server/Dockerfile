FROM node:20-alpine

# Build context is the monorepo root so both server/ and shared/ are accessible.
WORKDIR /app

# Install deps first (layer cached unless package.json changes)
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy source — server code + shared types
COPY server/ ./server/
COPY shared/ ./shared/

WORKDIR /app/server

EXPOSE 3001

# tsx resolves TypeScript path aliases (shared/*) natively at runtime —
# no compile step needed for local dev Docker.
CMD ["npx", "tsx", "src/index.ts"]
