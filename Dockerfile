FROM node:20-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json* tsconfig.base.json ./
COPY shared/package.json shared/
COPY api/package.json api/
COPY app/package.json app/
COPY bot/package.json bot/
RUN npm install --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/shared/node_modules ./shared/node_modules
COPY --from=deps /repo/api/node_modules ./api/node_modules
COPY --from=deps /repo/app/node_modules ./app/node_modules
COPY . .
RUN npm run build:shared && npm run build:app && npm run build:api

FROM node:20-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/shared ./shared
COPY --from=build /repo/api ./api
COPY --from=build /repo/app/dist ./app/dist
COPY --from=build /repo/package.json ./package.json
ENV PORT=3000
EXPOSE 3000
CMD ["node", "api/dist/server.js"]
