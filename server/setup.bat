@echo off
echo BIT CMS Setup Script
echo ====================

echo.
echo Installing MongoDB Community Server...
echo Please download and install MongoDB from: https://www.mongodb.com/try/download/community
echo After installation, MongoDB will be available at: C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe
echo.

echo Installing server dependencies...
cd server
call npm install

echo.
echo Installing web app dependencies...
cd ..\client\web
call npm install

echo.
echo Installing mobile app dependencies...
cd ..\mobile
call npm install

echo.
echo Setup completed!
echo.
echo Next steps:
echo 1. Start MongoDB service (if installed)
echo 2. Run 'npm run seed' in server directory to populate database
echo 3. Start server with 'npm start' in server directory
echo 4. Start web app with 'npm start' in client/web directory
echo 5. Start mobile app with 'npm start' in client/mobile directory
echo.

pause
