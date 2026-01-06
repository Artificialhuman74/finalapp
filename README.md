# 🛡️ SafeGuard – Women's Safety & Support Hub

**SafeGuard** is a comprehensive, AI-powered mobile safety application with an intuitive onboarding experience, instant SOS alerts, safe route planning, incident reporting, AI-powered fake call features, and anonymous community support. It runs on Flask with HTTPS to enable secure browser permissions (location, microphone, camera, notifications).

## ✨ Key Features

### 🎯 **Beautiful Onboarding Experience**
- Step-by-step interactive slides showcasing all features
- Permission requests integrated into each feature preview
- Smooth animations and transitions
- Skip option for returning users
- Progress tracking with visual indicators

### 🚨 **SOS Emergency Alert**
- One-tap emergency alerts with live GPS tracking
- Automatic SMS notifications to emergency contacts
- WhatsApp alert integration with tracking links
- Voice/video recording during emergencies
- Real-time location broadcasting every 60 seconds
- Reliability badge showing alert delivery status

### 🗺️ **Safe Routes**
- AI-powered route optimization based on:
  - Crime density analysis (260 crime records)
  - Street lighting coverage (1,144 lighting points)
  - Population density (187 data points)
- Interactive map with safety scores
- Multiple route options with detailed metrics
- Real-time navigation guidance

### 📝 **Incident Reporting**
- Step-by-step guided questionnaire
- AI-generated professional summaries (Gemini)
- Evidence upload (photos, audio, video, documents)
- Anonymous or identified reporting options
- Export reports for official documentation

### 🎭 **AI Fake Call**
- AI-powered conversational fake calls (Gemini)
- Voice recognition for natural responses
- Escape dangerous situations discreetly
- Customizable caller names
- Sound effects and realistic conversation

### 🤝 **Community Support**
- Anonymous story sharing
- Peer support with reactions and comments
- AI-powered emotional support chat
- Safe space for sharing experiences
- Real-time chat with community members

### 🔐 **Privacy & Security**
- HTTPS encryption (self-signed certificate for local dev)
- Anonymous posting options
- Secure data storage
- No personal data exposure without consent
- End-to-end permission controls

---

## 🚀 Quick Start Guide (Mac/Linux)

### Step 1: Clone the Repository
```bash
git clone https://github.com/BuiltbyVrunda/dreamflow.git
cd dreamflow/women-safety-app
```

### Step 2: Create Virtual Environment
```bash
# Create a new virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip
```

### Step 3: Install Dependencies
```bash
# Install all required packages
pip install -r requirements.txt
```

### Step 4: Frontend Setup
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 5: Configure Environment Variables
Create a file named `.env` in the `women-safety-app` folder:

```env
# ===== REQUIRED: Google Gemini AI =====
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_API_VERSION=v1

# ===== OPTIONAL: SMS Providers =====
FAST2SMS_API_KEY=your_fast2sms_key_here
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# ===== Flask Configuration =====
SECRET_KEY=change-this-to-a-random-secret-key-in-production
```

### Step 6: Start the Server
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Start HTTPS server on port 5443
python app.py
```

You should see:
```
============================================================
🚀 Women's Safety App - FULL APPLICATION (HTTPS)
============================================================
🔒 Running on HTTPS with self-signed certificate
   https://127.0.0.1:5443
   https://192.168.0.3:5443
```

### Step 7: Open in Browser
1. Visit: **https://127.0.0.1:5443**
2. Accept the security warning (self-signed certificate)
3. You'll see the beautiful onboarding experience
4. Grant permissions for full functionality

---

## 📱 Accessing from Mobile Device

To test on your phone (same WiFi network):

1. Find your Mac/Linux IP address:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for IPv4 address (e.g., 192.168.0.3)
```

2. On your phone, visit: `https://YOUR_IP:5443`
   - Example: `https://192.168.0.3:5443`

3. Accept the certificate warning on mobile browser

4. Complete the beautiful onboarding flow

5. Grant permissions for all features

## Tech Stack

**Backend:**
- Flask (Python web framework)
- SQLAlchemy (Database ORM)
- Google Gemini AI (AI responses & summarization)
- Pandas/NumPy (Route analysis & data processing)

**Frontend:**
- React 19 with TypeScript
- Framer Motion (Animations)
- GSAP (Advanced animations)
- Leaflet Maps (Route visualization)
- TailwindCSS (Styling)

## Project Structure

