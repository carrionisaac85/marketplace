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

3. **Add the iOS platform** (creates the `ios/` folder — only do this once, and only possible on a Mac):
   ```bash
   npx cap add ios
   ```

4. **Sync your web build into the iOS project** (also installs CocoaPods deps):
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

## Part 2b — Cloud build with Codemagic (no Mac needed) ⭐ recommended

If you don't own a Mac, you can let **Codemagic** build, sign, and upload the iOS app to TestFlight for you. Codemagic rents you a real Mac in the cloud for the ~20 minutes it takes to build. The free tier gives you **500 build minutes per month** — enough for ~20 iOS builds.

The repo already contains `codemagic.yaml`, which describes the entire build pipeline. You just need to wire up your accounts.

### What you'll need (one-time, ~1 hour)

| # | Item | Cost | Where |
|---|------|------|-------|
| 1 | Apple Developer Program membership | **$99/year** | [developer.apple.com/programs](https://developer.apple.com/programs/) |
| 2 | App Store Connect account (free, comes with #1) | — | [appstoreconnect.apple.com](https://appstoreconnect.apple.com/) |
| 3 | Codemagic account | Free (500 min/mo) | [codemagic.io](https://codemagic.io/) |
| 4 | GitHub account (your repo must live somewhere Codemagic can read) | Free | [github.com](https://github.com) |

### Step-by-step

**A. Push the repo to GitHub** (Codemagic needs to read it)
1. In Replit: open the **Version Control** tab → "Connect to GitHub" → create a new repo (private is fine)
2. Push your changes

**B. Sign up for Apple Developer ($99/year)**
1. Go to <https://developer.apple.com/programs/enroll/>
2. Sign in with your Apple ID, choose **Individual** (cheaper, no D-U-N-S number needed)
3. Pay the $99 and wait — enrollment usually takes a fthe ew hours to 2 days

**C. Register the bundle ID in App Store Connect**
1. Log in at <https://developer.apple.com/account/resources/identifiers/list>
2. Click **+** → **App IDs** → **App**
3. Description: `WantBoard`, Bundle ID: **Explicit** → `com.wantboard.app`
4. Leave default capabilities, hit **Continue → Register**
5. Now go to <https://appstoreconnect.apple.com/apps>, click **+** → **New App**
6. Platform: iOS, Name: `WantBoard`, Primary language: English, Bundle ID: `com.wantboard.app`, SKU: `wantboard-ios-001`. Click **Create**. Note the **Apple ID** (numeric, e.g. `1234567890`) shown on the app page — you'll need it later.

**D. Generate an App Store Connect API key** (Codemagic uses this to sign and upload)
1. Go to <https://appstoreconnect.apple.com/access/integrations/api>
2. Click **Team Keys** → **Generate API Key**
3. Name: `Codemagic`, Access: **App Manager**
4. Click **Generate**. Download the `.p8` file (you can only download it **once** — keep it safe)
5. Note the **Key ID** (10 chars) and **Issuer ID** (UUID at top of page)

**E. Connect Codemagic**
1. Sign up at <https://codemagic.io/signup> with your GitHub account
2. Authorize Codemagic to read your WantBoard repo
3. On the Codemagic dashboard, click **Add application** → pick the WantBoard repo → **iOS App** → **codemagic.yaml**
4. Go to **Teams → Personal Account → Integrations → Developer Portal → Connect**
   - Paste the **Issuer ID**, **Key ID**, and upload the **.p8** file from step D
   - Name the integration exactly: `WantBoard App Store Connect API Key` (this matches `codemagic.yaml`)
5. Go to **Environment variables** for the app → create a group called `app_store_credentials`:
   - `APP_STORE_APP_ID` = the numeric Apple ID from step C6
   - `CM_BUILD_NOTIFY_EMAIL` = your email (optional, used for build status emails)

**F. Run the first build**
1. In the Codemagic app dashboard, click **Start new build**
2. Workflow: `ios-app-store`, Branch: `main`
3. Wait ~20 minutes. The first build is slower because CocoaPods has no cache yet
4. On success, Codemagic uploads the `.ipa` straight to TestFlight

If the build fails, click the build to see logs. The most common first-time issues are: bundle ID not registered (redo step C), API key permissions too low (must be **App Manager** or higher), or Apple Developer enrollment still pending.

### Every time you change the app

Just push to GitHub. Codemagic auto-builds on every push to `main` (you can toggle this in the Codemagic UI under **Build triggers**), or click **Start new build** manually.

---

## Part 2c — TestFlight and App Store submission

Once Codemagic (or your Mac) has uploaded a build to App Store Connect:

### Install the build on your iPhone via TestFlight (~10 min)

1. Install **TestFlight** from the App Store on your iPhone
2. In App Store Connect → your app → **TestFlight** tab — your new build appears under **iOS Builds** with status **Processing** (5–15 min) → then **Ready to Submit**
3. Apple will email you about **Export Compliance** the first time. Click the build, answer "No" to "Does your app use encryption?" (unless you added a Capacitor crypto plugin — WantBoard does not), save.
4. Under **Internal Testing**, create a group called `Internal Testers`, add your Apple ID email, and assign the build to it. You'll get a TestFlight invite email within a minute. Tap **View in TestFlight** → **Install**.

### Promote to External Testing (optional, lets up to 10,000 outside testers try it)

1. Under **External Testing**, create a group, add testers by email (or generate a public link)
2. Submit the build for **Beta App Review** (usually approved within 24 hours — much faster than full App Store review)

### Submit to the App Store

In App Store Connect → **App Store** tab → version **1.0.0** (Codemagic creates this automatically):

You will need to fill in (Apple won't review until all are present):

| Field | What it is |
|---|---|
| **App Name** | `WantBoard` (30 chars max) |
| **Subtitle** | One-line pitch, 30 chars max |
| **Promotional Text** | 170 chars, can change without resubmit |
| **Description** | Long-form, 4000 chars max |
| **Keywords** | Comma-separated, 100 chars total |
| **Support URL** | A working URL (your Replit deploy or a contact page) |
| **Marketing URL** | Optional |
| **Screenshots** | Required sizes: 6.7" iPhone (1290×2796) and 6.5" iPhone (1242×2688), 3–10 per size. Take from your phone using TestFlight build, then drag into App Store Connect. |
| **App Preview Video** | Optional |
| **Primary Category** | e.g. Shopping or Lifestyle |
| **Age Rating** | Walk through the questionnaire |
| **Privacy Policy URL** | Required. Host one on your Replit deploy (`/privacy`) |
| **Data Collection** | "Does your app collect data?" — answer based on what WantBoard stores (Firebase auth → yes, "Contact Info → Email") |
| **Pricing** | Free |
| **Availability** | All countries, or pick |

Click **Add for Review → Submit for Review**. Apple review takes **1–7 days**.

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

2. **Sync the web build into the existing `android/` project** (this folder is already scaffolded in the repo):
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

> The `android/` folder is committed to this repo, so you don't need to run `npx cap add android`. If for any reason it's missing, regenerate it with `npx cap add android`.

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
5. ⏳ **Set up iOS via Codemagic** (Part 2b) — needs the $99/year Apple account, no Mac required

---

## App icons & splash screens

A single 1024×1024 PNG at `assets/icon.png` (plus `assets/splash.png` at 2732×2732) is the source of truth for every native icon size. Regenerate with:

```bash
npm run icons          # iOS + Android
npm run icons:ios      # iOS only
npm run icons:android  # Android only
```

This runs `@capacitor/assets` which writes into `ios/App/App/Assets.xcassets/` and `android/app/src/main/res/`. CI runs `npm run icons` automatically on every Codemagic build. To change the look, edit `public/icons/icon-source.svg` and rerun the included ImageMagick command to refresh `assets/icon.png` (see commit history).

## Privacy strings (`Info.plist`)

WantBoard currently does not use the camera, microphone, photo library, location, contacts, calendar, or Bluetooth, so the iOS app intentionally does **not** declare any `NS*UsageDescription` keys. Apple only requires usage strings when the app actually invokes the corresponding native API. If you add a Capacitor plugin like `@capacitor/camera` or `@capacitor/geolocation` later, you must add the matching `NSCameraUsageDescription` / `NSLocationWhenInUseUsageDescription` to `ios/App/App/Info.plist` or Apple will reject the binary.

## What's already configured in this repo

- ✅ PWA manifest, service worker, icons, splash colors (`vite.config.js`, `public/icons/`)
- ✅ Apple meta tags for iOS home-screen installs (`index.html`)
- ✅ Safe-area CSS so content doesn't go under the iPhone notch or home indicator (`src/App.jsx`)
- ✅ Friendly offline banner that appears when the device loses connectivity (`src/App.jsx`)
- ✅ Capacitor config with iOS scheme, status bar, splash, and background color (`capacitor.config.ts`)
- ✅ Capacitor iOS + Android packages installed
- ✅ **`android/`** native project folder scaffolded and committed — ready to open in Android Studio
- ✅ **`codemagic.yaml`** — cloud build pipeline that produces a signed `.ipa` and uploads to TestFlight without a Mac
- ✅ **`@capacitor/assets`** wired into `npm run icons` to regenerate every native icon size from one PNG

## What's intentionally NOT done

- ❌ The `ios/` folder is **not in this repo** — it's generated on Codemagic's Mac runners on the first build (`npx cap add ios`). You can also generate it locally if you ever get access to a Mac.
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

Change these in `capacitor.config.ts` and `vite.config.js` if you want a different name or bundle ID **before** your first App Store submission. Changing the bundle ID after launch is painful.
