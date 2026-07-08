# ---- Build stage ----
# Node 22+ is required by the pinned pnpm version in package.json ("packageManager")
FROM node:22-alpine AS build

WORKDIR /app

# Enable pnpm via corepack (version pinned by package.json "packageManager")
RUN corepack enable

# Install dependencies first (better layer caching).
# pnpm-workspace.yaml carries allowBuilds (esbuild) and MUST be present during
# install, otherwise pnpm 11 fails with ERR_PNPM_IGNORED_BUILDS.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Build the app (VITE_* vars are baked in at build time — see frontend/README.md)
ARG VITE_API_BASE_URL=https://pragent-api-backend-tl4erlvygq-as.a.run.app
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN pnpm build

# ---- Runtime stage ----
FROM nginx:1.27-alpine

# SPA routing + listen on Cloud Run's $PORT (defaults to 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
