#!/bin/bash
#
# Quantum X Deployment Script
# One-click deploy for production environment
#
# Usage:
#   ./scripts/deploy.sh [command]
#
# Commands:
#   up        Start all services (default)
#   down      Stop all services
#   restart   Restart all services
#   status    Show service status
#   logs      Show service logs
#   build     Build without starting
#   clean     Remove containers and volumes
#   health    Check health endpoints
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi

    log_info "Prerequisites OK"
}

# Load environment variables
load_env() {
    if [ -f "$PROJECT_DIR/.env.local" ]; then
        log_info "Loading .env.local..."
        export $(grep -v '^#' "$PROJECT_DIR/.env.local" | xargs)
    elif [ -f "$PROJECT_DIR/.env" ]; then
        log_info "Loading .env..."
        export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
    else
        log_warn "No .env file found, using defaults"
    fi
}

# Commands
cmd_up() {
    log_info "Starting Quantum X services..."
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" up -d --build
    log_info "Services started. Run './scripts/deploy.sh health' to check status."
}

cmd_down() {
    log_info "Stopping Quantum X services..."
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" down
    log_info "Services stopped."
}

cmd_restart() {
    log_info "Restarting Quantum X services..."
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" restart
    log_info "Services restarted."
}

cmd_status() {
    log_info "Service status:"
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" ps
}

cmd_logs() {
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" logs -f "${@:2}"
}

cmd_build() {
    log_info "Building Quantum X services..."
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" build
    log_info "Build complete."
}

cmd_clean() {
    log_warn "This will remove all containers and volumes. Continue? [y/N]"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log_info "Cleaning up..."
        cd "$PROJECT_DIR"
        docker compose -f "$COMPOSE_FILE" down -v --rmi local
        log_info "Cleanup complete."
    else
        log_info "Aborted."
    fi
}

cmd_health() {
    log_info "Checking health endpoints..."

    BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
    FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

    echo ""
    echo "Backend Health:"
    echo "---------------"
    if curl -s "${BACKEND_URL}/api/health" | jq . 2>/dev/null; then
        echo ""
    else
        log_error "Backend health check failed"
    fi

    echo ""
    echo "Backend Readiness:"
    echo "------------------"
    if curl -s "${BACKEND_URL}/api/ready" | jq . 2>/dev/null; then
        echo ""
    else
        log_warn "Backend readiness check failed (may still be starting)"
    fi

    echo ""
    echo "Frontend Health:"
    echo "----------------"
    if curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "${FRONTEND_URL}/"; then
        echo "Frontend is responding"
    else
        log_error "Frontend health check failed"
    fi
}

# Main
main() {
    check_prerequisites
    load_env

    command="${1:-up}"

    case "$command" in
        up)
            cmd_up
            ;;
        down)
            cmd_down
            ;;
        restart)
            cmd_restart
            ;;
        status)
            cmd_status
            ;;
        logs)
            cmd_logs "$@"
            ;;
        build)
            cmd_build
            ;;
        clean)
            cmd_clean
            ;;
        health)
            cmd_health
            ;;
        *)
            echo "Usage: $0 {up|down|restart|status|logs|build|clean|health}"
            exit 1
            ;;
    esac
}

main "$@"
