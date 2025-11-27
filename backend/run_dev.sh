#!/bin/bash

# DMS Dashboard Backend Development Startup Script

echo "🚀 Starting DMS Dashboard Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Seed database with sample data
echo "🌱 Seeding database with sample data..."
python scripts/seed_data.py

# Start the development server
echo "🎯 Starting development server..."
echo "📊 API Documentation: http://localhost:8000/docs"
echo "🔗 API Base URL: http://localhost:8000"
echo ""

python start.py
