@echo off
echo 🚀 DEPLOY BIT CMS NOW
echo ===================
echo.
echo ✅ You're logged into Vercel!
echo ✅ Build is ready!
echo ✅ PWA is configured!
echo.
echo 🌐 Deploying to Vercel...
echo.
cd client\web
echo 📦 Running deployment command...
vercel --prod
echo.
echo 🎉 If deployment completes:
echo    - Your BIT CMS will be live!
echo    - You'll get a URL like: https://bit-cms-xxx.vercel.app
echo    - PWA features will work immediately
echo    - Share the URL with students and faculty
echo.
echo 📱 After deployment:
echo    1. Visit your new BIT CMS URL
echo    2. Look for install icon (⬇) in browser
echo    3. Install PWA on desktop/mobile
echo    4. Test all features
echo.
echo 🔧 If you need to cancel:
echo    Press Ctrl+C and run this script again
echo.
echo 🚀 Your college management system goes live!
echo.
pause
