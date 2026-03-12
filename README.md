# BIT CMS - Bhagwant Institute of Technology College Management System

A comprehensive College Management System built with modern web technologies for managing students, faculty, courses, attendance, fees, notices, and more.

## 🏗️ Architecture

### Backend (Server)
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Socket.io** for real-time updates
- **Multer** for file uploads

### Web Frontend
- **React 19** with **React Router**
- **Socket.io-client** for real-time features
- **CSS** with futuristic design theme

### Mobile App
- **React Native** with **TypeScript**
- **AsyncStorage** for local data persistence
- **Socket.io-client** for real-time updates

## 🚀 Features

### Authentication & Authorization
- Role-based access control (Admin, Faculty, Student)
- JWT authentication
- Secure API endpoints

### Core Modules
- **Notices**: Real-time notice board with categorization
- **Dashboard**: Role-specific dashboards with statistics
- **Attendance**: Track and manage student attendance
- **Timetable**: Class schedules and management
- **Fees**: Fee tracking and payment management
- **Library**: Book management and issue tracking
- **Exams**: Exam scheduling and results
- **Courses**: Course management and enrollment
- **Results**: Grade management and reporting

### Real-time Features
- Live notice updates via Socket.io
- Real-time attendance tracking
- Instant dashboard updates

## 📋 Prerequisites

- Node.js (v22.11.0 or higher)
- MongoDB (local or cloud instance)
- React Native CLI (for mobile development)
- Android Studio / Xcode (for mobile testing)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bit-cms
```

### 2. Backend Setup

```bash
cd server
npm install
```

#### Environment Variables
Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bit-cms
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
```

#### Database Setup
```bash
# Seed the database with sample data
npm run seed
```

#### Start Server
```bash
# Development
npm run dev

# Production
npm start
```

### 3. Web App Setup

```bash
cd client/web
npm install
```

#### Start Web App
```bash
npm start
```
The web app will be available at `http://localhost:3000`

### 4. Mobile App Setup

```bash
cd client/mobile
npm install
```

#### For iOS
```bash
npx react-native run-ios
```

#### For Android
```bash
npx react-native run-android
```

## 📱 Default Users

The system comes with pre-seeded users for testing:

### Admin
- Email: `admin@bit.edu`
- Password: `admin123`

### Faculty
- Email: `faculty@bit.edu`
- Password: `faculty123`

### Student
- Email: `student@bit.edu`
- Password: `student123`

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Notice Endpoints
- `GET /api/notices` - Get all notices (public)
- `POST /api/notices` - Create notice (admin/faculty only)
- `PUT /api/notices/:id` - Update notice (admin/faculty only)
- `DELETE /api/notices/:id` - Delete notice (admin only)

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics (authenticated)

## 🌐 Real-time Events

The system uses Socket.io for real-time updates:

### Client Events
- `new-notice` - New notice posted
- `attendance-updated` - Attendance records updated
- `timetable-updated` - Timetable changes
- `fee-updated` - Fee payment updates

## 🎨 UI/UX Theme

The application features a futuristic, cyberpunk-inspired design with:
- Dark color scheme (#0d0d1a, #1a1a2e)
- Neon blue accents (#00aaff)
- Glowing effects and animations
- Responsive design for all screen sizes

## 📁 Project Structure

```
bit-cms/
├── server/                 # Backend API
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── config/            # Database configuration
│   └── uploads/           # File upload directory
├── client/
│   ├── web/               # React web app
│   │   └── src/
│   │       ├── components/
│   │       └── context/
│   └── mobile/            # React Native app
│       └── src/
│           ├── components/
│           └── context/
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Password hashing with bcryptjs

## 🚀 Deployment

### Backend (Heroku/Render)
1. Set environment variables
2. Connect to MongoDB Atlas
3. Deploy the application

### Web App (Netlify/Vercel)
1. Build the React app
2. Deploy to static hosting
3. Configure environment variables

### Mobile App
1. Build for iOS/Android
2. Submit to App Store/Play Store
3. Configure production API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration

3. **Mobile App Build Issues**
   - Ensure React Native CLI is properly installed
   - Check Android/iOS development environment

4. **Socket.io Connection Issues**
   - Ensure server is running on correct port
   - Check CORS configuration

## 📞 Support

For support and queries, please contact:
- Email: support@bit.edu
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

---

**BIT CMS** - Empowering Education through Technology 🎓
