#!/bin/bash

echo "🚀 BIT CMS Vercel Deployment Script"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - BIT CMS ready for deployment"
fi

# Check if remote is set
if ! git remote get-url origin 2>/dev/null; then
    echo "📦 Please set up GitHub repository first:"
    echo "1. Go to https://github.com and create a new repository"
    echo "2. Run: git remote add origin https://github.com/yourusername/bit-cms.git"
    echo "3. Run: git push -u origin main"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "📦 Deploying to Vercel..."

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up MongoDB Atlas: https://www.mongodb.com/atlas"
echo "2. Add environment variables in Vercel dashboard:"
echo "   - MONGODB_URI: your-mongodb-connection-string"
echo "   - JWT_SECRET: your-jwt-secret-key"
echo "   - NODE_ENV: production"
echo "   - CORS_ORIGIN: https://your-app-name.vercel.app"
echo "3. Test your application at the provided URL"
echo "4. Change default admin password"
echo ""
echo "🌐 Your app will be available at: https://your-app-name.vercel.app"
