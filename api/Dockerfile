FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY api/package.json api/
RUN pnpm install --frozen-lockfile --filter @gymflow/api
COPY api api
RUN pnpm --filter @gymflow/api build && pnpm --filter @gymflow/api deploy --prod /out

FROM node:24-alpine
WORKDIR /app
COPY --from=build /out .
EXPOSE 3333
CMD ["node", "dist/main.js"]
