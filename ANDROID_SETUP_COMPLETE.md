# Sylvie Android App - Setup Complete ✅

Your Capacitor Android project is now ready! Here's what was done and next steps.

## ✅ Completed Setup

1. **Installed Capacitor** - Core framework and CLI
2. **Initialized Capacitor** with:
   - App name: `Sylvie`
   - App ID: `com.sylvie.app`
   - Web directory: `frontend/build`
3. **Added Android Platform** - Created native Android project
4. **Updated API Configuration** - App detects environment and uses:
   - Local proxy (dev mode in browser)
   - Remote backend URL (Capacitor app)
5. **Built React App** - Production build ready
6. **Synced Assets** - Web assets copied to Android

## 📁 Project Structure

```
women-safety-app/
├── frontend/
│   ├── android/              ← Android project (ready to build)
│   ├── build/                ← Production web assets
│   ├── src/
│   │   └── services/api.ts   ← Updated API configuration
│   ├── capacitor.config.ts   ← Capacitor configuration
│   └── .env.production       ← Backend URL configuration
└── [Flask backend files]
```

## 🚀 Next Steps

### Option 1: Build APK Without Android Studio (Fastest)

```bash
cd women-safety-app/frontend/android
./gradlew assembleDebug

# Output APK: android/app/build/outputs/apk/debug/app-debug.apk
```

### Option 2: Use Android Studio (Recommended for signing)

1. **Install Android Studio** from https://developer.android.com/studio
2. Open it with:
   ```bash
   cd women-safety-app/frontend
   npx cap open android
   ```
3. In Android Studio:
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build to complete
   - Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 3: Build Signed Release APK (For Play Store)

In Android Studio:
1. Go to **Build** → **Generate Signed Bundle/APK**
2. Choose **APK**
3. **Create new keystore**:
   - Store file: `Sylvie.jks`
   - Password: Create a strong password (save this!)
   - Key alias: `sylvie`
4. Complete the form and build
5. Output: `android/app/release/app-release.apk` or `app-release.aab`

## ⚙️ Configure Your Backend URL

Before building for real use, update the Flask backend URL:

**File**: `frontend/.env.production`

```env
REACT_APP_API_URL=https://your-app.onrender.com
```

Replace `your-app.onrender.com` with your actual Render deployment URL.

## 📱 Test on Emulator/Device

```bash
cd women-safety-app/frontend
npx cap run android

# Or manually:
# 1. Connect Android device via USB (USB Debug enabled)
# 2. Run: adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 📊 Publish to Google Play Store

1. Create Google Play Console account (€20 one-time fee)
2. Create new app with details:
   - Name: `Sylvie`
   - Category: Lifestyle/Tools
3. Upload signed APK/AAB
4. Add:
   - App icon (512x512 PNG)
   - Screenshots (2-8 images)
   - Description
   - Privacy policy URL
5. Submit for review (takes ~24 hours)

## 🔑 Important Files

- **API Configuration**: [frontend/src/services/api.ts](frontend/src/services/api.ts)
- **Backend URL**: [frontend/.env.production](frontend/.env.production)
- **Capacitor Config**: [frontend/capacitor.config.ts](frontend/capacitor.config.ts)
- **Android Project**: `frontend/android/` (Gradle-based)

## 🐛 Troubleshooting

**"Web assets not found"**
- Run: `npm run build && npx cap copy`

**"Cannot connect to backend"**
- Check `.env.production` has correct URL
- Ensure Flask backend is deployed on Render

**"Build fails in Android Studio"**
- Update Gradle: Tools → SDK Manager → SDK Tools → Update all
- Clean: Build → Clean Project
- Rebuild

**"App crashes on startup"**
- Check Android logcat: View → Tool Windows → Logcat
- Look for JavaScript errors in browser console during dev testing

## 📞 Need Help?

- Capacitor Docs: https://capacitorjs.com/docs
- Android Studio Guide: https://developer.android.com/studio
- Play Store Submission: https://developer.android.com/distribute/console

---

**Your app is now ready for Android! 🎉**
