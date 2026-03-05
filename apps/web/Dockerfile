# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package*.json ./

# Copy the web package explicitly
COPY apps/web/package.json apps/web/

# Install dependencies for the monorepo
RUN npm install

# Copy source code for the web app
COPY apps/web apps/web

# Build the web app
WORKDIR /app/apps/web
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom Nginx configuration to enable React Router DOM (SPA routing)
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the builder stage to Nginx serving directory
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
