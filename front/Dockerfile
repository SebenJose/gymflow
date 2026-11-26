FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY front/package.json front/
RUN pnpm install --frozen-lockfile --filter @gymflow/front
COPY front front
RUN pnpm --filter @gymflow/front build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/front/.next/standalone ./
COPY --from=build /repo/front/.next/static ./front/.next/static
COPY --from=build /repo/front/public ./front/public
EXPOSE 3000
CMD ["node", "front/server.js"]
