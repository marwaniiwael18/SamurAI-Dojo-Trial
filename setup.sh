#!/bin/bash

# SamurAI Dojo Development Setup Script
echo echo ""
echo "� Figma Integration (Recommended):"
echo "5. Run: ./setup-figma.sh for guided Figma MCP setup"
echo "6. Generate components: Follow QUICK_START_FIGMA.md"
echo "7. Your designs: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-"
echo ""
echo "🌐 Access the application:"ting up SamurAI Dojo Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ and try again."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep mongod &> /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB and try again."
    echo "   Start MongoDB with: brew services start mongodb/brew/mongodb-community"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo "📦 Setting up backend..."
cd backend

# Install dependencies
npm install

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please configure your environment variables."
fi

# Create logs directory
mkdir -p logs

echo "✅ Backend setup complete"

# Setup Frontend
echo "📦 Setting up frontend..."
cd ../frontend

# Install dependencies
npm install

echo "✅ Frontend setup complete"

# Back to root
cd ..

echo ""
echo "🎉 SamurAI Dojo setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment variables in backend/.env"
echo "2. Start MongoDB: brew services start mongodb/brew/mongodb-community"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "� Figma Integration (Optional):"
echo "5. Download and install Figma Desktop App"
echo "6. Enable 'Dev Mode MCP Server' in Figma Preferences"
echo "7. Read FIGMA_SETUP.md for detailed integration guide"
echo ""
echo "�🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Health:   http://localhost:5000/health"
echo "   Figma MCP: http://127.0.0.1:3845/mcp"
echo ""
echo "📚 Documentation:"
echo "   README.md - Project overview and setup"
echo "   FIGMA_SETUP.md - Detailed Figma integration guide"
echo "   QUICK_START_FIGMA.md - Fast component generation"
echo "   COMPONENT_MAPPING.md - Your design-to-component mapping"
echo "   PROJECT_STATUS.md - Current implementation status"
echo ""
echo "Happy coding! 🚀"
