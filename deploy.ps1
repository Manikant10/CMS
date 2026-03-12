# BIT CMS Deployment Script for Windows
# PowerShell script for deploying BIT CMS with real-time features

param(
    [switch]$SSL,
    [switch]$Monitoring,
    [switch]$Backup,
    [switch]$Health,
    [switch]$Help
)

# Configuration
$ProjectName = "bit-cms"
$BackupDir = ".\backups"
$LogFile = ".\logs\deploy.log"

# Create necessary directories
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
New-Item -ItemType Directory -Force -Path ".\logs" | Out-Null
New-Item -ItemType Directory -Force -Path ".\uploads" | Out-Null

# Logging function
function Log-Message {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    
    Write-Host "[$Timestamp] [$Level] $Message" -ForegroundColor $Color
    Add-Content -Path $LogFile -Value "[$Timestamp] [$Level] $Message"
}

function Log-Error {
    param([string]$Message)
    Log-Message -Message $Message -Level "ERROR"
    throw $Message
}

function Log-Success {
    param([string]$Message)
    Log-Message -Message $Message -Level "SUCCESS"
}

function Log-Warning {
    param([string]$Message)
    Log-Message -Message $Message -Level "WARNING"
}

# Check Docker installation
function Test-Docker {
    try {
        $DockerVersion = docker --version
        if ($LASTEXITCODE -ne 0) {
            Log-Error "Docker is not installed or not running. Please install Docker Desktop for Windows."
        }
        Log-Success "Docker is available: $DockerVersion"
        
        $ComposeVersion = docker-compose --version
        if ($LASTEXITCODE -ne 0) {
            Log-Error "Docker Compose is not installed. Please install Docker Compose."
        }
        Log-Success "Docker Compose is available: $ComposeVersion"
    }
    catch {
        Log-Error "Failed to check Docker installation: $($_.Exception.Message)"
    }
}

# Check environment variables
function Test-Environment {
    if (-not (Test-Path ".env.production")) {
        Log-Warning ".env.production file not found. Using default values."
    }
    
    # Check for required environment variables
    $RequiredVars = @("JWT_SECRET", "MONGODB_URI")
    
    foreach ($Var in $RequiredVars) {
        $Content = Get-Content ".env.production" -ErrorAction SilentlyContinue
        if ($Content -notmatch "^$Var=") {
            Log-Warning "Environment variable $Var is not set in .env.production"
        }
    }
}

# Backup current data
function Backup-Data {
    Log-Message "Creating backup of current data..."
    
    try {
        # Check if MongoDB container is running
        $MongoContainer = docker ps -q -f name="$ProjectName-mongodb"
        if ($MongoContainer) {
            $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
            docker exec $MongoContainer mongodump --out /tmp/backup
            docker cp "$MongoContainer`:/tmp/backup" "$BackupDir\mongodb-$Timestamp"
            Log-Success "MongoDB backup created: mongodb-$Timestamp"
        }
        
        # Check if Redis container is running
        $RedisContainer = docker ps -q -f name="$ProjectName-redis"
        if ($RedisContainer) {
            $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
            docker exec $RedisContainer redis-cli BGSAVE
            Start-Sleep -Seconds 5
            docker cp "$RedisContainer`:/data/dump.rdb" "$BackupDir\redis-$Timestamp.rdb"
            Log-Success "Redis backup created: redis-$Timestamp.rdb"
        }
        
        Log-Success "Backup completed successfully"
    }
    catch {
        Log-Error "Backup failed: $($_.Exception.Message)"
    }
}

# Build and deploy
function Deploy-Application {
    Log-Message "Starting deployment process..."
    
    try {
        # Stop existing services
        Log-Message "Stopping existing services..."
        docker-compose down
        
        # Build new images
        Log-Message "Building Docker images..."
        docker-compose build --no-cache
        
        # Start services
        Log-Message "Starting services..."
        docker-compose up -d
        
        # Wait for services to be healthy
        Log-Message "Waiting for services to be healthy..."
        Start-Sleep -Seconds 30
        
        # Check service status
        $RunningServices = docker-compose ps --filter "status=running" -q
        if ($RunningServices.Count -gt 0) {
            Log-Success "Services are running ($($RunningServices.Count) containers)"
        } else {
            Log-Error "No services are running"
        }
    }
    catch {
        Log-Error "Deployment failed: $($_.Exception.Message)"
    }
}

