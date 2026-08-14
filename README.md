# Assignment Submission System

A comprehensive full-stack web application for managing assignment submissions in educational institutions. Built with .NET 8 backend API and React frontend, featuring role-based access control for Admins, Teachers, and Students.

## 🎯 Project Overview

This system provides a complete platform for:
- **Admins**: Manage users (create, update, delete), manage classes and subjects
- **Teachers**: Create and publish assignments, review student submissions, provide grades and feedback
- **Students**: View assignments, submit work before deadlines, edit submissions, receive grades and feedback

## 🛠 Technology Stack

### Backend
- **.NET 8** - Web Framework
- **PostgreSQL** - Relational Database
- **Entity Framework Core 8** - ORM
- **JWT (JSON Web Tokens)** - Authentication
- **ASP.NET Core** - REST API

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Development Server
- **Axios** - HTTP Client
- **React Router** - Navigation
- **Context API** - State Management

### Testing
- **xUnit** - Unit Testing Framework (.NET)
- **Moq** - Mocking Framework

## 📁 Project Structure

```
AssignmentSubmissionSystem/
├── AssignmentSubmissionSystem.Api/              # Backend API (.NET 8)
│   ├── Controllers/                             # API endpoints
│   │   ├── AuthController.cs                    # Login, register
│   │   ├── UsersController.cs                   # User management (Admin)
│   │   ├── ClassCoursesController.cs            # Class management (Admin)
│   │   ├── SubjectsController.cs                # Subject management (Admin)
│   │   ├── AssignmentsController.cs             # Assignment CRUD (Teacher)
│   │   ├── SubmissionsController.cs             # Submissions (Student/Teacher)
│   │   ├── GradingController.cs                 # Grading (Teacher)
│   │   └── TeachersController.cs                # Teacher assignment
│   ├── Models/
│   │   ├── Entities/                            # Database entities
│   │   │   ├── User.cs
│   │   │   ├── Assignment.cs
│   │   │   ├── Submission.cs
│   │   │   ├── ClassCourse.cs
│   │   │   ├── StudentEnrollment.cs
│   │   │   ├── TeacherAssignment.cs
│   │   │   ├── Subject.cs
│   │   │   └── ApplicationDbContext.cs          # DbContext
│   │   ├── Dtos/                                # Data Transfer Objects
│   │   └── Enums/                               # Enumerations (UserRole, etc.)
│   ├── Services/                                # Business Logic
│   │   ├── UserService.cs
│   │   ├── AssignmentService.cs
│   │   ├── SubmissionService.cs
│   │   ├── GradingService.cs
│   │   ├── JwtTokenService.cs
│   │   ├── PasswordHashingService.cs
│   │   └── DataSeeder.cs                        # Seed sample data
│   ├── Middleware/                              # Custom middleware
│   ├── Migrations/                              # EF Core migrations
│   ├── Properties/launchSettings.json           # Launch configuration
│   ├── appsettings.json                         # Configuration
│   ├── appsettings.Development.json             # Dev configuration
│   ├── Program.cs                               # Startup configuration
│   └── AssignmentSubmissionSystem.Api.csproj    # Project file
│
├── AssignmentSubmissionSystem.Api.Tests/        # Backend Tests (xUnit)
│   └── Tests for controllers and services
│
├── AssignmentSubmissionSystem.React/            # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/                          # React components
│   │   ├── pages/                               # Page components
│   │   ├── services/                            # API client services
│   │   ├── context/                             # React Context (Auth, etc.)
│   │   ├── types/                               # TypeScript types/interfaces
│   │   ├── App.tsx                              # Root component
│   │   └── main.tsx                             # Entry point
│   ├── public/                                  # Static assets
│   ├── package.json                             # Dependencies
│   ├── vite.config.ts                           # Vite configuration
│   ├── tsconfig.json                            # TypeScript configuration
│   └── .env.example                             # Environment template
│
├── README.md                                     # This file
├── SUBMISSION.md                                # Submission details
└── .env.example                                 # Backend environment template
```

## 🚀 Setup Instructions

