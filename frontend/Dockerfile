# build stage
FROM node:20-alpine as build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# production stage
FROM nginx:alpine

# For envsubst
RUN apk add --no-cache gettext

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config template and entrypoint script
COPY nginx.conf /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Symlink logs
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
