# WantBoard — Mobile App Build Guide

This project ships as a **mobile-friendly PWA** today, and is scaffolded to build **native iOS and Android apps** through [Capacitor](https://capacitorjs.com/) when you are ready to publish to the App Store and Google Play.

---

## Part 1 — The PWA (works right now, no Mac needed)

Once you deploy the app to Replit (your `.replit.app` URL), anyone can install it on their phone like a native app:

**iPhone (Safari)**
1. Open your `.replit.app` URL in Safari
2. Tap the **Share** button (square with arrow)
3. Tap **Add to Home Screen**
4. The WantBoard icon appears on the home screen and opens full-screen, no browser bar

**Android (Chrome)**
1. Open your `.replit.app` URL in Chrome
2. Tap the **⋮** menu
3. Tap **Install app** (or **Add to Home Screen**)
4. Same result — full-screen app with the WantBoard icon

This is free, requires no developer accounts, and works for 90% of users. **Try this first** before paying $99/year to Apple.

---

## Part 2 — Native iOS app (App Store)

### One-time requirements

| Need | How to get it |
|---|---|
| **Mac computer** with macOS 14+ | Buy a Mac mini (~$600) **or** rent a cloud Mac at [MacStadium](https://www.macstadium.com/), [MacInCloud](https://www.macincloud.com/), or [Scaleway](https://www.scaleway.com/en/dedibox/mac-mini/) (~$25–60/mo) |
| **Xcode** (free) | Install from the Mac App Store |
| **Apple Developer account** | $99/year at [developer.apple.com](https://developer.apple.com/programs/) |
| **CocoaPods** (free) | Run `sudo gem install cocoapods` in Terminal on the Mac |

### First-time setup on the Mac

1. **Clone this repo** to the Mac:
   ```bash
   git clone <your-repl-url>
   cd <project>
   npm install
   ```

2. **Build the web assets** (creates `dist/`):
   ```bash
   npm run build
   ```

3. **Add the iOS platform** (creates the `ios/` folder — only do this once):
   ```bash
   npx cap add ios
   ```

4. **Sync your web build into the iOS project**:
   ```bash
   npx cap sync ios
   ```

5. **Open the project in Xcode**:
   ```bash
   npx cap open ios
   ```

### Every time you change the app

```bash
npm run build && npx cap sync ios
```
Then in Xcode hit the Play button to preview on a simulator or connected iPhone.

### To publish to the App Store

1. In Xcode, sign in with your Apple Developer account (Xcode → Settings → Accounts)
2. Set the Team and Bundle ID (currently `com.wantboard.app`) in the project's Signing & Capabilities tab
3. Choose **Any iOS Device** as the build target, then **Product → Archive**
4. When the archive finishes, click **Distribute App → App Store Connect → Upload**
5. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com/), create the app listing (name, screenshots, description, category, age rating), and submit for review
6. Apple review takes **1–7 days** on average

---

## Part 3 — Native Android app (Google Play)

### One-time requirements

| Need | How to get it |
|---|---|
| **Android Studio** (free) | [developer.android.com/studio](https://developer.android.com/studio) — works on Mac, Windows, and Linux |
| **JDK 17** (free) | Bundled with recent Android Studio |
| **Google Play Developer account** | **$25 one-time** at [play.google.com/console](https://play.google.com/console) |

You do **not** need a Mac for Android.

### First-time setup

1. **On any computer**, clone the repo and build:
   ```bash
   npm install
   npm run build
   ```

2. **Add the Android platform**:
   ```bash
   npx cap add android
   ```

3. **Sync the web build**:
   ```bash
   npx cap sync android
   ```

4. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

### Every time you change the app

```bash
npm run build && npx cap sync android
```

### To publish to Google Play

1. In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**
2. Create a new signing key (save the keystore file and password somewhere safe — losing it means you can never update your app)
3. Upload the `.aab` file at [play.google.com/console](https://play.google.com/console) → create app → upload to Internal Testing first, then promote to Production
4. Fill in the store listing (name, screenshots, description, content rating)
5. Google Play review takes **a few hours to 7 days**

---

## Recommended order of operations

1. ✅ **Deploy the web app** on Replit (already done)
2. ✅ **Test the PWA install flow** on your own phone (free, 5 min)
3. ⏳ **Share the URL** with 10–20 friends and collect feedback for a few weeks
4. ⏳ **Set up Android** first — cheaper ($25 one-time) and works on any computer
5. ⏳ **Set up iOS** last — needs a Mac and the $99/year Apple account

---

## What's already configured in this repo

- ✅ PWA manifest, service worker, icons, splash colors (`vite.config.js`, `public/icons/`)
- ✅ Apple meta tags for iOS home-screen installs (`index.html`)
- ✅ Safe-area CSS so content doesn't go under the iPhone notch or home indicator (`src/App.jsx`)
- ✅ Capacitor config pointing at the Vite build output (`capacitor.config.json`)
- ✅ Capacitor iOS + Android packages installed

## What's intentionally NOT done

- ❌ The `ios/` folder is not in this repo — Apple requires it be generated on a Mac via `npx cap add ios`
- ❌ The `android/` folder is not in this repo — generate it on your build machine via `npx cap add android`
- ❌ No native push notifications, native camera, or deep links yet — these can be added later via Capacitor plugins
- ❌ No App Store screenshots or marketing copy

---

## App identity

| Field | Value |
|---|---|
| App name | WantBoard |
| Bundle ID / Package | `com.wantboard.app` |
| Theme color | `#E84B2A` (orange) |
| Background color | `#F7F5F2` (cream) |

Change these in `capacitor.config.json` and `vite.config.js` if you want a different name or bundle ID **before** your first App Store submission. Changing the bundle ID after launch is painful.
