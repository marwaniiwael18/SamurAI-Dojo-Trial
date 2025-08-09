# SamurAI Dojo - Corporate Authentication & AI Profiling Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-green.svg)](https://www.mongodb.com/)

## 🏯 Overview

SamurAI Dojo is an intelligent security platform designed for corporate professionals. It features sophisticated authentication, AI-powered company detection, smart profiling wizards, and collaborative workspace management with role-based access control.

### 🎯 Key Features

- **Corporate Authentication** - OAuth integration with corporate email validation
- **AI Company Detection** - Intelligent industry classification and company context
- **Smart Profiling Wizard** - AI-powered suggestions for security professionals
- **Workspace Management** - Team collaboration with granular RBAC permissions
- **Real-time Validation** - Corporate email domain verification
- **Progressive Enhancement** - Mobile-first responsive design

## 🏗️ Architecture

```
SamurAI-Dojo-Trial/
├── backend/                 # Node.js + Express + MongoDB
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, validation, error handling
│   ├── utils/              # Helpers, email, logging
│   └── server.js           # Main server file
│
├── frontend/               # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── services/       # API clients
│   │   ├── store/          # Zustand state management
│   │   └── utils/          # Frontend utilities
│   └── public/             # Static assets
│
└── docs/                   # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ 
- **MongoDB** v6+ (or MongoDB Atlas)
- **Redis** (for sessions, optional in development)
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd SamurAI-Dojo-Trial
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables
nano .env
```

#### Essential Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/samurai-dojo

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OAuth (Optional for MVP)
OKTA_CLIENT_ID=your-okta-client-id
LINKEDIN_CLIENT_ID=your-linkedin-client-id
GITHUB_CLIENT_ID=your-github-client-id
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Start Backend

```bash
cd ../backend

# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🎨 Figma Integration

SamurAI Dojo includes Figma Dev Mode MCP Server integration for seamless design-to-code workflow:

### Quick Setup
```bash
# Test MCP server connection
./test-mcp.sh

# Manual setup if needed
./setup.sh
```

### Features
- **Automated Code Generation**: Convert Figma designs to React components
- **Design System Rules**: Custom rules ensure consistent SamurAI Dojo styling
- **Real-time Integration**: Generate code directly in VS Code from Figma selections

### Setup Instructions
1. **Download [Figma Desktop App](https://www.figma.com/downloads/)**
2. **Enable "Dev Mode MCP Server"** in Figma → Preferences
3. **Follow detailed guide** in `FIGMA_SETUP.md`
4. **Test in VS Code**: `⌥⌘B` → Agent mode → type `#get_code`

### Configuration Files
- ✅ `.vscode/settings.json` - VS Code MCP settings
- ✅ `mcp.json` - MCP server configuration  
- ✅ `rules/figma-dev-mode-rules.md` - Design system rules
- ✅ `FIGMA_SETUP.md` - Complete setup guide

## 📊 Database Schema

### Core Collections

#### Users
```javascript
{
  email: String,              // Corporate email (validated)
  password: String,           // Hashed password
  firstName: String,
  lastName: String,
  emailDomain: String,        // Auto-extracted domain
  isCorporateEmail: Boolean,  // Auto-validated
  oktaUserId: String,         // OAuth integration
  oauthProvider: String,      // 'okta', 'linkedin', 'github'
  mfaEnabled: Boolean,
  emailVerified: Boolean,
  isActive: Boolean
}
```

#### UserProfiles
```javascript
{
  userId: ObjectId,
  companyName: String,        // AI-detected company
  companyIndustry: String,    // AI-classified industry
  aiConfidence: Number,       // 0.00-1.00 confidence score
  jobTitle: String,
  department: String,
  seniorityLevel: String,     // 'junior', 'mid', 'senior', 'executive'
  industry: String,
  complianceRequirements: [String], // ['HIPAA', 'SOC2', 'GDPR']
  securityFocus: String,
  profileCompleteness: Number, // 0-100%
  isProfileComplete: Boolean   // >= 80% required for workspace creation
}
```

#### Workspaces
```javascript
{
  name: String,
  description: String,
  domain: String,             // Corporate domain for invites
  type: String,              // 'personal', 'team', 'enterprise'
  createdBy: ObjectId,
  settings: {
    visibility: String,       // 'private', 'domain', 'public'
    allowInvites: Boolean,
    maxMembers: Number
  }
}
```

