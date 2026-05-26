# Native Push Notifications — One-Time Setup

The app code is wired. To actually deliver pushes to iOS and Android devices you must do these one-time steps in the Firebase and Apple consoles.

## iOS — APNs Auth Key (required, ~5 min)

Capacitor's push plugin asks iOS for an APNs token, which FCM then exchanges for delivery. FCM needs your APNs Auth Key to do that exchange.

1. Apple Developer → **Certificates, Identifiers & Profiles** → **Keys** → **+**.
2. Name it "WantBoard APNs", check **Apple Push Notifications service (APNs)**, Continue → Register.
3. Download the `.p8` file (you only get one chance). Note the **Key ID** and your **Team ID**.
4. Apple Developer → **Identifiers** → select `com.wantboard.app` → enable **Push Notifications** capability → Save.
5. Firebase console → project `marketplace305` → **Project settings** → **Cloud Messaging** tab → under **Apple app configuration** → **APNs Authentication Key** → **Upload**.
6. Upload the `.p8`, paste the Key ID and Team ID → Upload.

The Push Notifications capability is already wired in the Xcode project (`App.entitlements` with `aps-environment = development`, `CODE_SIGN_ENTITLEMENTS` set on Debug + Release, and `remote-notification` background mode in `Info.plist`). For App Store / TestFlight builds, Xcode will automatically switch `aps-environment` to `production` when archiving with a distribution provisioning profile — no manual change needed.

## iOS — `GoogleService-Info.plist` (required)

The native push plugin uses the Firebase iOS SDK to convert the APNs device token into an FCM registration token (which is what our Cloud Functions send to). The SDK needs the Firebase config plist.

1. Firebase console → project `marketplace305` → **Project settings** → **General** → **Your apps** → **Add app** → iOS (if not already added).
2. Bundle ID: `com.wantboard.app`. Register the app.
3. Download `GoogleService-Info.plist` and drop it into `ios/App/App/GoogleService-Info.plist`.
4. In Xcode (one-time): drag the file into the `App` group of the `App` target so it gets bundled into the .app. Make sure "Copy items if needed" is checked and the App target is selected.

## Android — `google-services.json` (required)

1. Firebase console → project `marketplace305` → **Project settings** → **General** → **Your apps** → **Add app** → Android.
2. Package name: `com.wantboard.app`. Register the app.
3. Download `google-services.json` and drop it into `android/app/google-services.json` (same level as `build.gradle`).
4. `android/app/build.gradle` already conditionally applies `com.google.gms.google-services` when this file is present, so no Gradle edits are needed.

## After both consoles are set up

```
npx cap sync ios
npx cap sync android
```

Then build & run on a real device (push does NOT work in the iOS simulator). On first sign-in the app will request notification permission; granting writes the device's FCM token to `fcmTokens/{uid}` in Firestore. The existing Cloud Functions (`notifyOnNewMessage`, `notifyOnNewOffer`, `notifyOnOfferStatus`) deliver to web and native from the same code path — no functions changes needed.
