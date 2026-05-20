# ─── Stage 1: Install production dependencies ─────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Create a non-root user for security hardening
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Copy installed dependencies from deps stage
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy application source (respects .dockerignore)
COPY --chown=nodeuser:nodejs . .

# Create logs directory with correct ownership
RUN mkdir -p logs && chown nodeuser:nodejs logs

# Switch to non-root user
USER nodeuser

# Expose application port
EXPOSE 5000

# Health check — used by Docker, docker-compose, and hosting platforms
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "index.js"]
