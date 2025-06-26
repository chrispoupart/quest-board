# Quest Board - Docker Setup

This document describes how to run the Quest Board application using Docker.

## Quick Start

### Development Environment

```bash
# Start the development environment
docker-compose up --build

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:8000
```

### Production Environment

```bash
# Start the production environment
docker-compose -f docker-compose.prod.yml up --build -d

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:8000
```

## Environment Variables

### Frontend Environment Variables

- `BACKEND_HOST`: Backend service hostname (default: `backend`)
- `BACKEND_PORT`: Backend service port (default: `5000`)

### Backend Environment Variables

- `DATABASE_URL`: Database connection string
- `NODE_ENV`: Environment mode (`development` or `production`)
- `JWT_SECRET`: Secret key for JWT token signing
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

## Docker Images

### Frontend Image

The frontend uses a multi-stage build:
1. **Builder stage**: Node.js 20 Alpine with all dependencies
2. **Production stage**: Nginx Alpine serving the built React application

**Features:**
- Optimized for production with gzip compression
- Security headers enabled
- Health check endpoint at `/health`
- API proxy to backend service
- React Router support (SPA routing)
- Static file caching
- Non-root user execution

### Backend Image

The backend uses Node.js 20 Alpine with:
- Development dependencies for hot reloading
- Health check endpoint at `/health`
- Database migrations on startup

## Health Checks

Both services include health checks:

- **Frontend**: `curl -f http://localhost:8080/health`
- **Backend**: `curl -f http://localhost:8000/health`

## Development vs Production

### Development Mode
- Hot reloading enabled
- Source code mounted as volumes
- Development dependencies included
- Debug logging enabled

### Production Mode
- Optimized builds
- No source code mounting
- Production dependencies only
- Health checks enabled
- Automatic restarts

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 8000 and 8080 are available
2. **Permission issues**: The frontend runs as non-root user (nginx)
3. **Build failures**: Check that all source files are present
4. **Health check failures**: Verify services are starting correctly

### Logs

```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

### Rebuilding

```bash
# Rebuild all services
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache frontend
```

## Security Features

- Non-root user execution
- Security headers in nginx
- Environment variable validation
- Health check monitoring
- Proper file permissions

## Performance Optimizations

- Multi-stage Docker builds
- Nginx caching for static assets
- Gzip compression
- Optimized npm installs
- Alpine Linux base images