# Health check
function Test-Health {
    Log-Message "Performing health checks..."
    
    try {
        # Check if main application is responding
        $Response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 10 -UseBasicParsing
        if ($Response.StatusCode -eq 200) {
            Log-Success "Application is healthy"
        } else {
            Log-Warning "Application returned status code: $($Response.StatusCode)"
        }
        
        # Check if WebSocket is working
        try {
            $StatsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/stats/realtime" -TimeoutSec 10 -UseBasicParsing
            if ($StatsResponse.StatusCode -eq 200) {
                Log-Success "Real-time features are working"
            } else {
                Log-Warning "Real-time features may not be working properly"
            }
        }
        catch {
            Log-Warning "Could not reach real-time stats endpoint"
        }
    }
    catch {
        Log-Error "Health check failed: $($_.Exception.Message)"
    }
}

# SSL setup (Windows version)
function Setup-SSL {
    if ($SSL) {
        Log-Message "SSL setup for Windows requires manual configuration."
        Log-Message "Please refer to the deployment documentation for SSL setup instructions."
        
        # Create SSL directory
        New-Item -ItemType Directory -Force -Path ".\nginx\ssl" | Out-Null
        
        Log-Warning "Place your SSL certificates in .\nginx\ssl\ folder:"
        Log-Warning "  - cert.pem (SSL certificate)"
        Log-Warning "  - key.pem (Private key)"
        Log-Warning "Then restart the nginx service: docker-compose restart nginx"
    }
}

# Monitoring setup
function Setup-Monitoring {
    if ($Monitoring) {
        Log-Message "Setting up monitoring..."
        
        # Create monitoring configuration
        New-Item -ItemType Directory -Force -Path ".\monitoring\grafana\dashboards" | Out-Null
        New-Item -ItemType Directory -Force -Path ".\monitoring\grafana\datasources" | Out-Null
        
        # Create monitoring docker-compose file
        $MonitoringCompose = @"
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
"@
        
        $MonitoringCompose | Out-File -FilePath "docker-compose.monitoring.yml" -Encoding UTF8
        
        # Create Prometheus configuration
        $PrometheusConfig = @"
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'bit-cms'
    static_configs:
      - targets: ['bit-cms:9090']
    metrics_path: '/metrics'
    scrape_interval: 5s
"@
        
        $PrometheusConfig | Out-File -FilePath ".\monitoring\prometheus.yml" -Encoding UTF8
        
        # Start monitoring services
        docker-compose -f docker-compose.monitoring.yml up -d
        
        Log-Success "Monitoring setup completed"
        Log-Message "Grafana is available at http://localhost:3001 (admin/admin123)"
        Log-Message "Prometheus is available at http://localhost:9090"
    }
}

# Show usage
function Show-Usage {
    Write-Host "BIT CMS Deployment Script for Windows" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1                    # Basic deployment"
    Write-Host "  .\deploy.ps1 -SSL              # Deployment with SSL setup"
    Write-Host "  .\deploy.ps1 -SSL -Monitoring # Full deployment with SSL and monitoring"
    Write-Host "  .\deploy.ps1 -Backup           # Create backup only"
    Write-Host "  .\deploy.ps1 -Health           # Check application health"
    Write-Host "  .\deploy.ps1 -Help             # Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1"
    Write-Host "  .\deploy.ps1 -SSL"
    Write-Host "  .\deploy.ps1 -SSL -Monitoring"
    Write-Host "  .\deploy.ps1 -Backup"
    Write-Host "  .\deploy.ps1 -Health"
}

# Main deployment function
function Start-Deployment {
    Log-Message "Starting BIT CMS deployment on Windows..."
    
    Test-Docker
    Test-Environment
    
    if ($Backup) {
        Backup-Data
        return
    }
    
    if ($Health) {
        Test-Health
        return
    }
    
    Backup-Data
    Deploy-Application
    Test-Health
    Setup-SSL
    Setup-Monitoring
    
    Log-Success "Deployment completed successfully!"
    Log-Message "Application is available at http://localhost:5000"
    Log-Message "API documentation: http://localhost:5000/api/docs"
    Log-Message "Health check: http://localhost:5000/health"
    Log-Message "Real-time stats: http://localhost:5000/api/stats/realtime"
    
    if ($Monitoring) {
        Log-Message "Monitoring dashboard: http://localhost:3001 (admin/admin123)"
        Log-Message "Prometheus metrics: http://localhost:9090"
    }
}

# Handle help request
if ($Help) {
    Show-Usage
    return
}

# Start deployment
try {
    Start-Deployment
}
catch {
    Log-Error "Deployment failed: $($_.Exception.Message)"
}
