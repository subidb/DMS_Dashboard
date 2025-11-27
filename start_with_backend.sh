#!/bin/bash

# DMS Dashboard - Start with Backend Integration

echo "🚀 Starting DMS Dashboard with Backend Integration..."

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend is not running. Please start the backend first:"
    echo "   cd backend && ./run_dev.sh"
    exit 1
fi

echo "✅ Backend is running on http://localhost:8000"

# Copy environment file
if [ -f "dms-frontend/env.local" ]; then
    cp dms-frontend/env.local dms-frontend/.env.local
    echo "✅ Environment configured for backend integration"
else
    echo "⚠️  Please create dms-frontend/.env.local with:"
    echo "   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000"
fi

# Start frontend
echo "🎯 Starting frontend..."
cd dms-frontend
npm run dev
