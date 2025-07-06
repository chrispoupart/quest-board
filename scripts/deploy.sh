#!/usr/bin/env bash

# Quest Board Production Deployment Script
# This script helps deploy the Quest Board application to production

set -euo pipefail

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    echo "Error occurred in script at line: ${line_number}, exit code: ${exit_code}" >&2
    exit "${exit_code}"
}

# Set error handler
trap 'handle_error ${LINENO}' ERR

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly ENV_FILE="${PROJECT_ROOT}/.env.production"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment file exists
check_environment() {
    if [[ ! -f "${ENV_FILE}" ]]; then
        log_error "Environment file not found: ${ENV_FILE}"
        log_info "Please copy env.production.example to .env.production and configure it"
        exit 1
    fi

    log_info "Environment file found: ${ENV_FILE}"
}

# Validate required environment variables
validate_environment() {
    log_info "Validating environment variables..."

    # Source the environment file
    set -a
    source "${ENV_FILE}"
    set +a

    local missing_vars=()

    # Check required variables
    [[ -z "${GOOGLE_CLIENT_ID:-}" ]] && missing_vars+=("GOOGLE_CLIENT_ID")
    [[ -z "${GOOGLE_CLIENT_SECRET:-}" ]] && missing_vars+=("GOOGLE_CLIENT_SECRET")
    [[ -z "${VITE_GOOGLE_CLIENT_ID:-}" ]] && missing_vars+=("VITE_GOOGLE_CLIENT_ID")
    [[ -z "${JWT_SECRET:-}" ]] && missing_vars+=("JWT_SECRET")

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}" | sed 's/^/  - /'
        exit 1
    fi

    log_info "All required environment variables are set"
}

# Deploy the application
deploy() {
    log_info "Starting deployment..."

    cd "${PROJECT_ROOT}"

    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down || true

    # Build and start containers
    log_info "Building and starting containers..."
    docker-compose -f docker-compose.prod.yml up -d --build

    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10

    # Check service health
    log_info "Checking service health..."
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log_info "Deployment successful!"
        log_info "Frontend should be available at: http://localhost:8080"
        log_info "Backend should be available at: http://localhost:8000"
    else
        log_error "Deployment failed - services are not running"
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi
}

# Show usage information
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy Quest Board application to production.

OPTIONS:
    -h, --help      Show this help message
    -c, --check     Only check environment configuration
    -d, --deploy    Deploy the application (default)

EXAMPLES:
    $0 --check      # Validate environment configuration
    $0 --deploy     # Deploy the application
    $0              # Deploy the application (default)

ENVIRONMENT:
    The script expects a .env.production file in the project root
    with the following variables:
    - GOOGLE_CLIENT_ID
    - GOOGLE_CLIENT_SECRET
    - VITE_GOOGLE_CLIENT_ID
    - JWT_SECRET
    - ALLOWED_ORIGINS (optional)
EOF
}

# Main function
main() {
    local check_only=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -c|--check)
                check_only=true
                shift
                ;;
            -d|--deploy)
                check_only=false
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    log_info "Quest Board Production Deployment Script"
    log_info "========================================"

    check_environment
    validate_environment

    if [[ "${check_only}" == true ]]; then
        log_info "Environment check completed successfully"
        exit 0
    fi

    deploy
}

# Run main function with all arguments
main "$@"
