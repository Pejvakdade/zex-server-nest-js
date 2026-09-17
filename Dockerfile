# ######################################################################################################################
# ======================================================================================================================
# Base -----------------------------------------------------------------------------------------------------------------
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# ######################################################################################################################
# ======================================================================================================================
# Dependencies (full, dev + prod) --------------------------------------------------------------------------------------
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ######################################################################################################################
# ======================================================================================================================
# Development ----------------------------------------------------------------------------------------------------------
FROM deps AS development
WORKDIR /usr/src/app
COPY . .
CMD ["bun", "run", "start:dev"]

# ######################################################################################################################
# ======================================================================================================================
# Typecheck (CI gate only, produces no runtime artifact) ---------------------------------------------------------------
FROM deps AS typecheck
WORKDIR /usr/src/app
COPY . .
RUN bunx tsc --noEmit -p tsconfig.build.json

# ######################################################################################################################
# ======================================================================================================================
# Production dependencies only -----------------------------------------------------------------------------------------
FROM base AS deps-prod
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ######################################################################################################################
# ======================================================================================================================
# Production -----------------------------------------------------------------------------------------------------------
FROM base AS production

WORKDIR /usr/src/app

# No .env files are baked in: configuration reaches the container through compose `environment`
# / `env_file`, so a fresh clone builds without them and no secret lands in an image layer.
COPY package.json bun.lock tsconfig.json ./
COPY --from=deps-prod /usr/src/app/node_modules ./node_modules

COPY src     ./src
COPY libs    ./libs
COPY public  ./public

ENV NODE_ENV=production

EXPOSE ${APPLICATION_INTERNAL_PORT}

# Same probe the /health endpoint exposes (Postgres + Redis reachability); compose reports the
# container unhealthy if the app cannot answer it. The port comes from .env at build time.
ARG APPLICATION_INTERNAL_PORT=3000
ENV APPLICATION_INTERNAL_PORT=${APPLICATION_INTERNAL_PORT}
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:' + process.env.APPLICATION_INTERNAL_PORT + '/api/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "src/main.ts"]
