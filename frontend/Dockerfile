# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# ─── Stage 2: Build the Vite SPA ─────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

# Accept build-time env vars (Vite bakes these into the bundle at build time)
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_APP_ENV=production

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_APP_ENV=$VITE_APP_ENV

COPY . .
RUN npm run build

# ─── Stage 3: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default config, use our custom SPA-aware config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
