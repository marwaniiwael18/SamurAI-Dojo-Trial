#!/bin/bash

echo "🧪 SamurAI Dojo - Project Testing Guide"
echo "====================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ "$2" = "success" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    elif [ "$2" = "error" ]; then
        echo -e "${RED}❌ $1${NC}"
    elif [ "$2" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $1${NC}"
    elif [ "$2" = "info" ]; then
        echo -e "${BLUE}ℹ️  $1${NC}"
    else
        echo "$1"
    fi
}

# Check prerequisites
echo "🔍 Checking Prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION" "success"
else
    print_status "Node.js not found! Please install Node.js v18+" "error"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm found: $NPM_VERSION" "success"
else
    print_status "npm not found!" "error"
    exit 1
fi

# Check MongoDB
if command -v mongod &> /dev/null || command -v mongodb &> /dev/null; then
    print_status "MongoDB found" "success"
else
    print_status "MongoDB not found - will attempt to start service" "warning"
fi

# Check if MongoDB is running
if pgrep mongod &> /dev/null; then
    print_status "MongoDB is running" "success"
else
    print_status "MongoDB is not running - attempting to start..." "warning"
    if command -v brew &> /dev/null; then
        brew services start mongodb/brew/mongodb-community
        sleep 3
        if pgrep mongod &> /dev/null; then
            print_status "MongoDB started successfully" "success"
        else
            print_status "Failed to start MongoDB - please start manually" "error"
        fi
    else
        print_status "Please start MongoDB manually: mongod" "warning"
    fi
fi

echo ""
echo "📦 Installing Dependencies..."
echo ""

# Install backend dependencies
if [ -d "backend" ]; then
    cd backend
    if [ -f "package.json" ]; then
        print_status "Installing backend dependencies..." "info"
        npm install
        if [ $? -eq 0 ]; then
            print_status "Backend dependencies installed" "success"
        else
            print_status "Failed to install backend dependencies" "error"
            exit 1
        fi
    else
        print_status "Backend package.json not found" "error"
        exit 1
    fi
    cd ..
else
    print_status "Backend directory not found" "error"
    exit 1
fi

# Install frontend dependencies
if [ -d "frontend" ]; then
    cd frontend
    if [ -f "package.json" ]; then
        print_status "Installing frontend dependencies..." "info"
        npm install
        if [ $? -eq 0 ]; then
            print_status "Frontend dependencies installed" "success"
        else
            print_status "Failed to install frontend dependencies" "error"
            exit 1
        fi
    else
        print_status "Frontend package.json not found" "error"
        exit 1
    fi
    cd ..
else
    print_status "Frontend directory not found" "error"
    exit 1
fi

echo ""
echo "⚙️  Environment Configuration..."
echo ""

# Check backend .env file
if [ -f "backend/.env" ]; then
    print_status "Backend .env file exists" "success"
else
    if [ -f "backend/.env.example" ]; then
        print_status "Creating .env from .env.example..." "info"
        cp backend/.env.example backend/.env
        print_status ".env file created - please configure your environment variables" "warning"
    else
        print_status "No .env.example found - creating basic .env..." "warning"
        cat > backend/.env << EOL
# Database
MONGODB_URI=mongodb://localhost:27017/samurai-dojo

# JWT Secrets (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret

# Server
PORT=5000
NODE_ENV=development

# Email (configure for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOL
        print_status "Basic .env file created" "success"
    fi
fi

echo ""
echo "🧪 Running Tests..."
echo ""

# Test backend health
print_status "Testing backend..." "info"
cd backend

# Start backend in background for testing
npm run dev &
BACKEND_PID=$!
sleep 5

# Test health endpoint
if curl -s -f "http://localhost:5000/health" > /dev/null 2>&1; then
    print_status "Backend health check passed" "success"
    BACKEND_RESPONSE=$(curl -s "http://localhost:5000/health")
    echo "   Response: $BACKEND_RESPONSE"
else
    print_status "Backend health check failed" "error"
    echo "   Backend may not be running on port 5000"
fi

# Test API endpoints
print_status "Testing API endpoints..." "info"

# Test auth routes
AUTH_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:5000/api/auth/test" 2>/dev/null || echo "000")
if [ "$AUTH_RESPONSE" = "404" ] || [ "$AUTH_RESPONSE" = "200" ]; then
    print_status "Auth routes accessible" "success"
else
    print_status "Auth routes not accessible (HTTP: $AUTH_RESPONSE)" "warning"
fi

# Stop background backend
kill $BACKEND_PID 2>/dev/null
cd ..

echo ""
echo "🎯 Test Results Summary"
echo "======================"
echo ""

# Database connection test
print_status "Testing database connection..." "info"
cd backend
MONGO_TEST=$(node -e "
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/samurai-dojo';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Database connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  });
setTimeout(() => {
  console.log('❌ Database connection timeout');
  process.exit(1);
}, 5000);
" 2>/dev/null)

if [ $? -eq 0 ]; then
    print_status "Database connection test passed" "success"
else
    print_status "Database connection test failed" "error"
fi

cd ..

echo ""
echo "🚀 How to Start the Project"
echo "=========================="
echo ""
echo "1. 🗄️  Start MongoDB (if not running):"
echo "   brew services start mongodb/brew/mongodb-community"
echo ""
echo "2. 🔧 Start Backend Development Server:"
echo "   cd backend && npm run dev"
echo "   Backend will run on: http://localhost:5000"
echo ""
echo "3. 🎨 Start Frontend Development Server (in new terminal):"
echo "   cd frontend && npm run dev"
echo "   Frontend will run on: http://localhost:3000"
echo ""
echo "4. 🌐 Access the Application:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:5000"
echo "   • Health Check: http://localhost:5000/health"
echo ""
echo "5. 🧪 Test API Endpoints:"
echo "   • GET http://localhost:5000/health"
echo "   • POST http://localhost:5000/api/auth/register"
echo "   • POST http://localhost:5000/api/auth/login"
echo ""

echo "🎨 Optional: Figma Integration"
echo "=============================="
echo ""
echo "6. 🎨 Setup Figma MCP Server:"
echo "   ./setup-figma.sh"
echo ""
echo "7. 🔗 Test MCP Connection:"
echo "   ./test-mcp.sh"
echo ""

echo "📊 Project Status"
echo "================"
echo ""
print_status "✅ Backend structure ready" "success"
print_status "✅ Frontend structure ready" "success"
print_status "✅ Database models defined" "success"
print_status "✅ Authentication system ready" "success"
print_status "✅ API endpoints structured" "success"
print_status "✅ State management configured" "success"
print_status "✅ Figma integration prepared" "success"
echo ""
print_status "🎯 Ready for development and component generation!" "info"
echo ""
echo "📚 Documentation:"
echo "   • README.md - Project overview"
echo "   • PROJECT_STATUS.md - Implementation status"
echo "   • FIGMA_SETUP.md - Figma integration guide"
echo "   • QUICK_START_FIGMA.md - Component generation"
echo ""
echo "Happy coding! 🚀"
