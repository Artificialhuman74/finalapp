#!/usr/bin/env bash
# Render deployment build script
# Works from repo root where all files are at the top level

set -o errexit

echo "=== Sylvie Build Script ==="
echo "Initial directory: $(pwd)"
echo "Files here: $(ls -1 | head -15)"

# Build Frontend
echo ""
echo "📦 Building Frontend..."
npm install --prefix frontend 2>&1 | tail -10
CI=false npm run build --prefix frontend 2>&1 | tail -20

# Install Backend Dependencies
echo ""
echo "🐍 Installing Backend Dependencies..."
pip install -r requirements.txt 2>&1 | tail -10

echo ""
echo "✅ Build Complete!"


