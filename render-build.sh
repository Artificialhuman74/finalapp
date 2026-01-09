#!/usr/bin/env bash
# Render deployment build script
# Handles being run from any directory level

set -o errexit

echo "=== Sylvie Build Script ==="
echo "Initial directory: $(pwd)"

# Ensure we're in the women-safety-app directory (project root)
if [ -f "render-build.sh" ] && [ -d "frontend" ]; then
  # We're already in women-safety-app
  echo "✓ Already in project root"
elif [ -d "women-safety-app" ] && [ -f "women-safety-app/render-build.sh" ]; then
  # We're in the repo root, need to cd into women-safety-app
  echo "✓ Found women-safety-app directory, entering it..."
  cd women-safety-app
else
  # Last resort: search for it
  echo "⚠ Searching for project structure..."
  find . -maxdepth 2 -name "render-build.sh" | head -1 | xargs dirname | head -1 | xargs -I {} sh -c 'cd {} && echo "Found project at: $(pwd)"'
fi

echo "Working directory: $(pwd)"
echo "Directory contents: $(ls | head -10)"

# Build Frontend
echo ""
echo "📦 Building Frontend..."
npm install --prefix frontend 2>&1 | tail -20
CI=false npm run build --prefix frontend 2>&1 | tail -30

# Install Backend Dependencies
echo ""
echo "🐍 Installing Backend Dependencies..."
pip install -r requirements.txt 2>&1 | tail -20

echo ""
echo "✅ Build Complete!"

