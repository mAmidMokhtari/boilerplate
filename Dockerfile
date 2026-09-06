# syntax=docker/dockerfile:1.7
# Build any app with:  docker build --build-arg APP_NAME=web -t web:local .
# Runtime env is read at start (docker run --env-file .env ...), except the
# NEXT_PUBLIC_* values which are inlined at build time via --secret env_file.

ARG NODE_VERSION=22
ARG PNPM_VERSION=10

############### base ###############
FROM node:${NODE_VERSION}-bookworm-slim AS base
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

############### deps ###############
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY libs ./libs
COPY tools ./tools
# Keep only manifests so the layer is cached until a dependency changes.
RUN find apps libs tools -type f ! -name package.json -delete && find apps libs tools -type d -empty -delete
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

############### builder ###############
FROM base AS builder
ARG APP_NAME=web
ENV NEXT_TELEMETRY_DISABLED=1
ENV NX_DAEMON=false
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Restore per-package node_modules symlinks created by pnpm.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline
RUN --mount=type=secret,id=env_file \
    if [ -f /run/secrets/env_file ]; then cp /run/secrets/env_file .env; fi && \
    pnpm nx build ${APP_NAME} --configuration=production --skip-nx-cache

############### runner ###############
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
ARG APP_NAME=web
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/apps/${APP_NAME}

COPY --from=builder --chown=nonroot:nonroot /app/apps/${APP_NAME}/.next/standalone /app/
COPY --from=builder --chown=nonroot:nonroot /app/apps/${APP_NAME}/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/apps/${APP_NAME}/.next/static ./.next/static

EXPOSE 3000
CMD ["server.js"]
