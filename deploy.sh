#!/bin/bash

# BIT CMS Deployment Script
# This script handles the complete deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="bit-cms"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy.log"

# Create necessary directories
mkdir -p $BACKUP_DIR
mkdir -p ./logs
mkdir -p ./uploads

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    success "Docker and Docker Compose are available"
}

# Check environment variables
check_env() {
    if [ ! -f ".env.production" ]; then
        warning ".env.production file not found. Using default values."
    fi
    
    # Check required environment variables
    required_vars=("JWT_SECRET" "MONGODB_URI")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env.production 2>/dev/null; then
            warning "Environment variable $var is not set in .env.production"
        fi
    done
}

# Backup current data
backup_data() {
    log "Creating backup of current data..."
    
    if docker ps | grep -q "$PROJECT_NAME-mongodb"; then
        docker exec $PROJECT_NAME-mongodb mongodump --out /tmp/backup
        docker cp $PROJECT_NAME-mongodb:/tmp/backup $BACKUP_DIR/mongodb-$(date +%Y%m%d-%H%M%S)
        log "MongoDB backup created"
    fi
    
    if docker ps | grep -q "$PROJECT_NAME-redis"; then
        docker exec $PROJECT_NAME-redis redis-cli BGSAVE
        docker cp $PROJECT_NAME-redis:/data/dump.rdb $BACKUP_DIR/redis-$(date +%Y%m%d-%H%M%S).rdb
        log "Redis backup created"
    fi
    
    success "Backup completed"
}

# Build and deploy
deploy() {
    log "Starting deployment process..."
    
    # Stop existing services
    log "Stopping existing services..."
    docker-compose down
    
    # Build new images
    log "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    if docker-compose ps | grep -q "Up"; then
        success "Services are running"
    else
        error "Some services failed to start"
    fi
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Check if main application is responding
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        success "Application is healthy"
    else
        error "Application health check failed"
    fi
    
    # Check if WebSocket is working
    if curl -f http://localhost:5000/api/stats/realtime > /dev/null 2>&1; then
        success "Real-time features are working"
    else
        warning "Real-time features may not be working properly"
    fi
}

# SSL certificate setup (Let's Encrypt)
setup_ssl() {
    if [ "$1" = "--ssl" ]; then
        log "Setting up SSL certificates..."
        
        # Install certbot if not present
        if ! command -v certbot &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y certbot python3-certbot-nginx
        fi
        
        # Get SSL certificate
        sudo certbot --nginx -d your-domain.com -d www.your-domain.com --non-interactive --agree-tos --email admin@your-domain.com
        
        # Setup auto-renewal
        sudo crontab -l | grep -q "certbot renew" || (sudo crontab -l; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
        
        success "SSL certificates setup completed"
    fi
}

# Monitoring setup
setup_monitoring() {
    if [ "$1" = "--monitoring" ]; then
        log "Setting up monitoring..."
        
        # Create monitoring docker-compose file
        cat > docker-compose.monitoring.yml << EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: bit-cms-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    networks:
      - bit-cms-network

  grafana:
    image: grafana/grafana:latest
    container_name: bit-cms-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - bit-cms-network

volumes:
  prometheus_data:
  grafana_data:

networks:
  bit-cms-network:
    external: true
EOF
        
        # Create monitoring configuration
        mkdir -p monitoring/grafana/{dashboards,datasources}
        
        cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'bit-cms'
    static_configs:
      - targets: ['bit-cms:9090']
    metrics_path: '/metrics'
    scrape_interval: 5s
EOF
        
        docker-compose -f docker-compose.monitoring.yml up -d
        success "Monitoring setup completed"
        log "Grafana is available at http://localhost:3001 (admin/admin123)"
        log "Prometheus is available at http://localhost:9090"
    fi
}

# Main deployment function
main() {
    log "Starting BIT CMS deployment..."
    
    check_docker
    check_env
    
    if [ "$1" = "--backup" ]; then
        backup_data
        exit 0
    fi
    
    if [ "$1" = "--health" ]; then
        health_check
        exit 0
    fi
    
    backup_data
    deploy
    health_check
    setup_ssl $1
    setup_monitoring $1
    
    success "Deployment completed successfully!"
    log "Application is available at http://localhost:5000"
    log "API documentation: http://localhost:5000/api/docs"
    log "Health check: http://localhost:5000/health"
    log "Real-time stats: http://localhost:5000/api/stats/realtime"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --ssl         Setup SSL certificates with Let's Encrypt"
    echo "  --monitoring  Setup Prometheus and Grafana monitoring"
    echo "  --backup      Create backup only"
    echo "  --health      Perform health check only"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Basic deployment"
    echo "  $0 --ssl              # Deployment with SSL"
    echo "  $0 --ssl --monitoring # Full deployment with SSL and monitoring"
    echo "  $0 --backup           # Create backup"
    echo "  $0 --health           # Check application health"
}

# Handle command line arguments
case "$1" in
    --help|-h)
        usage
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
