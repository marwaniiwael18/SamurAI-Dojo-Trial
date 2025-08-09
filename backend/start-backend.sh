#!/bin/bash

echo "🚀 Starting SamurAI Dojo Backend..."
echo ""

# Check if MongoDB is running
if ! pgrep mongod &> /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    if command -v brew &> /dev/null; then
        brew services start mongodb/brew/mongodb-community
        sleep 3
        if pgrep mongod &> /dev/null; then
            echo "✅ MongoDB started successfully"
        else
            echo "❌ Failed to start MongoDB"
            echo "💡 Try manually: mongod --config /usr/local/etc/mongod.conf"
        fi
    else
        echo "❌ Please start MongoDB manually: mongod"
        exit 1
    fi
else
    echo "✅ MongoDB is already running"
fi

echo ""
echo "🔧 Environment Check:"

if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "📊 Database URI: $(grep MONGODB_URI .env | cut -d'=' -f2)"
else
    echo "❌ .env file missing!"
    exit 1
fi

echo ""
echo "🔄 Starting backend server..."
npm run dev
