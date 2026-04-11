FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Production image
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 ruchimeal

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
# COPY .env.example ./.env.example

# Create logs directory
RUN mkdir -p logs && chown -R ruchimeal:nodejs logs

USER ruchimeal

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "src/server.js"]
