# BlackRoad OS App Factory 🏭

Automated iOS & Android app creation, building, and deployment pipeline.

## Overview

This app factory automates the entire mobile app lifecycle:
- 📱 iOS app generation (React Native, Flutter, or Native)
- 🤖 Android app generation
- 🔄 CI/CD pipeline setup
- 🚀 Automated deployment to TestFlight & Google Play Beta
- 📊 Multi-app management dashboard

## Quick Start

```bash
# 1. Set up Apple & Google credentials
./setup-credentials.sh

# 2. Generate a new app
./generate-app.sh "MyApp" react-native

# 3. Build and deploy
./deploy-app.sh MyApp ios
./deploy-app.sh MyApp android
```

## Scripts

| Script | Purpose |
|--------|---------|
| `setup-credentials.sh` | Configure Apple Developer & Google Play accounts |
| `generate-app.sh` | Create new app from template |
| `build-ios.sh` | Build iOS app + upload to TestFlight |
| `build-android.sh` | Build Android APK/AAB + upload to Play Store |
| `deploy-app.sh` | Unified deployment script |
| `batch-create-apps.sh` | Generate multiple apps at once |
| `app-factory-dashboard.sh` | Launch monitoring dashboard |

## Account Setup

### Apple Developer Account
1. Sign up: https://developer.apple.com ($99/year)
2. Create App ID & provisioning profiles
3. Generate API key for automation
4. Add credentials to `config/apple-credentials.json`

### Google Play Developer Account
1. Sign up: https://play.google.com/console ($25 one-time)
2. Create service account for API access
3. Download JSON key file
4. Add to `config/google-play-credentials.json`

## App Templates

- `react-native` - React Native + Expo
- `flutter` - Flutter cross-platform
- `native-ios` - SwiftUI iOS app
- `native-android` - Kotlin Android app

## Features

✅ Automatic version bumping
✅ CI/CD with GitHub Actions
✅ Fastlane integration
✅ Screenshot generation
✅ App Store metadata management
✅ Multi-app orchestration
✅ Crash reporting setup (Sentry)
✅ Analytics integration (Firebase)

## Environment Variables

```bash
# Add to .env
APPLE_DEVELOPER_TEAM_ID=ABC123
APPLE_API_KEY_ID=DEF456
APPLE_API_KEY_PATH=/path/to/AuthKey.p8
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=/path/to/service-account.json
```

## Automated Workflow

1. **Code Push** → GitHub
2. **GitHub Actions** triggers build
3. **Fastlane** compiles app
4. **Upload** to TestFlight/Play Console
5. **Notify** via Slack/Email

## Cost Estimate

| Service | Cost |
|---------|------|
| Apple Developer | $99/year |
| Google Play Developer | $25 one-time |
| CI/CD (GitHub Actions) | Free (2000 min/mo) |
| **Total First Year** | **$124** |

---

**BlackRoad OS** - Autonomous App Factory