#### WorkspaceMembers
```javascript
{
  workspaceId: ObjectId,
  userId: ObjectId,
  role: String,              // 'creator', 'admin', 'manager', 'member', 'viewer'
  permissions: {
    manageWorkspace: Boolean,
    inviteMembers: Boolean,
    createProjects: Boolean,
    editAllProjects: Boolean,
    advancedAnalytics: Boolean,
    exportData: Boolean
  },
  status: String,            // 'pending', 'active', 'suspended'
  joinedAt: Date
}
```

## 🔐 Authentication Flow

### 1. Registration Process
```
User Registration → Corporate Email Validation → AI Company Detection → 
Email Verification → Profile Creation → Personal Workspace Setup
```

### 2. Login Process
```
Login Attempt → Account Lock Check → Password Verification → 
JWT Token Generation → Profile & Workspace Loading → Dashboard Access
```

### 3. Corporate Email Validation
- **Blocked Domains**: Gmail, Yahoo, Outlook, academic domains (.edu, .ac.uk)
- **Real-time Validation**: Domain checking during form input
- **AI Company Detection**: Automatic company name and industry detection

## 🧠 AI Intelligence Features

### Company Detection
```javascript
// Example AI detection flow
const detectCompany = async (emailDomain) => {
  // 1. Database lookup for known companies
  const knownCompany = await Company.findByDomain(emailDomain)
  
  if (knownCompany) {
    return { 
      found: true, 
      company: knownCompany, 
      confidence: knownCompany.aiConfidence 
    }
  }
  
  // 2. AI-powered domain analysis
  const aiDetection = await performAIDetection(emailDomain)
  return aiDetection
}
```

### Smart Profiling Suggestions
- **Industry-specific Job Titles**: Auto-complete based on detected industry
- **Compliance Framework Suggestions**: Automatic recommendations (HIPAA for healthcare, SOX for finance)
- **Security Focus Areas**: Role and industry-based suggestions

## 🛡️ Security Features

### Authentication Security
- **Password Requirements**: 8+ chars, uppercase, lowercase, number, special character
- **Account Locking**: 5 failed attempts = 2-hour lock
- **JWT Tokens**: Access (7 days) + Refresh (30 days) token system
- **Session Management**: Redis-based sessions with httpOnly cookies

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for specific origins
- **Helmet.js**: Security headers for XSS, CSRF protection
- **Input Validation**: Express-validator for all inputs
- **MongoDB Injection**: Mongoose sanitization

### Data Protection
- **Password Hashing**: bcryptjs with 12 rounds
- **Email Encryption**: Verification tokens with SHA-256
- **Environment Isolation**: Separate configs for dev/prod
- **Audit Logging**: Winston-based comprehensive logging

## 🎨 Frontend Architecture

### Technology Stack
- **React 18**: Modern hooks and concurrent features
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling with custom design system
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **React Router v6**: Client-side routing
- **React Hook Form**: Form handling with validation

### State Management (Zustand)
```javascript
const useAuthStore = create((set, get) => ({
  // State
  user: null,
  profile: null,
  workspaces: [],
  isAuthenticated: false,
  
  // Actions
  login: async (credentials) => { /* login logic */ },
  logout: () => { /* logout logic */ },
  updateProfile: (data) => { /* profile updates */ }
}))
```

