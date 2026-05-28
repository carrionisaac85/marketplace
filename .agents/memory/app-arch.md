---
name: App architecture
description: WantBoard codebase structure and key patterns
---

## Stack
React + Vite PWA + Firebase (Firestore, Storage, Auth) + Capacitor iOS (`com.wantboard.app`, Firebase project `marketplace305`).

## Key files
- `src/App.jsx` — entire app in one file (~3300 lines). All CSS as template literal `const css`. All state in one component.
- `src/index.jsx` — entry point; SW registration (web only, guarded with Capacitor.isNativePlatform())
- `index.html` — viewport meta (has `maximum-scale=1.0, user-scalable=no` for iOS)
- `vite.config.js` — PWA with `injectRegister: false`
- `ios/App/App/AppDelegate.swift` — native Firebase init
- `capacitor.config.ts` — Capacitor config

## Auth (iOS-safe)
Uses `initializeAuth(app, { persistence: inMemoryPersistence })` on native (no resolver) via `Capacitor.isNativePlatform()` check. Web uses `getAuth(app)`. `getRedirectResult` has a native guard to prevent hung iframe.

## Data model
- `wants` collection: `{title, description, budget, category, location, userId, user, offers:[], photos:[], status, createdAt}`
- `users` collection: `{name, email, uid, joinedAt, savedWants:[], reviewedKeys:[], reportedWants:[], notifPrefs:{messages,offers,offerStatus}, privacyEnabled, location}`
- `conversations` collection: `{participants:[], participantNames:{}, wantTitle, wantId, offerPrice, lastMessage, lastSenderId, readBy:[], archivedBy:[]}`

## Key patterns
- `wants` loaded via `onSnapshot` with `orderBy("createdAt","desc")` — single listener for everything
- `convos` loaded via separate `onSnapshot` on conversations
- User doc loaded via `onSnapshot` — sets savedWants, reviewedKeys, notifPrefs, privacyEnabled, userLocation
- Offers are embedded arrays inside want docs (not a separate collection)
- All CSS uses CSS variables: `--accent` (#e05a33 orange), `--text`, `--text2`, `--surface`, `--surface2`, `--border`, `--r` (border-radius), `--fd` (display font), `--fb` (body font)
