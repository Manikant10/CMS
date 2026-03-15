@echo off
echo 🚀 BIT CMS v2.0.0 - Quick Start
echo ===============================
echo.
echo 📱 Enhanced Features:
echo ✅ Progressive Web App (PWA)
echo ✅ Custom Icon Support
echo ✅ Advanced Security
echo ✅ Real-time Features
echo ✅ Performance Optimizations
echo.
echo 🔧 Quick Start Options:
echo.
echo 1. Start Development Servers
echo 2. Setup PWA Icons
echo 3. Run Tests
echo 4. Build PWA
echo 5. Deploy to Production
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Starting Development Servers...
    echo.
    echo Starting Backend Server...
    start "BIT CMS Backend" cmd /k "cd server && node index.js"
    echo.
    echo Starting Frontend Server...
    timeout /t 3 /nobreak > nul
    start "BIT CMS Frontend" cmd /k "cd client\web && npm start"
    echo.
    echo ✅ Both servers started!
    echo 📊 Backend: http://localhost:5000
    echo 🌐 Frontend: http://localhost:3000
    echo 📱 Health Check: http://localhost:5000/health
    echo.
    echo 🎯 BIT CMS v2.0.0 is running!
    pause
)

if "%choice%"=="2" (
    echo.
    echo 🎨 Setting up PWA Icons...
    echo.
    echo Opening Icon Converter Tool...
    echo.
    echo Instructions:
    echo 1. Upload your BIT image
    echo 2. Download generated icons
    echo 3. Replace files in client\web\public\
    echo 4. Restart servers to see new icons
    echo.
    start open-icon-converter.bat
    pause
)

if "%choice%"=="3" (
    echo.
    echo 🧪 Running Tests...
    echo.
    cd client\web
    npm test
    pause
)

if "%choice%"=="4" (
    echo.
    echo 📦 Building PWA...
    echo.
    cd client\web
    npm run build:pwa
    echo.
    echo ✅ PWA Build Complete!
    echo 📁 Check client\web\build\ folder
    pause
)

if "%choice%"=="5" (
    echo.
    echo 🚀 Deploying to Production...
    echo.
    echo Deployment Options:
    echo 1. Vercel (Recommended)
    echo 2. Heroku
    echo 3. Docker
    echo.
    set /p deploy="Choose deployment platform (1-3): "
    
    if "%deploy%"=="1" (
        echo.
        echo 🚀 Deploying to Vercel...
        npm run deploy:vercel
    )
    
    if "%deploy%"=="2" (
        echo.
        echo 🚀 Deploying to Heroku...
        npm run deploy:heroku
    )
    
    if "%deploy%"=="3" (
        echo.
        echo 🐳 Deploying with Docker...
        npm run deploy:docker
    )
    
    pause
)

if "%choice%"=="6" (
    echo.
    echo 👋 Goodbye!
    exit /b 0
)

echo.
echo 🎉 BIT CMS v2.0.0 - Complete!
echo 📚 For more options, run: npm run
echo 📖 Documentation: UPDATE_SUMMARY_V2.md
echo.
pause