```
women-safety-app/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── routes.py                # API routes
│   ├── models.py                # Database models
│   ├── auth_models.py           # Authentication models
│   ├── route_optimizer.py       # Safe route algorithm
│   ├── data/                    # Crime, lighting, population data
│   ├── ml/                      # Machine learning models
│   ├── safety/                  # Safety guardrails
│   ├── templates/               # HTML templates
│   ├── static/                  # CSS, JS, images
│   │   ├── css/                 # Stylesheets
│   │   ├── js/                  # JavaScript files
│   │   └── images/              # App images
│   └── uploads/                 # User uploads (evidence, SOS)
├── frontend/                    # React TypeScript frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── IntroOnboarding.tsx    # Beautiful onboarding
│   │   │   ├── Landing.tsx            # Main dashboard
│   │   │   ├── SOSCenter.tsx          # SOS emergency
│   │   │   ├── SafeRoutesApp.tsx      # Route planner
│   │   │   ├── IncidentReport.tsx     # Report form
│   │   │   ├── FakeCall.tsx           # AI fake call
│   │   │   └── CommunitySupport.tsx   # Community chat
│   │   ├── styles/              # Stylesheets
│   │   └── App.tsx              # Main app component
│   ├── public/                  # Static assets
│   └── package.json             # NPM dependencies
├── app.py                       # Application entry point
├── config.py                    # Configuration
└── requirements.txt             # Python dependencies
```

## Usage Guide

### 1. First-Time Onboarding
1. Visit `https://127.0.0.1:5443` 
2. Swipe through 6 beautiful feature slides
3. Grant permissions for each feature:
   - Location (for SOS & Safe Routes)
   - Notifications (for SOS alerts)
   - Microphone (for Fake Call feature)
   - Camera (for Incident Reports)
4. Click "Get Started" to proceed

### 2. Create Account & Login
- Sign up with email/password
- Use credentials to log in
- Access main dashboard with dock navigation

### 3. File an Incident Report
1. Tap "Incident Report" on dock
2. Answer guided questionnaire:
   - Who was involved?
   - What type of incident?
   - Where did it happen?
   - Impact assessment
   - Date/time details
3. Upload evidence (photos, video, audio, documents)
4. AI generates professional summary
5. Option to post anonymously to community

### 4. SOS Emergency Alert
1. Tap the red SOS button on dock
2. Confirm emergency activation
3. App automatically:
   - Captures live GPS location
   - Records video/audio (optional)
   - Sends SMS to emergency contacts
   - Broadcasts WhatsApp alerts with tracking link
   - Updates location every 60 seconds

### 5. Plan Safe Routes
1. Tap "Safe Routes" on dock
2. Enter starting point and destination
3. View multiple route options with:
   - Crime density scores
   - Lighting coverage percentage
   - Population density info
   - Safety rating per route
4. Tap to navigate with turn-by-turn directions

### 6. Use AI Fake Call
1. Tap "Fake Call" feature
2. Choose caller name or use default
3. AI generates realistic conversation
4. Speak naturally - AI responds in real-time
5. Tap to end call when safe

### 7. Community Support
1. Tap "Community Support" on dock
2. Read anonymous stories from others
3. Post your own story anonymously
4. Send hearts ❤️ as support
5. Comment supportively on others' posts
6. Chat with AI for emotional support

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5443
lsof -i :5443 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Gemini API Errors
- Verify `GEMINI_API_KEY` is valid
- Check `.env` file in `women-safety-app` folder
- Ensure model is `gemini-2.0-flash`

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

### Certificate Warnings
- Accept security warning on first visit
- Clear browser cache if issues persist
- Certificate is self-signed for local development

## Environment Setup

**Get Your Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy to `.env` file

**Optional: SMS Configuration**
- **Twilio**: Requires international number (+country code)
- **Fast2SMS**: Requires 10-digit Indian number

## Performance Optimizations

✨ The app includes:
- Hardware-accelerated CSS animations
- Optimized React rendering with memo
- Lazy loading for route maps
- Image optimization
- Service worker for offline support (coming soon)
- Database indexing for fast queries

## Security Features

🔒 Built with security first:
- HTTPS encryption (self-signed for local dev)
- CSRF protection on all forms
- Input validation & sanitization
- SQL injection prevention (SQLAlchemy ORM)
- Rate limiting on sensitive endpoints
- Anonymous posting without user tracking
- Secure file upload validation

## Future Roadmap

- [ ] Real-time SOS tracking for family members
- [ ] Integration with local police databases
- [ ] ML-powered incident prediction
- [ ] Video call feature for SOS
- [ ] Offline incident reporting
- [ ] Push notification support
- [ ] Emergency contact geo-mapping
- [ ] Community event alerts
- [ ] Cloud database sync

## Support Resources

For more information:
- GitHub: [buildbychiranth/dreamflow](https://github.com/Artificialhuman74/buildbychiranth)
- Documentation: See individual README files in folders
- Issues: Submit via GitHub Issues

## License

MIT License - Free to use and modify

## Authors

**Built with ❤️ for safety and community support**

- Frontend: React + TypeScript
- Backend: Flask + Python
- AI: Google Gemini
- Maps: Leaflet
- Data: Crime records, lighting coverage, population density

---

**Last Updated:** January 4, 2026
**Version:** 2.0 (React Frontend + Beautiful Onboarding)
