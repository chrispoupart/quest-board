#!/bin/sh
set -e

# Use environment variables, with defaults for local development
export BACKEND_HOST=${BACKEND_HOST:-backend}
export BACKEND_PORT=${BACKEND_PORT:-8000}

echo "Using backend at: http://${BACKEND_HOST}:${BACKEND_PORT}"

# Substitute environment variables in the nginx config template
envsubst '$BACKEND_HOST $BACKEND_PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start nginx
exec nginx -g "daemon off;"
