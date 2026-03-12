# BIT CMS Production Deployment Script for Windows

Write-Host "🚀 BIT CMS Production Deployment Script" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
New-Item -ItemType Directory -Force -Path "ssl" | Out-Null
New-Item -ItemType Directory -Force -Path "uploads" | Out-Null

# Build and start containers
Write-Host "🐳 Building and starting containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for containers to start
Write-Host "⏳ Waiting for containers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check container status
Write-Host "📊 Checking container status..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# Initialize database
Write-Host "🗄️ Initializing database..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.prod.yml exec mongo mongo bit_cms --eval "db.createCollection('test')" | Out-Null
    Write-Host "✅ Database initialized" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Database initialization may need manual verification" -ForegroundColor Yellow
}

# Show logs
Write-Host "📋 Showing recent logs..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml logs --tail=50

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   Health Check: http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Default login credentials:" -ForegroundColor Cyan
Write-Host "   Admin: Admin.bit / Bitadmin@1122" -ForegroundColor White
Write-Host "   Faculty: faculty@bit.edu / faculty123" -ForegroundColor White
Write-Host "   Student: student@bit.edu / student123" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Change default passwords" -ForegroundColor White
Write-Host "   2. Update yourdomain.com in configuration files" -ForegroundColor White
Write-Host "   3. Set up SSL certificate" -ForegroundColor White
Write-Host "   4. Configure email settings" -ForegroundColor White
