#!/bin/bash

# AI-CMS Docker Startup Script
# This script helps start the entire stack with proper health checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.docker template..."
    cp .env.docker .env
    print_info "Please update .env with your configuration"
    print_info "Especially: JWT_SECRET and GEMINI_API_KEY"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_info "Starting AI-CMS Stack..."

# Stop any existing containers
print_info "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build images
print_info "Building Docker images..."
docker-compose build

# Start services
print_info "Starting services..."
docker-compose up -d

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."

# Wait for PostgreSQL
print_info "Checking PostgreSQL..."
POSTGRES_READY=false
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        POSTGRES_READY=true
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

if [ "$POSTGRES_READY" = true ]; then
    print_success "PostgreSQL is ready"
else
    print_error "PostgreSQL failed to start"
    docker-compose logs postgres
    exit 1
fi

# Wait for Backend
print_info "Checking Backend API..."
BACKEND_READY=false
for i in {1..60}; do
    if curl -sf http://localhost:3001/api/v1/health > /dev/null 2>&1; then
        BACKEND_READY=true
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

if [ "$BACKEND_READY" = true ]; then
    print_success "Backend API is ready"
else
    print_error "Backend failed to start"
    docker-compose logs backend
    exit 1
fi

# Wait for Frontend
print_info "Checking Frontend..."
FRONTEND_READY=false
for i in {1..30}; do
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        FRONTEND_READY=true
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

if [ "$FRONTEND_READY" = true ]; then
    print_success "Frontend is ready"
else
    print_warning "Frontend may still be starting (this is normal)"
fi

# Print success message
echo ""
print_success "🎉 AI-CMS Stack is running!"
echo ""
print_info "Access the application:"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend API: http://localhost:3001"
echo "  • API Health: http://localhost:3001/api/v1/health"
echo ""
print_info "Default credentials:"
echo "  • Email: admin@example.com"
echo "  • Password: Admin123!"
echo ""
print_info "Useful commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop stack: docker-compose down"
echo "  • Restart: docker-compose restart"
echo "  • View status: docker-compose ps"
echo ""
print_warning "Remember to update JWT_SECRET in .env for production!"
