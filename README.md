# AppLocker — React Native App

A fully functional mobile app locker built with Expo / React Native.

## Features

- **PIN Setup** — First-launch PIN creation with AI-suggested strong PINs
- **App List** — Toggle lock on/off for each app individually
- **Lock Screen** — PIN pad with shake animation on wrong entry, biometric support
- **Access Log** — Full history of unlock attempts, failures, and cancellations with filters
- **Settings** — Biometrics, auto-lock timer, max attempts, change PIN, lock/unlock all
- **Secure Storage** — PIN stored in device secure enclave via `expo-secure-store`
- **Haptics** — Tactile feedback on every key press and outcome

## Screens

| Screen | Description |
|--------|-------------|
| Setup PIN | First-launch PIN creation with suggestions |
| Home (Apps) | App list with lock toggles and search |
| Lock Screen | PIN entry to unlock a specific app |
| Access Log | Timestamped log of all access events |
| Settings | All configuration options |

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator / Android Emulator, or Expo Go app on your phone

### Install & Run

```bash
cd AppLocker
npm install
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go on your phone

### Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Project Structure

```
AppLocker/
├── App.js                          # Root component
├── app.json                        # Expo config
├── package.json
├── babel.config.js
└── src/
    ├── components/
    │   ├── PinPad.js               # Reusable 4-digit PIN pad
    │   ├── Toggle.js               # Animated toggle switch
    │   └── AppIcon.js              # App icon with colored bg
    ├── context/
    │   └── AppContext.js           # Global state (useReducer)
    ├── navigation/
    │   └── AppNavigator.js         # Stack + Tab navigation
    ├── screens/
    │   ├── SetupPinScreen.js       # PIN creation with suggestions
    │   ├── HomeScreen.js           # App list + lock toggles
    │   ├── LockScreen.js           # PIN unlock for a specific app
    │   ├── AccessLogScreen.js      # Access history with filters
    │   └── SettingsScreen.js       # All settings
    └── utils/
        ├── theme.js                # Colors, spacing, radius tokens
        └── storage.js              # SecureStore wrapper + defaults
```

## Tech Stack

- **Expo SDK 51** — Managed workflow
- **React Navigation 6** — Stack + Bottom tabs
- **expo-secure-store** — Encrypted PIN storage
- **expo-local-authentication** — Biometric (Face ID / fingerprint)
- **expo-haptics** — Tactile feedback
- **@expo/vector-icons** — Ionicons

## Customization

### Add more apps
Edit `DEFAULT_APPS` in `src/utils/storage.js`:
```js
{ id: '13', name: 'Spotify', category: 'Music', icon: 'musical-note', color: '#1DB954', bgColor: '#0D2D15', locked: false },
```

### Change theme colors
Edit `src/utils/theme.js` — all colors are CSS variables used throughout.

### Change PIN length
Update `PIN_LENGTH` in `src/components/PinPad.js` (default: 4).
