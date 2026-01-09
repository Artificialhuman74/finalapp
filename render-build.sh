#!/usr/bin/env bash
# exit on error
set -o errexit

# Check current directory and adjust if needed
echo "Current directory: $(pwd)"
echo "Checking for package.json..."

if [ ! -f "package.json" ] && [ -d "women-safety-app" ]; then
  echo "Switching to women-safety-app directory..."
  cd women-safety-app
fi

# Build Frontend
echo "Building Frontend..."
npm install --prefix frontend
CI=false npm run build --prefix frontend

# Install Backend Dependencies
echo "Installing Backend Dependencies..."
pip install -r requirements.txt
