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

In Xcode, also confirm the App target has the **Push Notifications** capability (Signing & Capabilities → + Capability → Push Notifications). The `remote-notification` background mode is already in `Info.plist`.

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
