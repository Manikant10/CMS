@echo off
echo 🎨 Convert Your New Image to BIT CMS App Icon
echo ==========================================
echo.
echo 📱 I see you've uploaded a new image! Let's convert it.
echo.
echo 🎯 Easy Steps:
echo.
echo 1. 🌐 Icon converter should be open (or double-click: open-icon-converter.bat)
echo 2. 📸 Upload your NEW image (the one you just uploaded)
echo 3. 📦 Download all 4 icon sizes
echo 4. 🔄 Replace files in client\web\public\
echo.
echo 📁 Files to Replace:
echo    - bit-cms-icon-512.png (your new image 512x512)
echo    - bit-cms-icon-192.png (your new image 192x192)
echo    - apple-touch-icon.png (your new image 180x180)
echo    - favicon.ico (your new image 32x32)
echo.
echo 🚀 After Replacing Icons:
echo    1. Restart BIT CMS server
echo    2. Clear browser cache (Ctrl+F5)
echo    3. Test PWA installation
echo    4. Enjoy your NEW custom BIT CMS icons!
echo.
echo 🎯 Let's make sure the icon converter is open...
echo.
if exist "open-icon-converter.bat" (
    start open-icon-converter.bat
    echo ✅ Icon converter opened!
) else (
    echo ❌ Icon converter not found. Please check the file.
)
echo.
echo ✨ Your BIT CMS will have your NEW image as the app icon!
echo.
pause
