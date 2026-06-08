import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wantboard.app",
  appName: "WantBoard",
  webDir: "dist",
  backgroundColor: "#F7F5F2",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  ios: {
    contentInset: "always",
    scheme: "WantBoard",
    backgroundColor: "#F7F5F2",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: "#F7F5F2",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#F7F5F2",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "DEFAULT",
      backgroundColor: "#F7F5F2",
      overlaysWebView: false,
    },
    FirebaseMessaging: {
      presentationOptions: ["alert", "badge", "sound"],
    },
  },
};

export default config;
