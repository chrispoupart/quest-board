# Multi-stage build for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary packages for building
RUN apk add --no-cache openssl

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with explicit registry and better error handling
RUN npm ci --no-audit --no-fund && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install necessary packages
RUN apk add --no-cache bash curl

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Symlink nginx logs to stdout/stderr for Docker best practices
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /usr/share/nginx/html /tmp/nginx && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod 755 /tmp/nginx

# Change ownership of nginx directories to nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080

# Create startup script with proper environment variable handling
RUN echo '#!/bin/bash' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Set default values for environment variables' >> /docker-entrypoint.sh && \
    echo 'export BACKEND_HOST=${BACKEND_HOST:-backend}' >> /docker-entrypoint.sh && \
    echo 'export BACKEND_PORT=${BACKEND_PORT:-5000}' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Write runtime env.js for frontend config' >> /docker-entrypoint.sh && \
    echo 'echo "window.ENV = { VITE_GOOGLE_CLIENT_ID: \"$VITE_GOOGLE_CLIENT_ID\" };" > /usr/share/nginx/html/env.js' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Log configuration' >> /docker-entrypoint.sh && \
    echo 'echo "Starting Quest Board Frontend..."' >> /docker-entrypoint.sh && \
    echo 'echo "Backend URL: http://$BACKEND_HOST:$BACKEND_PORT"' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Substitute environment variables in nginx config' >> /docker-entrypoint.sh && \
    echo 'envsubst "$BACKEND_HOST $BACKEND_PORT" < /etc/nginx/nginx.conf.template > /tmp/nginx/nginx.conf' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Test nginx configuration' >> /docker-entrypoint.sh && \
    echo 'nginx -t -c /tmp/nginx/nginx.conf' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Start nginx in foreground with custom config' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;" -c /tmp/nginx/nginx.conf' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Start nginx with environment variable substitution
CMD ["/docker-entrypoint.sh"]
