#!/usr/bin/env bash

# Run all tests
set -euo pipefail

echo "Running tests..."

# Backend tests
echo "Running backend tests..."
cd backend
npm test

# Frontend tests
echo "Running frontend tests..."
cd ../frontend
npm test

echo "All tests completed!"
