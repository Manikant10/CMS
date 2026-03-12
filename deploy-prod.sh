#!/bin/bash

echo "🚀 BIT CMS Production Deployment Script"
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p ssl
mkdir -p uploads

# Build and start containers
echo "🐳 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 30

# Check container status
echo "📊 Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Initialize database
echo "🗄️ Initializing database..."
docker-compose -f docker-compose.prod.yml exec mongo mongo bit_cms --eval "db.createCollection('test')"

# Show logs
echo "📋 Showing recent logs..."
docker-compose -f docker-compose.prod.yml logs --tail=50

echo "✅ Deployment completed!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/api/health"
echo ""
echo "🔐 Default login credentials:"
echo "   Admin: Admin.bit / Bitadmin@1122"
echo "   Faculty: faculty@bit.edu / faculty123"
echo "   Student: student@bit.edu / student123"
echo ""
echo "📝 Next steps:"
echo "   1. Change default passwords"
echo "   2. Update yourdomain.com in configuration files"
echo "   3. Set up SSL certificate"
echo "   4. Configure email settings"
