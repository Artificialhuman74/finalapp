#!/bin/bash
# Quick APK Build Script for Sylvie App

echo "🚀 Building Sylvie Android APK..."
echo "=================================="

cd "$(dirname "$0")/frontend" || exit 1

echo "📦 Step 1: Building React app..."
npm run build

echo "📱 Step 2: Syncing to Android..."
npx cap copy
npx cap sync

echo "🔨 Step 3: Building Android APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug

echo ""
echo "✅ Build complete!"
echo ""
echo "📂 APK Location:"
echo "   app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📲 Install on device:"
echo "   adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "💡 Note: For Play Store, generate a signed APK using Android Studio"
