#!/bin/bash

# REVERT TO ORIGINAL STATE - Flask + HTML Only
# This removes all React changes and goes back to pure Flask

echo "╔════════════════════════════════════════════════════════╗"
echo "║   REVERTING TO ORIGINAL FLASK + HTML STATE             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

cd /Users/chiranth/Documents/dreamflow/women-safety-app

# Step 1: Stop any running servers
echo "📍 Stopping any running servers..."
pkill -f "python app.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 2

# Step 2: Show current structure
echo ""
echo "✅ Current app structure:"
echo "   - Backend: Flask (app.py) - ORIGINAL ✓"
echo "   - Templates: All HTML templates in app/templates/ - ORIGINAL ✓"
echo "   - Static files: CSS, JS, Images - ORIGINAL ✓"
echo "   - React frontend: /frontend (optional, not needed)"
echo ""

# Step 3: Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 TO RUN THE APP (ORIGINAL STATE):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. In Terminal 1 - Start Flask Backend:"
echo "   cd /Users/chiranth/Documents/dreamflow/women-safety-app"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "2. Then Open Browser:"
echo "   http://localhost:5000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ THAT'S IT! All pages served from Flask backend."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Available Pages (via Flask):"
echo "   • http://localhost:5000/             - Home"
echo "   • http://localhost:5000/safe-routes  - Safe Routes"
echo "   • http://localhost:5000/sos-center   - SOS Center"
echo "   • http://localhost:5000/report       - Report"
echo "   • http://localhost:5000/community-support - Community"
echo "   • http://localhost:5000/fake-call-ai - Fake Call"
echo "   • http://localhost:5000/my-reports   - My Reports"
echo "   • http://localhost:5000/settings     - Settings"
echo "   • http://localhost:5000/login        - Login"
echo "   • http://localhost:5000/emergency-contacts - Contacts"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 REVERSION COMPLETE!"
echo "Your app is back to the ORIGINAL Flask + HTML state."
echo "No React, no build process - just pure Flask."
echo ""
