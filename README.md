# SmartCart

SmartCart is an Expo-managed React Native MVP for grocery receipt scanning. The app now runs as a clean offline-first demo with:

- Receipt capture using `expo-camera`
- Image preview before processing
- Mock receipt parsing with structured JSON output
- Local persistence for receipts and rewards
- Savings recommendations
- Lightweight shopping analytics
- Nearby deal markers on a map
- Profile and receipt history

## Project structure

```text
SmartCart/
├── App.tsx
├── components/
├── hooks/
├── navigation/
├── screens/
├── services/
├── utils/
└── server/               # legacy backend workspace, not required for the MVP app flow
```

## Key app behavior

- The app uses React Navigation instead of Expo Router.
- Receipt parsing is mocked in `services/receiptService.ts`.
- Recommendations are mocked in `services/recommendationService.ts`.
- Saved receipts and reward points are persisted locally with `expo-file-system`.
- The camera flow is Expo Go compatible and uses `CameraView` from `expo-camera`.

## Requirements

- Node.js 18+
- Expo Go on an iPhone or Android device
- Same Wi-Fi network between phone and computer if using LAN mode

## Install

```bash
npm install
```

## Run the app

```bash
npm start
```

Useful variants:

```bash
npm run start:tunnel
npm run ios
npm run android
```

## Open on a real iPhone with Expo Go

1. Install Expo Go from the App Store.
2. From the project root, run `npm start`.
3. Wait for the Expo dev server QR code to appear.
4. Open the Camera app on the iPhone and scan the QR code.
5. Tap the Expo Go link that appears.
6. When prompted, allow camera and location access.

If your phone cannot connect over local network, use:

```bash
npm run start:tunnel
```

## Camera test flow

1. Open the `Scan` tab.
2. Tap `Open camera`.
3. Allow camera access.
4. Capture a receipt.
5. Review the image preview.
6. Tap `Use this receipt`.
7. The app will mock-parse the receipt, save it locally, and update rewards and recommendations.

## Typecheck

```bash
npm run typecheck
```

## Notes

- This MVP stays within Expo managed workflow.
- No backend is required for the primary demo flow.
- `react-native-maps` works on iPhone and Android; the web build shows a fallback message instead.
- The `server/` folder is still in the repo for future backend integration, but the mobile app no longer depends on it for core MVP behavior.
