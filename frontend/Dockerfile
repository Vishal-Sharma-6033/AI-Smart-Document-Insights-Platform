# ── Build stage ─────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
# Prefer the lockfile; fall back to a plain install if none is committed yet.
COPY package*.json ./
RUN npm ci || npm install
COPY . .
# VITE_API_URL is baked at build time; default to relative /api (nginx proxies it).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Serve stage ─────────────────────────────────────────
FROM nginx:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
