# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package*.json ./

# Copy the server package explicitly
COPY apps/server/package.json apps/server/

# Install dependencies for the monorepo
RUN npm install

# Copy source code for the server
COPY apps/server apps/server

# Build the server
WORKDIR /app/apps/server
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/server/package.json apps/server/

# Install only production dependencies
RUN npm install --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/apps/server/dist apps/server/dist

WORKDIR /app/apps/server

ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080

CMD ["npm", "start"]
