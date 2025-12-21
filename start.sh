#!/bin/bash

echo "🌊 Amrut-Dhara Bot - Quick Start Script"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your Supabase credentials before continuing."
    echo ""
    echo "To edit: nano .env"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

echo "🚀 Starting Amrut-Dhara Bot..."
echo ""
echo "📱 Web interface will be available at: http://localhost:3000"
echo "🔗 Webhook endpoint: http://localhost:3000/webhook"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