### Prerequisites
- **.NET 8 SDK** (https://dotnet.microsoft.com/download)
- **PostgreSQL 12+** (https://www.postgresql.org/download/)
- **Node.js 18+** (https://nodejs.org/)
- **npm or yarn** (comes with Node.js)
- **Git** (https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/sojeebroy/AssignmentSubmissionManager.git
cd AssignmentSubmissionManager
```

### 2. Backend Setup (.NET API)

#### Step 1: Configure Database Connection
```bash
cd AssignmentSubmissionSystem.Api

# Copy environment template
cp .env.example .env  # (Windows: copy .env.example .env)

# Edit .env with your PostgreSQL credentials
# Or edit appsettings.json directly
```

#### Step 2: Update `appsettings.json`

Set your PostgreSQL connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=AssignmentSubmissionSystem;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

#### Step 3: Restore Dependencies & Apply Migrations
```bash
# Restore NuGet packages
dotnet restore

# Apply database migrations (creates tables and seeds data)
dotnet ef database update

# Or run migrations explicitly
# dotnet ef migrations add InitialMigration
# dotnet ef database update
```

#### Step 4: Run the API
```bash
dotnet run

# API will be available at: https://localhost:7013
# Swagger UI: https://localhost:7013/swagger
```

### 3. Frontend Setup (React)

#### Step 1: Install Dependencies
```bash
cd ../AssignmentSubmissionSystem.React

npm install
```

#### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# .env file should contain:
# VITE_API_BASE_URL=https://localhost:7013
# VITE_APP_NAME=Assignment Submission System
# VITE_API_TIMEOUT=10000
```

#### Step 3: Start Development Server
```bash
npm run dev

# Frontend will be available at: http://localhost:5173
```

### 4. Access the Application

1. Open browser to **http://localhost:5173**
2. Use demo credentials (see below)
3. Login and explore features

## 🗄️ Database Setup

### Automatic Setup (Recommended)
The database is automatically created and seeded when the API starts. Entity Framework Core migrations are applied automatically.

### Manual Setup (If Needed)
```bash
cd AssignmentSubmissionSystem.Api

# Create database and apply migrations
dotnet ef database update

# Or create from scratch
dotnet ef database drop --force
dotnet ef database update
```

### Seed Data
Sample data includes:
- 1 Admin account
- 2 Teacher accounts
- 3 Student accounts
- 2 Subjects (Mathematics, Biology)
- 2 Classes (Grade 10 Math, Grade 10 Biology)
- Sample assignments and submissions

See `DataSeeder.cs` for details.

## 👤 Demo Credentials

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `Admin@123`

### Teacher Account
- **Email**: `teacher1@example.com`
- **Password**: `Teacher@123`

### Student Account
- **Email**: `student1@example.com`
- **Password**: `Student@123`

**Additional Test Users** (password same: `Teacher@123` or `Student@123`)
- `teacher2@example.com`
- `student2@example.com`
- `student3@example.com`

## 🧪 Running Tests

### Backend Tests (xUnit)
```bash
cd AssignmentSubmissionSystem.Api.Tests

# Run all tests
dotnet test

# Run specific test class
dotnet test --filter "ClassName=TestClassName"

# Run with verbose output
dotnet test -v detailed
```

### Test Coverage
Tests include:
- Authentication and authorization
- User CRUD operations
- Assignment creation and management
- Submission handling
- Grading functionality

## 🔒 Environment Configuration

### Backend (.env / appsettings.json)

**DO NOT commit real credentials!** Use `.env.example` as template:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
POSTGRES_DB=AssignmentSubmissionSystem

JWT_SECRET=your-super-secret-key-min-32-characters-for-hs256
JWT_ISSUER=AssignmentSubmissionSystem
JWT_AUDIENCE=AssignmentSubmissionSystemUsers
JWT_EXPIRY_MINUTES=60
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)

```
VITE_API_BASE_URL=https://localhost:7013
VITE_APP_NAME=Assignment Submission System
VITE_API_TIMEOUT=10000
```

## 📋 Features

### Admin Dashboard
- ✅ User Management (Create, Update, Delete, Activate/Deactivate)
- ✅ Class Management (Create, Edit, Delete classes)
- ✅ Subject Management (Create, Edit, Delete subjects)
- ✅ Assign teachers to classes
- ✅ Enroll students in classes

### Teacher Portal
- ✅ Create assignments
- ✅ Edit/Delete unpublished assignments
- ✅ Publish assignments
- ✅ View student submissions
- ✅ Grade submissions
- ✅ Provide feedback
- ✅ Update grades

### Student Portal
- ✅ View available assignments
- ✅ Submit assignments before deadline
- ✅ Edit submissions (before deadline)
- ✅ View submission status
- ✅ View grades and feedback
- ✅ Download assignment details

## 📚 API Documentation

### Swagger UI
Visit `https://localhost:7013/swagger` after starting the API to explore endpoints interactively.

### Main Endpoints

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

#### Users (Admin)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

#### Assignments (Teacher)
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/{id}` - Update assignment
- `DELETE /api/assignments/{id}` - Delete assignment
- `POST /api/assignments/{id}/publish` - Publish assignment

#### Submissions (Student/Teacher)
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Submit assignment
- `PUT /api/submissions/{id}` - Update submission
- `GET /api/submissions/{id}` - Get submission

#### Grading (Teacher)
- `POST /api/grading/submit-grade` - Submit grade
- `GET /api/grading/submissions/{assignmentId}` - Get all submissions for assignment

## 🔐 Authentication & Authorization

### JWT Token Flow
1. User logs in via `/api/auth/login`
2. Backend returns JWT token
3. Client stores token in localStorage
4. Client includes token in `Authorization: Bearer <token>` header
5. Backend validates token and checks user role

### Role-Based Access Control
- **Admin**: Full system access
- **Teacher**: Can manage assignments and grade submissions
- **Student**: Can view assignments and submit work

## ⚙️ Configuration Details

### JWT Settings (appsettings.json)
```json
{
  "JwtSettings": {
    "Secret": "your-super-secret-key-min-32-characters-for-hs256",
    "Issuer": "AssignmentSubmissionSystem",
    "Audience": "AssignmentSubmissionSystemUsers",
    "ExpiryMinutes": 60
  }
}
```

### CORS Configuration
Frontend URLs are whitelisted in `AllowedOrigins`:
- `http://localhost:3000`
- `http://localhost:5173`

Modify `appsettings.json` to add more origins.

## 🐛 Troubleshooting

### Issue: Database Connection Error
**Solution**: Verify PostgreSQL is running and connection string is correct.
```bash
# Test PostgreSQL connection
psql -h localhost -U postgres
```

### Issue: CORS Error
**Solution**: Ensure frontend URL is in `AllowedOrigins` in `appsettings.json`.

### Issue: API not starting
**Solution**: Check logs in Visual Studio Output window. Ensure port 7013 is available.

### Issue: Frontend can't connect to API
**Solution**: Verify `VITE_API_BASE_URL` in `.env` matches API URL (usually https://localhost:7013).

## 📝 Assumptions & Limitations

### Assumptions
1. PostgreSQL is installed and running on the local machine
2. .NET 8 SDK is installed
3. Node.js 18+ is installed
4. Ports 7013 (API) and 5173 (Frontend) are available
5. Users have appropriate file permissions to create databases
6. JWT secret is kept secure and not exposed in version control

### Known Limitations
1. **File Upload**: Assignments don't support file attachments yet (text-based only)
2. **Notifications**: No email notifications system implemented
3. **Real-time**: No WebSocket/SignalR for real-time updates
4. **Pagination**: Some lists may not have pagination for large datasets
5. **Localization**: Single language support (English)
6. **Mobile**: Not optimized for mobile devices yet
7. **Search**: Limited search functionality
8. **Deployment**: Frontend and backend must run on same HTTPS domain in production

### Security Considerations
1. Always use HTTPS in production
2. Rotate JWT secret regularly
3. Use environment variables for sensitive data
4. Implement rate limiting for production
5. Add HTTPS certificate validation
6. Consider adding two-factor authentication
7. Implement audit logging for compliance

## 📦 Dependencies

### Backend NuGet Packages
- EntityFrameworkCore (v8.0.x)
- EntityFrameworkCore.Design
- EntityFrameworkCore.Tools
- EntityFrameworkCore.Npgsql
- System.IdentityModel.Tokens.Jwt
- Npgsql
- BCrypt.Net-Next

### Frontend npm Packages
- react@^18.x
- typescript@^5.x
- axios
- react-router-dom
- vite@latest

See `package.json` and `.csproj` files for complete lists.

## 🤝 Contributing

This is a student project. For questions or issues, refer to the original repository or documentation.

## 📄 License

This project is provided as-is for educational purposes.

## 🔗 Links

- **Repository**: https://github.com/sojeebroy/AssignmentSubmissionManager
- **Issues**: https://github.com/sojeebroy/AssignmentSubmissionManager/issues

---

**Last Updated**: December 2024  
**Status**: Completed (M0-M9)  
**Built With**: .NET 8, PostgreSQL, React, TypeScript

