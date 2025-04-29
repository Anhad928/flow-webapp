# ─────────────────────────────────────────────────────────────
# Build stage
# ─────────────────────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci                       # full install (dev+prod)
COPY src ./src
RUN npm run build                # ⇒ dist/index.js etc.

# ─────────────────────────────────────────────────────────────
# Run stage  (tiny image, prod deps only)
# ─────────────────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000

# copy prod files & node_modules ----from=build
COPY --from=build /app/dist       ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
