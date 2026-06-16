# ── Backend image (API + worker share this image) ──────
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install production deps. Prefer the lockfile (reproducible); fall back to a
# plain install when no package-lock.json has been committed yet.
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# App source.
COPY src ./src

# Run as non-root.
RUN addgroup -S app && adduser -S app -G app \
  && mkdir -p /app/uploads && chown -R app:app /app
USER app

EXPOSE 5000

# Lightweight healthcheck against the health route.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health > /dev/null 2>&1 || exit 1

CMD ["node", "src/server.js"]
