#!/bin/bash
# Bash script to start development environment
# This script verifies MongoDB connection and then starts the application

echo "🚀 Starting AI Interview Platform Development Environment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    # Try to load from .env file if it exists
    if [ -f "apps/api/.env" ]; then
        export $(grep -v '^#' apps/api/.env | xargs)
    else
        echo "❌ DATABASE_URL not found. Please set it in apps/api/.env"
        echo ""
        echo "Example .env file:"
        echo "  DATABASE_URL=mongodb://localhost:27017/ai_interview_dev"
        echo "  DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"
        echo ""
        exit 1
    fi
fi

echo "✅ Using MongoDB connection from DATABASE_URL"

# Extract host and port from DATABASE_URL for connection test
# Try to parse MongoDB connection string
if echo "$DATABASE_URL" | grep -q "mongodb://"; then
    # Standard MongoDB connection
    MONGO_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^/]*\).*/\1/p' | cut -d: -f1)
    MONGO_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^/]*\).*/\1/p' | cut -d: -f2)
    MONGO_PORT=${MONGO_PORT:-27017}
    
    # Test connection if it's a local connection
    if [ "$MONGO_HOST" = "localhost" ] || [ "$MONGO_HOST" = "127.0.0.1" ]; then
        echo "🔍 Testing MongoDB connection at $MONGO_HOST:$MONGO_PORT..."
        if command -v mongosh > /dev/null 2>&1; then
            if mongosh "$DATABASE_URL" --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
                echo "✅ MongoDB is ready and responding"
            else
                echo "⚠️  Could not connect to MongoDB. Please ensure MongoDB is running."
                echo "   Connection string: $DATABASE_URL"
            fi
        else
            echo "⚠️  mongosh not found. Skipping connection test."
            echo "   Please ensure MongoDB is accessible at: $DATABASE_URL"
        fi
    else
        echo "🌐 Using remote MongoDB server: $MONGO_HOST"
        echo "   Please ensure the MongoDB server is accessible."
    fi
elif echo "$DATABASE_URL" | grep -q "mongodb+srv://"; then
    # MongoDB Atlas connection
    CLUSTER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^@]*@\([^/]*\).*/\1/p')
    echo "☁️  Using MongoDB Atlas cluster: $CLUSTER"
    echo "   Please ensure your IP is whitelisted and credentials are correct."
else
    echo "⚠️  Could not parse DATABASE_URL format. Please verify your connection string."
fi

echo ""
echo "🎉 Development environment is ready!"
echo "   - MongoDB: $DATABASE_URL"
echo "   - API Server: http://localhost:5000"
echo "   - Web App: http://localhost:3000"
echo ""
echo "💡 To start the API and Web servers, run:"
echo "   pnpm dev"
echo ""



