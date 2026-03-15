# BIT CMS - Bhagwant Institute of Technology College Management System

A comprehensive College Management System with PWA capabilities for managing students, faculty, courses, attendance, fees, notices, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (or use provided mock data)

### Installation
```bash
npm run setup:dev
```

### Start Development
```bash
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Login: Admin.bit / password

## 📱 PWA Features

### Installable App
- Desktop: Look for install icon (⬇) in browser
- Mobile: Add to home screen from browser menu

### PWA Testing
```bash
npm run pwa:test
```

### Custom Icons
```bash
npm run icon:setup
```

## 🛠️ Available Scripts

### Development
```bash
npm run dev              # Start development servers
npm run server           # Start backend only
npm run client           # Start frontend only
```

### Build & Deploy
```bash
npm run build            # Build frontend
npm run build:pwa        # Build PWA
npm run deploy:vercel    # Deploy to Vercel
npm run deploy:heroku    # Deploy to Heroku
```

### Testing & Quality
```bash
npm run test             # Run tests
npm run lint             # ESLint check
npm run pwa:audit        # Lighthouse PWA audit
```

### Database
```bash
npm run db:reset         # Reset database
npm run seed             # Seed initial data
```

## 🏗️ Architecture

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **Socket.io** for real-time updates
- **JWT** authentication
- **Security** with Helmet.js

### Frontend
- **React 19** with **React Router**
- **Progressive Web App** (PWA)
- **Socket.io-client** for real-time features
- **Responsive Design**

### Features
- **👥 User Management**: Students, Faculty, Admin
- **📚 Course Management**: Courses, Timetables
- **💰 Fee Management**: Fee tracking, payments
- **📢 Notice System**: Real-time notifications
- **📊 Dashboard**: Analytics and reports
- **📱 PWA**: Installable app, offline support

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:
```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
NODE_ENV=development
PORT=5000
```

### PWA Configuration
- **Manifest**: `client/web/public/manifest.json`
- **Service Worker**: `client/web/public/service-worker.js`
- **Icons**: Use `icon:setup` script

## 📦 Deployment

### Vercel (Recommended)
```bash
npm run deploy:vercel
```

### Heroku
```bash
npm run deploy:heroku
```

### Docker
```bash
npm run docker:build
npm run docker:run
```

## 🔒 Security

- **Content Security Policy** configured
- **Rate Limiting** enabled
- **Input Validation** implemented
- **HTTPS Ready** for production

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Real-time Stats
```bash
curl http://localhost:5000/api/stats/realtime
```

## 🎯 Support

### Quick Commands
```bash
# Start everything
npm run setup:dev

# Test PWA
npm run pwa:test

# Setup icons
npm run icon:setup

# Deploy
npm run deploy:vercel
```

## 📱 PWA Features

- **Installable**: Add to home screen
- **Offline Support**: Works without internet
- **App Shortcuts**: Quick access to features
- **Push Notifications**: Real-time updates
- **Background Sync**: Data synchronization
- **Custom Branding**: Your institution's identity

## 🎉 Success

Your BIT CMS is a complete, production-ready Progressive Web App with all modern features for college management.

---

**Built with ❤️ for Bhagwant Institute of Technology**
