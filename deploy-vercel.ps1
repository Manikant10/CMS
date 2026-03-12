# BIT CMS Vercel Deployment Script for Windows

Write-Host "🚀 BIT CMS Vercel Deployment Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - BIT CMS ready for deployment"
}

# Check if remote is set
try {
    $remoteUrl = git remote get-url origin 2>$null
    if (-not $remoteUrl) {
        throw "No remote found"
    }
} catch {
    Write-Host "📦 Please set up GitHub repository first:" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com and create a new repository" -ForegroundColor White
    Write-Host "2. Run: git remote add origin https://github.com/yourusername/bit-cms.git" -ForegroundColor White
    Write-Host "3. Run: git push -u origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Deploying to Vercel..." -ForegroundColor Yellow

# Deploy to Vercel
vercel --prod

Write-Host ""
Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up MongoDB Atlas: https://www.mongodb.com/atlas" -ForegroundColor White
Write-Host "2. Add environment variables in Vercel dashboard:" -ForegroundColor White
Write-Host "   - MONGODB_URI: your-mongodb-connection-string" -ForegroundColor White
Write-Host "   - JWT_SECRET: your-jwt-secret-key" -ForegroundColor White
Write-Host "   - NODE_ENV: production" -ForegroundColor White
Write-Host "   - CORS_ORIGIN: https://your-app-name.vercel.app" -ForegroundColor White
Write-Host "3. Test your application at the provided URL" -ForegroundColor White
Write-Host "4. Change default admin password" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your app will be available at: https://your-app-name.vercel.app" -ForegroundColor Cyan
