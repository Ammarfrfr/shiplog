# 🚀 Shiplog

A progress-logging + team accountability ledger built for developer crews.

---

## 🛠 Tech Stack & Architecture

- **Backend**: Node.js + Express + MongoDB (Mongoose) — deployed on **Render**.
- **Frontend**: React Native with Expo (SDK 57, Expo Router, TypeScript) targeting **Android (including Galaxy S24 FE / Android 24+)**.
- **Design System**: Strict dark theme `#0F1319`, `#171C24` panels, 1px hairline `#262C36` borders, Brass `#C9963C` and Teal `#3E6E62` accents, **Fraunces** + **IBM Plex Mono** typography.

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Make sure your MongoDB Atlas cluster has your IP whitelisted or set to allow access from anywhere (`0.0.0.0/0` in MongoDB Atlas > Network Access).

Run the DSA Seeder to populate the Striver A2Z Sheet curriculum:
```bash
npm run seed:dsa
```

Start the backend API server:
```bash
npm run dev
# Running at http://localhost:5001
```

### 2. Mobile App Setup (Expo)

```bash
cd app
npm install
npx expo start
```

- Press `a` to open on an Android emulator or connected device (e.g. Galaxy S24 FE).
- Scan QR code using Expo Go on Android.

---

## 🌐 Deploying Backend to Render

1. Push this repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
3. Connect your repository:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set Environment Variables in Render:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: Any random 32+ character secure key
   - `GITHUB_CLIENT_ID`: (Optional) GitHub OAuth Client ID
   - `GITHUB_CLIENT_SECRET`: (Optional) GitHub OAuth Client Secret
5. Once deployed, copy your Render URL (e.g., `https://shiplog-backend.onrender.com`) and enter it in the app's login screen server configuration.

---

## 🐙 GitHub OAuth Setup

When creating your GitHub OAuth Application at [GitHub Developer Settings](https://github.com/settings/developers):
- **Application Name**: `Shiplog`
- **Homepage URL**: `https://github.com` (or your Render URL)
- **Authorization Callback URL**:
  - **Local Development**: `http://localhost:5001/api/github/callback`
  - **Render Deployment**: `https://<your-render-service-name>.onrender.com/api/github/callback`

### Auto-Commit Logging & DSA Ticking
When a GitHub push event fires:
- Each commit creates a ledger entry with `source: 'github_commit'` and auto-parses prefixes (`feat:`, `fix:`, `style:`).
- If the commit message matches a DSA problem slug (e.g. `two-sum`, `kadanes-algorithm`), the DSA progress item is automatically ticked as `done` with a `git` commit badge.

---

## 🔔 Push Notifications (Nudge Feature)

1. Expo Push notifications work out of the box in Expo Go.
2. For production Android standalone builds:
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Add an Android app with package name `com.shiplog.app` and place `google-services.json` in `app/`.
   - Run `eas credentials` to link FCM keys with Expo.

---

## 📱 Features Included

1. **Log Tab**: Grouped daily feed, tags (feature, fix, design, research, blocker), cheer button with optimistic updates, bottom sheet composer.
2. **Track Tab**: Team / individual member switcher, current & best streaks, monthly count, and a 14-week (98-day) GitHub-style SVG activity heatmap.
3. **Route Tab**: Vertical milestone roadmap with states (done, current, upcoming) and instant add/edit modal.
4. **Crew Tab**: Team members list, online/last-active relative indicators, streak badges, 1-tap Nudge button with push notification, and room invite code sharing.
5. **DSA Tab**: Striver's A2Z DSA sheet tracker, categorized problem accordions, commit-match git badge, and category completion ratios.
