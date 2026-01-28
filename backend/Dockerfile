# syntax=docker/dockerfile:1

# ===== Stage 1: Dependencies (ALL deps for build) =====
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (dev deps needed for TypeScript build)
RUN npm ci

# ===== Stage 2: Builder =====
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript
RUN npm run build

# ===== Stage 3: Production Dependencies =====
FROM node:20-alpine AS prod-deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# ===== Stage 4: Runner =====
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

# Copy built files and production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Create audit and storage directories with proper permissions
RUN mkdir -p ./audit ./storage && chown -R backend:nodejs ./audit ./storage

# Switch to non-root user
USER backend

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]
