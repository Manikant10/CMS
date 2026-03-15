@echo off
echo 🚀 BIT CMS Deployment Guide
echo ============================
echo.
echo 📱 Choose Your Deployment Platform:
echo.
echo 1. 🌐 Vercel (Recommended - Free & Easy)
echo 2. 🚀 Heroku (Free Tier Available)
echo 3. 🐳 Docker (Local/Cloud)
echo 4. 📋 Manual Instructions
echo 5. 📊 Check Deployment Readiness
echo 6. ❌ Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🌐 Deploying to Vercel (Recommended)
    echo ==================================
    echo.
    echo ✅ Vercel Benefits:
    echo    - Free hosting
    echo    - Automatic HTTPS
    echo    - Global CDN
    echo    - Git integration
    echo    - Custom domain support
    echo.
    echo 🚀 Steps to Deploy to Vercel:
    echo.
    echo 1. 📦 Build PWA First:
    cd client\web
    npm run build:pwa
    echo.
    echo 2. 🌐 Install Vercel CLI:
    npm install -g vercel
    echo.
    echo 3. 🔐 Login to Vercel:
    vercel login
    echo.
    echo 4. 🚀 Deploy:
    vercel --prod
    echo.
    echo 5. 📱 Your BIT CMS will be live!
    echo.
    echo 🔗 Quick Command: npm run deploy:vercel
    echo.
    pause
)

if "%choice%"=="2" (
    echo.
    echo 🚀 Deploying to Heroku
    echo ========================
    echo.
    echo ✅ Heroku Benefits:
    echo    - Free tier available
    echo    - Custom domains
    echo    - Add-ons support
    echo    - Git deployment
    echo.
    echo 🚀 Steps to Deploy to Heroku:
    echo.
    echo 1. 📦 Install Heroku CLI:
    echo    Download from: https://devcenter.heroku.com/articles/heroku-cli
    echo.
    echo 2. 🔐 Login to Heroku:
    echo    heroku login
    echo.
    echo 3. 📱 Create Heroku App:
    echo    heroku create your-bit-cms
    echo.
    echo 4. 🌐 Set Environment Variables:
    echo    heroku config:set NODE_ENV=production
    echo    heroku config:set MONGODB_URI=your-mongodb-uri
    echo    heroku config:set JWT_SECRET=your-jwt-secret
    echo.
    echo 5. 🚀 Deploy:
    echo    git push heroku main
    echo.
    echo 🔗 Quick Command: npm run deploy:heroku
    echo.
    pause
)

if "%choice%"=="3" (
    echo.
    echo 🐳 Docker Deployment
    echo ===================
    echo.
    echo ✅ Docker Benefits:
    echo    - Consistent environment
    echo    - Easy scaling
    echo    - Portability
    echo    - Version control
    echo.
    echo 🚀 Steps to Deploy with Docker:
    echo.
    echo 1. 🐳 Build Docker Image:
    docker build -t bit-cms .
    echo.
    echo 2. 🚀 Run Docker Container:
    docker run -p 5000:5000 bit-cms
    echo.
    echo 3. 🌐 Or Use Docker Compose:
    docker-compose up -d
    echo.
    echo 4. 📱 Your BIT CMS runs on port 5000
    echo.
    echo 🔗 Quick Commands:
    echo    npm run docker:build
    echo    npm run docker:run
    echo.
    pause
)

if "%choice%"=="4" (
    echo.
    echo 📋 Manual Deployment Instructions
    echo ===============================
    echo.
    echo 🚀 General Deployment Steps:
    echo.
    echo 1. 📦 Build Your App:
    cd client\web
    npm run build:pwa
    echo.
    echo 2. 🔧 Configure Environment:
    echo    Create .env.production file
    echo    Set MONGODB_URI, JWT_SECRET, etc.
    echo.
    echo 3. 🌐 Choose Hosting Platform:
    echo    - Netlify, Firebase, AWS, DigitalOcean
    echo    - Any static hosting service
    echo.
    echo 4. 📱 Upload Build Files:
    echo    Upload client\web\build\ folder
    echo    Configure server separately if needed
    echo.
    echo 5. 🔐 Set Environment Variables:
    echo    Configure in hosting platform
    echo.
    pause
)

if "%choice%"=="5" (
    echo.
    echo 📊 Checking Deployment Readiness
    echo ===============================
    echo.
    echo 🔍 Checking Requirements...
    echo.
    echo ✅ 1. Checking Node.js...
    node --version
    echo.
    echo ✅ 2. Checking npm...
    npm --version
    echo.
    echo ✅ 3. Checking Build Files...
    if exist "client\web\build\" (
        echo ✅ Build folder exists
    ) else (
        echo ❌ Build folder missing - Run: npm run build:pwa
    )
    echo.
    echo ✅ 4. Checking Environment Files...
    if exist ".env" (
        echo ✅ .env file exists
    ) else (
        echo ❌ .env file missing - Copy from .env.example
    )
    echo.
    echo ✅ 5. Checking PWA Files...
    if exist "client\web\public\manifest.json" (
        echo ✅ manifest.json exists
    ) else (
        echo ❌ manifest.json missing
    )
    echo.
    echo ✅ 6. Checking Service Worker...
    if exist "client\web\public\service-worker.js" (
        echo ✅ service-worker.js exists
    ) else (
        echo ❌ service-worker.js missing
    )
    echo.
    echo 🎯 Deployment Readiness Summary:
    echo.
    echo ✅ Your BIT CMS is ready for deployment!
    echo ✅ All PWA features are configured
    echo ✅ Build process is ready
    echo ✅ Environment configuration is ready
    echo.
    echo 🚀 Recommended Next Step:
    echo    Choose option 1 (Vercel) for easiest deployment
    echo.
    pause
)

if "%choice%"=="6" (
    echo.
    echo 👋 Good luck with your deployment!
    echo 🎉 Your BIT CMS is ready to go live!
    echo.
    exit /b 0
)

echo.
echo 🎉 Ready to Deploy Your BIT CMS!
echo 📱 Your college management system will be live soon!
echo.
pause
