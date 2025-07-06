#!/usr/bin/env bash

# Docker build script for Quest Board
# This script builds the production Docker images for both backend and frontend

set -euo pipefail

# Function to handle errors
handle_error() {
    echo "Error: $1" >&2
    exit 1
}

# Function to build Docker image
build_image() {
    local service=$1
    local context=$2
    local dockerfile=${3:-Dockerfile}

    echo "Building $service Docker image..."
    echo "Context: $context"
    echo "Dockerfile: $dockerfile"

    if docker build -t "quest-board-$service" -f "$context/$dockerfile" "$context"; then
        echo "✅ Successfully built $service image"
    else
        handle_error "Failed to build $service image"
    fi
}

# Main build process
echo "🚀 Starting Quest Board Docker build process..."
echo "================================================"

# Build backend
build_image "backend" "./backend"

# Build frontend
build_image "frontend" "./frontend"

echo "================================================"
echo "✅ All Docker images built successfully!"
echo ""
echo "Images created:"
echo "  - quest-board-backend"
echo "  - quest-board-frontend"
echo ""
echo "To run the application:"
echo "  docker-compose -f docker-compose.prod.yml up"
