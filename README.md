# Ilorin Innovation Hub - Digital Attendance Management System

A comprehensive digital attendance management system built for Ilorin Innovation Hub, featuring real-time location tracking, role-based access control, and professional user management.

## 🏗️ Project Structure

This project is organized into **server-side** and **client-side** components for better maintainability and scalability.

```
iih-hub/
├── 📁 client/                    # Frontend React application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API service layer
│   │   ├── config/              # Application configuration
│   │   ├── utils/               # Utility functions
│   │   ├── types/               # TypeScript type definitions
│   │   └── integrations/        # External service integrations
│   └── package.json
├── 📁 server/                   # Backend API server
│   ├── routes/                  # API route handlers
│   ├── middleware/              # Express middleware
│   ├── utils/                   # Server utility functions
│   └── package.json
├── 📁 supabase/                 # Database migrations and config
│   └── migrations/              # SQL migration files
└── 📄 README.md
```

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure sign-up, sign-in, and session management
- **Role-Based Access**: Support for Intern, Staff, and Admin roles
- **Location-Based Attendance**: GPS tracking with hub proximity validation
- **Real-Time Updates**: Live attendance status and notifications
- **Attendance History**: Comprehensive tracking and reporting
- **Admin Dashboard**: User management and analytics

### Technical Features
- **Modern Stack**: React 18, TypeScript, Vite, Supabase
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Error Handling**: Comprehensive error logging and user feedback
- **Security**: Row Level Security (RLS) and API key validation
- **Performance**: Optimized queries and caching strategies

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd iih-hub
```

### 2. Install Dependencies

#### Client-side
```bash
npm install
```

#### Server-side
```bash
cd server
npm install
```

### 3. Environment Configuration

#### Client Environment
Create `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001/api
VITE_API_KEY=your_api_key
VITE_ADMIN_ACCESS_CODE=IIH-ADMIN-2025
VITE_HUB_LATITUDE=8.4969
VITE_HUB_LONGITUDE=4.5421
VITE_HUB_NAME="Ilorin Innovation Hub"
```

#### Server Environment
Create `.env` file in the `server/` directory:
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
ADMIN_ACCESS_CODE=IIH-ADMIN-2025
HUB_LATITUDE=8.4969
HUB_LONGITUDE=4.5421
HUB_RADIUS_METERS=100
```

### 4. Database Setup

Run the database migrations in your Supabase project:
```bash
# Apply the comprehensive schema fix
supabase db push
```

### 5. Start the Application

#### Development Mode
```bash
# Start client (from root directory)
npm run dev

# Start server (from server directory)
cd server
npm run dev
```

#### Production Mode
```bash
# Build client
npm run build

# Start server
cd server
npm start
```

## 📱 Usage

### User Registration
1. Navigate to the registration page
2. Fill in your details (name, email, password)
3. Select your role (Intern, Staff, or Admin)
4. For Admin role, enter the access code: `IIH-ADMIN-2025`
5. Verify your email address

### Attendance Management
1. **Sign In**: 
   - Ensure you're within 100m of the hub
   - Click "Sign In" and allow location access
   - Your attendance is recorded with GPS coordinates

2. **Sign Out**:
   - Click "Sign Out" when leaving
   - Total hours are automatically calculated

### Admin Features
- View all user profiles and attendance records
- Approve/reject pending attendance requests
- Generate attendance reports
- Manage user roles and permissions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Attendance
- `POST /api/attendance/submit` - Submit attendance (sign in/out)
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/today` - Get today's attendance status

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

## 🗄️ Database Schema

### Tables
- **profiles**: User information and roles
- **attendance_records**: Daily attendance tracking
- **pending_sign_ins**: Approval workflow for attendance
- **error_logs**: System error logging

### Key Features
- **Row Level Security (RLS)**: Ensures users only access their own data
- **Automatic Triggers**: Profile creation and attendance calculations
- **Enum Types**: Structured role and status definitions
- **Indexes**: Optimized query performance

## 🔒 Security Features

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Location Validation**: GPS proximity verification
- **API Security**: Key-based authentication
- **Data Protection**: RLS policies and input validation

## 🐛 Troubleshooting

### Common Issues

1. **Location Access Denied**
   - Ensure browser has location permissions
   - Check if you're within the hub radius (100m)

2. **Authentication Errors**
   - Verify email confirmation
   - Check Supabase configuration
   - Ensure valid API keys

3. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Review RLS policies

### Debug Mode
Enable debug mode by setting `VITE_DEBUG_MODE=true` in your environment variables.

## 📊 Monitoring & Analytics

The system includes comprehensive error logging and user activity tracking:
- Real-time error monitoring
- User engagement metrics
- Attendance pattern analysis
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with HR systems
- [ ] Multi-location support
- [ ] Offline mode capability

---

**Built with ❤️ for Ilorin Innovation Hub**