### Design System
- **Primary Colors**: Blue gradient (#0ea5e9 to #0284c7)
- **Samurai Theme**: Red accents (#ef4444 to #dc2626)
- **Typography**: Inter (body) + Lexend (headings)
- **Components**: Reusable UI components with variants
- **Responsive**: Mobile-first approach with Tailwind breakpoints

## 🚦 API Endpoints

### Authentication Routes
```
POST   /api/auth/register           # User registration
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
POST   /api/auth/refresh-token      # Refresh JWT token
GET    /api/auth/verify-email/:token # Email verification
POST   /api/auth/forgot-password    # Password reset request
PATCH  /api/auth/reset-password/:token # Password reset
GET    /api/auth/me                 # Get current user
PATCH  /api/auth/update-password    # Update password
```

### Profile Routes
```
GET    /api/profiles/current        # Get user profile
PUT    /api/profiles/current        # Update user profile
GET    /api/profiles/job-titles     # Job title suggestions
GET    /api/profiles/compliance     # Compliance frameworks
```

### Workspace Routes
```
GET    /api/workspaces              # Get user workspaces
POST   /api/workspaces              # Create workspace
GET    /api/workspaces/:id          # Get workspace details
PUT    /api/workspaces/:id          # Update workspace
DELETE /api/workspaces/:id          # Delete workspace
POST   /api/workspaces/:id/members  # Invite members
```

### Company Detection
```
POST   /api/companies/detect        # AI company detection
GET    /api/companies/suggestions   # Industry suggestions
```

## 📱 User Experience Flow

### New User Journey
1. **Landing Page** → Corporate value proposition
2. **Sign Up** → Real-time email validation with corporate domain check
3. **Email Verification** → Professional email confirmation
4. **AI Company Detection** → "We detected you work at TechCorp Inc (Technology)"
5. **Profiling Wizard** → 3-step carousel with smart suggestions:
   - Professional Identity (job title, department, seniority)
   - Industry & Compliance (industry confirmation, compliance frameworks)
   - Security Context (security focus, budget, organization size)
6. **Personal Workspace** → Automatic creation with corporate context
7. **Dashboard Access** → Contextual recommendations and features

### Profiling Wizard Features
- **Step 1**: Job title autocomplete filtered by detected industry
- **Step 2**: Pre-selected industry with compliance suggestions
- **Step 3**: Security focus options based on role and industry
- **Progress Tracking**: Visual completion percentage
- **AI Suggestions**: Real-time recommendations based on company context

## 🔧 Development

### Backend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Seed database
npm run seed
```

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

### Code Quality
```bash
# Backend linting
npm run lint

# Frontend linting
npm run lint

# Format code
npm run format
```

## 🧪 Testing

### Backend Testing
- **Jest**: Unit and integration tests
- **Supertest**: API endpoint testing
- **MongoDB Memory Server**: In-memory database for tests

### Frontend Testing
- **Vitest**: Unit testing
- **React Testing Library**: Component testing
- **MSW**: API mocking for tests

## 🚀 Deployment

### Environment Setup
1. **Production MongoDB**: MongoDB Atlas or self-hosted
2. **Redis**: For session management (Redis Cloud or self-hosted)
3. **Email Service**: Gmail, SendGrid, or AWS SES
4. **Domain & SSL**: Cloudflare or similar CDN

### Docker Deployment (Optional)
```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Environment Variables (Production)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=strong-production-secret
CORS_ORIGIN=https://yourdomain.com
SMTP_HOST=smtp.sendgrid.net
```

## 📋 MVP Deliverables (Sprint 1)

### ✅ Complete Authentication
- [x] Corporate email validation with real-time feedback
- [x] AI company detection and industry classification  
- [x] OAuth integration (LinkedIn/GitHub)
- [x] Secure password policies and session management

### ✅ AI Profiling Wizard
- [x] Smart job title autocomplete by industry
- [x] AI-powered company context building
- [x] Industry-specific compliance suggestions
- [x] Profile intelligence scoring and recommendations

### ✅ Full RBAC
- [x] Role-based access: Creator, Admin, Manager, Member, Viewer
- [x] Permission-based feature access
- [x] Multi-tenant workspace management
- [x] Same-domain user invitation system

### ✅ Technical Foundation
- [x] MERN stack integration (MongoDB + Express + React + Node.js)
- [x] Redis session management
- [x] Production-ready deployment configuration
- [x] Comprehensive error handling and logging

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **JSDoc**: Function documentation

## 📞 Support

### Team Contacts
- **Lead Developer**: Nihed Ben Abdennour (nihedabdworks@gmail.com)
- **Project Manager**: Sarah Henia (shenia@thesamurai.com)
- **Technical Lead**: Daryl Simpson (dsimpson@thesamurai.com)

### Resources
- **Project Documentation**: `/docs`
- **API Documentation**: `/docs/api`
- **Figma Design System**: [Link to Figma]
- **Sprint Specifications**: See attached PDFs

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The SamurAI Team** for project vision and requirements
- **MongoDB Community** for excellent documentation
- **React Ecosystem** for powerful development tools
- **Tailwind CSS** for the utility-first design system

---

**Built with ❤️ by Nihed Ben Abdennour & Team for SamurAI Dojo Trial**

*Last Updated: August 8, 2025*
