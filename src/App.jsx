import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
getFirestore, collection, addDoc, onSnapshot, updateDoc,
deleteDoc, doc, serverTimestamp, orderBy, query, where, arrayUnion, arrayRemove,
setDoc, getDocs, getDoc, limit, increment,
} from "firebase/firestore";
import {
initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence, browserPopupRedirectResolver,
createUserWithEmailAndPassword, signInWithEmailAndPassword,
signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup, signInWithCredential, signInWithRedirect, getRedirectResult,
sendPasswordResetEmail, deleteUser, getAdditionalUserInfo, getAuth,
} from "firebase/auth";
import {
getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject,
} from "firebase/storage";
import { getMessaging, getToken } from "firebase/messaging";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { App as CapacitorApp } from "@capacitor/app";
import { Badge } from "@capawesome/capacitor-badge";

async function setAppBadge(count) {
  const n = Math.max(0, Number(count) || 0);
  if (Capacitor.isNativePlatform()) {
    try {
      if (n === 0) await Badge.clear();
      else await Badge.set({ count: n });
    } catch (e) {
      console.warn("Badge set failed:", e);
    }
  } else if (typeof navigator !== "undefined") {
    try {
      if (n === 0 && navigator.clearAppBadge) await navigator.clearAppBadge();
      else if (navigator.setAppBadge) await navigator.setAppBadge(n);
    } catch {}
  }
}

async function clearDeliveredForConvo(convoId) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { notifications } = await FirebaseMessaging.getDeliveredNotifications();
    const match = (notifications || []).filter(n => n?.data?.convoId === convoId);
    if (match.length > 0) {
      await FirebaseMessaging.removeDeliveredNotifications({ notifications: match });
    }
  } catch (e) {
    console.warn("removeDeliveredNotifications failed:", e);
  }
}

const firebaseConfig = {
apiKey: "AIzaSyCztet4RJW50L6N1uKWq0ClHnj_ud4TxFo",
authDomain: "marketplace305.firebaseapp.com",
projectId: "marketplace305",
storageBucket: "marketplace305.firebasestorage.app",
messagingSenderId: "445461567451",
appId: "1:445461567451:web:aa2eb29f5e8449d405b9fe",
measurementId: "G-WGWS8Y69F0",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
// On native iOS/Android webviews, skip browserPopupRedirectResolver and indexedDBLocalPersistence 
// — they can hang in WKWebView and leave the app stuck on "Loading..." forever.
const auth = (() => {
  if (Capacitor.isNativePlatform()) {
    // Native WKWebView: NO popupRedirectResolver — it opens a hidden iframe that hangs forever.
    // Use browserLocalPersistence so users stay signed in after app restart.
    return initializeAuth(app, { persistence: browserLocalPersistence });
  }
  try { return initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence], popupRedirectResolver: browserPopupRedirectResolver }); }
  catch { return getAuth(app); }
})();
const storage = getStorage(app);

async function compressImage(file, maxSizePx = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxSizePx && height <= maxSizePx) { resolve(file); return; }
      const ratio = Math.min(maxSizePx / width, maxSizePx / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => resolve(blob || file), file.type === "image/png" ? "image/png" : "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

async function registerFcmToken(uid) {
  if (Capacitor.isNativePlatform()) return;
  if (!("serviceWorker" in navigator)) return;
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) return;
  try {
    const sw = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: sw });
    if (token) {
      await setDoc(doc(db, "fcmTokens", uid), { token, updatedAt: serverTimestamp() });
    }
  } catch (e) {
    console.warn("FCM token registration failed:", e);
  }
}

async function registerNativePush(uid, onConvoTap) {
  if (!Capacitor.isNativePlatform()) return () => {};
  try {
    let perm = await FirebaseMessaging.checkPermissions();
    if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
      perm = await FirebaseMessaging.requestPermissions();
    }
    if (perm.receive !== "granted") return () => {};

    const saveToken = async value => {
      if (!value) return;
      try {
        await setDoc(doc(db, "fcmTokens", uid), { token: value, updatedAt: serverTimestamp() });
      } catch (e) {
        console.warn("Native FCM token save failed:", e);
      }
    };

    const tokenListener = await FirebaseMessaging.addListener("tokenReceived", e => saveToken(e.token));
    const tapListener = await FirebaseMessaging.addListener("notificationActionPerformed", action => {
      const convoId = action.notification?.data?.convoId;
      if (convoId && typeof onConvoTap === "function") onConvoTap(convoId);
    });

    try {
      const { token } = await FirebaseMessaging.getToken();
      await saveToken(token);
    } catch (e) {
      console.warn("FirebaseMessaging.getToken failed (will retry via tokenReceived):", e);
    }

    return () => {
      tokenListener.remove();
      tapListener.remove();
    };
  } catch (e) {
    console.warn("Native push setup failed:", e);
    return () => {};
  }
}

const ADMIN_EMAILS = ["carrion.isaac85@gmail.com"];

const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
--bg:#F7F5F2;--surface:#FFFFFF;--surface2:#F0EDE8;--surface3:#E8E4DF;
--text:#1A1A1A;--text2:#6B6560;--accent:#E84B2A;--green:#16A34A;
--red:#DC2626;--border:#E2DDD8;--r:16px;
--fd:'Syne',sans-serif;--fb:'DM Sans',sans-serif;
}
html,body{overflow-x:hidden;overscroll-behavior:none;-webkit-overflow-scrolling:touch;height:100%}
body{font-family:var(--fb);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;position:relative;width:100%}
.app{min-height:100vh;min-height:-webkit-fill-available;display:flex;flex-direction:column;position:relative;overflow-x:hidden}
main{-webkit-overflow-scrolling:touch;}

/* AUTH */
.auth-wrap{min-height:100vh;min-height:-webkit-fill-available;display:flex;align-items:center;justify-content:center;padding:max(20px,calc(env(safe-area-inset-top,0px) + 12px)) 20px max(20px,calc(env(safe-area-inset-bottom,0px) + 12px));background:var(--bg)}
.auth-box{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:36px;width:100%;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.auth-logo{font-family:var(--fd);font-weight:800;font-size:28px;margin-bottom:6px}
.auth-logo span{color:var(--accent)}
.auth-sub{font-size:14px;color:var(--text2);margin-bottom:24px}
.auth-tabs{display:flex;gap:4px;margin-bottom:24px;background:var(--surface2);border-radius:10px;padding:4px}
.auth-tab{flex:1;padding:8px;text-align:center;font-size:13px;font-weight:600;font-family:var(--fd);cursor:pointer;border-radius:8px;color:var(--text2);transition:all .15s}
.auth-tab.active{background:var(--accent);color:#fff}
.auth-form{display:flex;flex-direction:column;gap:12px}
.forgot-link{background:none;border:none;color:var(--accent);font-size:12px;font-weight:600;cursor:pointer;text-align:right;padding:0;font-family:var(--fb);margin-top:-4px}
.forgot-link:hover{text-decoration:underline}
.forgot-back{background:none;border:none;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;padding:4px 0;font-family:var(--fb);text-align:center}
.forgot-back:hover{color:var(--text)}
.forgot-success{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:20px;text-align:center;color:var(--text)}
.auth-input{width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:var(--fb);font-size:14px;color:var(--text);background:var(--surface2);outline:none;transition:border-color .15s;box-sizing:border-box}
.auth-input:focus{border-color:var(--accent)}
.auth-pass-wrap{position:relative;display:flex;align-items:center}
.auth-pass-wrap .auth-input{padding-right:42px;width:100%}
.auth-pass-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;padding:0;cursor:pointer;color:var(--text2);display:flex;align-items:center;justify-content:center;line-height:1;-webkit-tap-highlight-color:transparent}
.auth-pass-toggle:hover{color:var(--text)}
.auth-pass-toggle:focus{outline:none}
.auth-btn{width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-weight:800;font-size:15px;cursor:pointer;font-family:var(--fd);margin-top:4px}
.auth-btn:hover{background:#c73d22}
.auth-btn:disabled{opacity:.5;cursor:not-allowed}
.auth-err{font-size:13px;color:var(--red);text-align:center}
.auth-divider{display:flex;align-items:center;gap:10px;margin:4px 0;color:var(--text2);font-size:12px}
.auth-divider::before,.auth-divider::after{content:"";flex:1;height:1px;background:var(--border)}
.auth-google{width:100%;padding:13px;background:var(--surface);color:var(--text);border:1.5px solid var(--border);border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;font-family:var(--fb);display:flex;align-items:center;justify-content:center;gap:10px;transition:border-color .15s}
.auth-google:hover{border-color:#4285F4;background:#f8faff}
.auth-google:disabled{opacity:.5;cursor:not-allowed}

/* HEADER */
.header{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;padding:calc(12px + env(safe-area-inset-top,0px)) calc(20px + env(safe-area-inset-right,0px)) 12px calc(20px + env(safe-area-inset-left,0px));box-shadow:0 1px 8px rgba(0,0,0,.06)}
.header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.logo{font-family:var(--fd);font-weight:800;font-size:22px;color:var(--text);cursor:pointer}
.logo span{color:var(--accent)}
.huser{display:flex;align-items:center;gap:8px}
.huser-name{font-size:12px;color:var(--text2)}
.huser-name strong{color:var(--accent)}
.signout{font-size:12px;font-weight:600;padding:5px 12px;border-radius:100px;border:1.5px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;font-family:var(--fb)}
.signout:hover{border-color:var(--red);color:var(--red)}
.del-account-btn{padding:12px 20px;background:transparent;color:var(--red);border:1.5px solid var(--red);border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;font-family:var(--fd)}
.del-account-btn:hover{background:var(--red);color:#fff}
.del-account-btn:disabled{opacity:.5;cursor:not-allowed}
.hsearch{display:flex;align-items:center;background:var(--surface2);border:1.5px solid var(--border);border-radius:100px;padding:0 16px;gap:8px}
.hsearch:focus-within{border-color:var(--accent)}
.hsearch input{border:none;background:transparent;font-family:var(--fb);font-size:14px;color:var(--text);outline:none;flex:1;padding:10px 0}
.hsearch input::placeholder{color:var(--text2)}

/* PULL TO REFRESH */
.ptr{display:flex;align-items:center;justify-content:center;padding:14px 0 4px;transition:all .25s}
.ptr-icon{width:24px;height:24px;transition:transform .3s ease}
.ptr-icon circle{fill:none;stroke:var(--text2);stroke-width:2.5;stroke-linecap:round}
.ptr.active .ptr-icon circle{stroke:var(--accent)}
@keyframes ptr-spin{to{transform:rotate(360deg)}}
.ptr.active .ptr-icon{animation:ptr-spin .7s linear infinite}

/* BOTTOM NAV */
.bnav{position:fixed;bottom:0;left:0;right:0;z-index:100;background:var(--surface);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-around;padding:8px calc(env(safe-area-inset-right,0px)) max(20px,calc(10px + env(safe-area-inset-bottom,0px))) calc(env(safe-area-inset-left,0px));box-shadow:0 -2px 12px rgba(0,0,0,.06);min-height:60px}
.bitem{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;flex:1;min-width:0;padding:4px 6px;color:var(--text2);font-family:var(--fd);font-size:10px;font-weight:600;transition:color .15s;position:relative;overflow:hidden}
.bitem:hover,.bitem.active{color:var(--accent)}
.bicon{font-size:22px;line-height:1}
.notif-badge{position:absolute;top:0;right:6px;width:8px;height:8px;background:var(--red);border-radius:50%;border:2px solid var(--surface)}

/* NOTIFICATION BELL */
.bell-btn{background:none;border:none;cursor:pointer;font-size:19px;padding:4px 5px;position:relative;display:flex;align-items:center;line-height:1}
.bell-badge{position:absolute;top:-1px;right:-2px;min-width:16px;height:16px;background:var(--red);color:#fff;border-radius:100px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:var(--fd);padding:0 3px;border:1.5px solid var(--surface);pointer-events:none}
.notif-panel{position:absolute;top:calc(100% + 8px);right:0;width:300px;max-width:calc(100vw - 24px);background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.14);z-index:300;overflow:hidden;max-height:420px;overflow-y:auto}
.notif-panel-head{padding:12px 16px;font-family:var(--fd);font-weight:700;font-size:14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:var(--surface)}
.notif-panel-close{background:none;border:none;cursor:pointer;font-size:16px;color:var(--text2);padding:0}
.notif-clear-btn{background:none;border:none;cursor:pointer;font-size:12px;font-weight:700;font-family:var(--fd);color:var(--accent);padding:0}
.notif-item{padding:10px 16px;border-bottom:1px solid var(--border);cursor:pointer;display:flex;gap:10px;align-items:flex-start;transition:background .1s}
.notif-item:hover{background:var(--surface2)}
.notif-item:last-child{border-bottom:none}
.notif-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.notif-dot.unread{background:var(--accent)}
.notif-dot.read{background:var(--border)}
.notif-body{flex:1;min-width:0}
.notif-name{font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.notif-msg{font-size:12px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px}
.notif-empty{padding:20px 16px;text-align:center;color:var(--text2);font-size:13px}

/* OFFERS SENT VIEW */
.offers-list{display:flex;flex-direction:column;gap:10px}
.offer-sent-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 16px;cursor:pointer;transition:box-shadow .15s}
.offer-sent-card:active{box-shadow:0 4px 16px rgba(0,0,0,.08)}
.offer-sent-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;gap:8px}
.offer-sent-title{font-family:var(--fd);font-weight:700;font-size:15px;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.offer-sent-badge{font-size:11px;font-weight:700;font-family:var(--fd);padding:2px 8px;border-radius:100px;flex-shrink:0}
.offer-sent-badge.accepted{background:#dcfce7;color:#15803d}
.offer-sent-badge.declined{background:#fee2e2;color:#dc2626}
.offer-sent-badge.pending{background:var(--surface2);color:var(--text2)}
.offer-sent-meta{font-size:12px;color:var(--text2);margin-bottom:8px}
.offer-sent-row{display:flex;align-items:center;justify-content:space-between}
.offer-sent-price{font-family:var(--fd);font-weight:800;font-size:17px;color:var(--accent)}
.offer-sent-cta{font-size:12px;color:var(--accent);font-weight:600;font-family:var(--fd)}

/* WANT & POST PHOTOS */
.post-photos{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px}
.post-photo-wrap{position:relative;display:inline-flex}
.post-photo-thumb{width:72px;height:72px;border-radius:10px;object-fit:cover;border:1.5px solid var(--border)}
.post-photo-rm{position:absolute;top:-6px;right:-6px;width:18px;height:18px;background:var(--red);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;padding:0;line-height:1}
.add-photo-btn{width:72px;height:72px;border-radius:10px;border:1.5px dashed var(--border);background:var(--surface2);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:var(--text2);font-size:11px;font-weight:600;gap:2px;font-family:var(--fd);transition:border-color .15s,color .15s}
.add-photo-btn:hover{border-color:var(--accent);color:var(--accent)}
.add-photo-btn span{font-size:20px}
.photo-src-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:flex-end;justify-content:center}
.photo-src-sheet{width:100%;max-width:480px;background:var(--surface);border-radius:18px 18px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom)+16px);display:flex;flex-direction:column;gap:10px}
.photo-src-title{font-family:var(--fd);font-size:13px;font-weight:700;color:var(--text2);text-align:center;padding-bottom:2px}
.photo-src-btn{background:var(--surface2);border:none;border-radius:12px;padding:15px;font-family:var(--fd);font-size:15px;font-weight:600;color:var(--text);cursor:pointer;display:flex;align-items:center;gap:10px;transition:background .15s}
.photo-src-btn:active{background:var(--border)}
.photo-src-cancel{background:none;border:none;border-radius:12px;padding:13px;font-family:var(--fd);font-size:15px;font-weight:600;color:var(--text2);cursor:pointer;text-align:center;margin-top:2px}
.want-photos{display:flex;gap:6px;overflow-x:auto;margin-top:6px;margin-bottom:4px;-webkit-overflow-scrolling:touch;padding-bottom:2px}
.want-photo{width:80px;height:80px;border-radius:10px;object-fit:cover;flex-shrink:0;border:1px solid var(--border)}
.sh-photos{display:flex;gap:8px;overflow-x:auto;margin-bottom:12px;-webkit-overflow-scrolling:touch}
.sh-photo{width:130px;height:130px;border-radius:12px;object-fit:cover;flex-shrink:0;border:1px solid var(--border)}

/* MAIN */
.main{max-width:1100px;margin:0 auto;padding:20px 16px;flex:1;width:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:max(100px,calc(80px + env(safe-area-inset-bottom,0px)))}

/* CATEGORIES */
.cats{display:flex;gap:8px;overflow-x:auto;margin-bottom:12px;scrollbar-width:none}
.cats::-webkit-scrollbar{display:none}
.chip{padding:7px 14px;border-radius:100px;border:1.5px solid var(--border);background:var(--surface);cursor:pointer;font-size:13px;font-weight:500;color:var(--text2);white-space:nowrap;transition:all .15s}
.chip:hover{border-color:var(--accent);color:var(--accent)}
.chip.active{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}

/* FILTERS */
.frow{display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.fsel{font-family:var(--fb);font-size:13px;border:1.5px solid var(--border);border-radius:100px;padding:7px 14px;background:var(--surface);color:var(--text);cursor:pointer;outline:none}
.fsel:focus{border-color:var(--accent)}

/* TWO COLUMN GRID */
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* WANT CARD */
.wcard{background:var(--surface);border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column;transition:box-shadow .2s;cursor:pointer;box-shadow:0 1px 6px rgba(0,0,0,.07)}
.wcard:hover{box-shadow:0 4px 18px rgba(0,0,0,.12)}
.wcard-body{padding:14px 14px 10px;flex:1}
.wcard-urow{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.wcard-tbrow{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:5px}
.wbudget-pill{font-family:var(--fd);font-weight:700;font-size:13px;color:var(--green);background:#eef8f1;padding:3px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0;display:inline-block}
.wphoto-hero{width:100%;max-height:200px;height:auto;object-fit:contain;border-radius:10px;margin:8px 0 0;display:block;background:var(--surface2)}
.av{width:30px;height:30px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-weight:800;font-size:12px;flex-shrink:0}
.av.sm{background:var(--surface3);color:var(--text2)}
.wuser{font-size:12px;font-weight:600;color:var(--text)}
.wtime{font-size:11px;color:var(--text2)}
.wbudget{font-family:var(--fd);font-weight:800;font-size:18px;color:var(--green)}
.blabel{font-size:9px;color:var(--text2);text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px}
.wtitle{font-family:var(--fd);font-weight:700;font-size:13px;line-height:1.3;color:var(--text);flex:1}
.wdesc{font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:100px;background:var(--surface2);color:var(--text2);display:inline-block}
.wfoot{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-top:1px solid var(--border);background:var(--surface2);gap:4px}
.ocnt{font-size:11px;color:var(--text2)}
.ocnt strong{color:var(--text)}
.obtn{font-family:var(--fb);font-size:11px;font-weight:600;background:var(--accent);color:#fff;border:none;cursor:pointer;border-radius:100px;padding:5px 10px;white-space:nowrap}
.obtn:hover{background:#c73d22}
.profile-link{cursor:pointer}
.profile-link:hover{opacity:.75}
.prof-overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;padding-bottom:0;animation:fi .2s}
.prof-sheet{background:var(--surface);border-radius:24px 24px 0 0;width:100%;max-width:540px;max-height:88vh;overflow-y:auto;padding:24px 20px max(40px,calc(env(safe-area-inset-bottom,0px) + 24px));display:flex;flex-direction:column;gap:0}
.prof-handle{width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 20px}
.prof-header{display:flex;align-items:center;gap:16px;margin-bottom:20px}
.prof-av{width:60px;height:60px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:26px;font-weight:800;flex-shrink:0}
.prof-name{font-family:var(--fd);font-size:22px;font-weight:800;color:var(--text)}
.prof-joined{font-size:12px;color:var(--text2);margin-top:3px}
.prof-close{margin-left:auto;background:var(--surface2);border:1px solid var(--border);border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.prof-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px}
.prof-stat{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center}
.prof-stat-num{font-family:var(--fd);font-size:22px;font-weight:800;color:var(--accent)}
.prof-stat-label{font-size:10px;color:var(--text2);margin-top:3px;font-weight:500}
.prof-section{font-family:var(--fd);font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
.prof-want{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px;cursor:pointer}
.prof-want:hover{border-color:var(--accent)}
.prof-want-title{font-size:13px;font-weight:600;color:var(--text)}
.prof-want-sub{font-size:11px;color:var(--text2);margin-top:3px}
.prof-rating{display:flex;align-items:center;gap:4px;margin-top:4px}
.prof-rating-text{font-size:12px;color:var(--text2)}
.rate-btn{background:#fef3c7;border:1px solid #fcd34d;color:#92400e;border-radius:8px;padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap}
.rate-btn:hover{background:#fde68a}
.rev-overlay{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:max(20px,calc(env(safe-area-inset-top,0px) + 10px)) 20px max(20px,calc(env(safe-area-inset-bottom,0px) + 10px));animation:fi .15s}
.rev-modal{background:var(--surface);border-radius:20px;width:100%;max-width:400px;padding:24px;display:flex;flex-direction:column;gap:12px}
.rev-modal-head{display:flex;align-items:center;justify-content:space-between}
.rev-modal-title{font-family:var(--fd);font-size:20px;font-weight:800;color:var(--text)}
.rev-modal-sub{font-size:12px;color:var(--text2);margin-top:-6px}
.rev-star-row{display:flex;gap:4px;justify-content:center;margin:4px 0}
.rev-star-btn{background:none;border:none;cursor:pointer;padding:4px;line-height:1;transition:transform .1s}
.rev-star-btn:hover{transform:scale(1.15)}
.rev-star-label{text-align:center;font-size:14px;font-weight:600;color:var(--text2);margin-top:-4px}
.rev-textarea{width:100%;border:1px solid var(--border);border-radius:12px;padding:10px 12px;font-size:13px;resize:none;background:var(--surface2);color:var(--text);font-family:var(--fb);box-sizing:border-box}
.rev-textarea:focus{outline:none;border-color:var(--accent)}
.rev-submit{background:var(--accent);color:#fff;border:none;border-radius:12px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;font-family:var(--fd);transition:background .15s}
.rev-submit:hover:not(:disabled){background:#c73d22}
.rev-submit:disabled{opacity:.45;cursor:not-allowed}
.rev-item{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px}
.rev-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.rev-av{width:32px;height:32px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0}
.rev-name{font-size:13px;font-weight:600;color:var(--text)}
.rev-stars{display:flex;gap:1px;margin-top:2px}
.rev-time{font-size:11px;color:var(--text2);flex-shrink:0;align-self:flex-start}
.rev-comment{font-size:13px;color:var(--text);font-style:italic;margin-bottom:4px;line-height:1.4}
.rev-want{font-size:11px;color:var(--text2)}
.frow-sep{width:1px;height:16px;background:var(--border);flex-shrink:0}
.budget-input{width:62px;padding:4px 6px;border:1.5px solid var(--border);border-radius:7px;font-size:12px;font-family:var(--fb);color:var(--text);background:var(--surface2);outline:none;-moz-appearance:textfield}
.budget-input::-webkit-outer-spin-button,.budget-input::-webkit-inner-spin-button{-webkit-appearance:none}
.budget-input:focus{border-color:var(--accent)}
.budget-clear{background:none;border:none;font-size:12px;color:var(--text2);cursor:pointer;padding:0 2px;line-height:1}
.budget-clear:hover{color:var(--text)}
.save-btn{background:none;border:none;cursor:pointer;padding:2px 4px;display:flex;align-items:center;gap:2px;font-size:11px;color:var(--text2)}
.save-btn:hover{opacity:.75}
.myprof-header{display:flex;align-items:center;gap:16px;padding:20px 16px 12px;background:linear-gradient(135deg,var(--accent) 0%,#e05a30 100%);margin:-16px -16px 0}
.myprof-av{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.25);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:28px;font-weight:800;flex-shrink:0;border:3px solid rgba(255,255,255,.4)}
.myprof-name{font-family:var(--fd);font-size:20px;font-weight:800;color:#fff}
.myprof-tabs{display:flex;gap:0;overflow-x:auto;border-bottom:1px solid var(--border);margin:0 -16px;padding:0 16px;scrollbar-width:none}
.myprof-tabs::-webkit-scrollbar{display:none}
.myprof-tab{flex-shrink:0;background:none;border:none;border-bottom:2.5px solid transparent;padding:12px 14px;font-size:13px;font-weight:600;color:var(--text2);cursor:pointer;white-space:nowrap;font-family:var(--fb);transition:all .15s}
.myprof-tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.myprof-body{padding:16px 0;display:flex;flex-direction:column;gap:10px}
.myprof-offer-group{border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:0}
.myprof-offer-group-hd{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:11px 14px;background:var(--surface);font-size:13px;font-weight:700;color:var(--text);cursor:pointer;border-bottom:1px solid var(--border)}
.myprof-offer-group-hd:hover{background:var(--surface2)}
.myprof-offer-group-count{margin-left:auto;font-size:11px;font-weight:600;color:var(--text2);background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:1px 8px;flex-shrink:0}
.myprof-offer{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:12px 14px}
.myprof-offer.no-title{border-radius:0;border-left:none;border-right:none;border-top:none;border-bottom:1px solid var(--border);background:var(--surface2)}
.myprof-offer.no-title:last-child{border-bottom:none}
.myprof-offer.accepted{background:#f0fdf4;border-color:#6ee7b7}
.myprof-offer.no-title.accepted{background:#f0fdf4;border-color:transparent;border-bottom-color:#d1fae5}
.myprof-offer.declined{opacity:.6}
.myprof-offer-want{font-size:12px;font-weight:600;color:var(--accent);margin-bottom:4px;cursor:pointer}
.myprof-offer-want:hover{opacity:.8}
.myprof-offer-msg{font-size:13px;color:var(--text);line-height:1.4}
.myprof-offer-price{font-family:var(--fd);font-size:15px;font-weight:800;color:var(--text)}
.save-unsave{position:absolute;top:10px;right:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;font-size:11px;padding:3px 8px;cursor:pointer;color:var(--text2)}
.report-btn{background:none;border:none;font-size:12px;color:var(--text2);cursor:pointer;padding:2px 6px;border-radius:6px;font-family:var(--fb);font-weight:500}
.report-btn:hover{background:#fee2e2;color:#dc2626}
.rpt-reasons{display:flex;flex-direction:column;gap:6px;margin-bottom:8px}
.rpt-reason{background:var(--surface2);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;font-size:13px;font-weight:500;color:var(--text);cursor:pointer;text-align:left;font-family:var(--fb);transition:all .15s}
.rpt-reason:hover{border-color:var(--accent);background:var(--surface)}
.rpt-reason.active{border-color:var(--accent);background:#fff5f0;color:var(--accent);font-weight:700}
.rpt-resolved{opacity:.55}
.rpt-badge-resolved{font-size:10px;font-weight:700;background:#d1fae5;color:#065f46;border-radius:999px;padding:2px 8px;border:1px solid #6ee7b7}
.offer-status-accepted{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:#065f46;background:#d1fae5;border:1px solid #6ee7b7;border-radius:999px;padding:2px 9px}
.offer-status-declined{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:#991b1b;background:#fee2e2;border:1px solid #fca5a5;border-radius:999px;padding:2px 9px}
.offer-accept{background:#d1fae5;border:1px solid #6ee7b7;color:#065f46;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.offer-accept:hover{background:#6ee7b7}
.offer-decline{background:#fee2e2;border:1px solid #fca5a5;color:#dc2626;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.offer-decline:hover{background:#fca5a5}
.oitem.accepted{background:#f0fdf4;border-color:#6ee7b7}
.oitem.declined{opacity:.55}

/* BOTTOM SHEET */
.soverlay{position:fixed;inset:0;z-index:150;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding-bottom:max(80px,calc(env(safe-area-inset-bottom,0px) + 64px));animation:fi .2s}
@keyframes fi{from{opacity:0}to{opacity:1}}
.sheet{background:var(--surface);border-radius:20px 20px 0 0;width:100%;max-width:640px;max-height:80vh;overflow-y:auto;animation:su .25s ease;box-shadow:0 -8px 32px rgba(0,0,0,.15)}
@keyframes su{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
.sh-head{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start}
.sh-title{font-family:var(--fd);font-weight:700;font-size:17px;line-height:1.3;flex:1;padding-right:12px}
.sh-close{width:30px;height:30px;border-radius:50%;background:var(--surface2);border:none;cursor:pointer;font-size:14px;color:var(--text2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sh-close:hover{background:var(--surface3)}
.sh-body{padding:16px 20px max(24px,calc(env(safe-area-inset-bottom,0px) + 12px))}
.sh-budget{font-family:var(--fd);font-weight:800;font-size:24px;color:var(--green);margin-bottom:4px}
.sh-meta{font-size:12px;color:var(--text2);margin-bottom:12px}
.sh-desc{font-size:14px;color:var(--text2);line-height:1.6;margin-bottom:16px}
.offers-ttl{font-family:var(--fd);font-size:12px;font-weight:700;color:var(--text2);letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px}
.oitem{padding:12px;border:1px solid var(--border);border-radius:12px;display:flex;gap:10px;margin-bottom:8px;background:var(--surface2)}
.obody{flex:1}
.oname{font-size:13px;font-weight:600;margin-bottom:4px;color:var(--text)}
.ophoto{max-width:100%;max-height:200px;height:auto;border-radius:8px;object-fit:contain;margin-bottom:8px;border:1px solid var(--border);display:block;background:var(--surface2)}
.omsg{font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:8px}
.orow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.oprice{font-family:var(--fd);font-weight:700;font-size:16px;color:var(--green)}
.otime{font-size:11px;color:var(--text2);flex:1}
.mbtn{font-size:12px;font-weight:600;padding:5px 12px;border-radius:100px;border:1.5px solid var(--border);background:var(--surface);color:var(--text2);cursor:pointer;font-family:var(--fb);transition:all .15s}
.mbtn:hover{border-color:var(--accent);color:var(--accent)}
.compose{margin-top:16px;padding-top:16px;border-top:1px solid var(--border)}
.clabel{font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px;font-family:var(--fd);letter-spacing:.3px}
.photo-lbl{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border:1.5px dashed var(--border);border-radius:10px;cursor:pointer;font-size:13px;color:var(--text2);background:var(--surface);margin-bottom:8px}
.photo-lbl:hover{border-color:var(--accent);color:var(--accent)}
.photo-prev{max-width:100%;max-height:200px;height:auto;object-fit:contain;border-radius:8px;border:1px solid var(--border);margin-top:6px;display:block;background:var(--surface2)}
.crow{display:flex;gap:10px;align-items:flex-end}
.cmsg{flex:1;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:var(--fb);font-size:13.5px;background:var(--surface);color:var(--text);outline:none;resize:none;min-height:60px}
.cmsg:focus{border-color:var(--accent)}
.cprice{width:80px;padding:10px;border:1.5px solid var(--border);border-radius:10px;font-family:var(--fd);font-size:15px;font-weight:700;background:var(--surface);color:var(--green);outline:none}
.csend{padding:10px 16px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:var(--fb);white-space:nowrap}
.csend:hover{background:#c73d22}
.sent{color:var(--green);font-size:13px;font-weight:600;padding:10px 0}

/* FORM */
.pform{max-width:540px;margin:0 auto;padding-bottom:20px}
.ftitle{font-family:var(--fd);font-size:24px;font-weight:800;margin-bottom:6px}
.fsub{font-size:14px;color:var(--text2);margin-bottom:24px}
.fg{margin-bottom:16px}
.fl{display:block;font-size:12px;font-weight:700;color:var(--text2);margin-bottom:7px;font-family:var(--fd);letter-spacing:.5px;text-transform:uppercase}
.fi{width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:var(--fb);font-size:14px;color:var(--text);background:var(--surface);outline:none;transition:border-color .15s}
.fi:focus{border-color:var(--accent)}
textarea.fi{resize:vertical;min-height:80px}
.pac-container-wrap{flex:1;min-width:0}
.pac-container-wrap gmp-place-autocomplete{display:block;width:100%}
.pac-container-wrap gmp-place-autocomplete::part(input){width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:var(--fb);font-size:14px;color:var(--text);background:var(--surface);outline:none;box-sizing:border-box;transition:border-color .15s}
.pac-container-wrap gmp-place-autocomplete::part(input):focus{border-color:var(--accent)}
.fr2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sbtn{width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:12px;font-weight:800;font-size:15px;cursor:pointer;font-family:var(--fd);margin-top:8px}
.sbtn:hover{background:#c73d22}
.sbtn:disabled{opacity:.5;cursor:not-allowed}
.loc-row{display:flex;gap:8px;align-items:flex-end}
.loc-btn{padding:12px 14px;background:var(--surface2);border:1.5px solid var(--border);border-radius:10px;cursor:pointer;font-size:18px;flex-shrink:0;transition:border-color .15s}
.loc-btn:hover{border-color:var(--accent)}
.loc-banner{display:flex;align-items:center;gap:7px;padding:9px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;margin-bottom:10px;font-size:13px;color:var(--text2)}
.loc-banner strong{color:var(--text);font-weight:600}
.loc-banner-detect{font-size:11px;color:var(--text2);margin-left:auto;animation:spin 1s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.loc-prompt{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--surface2);border:1.5px solid var(--border);border-radius:10px;margin-bottom:10px}
.loc-prompt-input{flex:1;border:none;outline:none;font-family:var(--fb);font-size:13px;color:var(--text);background:transparent;min-width:0}
.loc-prompt-input::placeholder{color:var(--text2)}
.loc-prompt-btn{padding:5px 12px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--fd);flex-shrink:0}
.dist-badge{font-size:11px;font-weight:600;color:var(--text2);background:var(--surface2);border:1px solid var(--border);border-radius:100px;padding:2px 8px;white-space:nowrap;flex-shrink:0}
.prof-loc-edit-wrap{display:flex;flex-direction:column;gap:6px;margin-top:6px;position:relative}
.prof-loc-edit-row{display:flex;align-items:center;gap:8px}
.prof-loc-text-input{flex:1;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-family:var(--fb);font-size:14px;color:var(--text);background:var(--surface);outline:none;min-width:0;transition:border-color .15s}
.prof-loc-text-input:focus{border-color:var(--accent)}
.prof-loc-sug-list{position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.12)}
.prof-loc-sug-item{padding:12px 14px;font-size:14px;color:var(--text);cursor:pointer;border-bottom:1px solid var(--border)}
.prof-loc-sug-item:last-child{border-bottom:none}
.prof-loc-sug-item:active{background:var(--surface2)}

/* MY POSTS */
.stitle{font-family:var(--fd);font-size:20px;font-weight:800;margin-bottom:6px}
.ssub{font-size:13px;color:var(--text2);margin-bottom:16px}
.mcard{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:12px}
.mtop{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:10px}
.mtitle{font-family:var(--fd);font-weight:700;font-size:15px}
.badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;font-family:var(--fd);white-space:nowrap}
.bo{background:rgba(232,75,42,.1);color:var(--accent)}
.bn{background:var(--surface2);color:var(--text2)}
.mbudget{font-family:var(--fd);font-size:14px;color:var(--green);font-weight:700;margin-bottom:6px}
.mdesc{font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:10px}
.cacts{display:flex;gap:8px;margin-bottom:10px}
.eedit{font-size:12px;font-weight:600;padding:6px 14px;border-radius:100px;border:1.5px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;font-family:var(--fb)}
.eedit:hover{border-color:var(--accent);color:var(--accent)}
.edel{font-size:12px;font-weight:600;padding:6px 14px;border-radius:100px;border:1.5px solid var(--border);background:transparent;color:var(--red);cursor:pointer;font-family:var(--fb)}
.edel:hover{border-color:var(--red);background:rgba(220,38,38,.05)}
.moffer{background:var(--surface2);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:10px;margin-bottom:6px;cursor:pointer}
.moffer:hover{background:var(--surface3)}
.mon{font-size:13px;font-weight:600;flex-shrink:0}
.mom{font-size:12px;color:var(--text2);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mop{font-family:var(--fd);font-size:14px;font-weight:700;color:var(--green);flex-shrink:0}
.reply-btn{font-size:11px;font-weight:600;padding:4px 10px;border-radius:100px;border:1.5px solid var(--accent);background:transparent;color:var(--accent);cursor:pointer;font-family:var(--fb);flex-shrink:0}

/* MESSAGES */
.clist{display:flex;flex-direction:column;gap:8px}
.citem{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 16px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:12px}
.citem:hover{border-color:var(--accent);box-shadow:0 2px 8px rgba(0,0,0,.07)}
.citem.unread{border-color:#fca5a5;background:#fff8f8}
.cinfo{flex:1;min-width:0}
.cinfo-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px}
.cwith{font-size:14px;font-weight:600;color:var(--text)}
.cwith.unread{font-weight:700}
.ctime{font-size:11px;color:var(--text2);flex-shrink:0}
.cprev{font-size:12px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cprev.unread{color:var(--text);font-weight:500}
.cwant{font-size:11px;color:var(--text2);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cunread-dot{width:9px;height:9px;background:var(--accent);border-radius:50%;flex-shrink:0}
.citem-actions{display:flex;flex-direction:column;gap:4px;flex-shrink:0;margin-left:4px}
.cact-btn{background:transparent;border:1px solid var(--border);border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:13px;padding:0;display:flex;align-items:center;justify-content:center;transition:all .15s}
.cact-btn:hover{background:var(--bg);border-color:var(--accent)}
.msg-search{width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:12px;font-size:14px;margin-bottom:10px;background:var(--surface);outline:none}
.msg-search:focus{border-color:var(--accent)}
.msg-filters{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}
.msg-chip{background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:500;cursor:pointer;color:var(--text2);transition:all .15s}
.msg-chip:hover{border-color:var(--accent)}
.msg-chip.active{background:var(--accent);color:#fff;border-color:var(--accent)}
.msg-tools{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;align-items:center}
.msg-sort{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;color:var(--text);cursor:pointer;outline:none}
.msg-toggle{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;color:var(--text2);transition:all .15s}
.msg-toggle:hover{border-color:var(--accent)}
.msg-toggle.active{background:var(--accent);color:#fff;border-color:var(--accent)}
.cgroup{margin-bottom:14px}
.cgroup-head{font-size:12px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;padding:6px 4px;margin-bottom:6px;border-bottom:1px solid var(--border)}
.cgroup-count{color:var(--text2);font-weight:500;text-transform:none;letter-spacing:0}
.cgroup .citem{margin-bottom:6px}
.msg-section-hd{font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;padding:14px 4px 6px;border-bottom:1px solid var(--border);margin-bottom:8px}
.cprice-tag{font-size:11px;font-weight:700;color:var(--green);background:#eef8f1;padding:2px 7px;border-radius:6px;flex-shrink:0;margin-left:auto}

/* ADMIN PANEL */
.admin-tabs{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}
.admin-tab{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;color:var(--text2);transition:all .15s}
.admin-tab:hover{border-color:var(--accent)}
.admin-tab.active{background:var(--accent);color:#fff;border-color:var(--accent)}
.admin-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
.admin-stat{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center}
.admin-stat-num{font-family:var(--fd);font-size:26px;font-weight:800;color:var(--accent)}
.admin-stat-label{font-size:11px;color:var(--text2);margin-top:4px;font-weight:500}
.admin-table{display:flex;flex-direction:column;gap:10px}
.admin-row{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:10px}
.admin-row-info{flex:1;min-width:0}
.admin-row-title{font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.admin-row-sub{font-size:11px;color:var(--text2);margin-top:2px}
.admin-del{background:#fee2e2;border:1px solid #fca5a5;color:#dc2626;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s}
.admin-del:hover{background:#fca5a5}
.admin-ban{background:#fef3c7;border:1px solid #fcd34d;color:#92400e;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s}
.admin-ban:hover{background:#fcd34d}
.admin-unban{background:#d1fae5;border:1px solid #6ee7b7;color:#065f46;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s}
.admin-unban:hover{background:#6ee7b7}
.admin-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.admin-badge{font-size:10px;padding:2px 8px;border-radius:999px;background:#f1f5f9;color:var(--text2);border:1px solid var(--border)}
.banned-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:max(30px,calc(env(safe-area-inset-top,0px) + 20px)) 30px max(30px,calc(env(safe-area-inset-bottom,0px) + 20px));text-align:center}
.banned-icon{font-size:56px}
.banned-title{font-family:var(--fd);font-size:24px;font-weight:800;color:#dc2626}
.banned-sub{font-size:14px;color:var(--text2);max-width:300px}

/* CHAT SCREEN — full-screen native-style overlay */
.chat-screen{position:fixed;inset:0;z-index:300;background:var(--bg);display:flex;flex-direction:column;overscroll-behavior:none}
.chat-header{display:flex;align-items:center;gap:12px;padding:calc(14px + env(safe-area-inset-top,0px)) 16px 14px;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0}
.chat-back{background:none;border:none;font-size:26px;line-height:1;color:var(--accent);cursor:pointer;padding:0 6px 0 0;font-family:var(--fb);font-weight:300;flex-shrink:0}
.chat-header-info{flex:1;min-width:0}
.chat-header-name{font-family:var(--fd);font-weight:800;font-size:16px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chat-header-sub{font-size:11px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.chat-offer-bar{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--surface2);border-bottom:1px solid var(--border);flex-shrink:0}
.chat-offer-thumb{width:40px;height:40px;border-radius:8px;object-fit:cover;flex-shrink:0}
.chat-offer-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text2)}
.chat-offer-price{font-family:var(--fd);font-size:16px;font-weight:800;color:var(--accent)}
.chat-messages{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 12px;display:flex;flex-direction:column;gap:6px;min-height:0}
.chat-msg-wrap{display:flex;flex-direction:column;max-width:75%;min-width:0}
.chat-msg-wrap.mine{align-self:flex-end;align-items:flex-end}
.chat-msg-wrap.theirs{align-self:flex-start;align-items:flex-start}
.chat-bubble{padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.5;word-wrap:break-word;overflow-wrap:break-word;word-break:break-word;white-space:pre-wrap;min-width:0;box-sizing:border-box}
.chat-bubble.mine{background:var(--accent);color:#fff;border-bottom-right-radius:4px}
.chat-bubble.theirs{background:var(--surface);color:var(--text);border-bottom-left-radius:4px;border:1px solid var(--border)}
.chat-bubble.offer{border:2px solid var(--accent)}
.chat-bubble-sender{font-size:10px;font-weight:700;color:var(--text2);margin-bottom:3px}
.chat-bubble-img{width:100%;border-radius:10px;margin-bottom:6px;max-height:200px;object-fit:contain;display:block}
.chat-bubble-time{font-size:10px;opacity:.55;margin-top:4px;display:block}
.chat-msg-del{background:none;border:none;color:var(--text2);font-size:10px;cursor:pointer;padding:2px 0;margin-top:2px;font-family:var(--fb)}
.chat-msg-del:active{color:var(--red)}
.chat-send-err{padding:6px 16px;color:#dc2626;font-size:12px;background:#fef2f2;border-top:1px solid #fecaca;flex-shrink:0}
.chat-input-area{display:flex;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));background:var(--surface);border-top:1px solid var(--border);flex-shrink:0;align-items:center}
.chat-input{flex:1;padding:10px 14px;border:1.5px solid var(--border);border-radius:22px;font-family:var(--fb);font-size:14px;color:var(--text);background:var(--surface2);outline:none}
.chat-input:focus{border-color:var(--accent)}
.chat-send-btn{padding:10px 18px;background:var(--accent);color:#fff;border:none;border-radius:22px;font-weight:700;cursor:pointer;font-family:var(--fb);font-size:14px;flex-shrink:0;white-space:nowrap}
.chat-send-btn:active{opacity:.85}
/* OTHER MODALS (edit, post, etc.) */
.moverlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:max(20px,calc(env(safe-area-inset-top,0px) + 10px)) 16px max(20px,calc(env(safe-area-inset-bottom,0px) + 10px))}
.modal{background:var(--surface);border-radius:20px;width:100%;max-width:500px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(0,0,0,.2);border:1px solid var(--border)}
.mhead{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.mttl{font-family:var(--fd);font-size:16px;font-weight:700}
.msub{font-size:12px;color:var(--text2);margin-top:2px}
.mclose{width:30px;height:30px;border-radius:50%;background:var(--surface2);border:none;cursor:pointer;font-size:14px;color:var(--text2);display:flex;align-items:center;justify-content:center}
.ebody{padding:20px;overflow-y:auto}

/* EMPTY / LOADING */
.empty{text-align:center;padding:50px 20px;color:var(--text2)}
.eicon{font-size:44px;margin-bottom:12px}
.etitle{font-family:var(--fd);font-size:18px;font-weight:700;color:var(--text)}
.esub{font-size:13px;margin-top:6px}
.loading{text-align:center;padding:60px 20px;color:var(--text2);font-size:14px}
.offline-banner{position:fixed;top:0;left:0;right:0;z-index:5000;background:#1A1A1A;color:#fff;text-align:center;font-size:13px;font-weight:600;padding:calc(8px + env(safe-area-inset-top,0px)) 16px 8px;display:flex;align-items:center;justify-content:center;gap:8px;font-family:var(--fb);box-shadow:0 2px 8px rgba(0,0,0,.2)}
.offline-banner .dot{width:8px;height:8px;border-radius:50%;background:#f59e0b}
.how-link{background:var(--surface2);border:1.5px solid var(--border);width:26px;height:26px;border-radius:50%;font-size:13px;font-weight:800;color:var(--text2);cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;margin-left:6px;font-family:var(--fb);transition:all .15s}
.how-link:hover{border-color:var(--accent);color:var(--accent)}
.onb-overlay{position:fixed;inset:0;z-index:4000;background:rgba(20,15,12,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:max(20px,calc(env(safe-area-inset-top,0px) + 12px)) 20px max(20px,calc(env(safe-area-inset-bottom,0px) + 12px));animation:onbFade .25s ease}
@keyframes onbFade{from{opacity:0}to{opacity:1}}
.onb-card{background:var(--surface);border-radius:24px;padding:36px 28px 24px;max-width:380px;width:100%;text-align:center;box-shadow:0 24px 60px -10px rgba(0,0,0,.35);position:relative;animation:onbPop .3s ease}
@keyframes onbPop{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}
.onb-skip{position:absolute;top:14px;right:18px;background:none;border:none;font-size:13px;color:var(--text2);cursor:pointer;font-family:var(--fb);font-weight:600;padding:4px 8px;border-radius:6px}
.onb-skip:hover{background:var(--surface2);color:var(--text)}
.onb-icon{font-size:64px;line-height:1;margin-bottom:14px}
.onb-title{font-family:var(--fd);font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;letter-spacing:-.5px}
.onb-text{font-size:14.5px;color:var(--text2);line-height:1.55;margin-bottom:22px;padding:0 6px}
.onb-dots{display:flex;justify-content:center;gap:7px;margin-bottom:20px}
.onb-dot{width:7px;height:7px;border-radius:50%;background:var(--border);cursor:pointer;transition:all .2s}
.onb-dot.active{background:var(--accent);width:22px;border-radius:4px}
.onb-next{width:100%;background:var(--accent);border:none;color:#fff;border-radius:14px;padding:14px;font-size:15px;font-weight:700;font-family:var(--fb);cursor:pointer;transition:all .15s}
.onb-next:hover{filter:brightness(1.05);transform:translateY(-1px)}
.terms-check-row{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;color:var(--text2);margin:4px 0;cursor:pointer;line-height:1.5}
.terms-check-row input{margin-top:2px;accent-color:var(--accent);cursor:pointer}
.terms-link{background:none;border:none;padding:0;color:var(--accent);font-size:inherit;font-family:inherit;cursor:pointer;text-decoration:underline;font-weight:600}
.terms-link:hover{opacity:.75}
.auth-footer{display:flex;justify-content:center;gap:10px;font-size:12px;padding:14px 0 4px;color:var(--text2)}
.legal-overlay{position:fixed;inset:0;z-index:3000;background:var(--bg);display:flex;flex-direction:column;overflow:hidden}
.legal-page{display:flex;flex-direction:column;height:100%;max-width:540px;margin:0 auto;width:100%}
.legal-header{display:flex;align-items:center;gap:12px;padding:calc(16px + env(safe-area-inset-top,0px)) 20px 16px;border-bottom:1px solid var(--border);background:var(--surface);position:sticky;top:0;z-index:1}
.legal-back{background:none;border:none;font-size:14px;color:var(--accent);cursor:pointer;font-family:var(--fb);font-weight:600;padding:0}
.legal-back:hover{opacity:.75}
.legal-title{font-family:var(--fd);font-size:17px;font-weight:800;color:var(--text)}
.legal-body{flex:1;overflow-y:auto;padding:20px 24px max(40px,calc(env(safe-area-inset-bottom,0px) + 20px));line-height:1.7;color:var(--text)}
.legal-body h3{font-family:var(--fd);font-size:15px;font-weight:800;margin:20px 0 6px;color:var(--text)}
.legal-body p{font-size:13.5px;color:var(--text2);margin:0 0 8px}
.legal-updated{font-size:12px;color:var(--text2);font-style:italic;margin-bottom:16px!important}

/* SINGLE COLUMN FEED */
.feed-col{display:flex;flex-direction:column;gap:14px}
.feed-card{background:var(--surface);border-radius:var(--r);border:1px solid var(--border);box-shadow:0 1px 6px rgba(0,0,0,.06);overflow:hidden;cursor:pointer;transition:box-shadow .2s}
.feed-card:active{box-shadow:0 3px 14px rgba(0,0,0,.1)}
.feed-urow{display:flex;align-items:center;gap:10px;padding:14px 16px 8px}
.feed-body{padding:0 16px 10px}
.feed-title{font-family:var(--fd);font-weight:700;font-size:16px;color:var(--text);margin-bottom:5px;line-height:1.3}
.feed-desc{font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.feed-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;align-items:center}
.feed-foot{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-top:1px solid var(--border);background:var(--surface2)}
.feed-img{width:100%;max-height:220px;object-fit:cover;display:block;border-radius:0}

/* MY WANTS POST CARD */
.mine-new-card{border:2px dashed var(--border);border-radius:var(--r);padding:28px 20px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s;background:var(--surface)}
.mine-new-card:active{border-color:var(--accent);background:#fff8f6}
.mine-new-icon{font-size:36px;margin-bottom:10px}
.mine-new-title{font-family:var(--fd);font-weight:700;font-size:16px;color:var(--text);margin-bottom:5px}
.mine-new-sub{font-size:13px;color:var(--text2)}

/* MY WANTS FEED CARDS */
.mine-feed-col{display:flex;flex-direction:column;gap:12px}
.mine-feed-card{background:var(--surface);border-radius:var(--r);border:1px solid var(--border);overflow:hidden;cursor:pointer;transition:box-shadow .15s;box-shadow:0 1px 6px rgba(0,0,0,.06)}
.mine-feed-card:active{box-shadow:0 3px 14px rgba(0,0,0,.1)}
.mine-feed-head{padding:14px 16px 6px;display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.mine-feed-body{padding:0 16px 10px}
.mine-feed-foot{display:flex;align-items:center;gap:8px;padding:10px 16px;border-top:1px solid var(--border);background:var(--surface2)}

/* MESSAGES LIST */
.msg-list{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.msg-item{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .1s;position:relative}
.msg-item:last-child{border-bottom:none}
.msg-item:active{background:var(--surface2)}
.msg-item.unread{background:#fff9f7}
.msg-item.swiped{background:#fff0ec;border-left:4px solid var(--red)}
.msg-item-av{width:46px;height:46px;border-radius:50%;background:var(--accent);color:#fff;font-family:var(--fd);font-weight:800;font-size:19px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.msg-item-body{flex:1;min-width:0}
.msg-item-name{font-family:var(--fd);font-weight:700;font-size:14px;color:var(--text);margin-bottom:2px;display:flex;align-items:center;gap:6px}
.msg-item-new{font-size:10px;font-weight:700;color:var(--accent);background:#fff0ec;border-radius:4px;padding:1px 5px;flex-shrink:0}
.msg-item-preview{font-size:12px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.msg-item-want{font-size:11px;color:var(--text2);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.msg-item-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0}
.msg-item-time{font-size:11px;color:var(--text2)}
.msg-item-dot{width:10px;height:10px;border-radius:50%;background:var(--accent)}
.msg-item-del{padding:6px 12px;border-radius:8px;border:1.5px solid var(--red);background:var(--red);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--fb);flex-shrink:0;white-space:nowrap}
.msg-item-del:active{opacity:.9}

/* PROFILE PAGE */
.prof-page{display:flex;flex-direction:column;gap:0;padding-bottom:8px}
.prof-hero{display:flex;align-items:center;gap:14px;padding:20px 0 16px}
.prof-hero-av{width:68px;height:68px;border-radius:50%;background:var(--accent);color:#fff;font-family:var(--fd);font-weight:800;font-size:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.prof-hero-name{font-family:var(--fd);font-weight:800;font-size:20px;color:var(--text);margin-bottom:3px}
.prof-hero-email{font-size:12px;color:var(--text2)}
.prof-mini-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:20px}
.prof-mini-stat{text-align:center;padding:10px 4px;background:var(--surface)}
.prof-mini-stat:not(:last-child){border-right:1px solid var(--border)}
.prof-mini-num{font-family:var(--fd);font-weight:800;font-size:18px;color:var(--text)}
.prof-mini-label{font-size:9px;color:var(--text2);font-weight:700;margin-top:2px;text-transform:uppercase;letter-spacing:.4px}
.prof-section-hd{font-family:var(--fd);font-weight:700;font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;margin-top:20px}
.prof-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:12px}
.prof-row{display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:1px solid var(--border)}
.prof-row:last-child{border-bottom:none}
.prof-row-icon{font-size:18px;width:26px;text-align:center;flex-shrink:0}
.prof-row-body{flex:1;min-width:0}
.prof-row-label{font-size:14px;font-weight:600;color:var(--text);font-family:var(--fb)}
.prof-row-sub{font-size:12px;color:var(--text2);margin-top:1px}
.prof-toggle{position:relative;width:44px;height:26px;border-radius:13px;background:var(--border);cursor:pointer;transition:background .2s;flex-shrink:0;border:none;padding:0}
.prof-toggle.on{background:var(--accent)}
.prof-toggle::after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.prof-toggle.on::after{transform:translateX(18px)}
.prof-loc-input{border:none;outline:none;font-family:var(--fb);font-size:14px;color:var(--text);background:transparent;width:100%;min-width:0}
.prof-loc-input::placeholder{color:var(--text2)}
.prof-action-btn{width:100%;padding:14px;border-radius:14px;font-family:var(--fd);font-weight:700;font-size:15px;cursor:pointer;text-align:center;border:1px solid var(--border);background:var(--surface);color:var(--text);margin-bottom:10px;display:block;transition:background .15s}
.prof-action-btn:active{background:var(--surface2)}
.prof-support-btn{width:100%;padding:14px;border-radius:14px;font-family:var(--fd);font-weight:700;font-size:15px;cursor:pointer;text-align:center;border:1.5px solid #E84B2A;background:var(--surface);color:#E84B2A;margin-bottom:10px;display:block;transition:background .15s,color .15s}
.prof-support-btn:active{background:#fff0ec}
.support-page{display:flex;flex-direction:column;min-height:100%}
.support-topbar{display:flex;align-items:center;gap:12px;padding:16px 0 12px;margin-bottom:4px}
.support-back{background:none;border:none;font-family:var(--fd);font-weight:700;font-size:15px;color:var(--accent);cursor:pointer;padding:0;line-height:1}
.support-title{font-family:var(--fd);font-weight:800;font-size:20px;color:var(--text)}
.support-body{display:flex;flex-direction:column;gap:0;padding-bottom:40px}
.support-section-hd{font-family:var(--fd);font-weight:700;font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;margin-top:20px}
.support-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px 16px;margin-bottom:4px}
.support-row{display:flex;align-items:flex-start;gap:12px}
.support-icon{font-size:20px;line-height:1;margin-top:2px}
.support-row-label{font-family:var(--fd);font-size:11px;color:var(--text2);font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
.support-row-val{font-family:var(--fb);font-size:15px;color:var(--text);text-decoration:none;display:block}
a.support-row-val{color:#E84B2A}
.support-faq-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px 16px;margin-bottom:8px}
.support-faq-q{font-family:var(--fd);font-weight:700;font-size:14px;color:var(--text);margin-bottom:6px}
.support-faq-a{font-family:var(--fb);font-size:14px;color:var(--text2);line-height:1.5}
.prof-danger-btn{width:100%;padding:14px;border-radius:14px;font-family:var(--fd);font-weight:700;font-size:15px;cursor:pointer;text-align:center;border:1px solid #fca5a5;background:var(--surface);color:var(--red);margin-bottom:10px;display:block;transition:background .15s}
.prof-danger-btn:active{background:#fff5f5}
`;


const CATS = ["All","Electronics","Furniture","Tools","Sports","Home","Music","Fashion","Collectibles","Other"];
const RADIUS_OPTIONS = [5, 10, 25, 50];
const NAV = [
{id:"browse",icon:"🏠",label:"Home"},
{id:"mine",icon:"📋",label:"My Wants"},
{id:"messages",icon:"💬",label:"Messages"},
{id:"myprofile",icon:"👤",label:"Profile"},
];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];
const MAX_FILE_SIZE_MB = 15;

function validateImageFiles(files) {
  for (const f of files) {
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type.toLowerCase())) {
      return `"${f.name}" is not a supported image type. Use JPG, PNG, or WebP.`;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `"${f.name}" is too large (max ${MAX_FILE_SIZE_MB}MB).`;
    }
  }
  return null;
}

function AddPhotoButton({ onPick, disabled }) {
const inputRef = useRef(null);
const [showSheet, setShowSheet] = useState(false);
const isNative = !!(window.Capacitor?.isNativePlatform?.());
const handleClick = () => {
  if (disabled) return;
  if (isNative) {
    setShowSheet(true);
  } else {
    inputRef.current?.click();
  }
};
const handleSource = (src) => {
  setShowSheet(false);
  onPick({ nativeSource: src });
};
return (
  <>
    <div className="add-photo-btn" onClick={handleClick} style={{cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1}}>
      <span>📷</span>
      {disabled ? "…" : "Add Photos"}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{display:"none"}}
        onChange={disabled ? undefined : onPick}
      />
    </div>
    {showSheet && (
      <div className="photo-src-overlay" onClick={() => setShowSheet(false)}>
        <div className="photo-src-sheet" onClick={e => e.stopPropagation()}>
          <div className="photo-src-title">Add Photo</div>
          <button className="photo-src-btn" onClick={() => handleSource("camera")}>
            <span>📷</span> Take Photo
          </button>
          <button className="photo-src-btn" onClick={() => handleSource("library")}>
            <span>🖼️</span> Choose from Library
          </button>
          <button className="photo-src-cancel" onClick={() => setShowSheet(false)}>Cancel</button>
        </div>
      </div>
    )}
  </>
);
}

export default function App() {
const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [authTab, setAuthTab] = useState("login");
const [agreeTerms, setAgreeTerms] = useState(false);
const [legalPage, setLegalPage] = useState(null);
const [af, setAf] = useState({name:"",email:"",password:""});
const [authErr, setAuthErr] = useState("");
const [authBusy, setAuthBusy] = useState(false);
const [forgotMode, setForgotMode] = useState(false);
const [showPass, setShowPass] = useState(false);
const [forgotEmail, setForgotEmail] = useState("");
const [forgotSent, setForgotSent] = useState(false);
const [forgotBusy, setForgotBusy] = useState(false);
const [forgotErr, setForgotErr] = useState("");

const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
const [banned, setBanned] = useState([]);
const [adminTab, setAdminTab] = useState("dashboard");
const [profileUid, setProfileUid] = useState(null);
const [profileData, setProfileData] = useState(null);
const [profileReviews, setProfileReviews] = useState([]);
const [myReviewedKeys, setMyReviewedKeys] = useState([]);
const [reviewSheet, setReviewSheet] = useState(null);
const [reviewStars, setReviewStars] = useState(0);
const [reviewHover, setReviewHover] = useState(0);
const [reviewComment, setReviewComment] = useState("");
const [reviewBusy, setReviewBusy] = useState(false);
const [savedWants, setSavedWants] = useState([]);
const [myReportedWants, setMyReportedWants] = useState([]);
const [reportSheet, setReportSheet] = useState(null);
const [reportReason, setReportReason] = useState("");
const [reportNote, setReportNote] = useState("");
const [reportBusy, setReportBusy] = useState(false);
const [reportDone, setReportDone] = useState(false);
const [adminReports, setAdminReports] = useState([]);
const [adminReportsLoaded, setAdminReportsLoaded] = useState(false);
const [profileTab, setProfileTab] = useState("overview");
const [notifPrefs, setNotifPrefs] = useState({messages:true, offers:true, offerStatus:true});
const notifPrefsRef = useRef(notifPrefs);
useEffect(() => { notifPrefsRef.current = notifPrefs; }, [notifPrefs]);
const [offerFilter, setOfferFilter] = useState("all"); // owner offer pipeline filter: all|pending|accepted|declined
const [onboardingOpen, setOnboardingOpen] = useState(false);
const [onboardingStep, setOnboardingStep] = useState(0);
const [onboardingChecked, setOnboardingChecked] = useState(false);
const [showPostSheet, setShowPostSheet] = useState(false);
const [privacyEnabled, setPrivacyEnabled] = useState(false);
const [userLocation, setUserLocation] = useState("");
const [onbLocation, setOnbLocation] = useState("");
const [onbLocLoading, setOnbLocLoading] = useState(false);
const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" && navigator.onLine === false);
useEffect(() => {
  const on = () => setIsOffline(false);
  const off = () => setIsOffline(true);
  window.addEventListener("online", on);
  window.addEventListener("offline", off);
  return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
}, []);
const [myReviews, setMyReviews] = useState([]);
const [myReviewsLoaded, setMyReviewsLoaded] = useState(false);
const [view, setView] = useState("browse");
const [search, setSearch] = useState("");
const [cat, setCat] = useState("All");
const [distFilter, setDistFilter] = useState("Any Distance");
const [userLatLng, setUserLatLng] = useState(null);
const [locDetecting, setLocDetecting] = useState(false);
const [locDenied, setLocDenied] = useState(false);
const [locPromptVal, setLocPromptVal] = useState("");
const [profLocEditing, setProfLocEditing] = useState(false);
const [profLocInput, setProfLocInput] = useState("");
const [profLocSugs, setProfLocSugs] = useState([]);
const [budgetMin, setBudgetMin] = useState("Any budget");
const [wants, setWants] = useState([]);
const [loading, setLoading] = useState(true);
const [sheet, setSheet] = useState(null);
const [notifPerm, setNotifPerm] = useState(() => typeof Notification !== "undefined" ? Notification.permission : "unsupported");
const [pendingConvoId, setPendingConvoId] = useState(null);
const prevOfferCounts = useRef(null);
const prevConvoUpdates = useRef(null);
const justSignedUp = useRef(false);
const [refreshing, setRefreshing] = useState(false);
const [pullY, setPullY] = useState(0);
const touchStartY = useRef(0);

const [oc, setOc] = useState({message:"",price:"",photoUrl:""});
const [photoPrev, setPhotoPrev] = useState(null);
const [photoFile, setPhotoFile] = useState(null);
const [sent, setSent] = useState({});
const [sending, setSending] = useState(false);
const [offerError, setOfferError] = useState("");

const [form, setForm] = useState({title:"",description:"",budget:"",category:"",location:""});
const [locLoading, setLocLoading] = useState(false);
const [posting, setPosting] = useState(false);
const locationInputRef = useRef(null);
const autocompleteRef = useRef(null);
const [posted, setPosted] = useState(false);

const [editId, setEditId] = useState(null);
const [ef, setEf] = useState({});
const [editPhotos, setEditPhotos] = useState([]);
const [editPhotoPreviews, setEditPhotoPreviews] = useState([]);
const [editPhotoPicking, setEditPhotoPicking] = useState(false);
const [editSaving, setEditSaving] = useState(false);

const [notifOpen, setNotifOpen] = useState(false);
const [postPhotos, setPostPhotos] = useState([]);
const [postPhotoPreviews, setPostPhotoPreviews] = useState([]);
const [postPhotoPicking, setPostPhotoPicking] = useState(false);
const [postPhotoErr, setPostPhotoErr] = useState("");
const [uploadingPhotos, setUploadingPhotos] = useState(false);
const [editSaveErr, setEditSaveErr] = useState("");
const [convos, setConvos] = useState([]);
const [hasUnread, setHasUnread] = useState(false);
const [msgFilter, setMsgFilter] = useState("all");
const [msgSearch, setMsgSearch] = useState("");
const [msgSort, setMsgSort] = useState("newest");
const [msgGroup, setMsgGroup] = useState(false);
const [showArchived, setShowArchived] = useState(false);
const [chat, setChat] = useState(null);
const [msgs, setMsgs] = useState([]);
const [ci, setCi] = useState("");
const [swipedConvoId, setSwipedConvoId] = useState(null);
const swipeStartX = useRef(0);
const swipeStartY = useRef(0);
const swipeDidMove = useRef(false);
const [msgSendErr, setMsgSendErr] = useState("");
const btm = useRef(null);
const prevMsgCount = useRef(0);
const msgsRef = useRef(null);
const profLocInputRef = useRef(null);
const profAcRef = useRef(null);


// Auth listener — auth is already platform-aware (getAuth() on native, initializeAuth on web)
useEffect(() => {
  const unsub = onAuthStateChanged(auth, async u => {
    setUser(u);
    setAuthLoading(false);
    if (u) {
      const sd = setDoc, st = serverTimestamp;
      sd(doc(db,"users",u.uid),{name:u.displayName||u.email,email:u.email,uid:u.uid,joinedAt:st()},{merge:true}).catch(err=>console.error("User upsert failed:",err));
    }
  });
  // Safety timeout: if onAuthStateChanged never fires in a native webview, unfreeze the UI
  const safety = setTimeout(() => setAuthLoading(false), 5000);
  return () => { unsub(); clearTimeout(safety); };
}, []);

// Handle Google redirect result on page load (web only — native uses GoogleAuth.signIn() instead)
useEffect(() => {
  if (Capacitor.isNativePlatform()) return;
  getRedirectResult(auth, browserPopupRedirectResolver).then(result => {
    if (result?.user) {
      setUser(result.user);
      if (getAdditionalUserInfo(result)?.isNewUser) justSignedUp.current = true;
      const sd = setDoc, st = serverTimestamp;
      sd(doc(db,"users",result.user.uid),{name:result.user.displayName||result.user.email,email:result.user.email,uid:result.user.uid,joinedAt:st()},{merge:true}).catch(err=>console.error("Redirect user upsert failed:",err));
    }
  }).catch(e => {
    // Silently swallow expected "no redirect" / cancelled cases
    console.warn("Google redirect result error:", e.message || e);
  });
}, []);

// Live listener for user doc (savedWants, reviewedKeys, reportedWants)
useEffect(() => {
if (!user) return;
return onSnapshot(doc(db,"users",user.uid), snap => {
  if (snap.exists()) {
    const data = snap.data();
    setMyReviewedKeys(data.reviewedKeys||[]);
    setSavedWants(data.savedWants||[]);
    setMyReportedWants(data.reportedWants||[]);
    const np = data.notifPrefs || {};
    setNotifPrefs({
      messages: np.messages !== false,
      offers: np.offers !== false,
      offerStatus: np.offerStatus !== false,
    });
    setPrivacyEnabled(data.privacyEnabled || false);
    setUserLocation(data.location || "");
    if (!onboardingChecked) {
      setOnboardingChecked(true);
      if (!data.onboardingDone && justSignedUp.current) { setOnboardingStep(0); setOnboardingOpen(true); }
    }
  }
}, err => console.error("User doc listener failed:", err));
}, [user?.uid]);

// Wants
useEffect(() => {
const q = query(collection(db,"wants"), orderBy("createdAt","desc"));
return onSnapshot(q, snap => {
const fresh = snap.docs.map(d=>({id:d.id,...d.data()}));
setWants(fresh);
setLoading(false);
setUser(u => {
  if (u && prevOfferCounts.current !== null) {
    fresh.filter(w => w.userId === u.uid).forEach(w => {
      const prev = prevOfferCounts.current[w.id] ?? (w.offers||[]).length;
      const curr = (w.offers||[]).length;
      if (curr > prev && Notification.permission === "granted" && notifPrefsRef.current.offers !== false) {
        const latest = w.offers[w.offers.length - 1];
        new Notification("New offer on your want!", {
          body: `${latest?.from || "Someone"} offered $${latest?.price || "?"} for "${w.title}"`,
          icon: "/favicon.ico",
        });
      }
      prevOfferCounts.current[w.id] = curr;
    });
  } else if (u && prevOfferCounts.current === null) {
    prevOfferCounts.current = {};
    fresh.filter(w => w.userId === u.uid).forEach(w => {
      prevOfferCounts.current[w.id] = (w.offers||[]).length;
    });
  }
  return u;
});
});
}, []);

// Keep open sheet in sync with live wants data
useEffect(() => {
if (sheet) setSheet(prev => wants.find(w => w.id === prev?.id) || prev);
}, [wants]);

// On mount: load saved location from localStorage, then auto-detect if nothing saved
useEffect(() => {
try {
  const saved = JSON.parse(localStorage.getItem("wb_user_loc") || "null");
  const savedDist = localStorage.getItem("wb_dist_filter");
  if (saved?.lat && saved?.lng) {
    setUserLatLng({lat: saved.lat, lng: saved.lng});
  }
  if (saved?.text) {
    setUserLocation(saved.text);
  } else {
    autoDetectLocation();
  }
  if (savedDist) setDistFilter(savedDist);
} catch { autoDetectLocation(); }
}, []); // eslint-disable-line react-hooks/exhaustive-deps

// Persist user location to localStorage
useEffect(() => {
if (userLocation && userLatLng) {
  try { localStorage.setItem("wb_user_loc", JSON.stringify({text: userLocation, lat: userLatLng.lat, lng: userLatLng.lng})); } catch {}
} else if (userLocation) {
  try { localStorage.setItem("wb_user_loc", JSON.stringify({text: userLocation, lat: null, lng: null})); } catch {}
}
}, [userLocation, userLatLng]);

// Persist distance filter
useEffect(() => {
try { localStorage.setItem("wb_dist_filter", distFilter); } catch {}
}, [distFilter]);

// Reset profile location edit state when closed
useEffect(() => {
if (!profLocEditing) { setProfLocInput(""); setProfLocSugs([]); }
}, [profLocEditing]);

// Debounced city search via Nominatim — no API key, CORS-safe, works in iOS WKWebView
useEffect(() => {
if (!profLocEditing || profLocInput.trim().length < 2) { setProfLocSugs([]); return; }
const controller = new AbortController();
const timer = setTimeout(async () => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(profLocInput.trim())}&format=json&limit=7&addressdetails=1`,
      { signal: controller.signal, headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const seen = new Set();
    const sugs = data
      .filter(r => r.address)
      .map(r => {
        const city = r.address.city || r.address.town || r.address.village || r.address.county || r.name || "";
        const state = r.address.state_code || r.address.state || "";
        const country = (r.address.country_code || "").toUpperCase();
        const desc = city && state
          ? `${city}, ${state}`
          : city && country ? `${city}, ${country}` : r.display_name;
        return { description: desc, lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
      })
      .filter(r => { if (!r.description || seen.has(r.description)) return false; seen.add(r.description); return true; })
      .slice(0, 5);
    setProfLocSugs(sugs);
  } catch(e) { if (e.name !== "AbortError") setProfLocSugs([]); }
}, 400);
return () => { clearTimeout(timer); controller.abort(); };
}, [profLocInput, profLocEditing]);

// Load Google Maps Places script once (new async pattern required by PlaceAutocompleteElement)
useEffect(() => {
const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
if (!key || document.querySelector('script[data-gmaps]')) return;
const s = document.createElement("script");
s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly&loading=async`;
s.async = true;
s.setAttribute("data-gmaps", "1");
document.head.appendChild(s);
}, []);


// Conversations — fetch all and filter client-side so legacy docs without participants are visible
useEffect(() => {
if (!user) return;
let unsub = null;
let retryTimer = null;
let cancelled = false;
const subscribe = () => {
  if (cancelled) return;
  const q = query(collection(db,"conversations"),limit(200));
  unsub = onSnapshot(q, snap => {
    if (cancelled) return;
    const all = snap.docs.map(d=>({id:d.id,...d.data()}));
    // Client-side filter: convo ID contains this user's uid (legacy docs) OR participants array includes them
    const mine = all.filter(c => {
      if (c.participants && c.participants.includes(user.uid)) return true;
      return c.id && c.id.includes(user.uid);
    }).sort((a,b)=>(b.updatedAt?.toMillis?.()??0)-(a.updatedAt?.toMillis?.()??0));
    setConvos(mine);
    setHasUnread(mine.some(c=>c.lastSenderId && c.lastSenderId !== user.uid && !c.readBy?.includes(user.uid) && !c.archivedBy?.includes(user.uid)));
    if (prevConvoUpdates.current !== null) {
      mine.forEach(c => {
        const prevTs = prevConvoUpdates.current[c.id];
        const currTs = c.updatedAt?.toMillis?.() ?? 0;
        if (c.lastSenderId && c.lastSenderId !== user.uid && currTs > (prevTs ?? 0)) {
          if ("Notification" in window && Notification.permission === "granted" && notifPrefsRef.current.messages !== false) {
            new Notification(`New message from ${c.lastSenderName || "someone"}`, {
              body: c.lastMessage || "You have a new message", icon: "/favicon.ico",
            });
          }
        }
      });
    }
    prevConvoUpdates.current = Object.fromEntries(mine.map(c => [c.id, c.updatedAt?.toMillis?.() ?? 0]));
  }, err => {
    if (err.code === "permission-denied") return;
    console.error("convos listener error", err);
    if (!cancelled) retryTimer = setTimeout(subscribe, 3000);
  });
};
subscribe();
return () => { cancelled = true; if (unsub) unsub(); if (retryTimer) clearTimeout(retryTimer); };
}, [user]);

// Backfill missing fields on legacy convos
useEffect(() => {
if (!user || convos.length === 0) return;
convos.forEach(c => {
  const patches = {};
  // Backfill participants from convo ID if missing
  if (!c.participants && c.id && c.id.includes("_")) {
    const parts = c.id.split("_");
    if (parts.length >= 3) {
      patches.participants = [parts[0], parts[1]];
    }
  }
  // Backfill wantUserId
  if (!c.wantUserId && c.wantId && wants.length > 0) {
    const w = wants.find(w => w.id === c.wantId);
    if (w?.userId) patches.wantUserId = w.userId;
  }
  if (Object.keys(patches).length > 0) {
    updateDoc(doc(db,"conversations",c.id), patches).catch(()=>{});
  }
});
}, [convos, wants, user]);

// Banned users listener
useEffect(() => {
return onSnapshot(doc(db,"config","banned"), snap => {
  setBanned(snap.exists() ? (snap.data().uids || []) : []);
}, () => {});
}, []);

// Messages in open chat — listener + polling fallback
useEffect(() => {
if (!chat || !user) return;
let unsub = null;
let retryTimer = null;
let pollTimer = null;
let cancelled = false;

const subscribe = () => {
  if (cancelled) return;
  const q = collection(db,"conversations",chat.convoId,"messages");
  unsub = onSnapshot(q, snap => {
    if (cancelled) return;
    const newMsgs = snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.createdAt?.toMillis?.()??0)-(b.createdAt?.toMillis?.()??0));
    if (newMsgs.length > prevMsgCount.current && prevMsgCount.current > 0) {
      const last = newMsgs[newMsgs.length-1];
      if (last.senderId !== user?.uid && "Notification" in window && Notification.permission === "granted" && notifPrefsRef.current.messages !== false) {
        new Notification(`New message from ${last.senderName}`, { body: last.text, icon: "/favicon.ico" });
      }
    }
    prevMsgCount.current = newMsgs.length;
    setMsgs(newMsgs);
    setMsgSendErr("");
    setTimeout(()=>btm.current?.scrollIntoView({behavior:"smooth"}),100);
    if (user && chat?.convoId) {
      updateDoc(doc(db,"conversations",chat.convoId),{readBy:arrayUnion(user.uid)}).catch(()=>{});
    }
  }, err => {
    console.error("messages listener error", err);
    if (!cancelled) {
      retryTimer = setTimeout(subscribe, 3000);
    }
  });
};

// Fallback: poll every 4s if real-time listener is struggling
const poll = () => {
  if (cancelled || !chat?.convoId) return;
  getDocs(query(collection(db,"conversations",chat.convoId,"messages"), orderBy("createdAt","desc"), limit(30)))
    .then(snap => {
      if (cancelled) return;
      const newMsgs = snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.createdAt?.toMillis?.()??0)-(b.createdAt?.toMillis?.()??0));
      if (newMsgs.length !== prevMsgCount.current) {
        setMsgs(newMsgs);
        prevMsgCount.current = newMsgs.length;
      }
    })
    .catch(e => console.error("poll fallback error", e));
};

subscribe();
pollTimer = setInterval(poll, 4000);
return () => {
  cancelled = true;
  if (unsub) unsub();
  if (retryTimer) clearTimeout(retryTimer);
  if (pollTimer) clearInterval(pollTimer);
};
}, [chat, user]);

// Request notification permission on login
useEffect(() => {
if (user && "Notification" in window && Notification.permission === "default") {
Notification.requestPermission().then(perm => setNotifPerm(perm)).catch(()=>{});
}
}, [user]);

// Register FCM token whenever user is logged in and permission is granted
useEffect(() => {
if (user && notifPerm === "granted") {
registerFcmToken(user.uid);
}
}, [user, notifPerm]);

// Native push (iOS/Android) registration + tap handling
useEffect(() => {
if (!user || !Capacitor.isNativePlatform()) return;
let cleanup = () => {};
let cancelled = false;
registerNativePush(user.uid, convoId => setPendingConvoId(convoId)).then(c => {
  if (cancelled) c(); else cleanup = c;
});
return () => { cancelled = true; cleanup(); };
}, [user]);

// Sync app icon badge with unread conversations + pending offers on my wants
useEffect(() => {
if (!user) { setAppBadge(0); return; }
const unreadConvos = convos.filter(c =>
  c.lastSenderId &&
  c.lastSenderId !== user.uid &&
  !c.readBy?.includes(user.uid) &&
  !c.archivedBy?.includes(user.uid)
).length;
const pendingOffers = wants.reduce((acc, w) => {
  if (w.userId !== user.uid) return acc;
  return acc + (w.offers || []).filter(o =>
    o && o.fromId !== user.uid && (!o.status || o.status === "pending")
  ).length;
}, 0);
setAppBadge(unreadConvos + pendingOffers);
}, [convos, wants, user]);

// Remove delivered notification banners when app comes to foreground.
// The badge itself is kept in sync by the effect above based on convo state,
// so we never force it to zero here — that would hide real unread counts.
useEffect(() => {
if (!user) return;
const onForeground = () => {
  if (Capacitor.isNativePlatform()) {
    FirebaseMessaging.removeAllDeliveredNotifications().catch(()=>{});
  }
};
const onVisible = () => {
  if (typeof document !== "undefined" && document.visibilityState === "visible") {
    onForeground();
  }
};
document.addEventListener("visibilitychange", onVisible);

let nativeHandle = null;
if (Capacitor.isNativePlatform()) {
  CapacitorApp.addListener("appStateChange", ({ isActive }) => {
    if (isActive) onForeground();
  }).then(h => { nativeHandle = h; });
}

return () => {
  document.removeEventListener("visibilitychange", onVisible);
  if (nativeHandle) nativeHandle.remove();
};
}, [user]);

// When a conversation is opened, clear its delivered notifications
useEffect(() => {
if (!chat?.convoId) return;
clearDeliveredForConvo(chat.convoId);
}, [chat?.convoId]);

// Listen for service worker messages (notification tap → open conversation)
useEffect(() => {
if (!("serviceWorker" in navigator)) return;
const handler = event => {
if (event.data?.type === "OPEN_CONVERSATION" && event.data.convoId) {
setPendingConvoId(event.data.convoId);
}
};
navigator.serviceWorker.addEventListener("message", handler);
return () => navigator.serviceWorker.removeEventListener("message", handler);
}, []);

// Open pending conversation once convos are loaded
useEffect(() => {
if (!pendingConvoId || convos.length === 0) return;
const convo = convos.find(c => c.id === pendingConvoId);
if (convo) {
const on = convo.participants?.find(uid => uid !== user?.uid) ? convo.lastSenderName || "User" : "User";
setChat({ convoId: convo.id, otherName: on, wantTitle: convo.wantTitle || "", offerPrice: convo.offerPrice||null, offerPhotoUrl: convo.offerPhotoUrl||null, participants:convo.participants||[] });
setPendingConvoId(null);
}
}, [pendingConvoId, convos, user]);

// On first load, check URL for ?convo= param (from notification tap on closed app)
useEffect(() => {
const params = new URLSearchParams(window.location.search);
const convoParam = params.get("convo");
if (convoParam) {
setPendingConvoId(convoParam);
window.history.replaceState({}, "", window.location.pathname);
}
}, []);

// Pull to refresh handlers
const handleTouchStart = e => { touchStartY.current = e.touches[0].clientY; };
const handleTouchMove = e => {
const delta = e.touches[0].clientY - touchStartY.current;
if (delta > 0 && window.scrollY === 0) setPullY(Math.min(delta, 80));
};
const handleTouchEnd = () => {
if (pullY > 60) {
setRefreshing(true);
setTimeout(() => { setRefreshing(false); setPullY(0); }, 1200);
} else { setPullY(0); }
};

const doAuth = async () => {
if (authTab==="signup" && !agreeTerms) { setAuthErr("You must agree to the Terms of Service and Privacy Policy."); return; }
setAuthErr(""); setAuthBusy(true);
try {
if (authTab==="signup") {
const c = await createUserWithEmailAndPassword(auth,af.email,af.password);
await updateProfile(c.user,{displayName:af.name});
setUser({...c.user,displayName:af.name});
justSignedUp.current = true;
} else {
await signInWithEmailAndPassword(auth,af.email,af.password);
}
} catch(e) {
  console.error("doAuth failed:", e?.code, e?.message, e);
  setAuthErr((e?.message || "Sign-in failed.").replace("Firebase:","").replace(/\(auth\/[^)]+\)\.?/,"").trim() || "Sign-in failed. Please try again.");
} finally {
  setAuthBusy(false);
}
};

const sendPasswordReset = async () => {
if (!forgotEmail.trim()) { setForgotErr("Please enter your email address."); return; }
setForgotBusy(true); setForgotErr("");
try {
  await sendPasswordResetEmail(auth, forgotEmail.trim());
  setForgotSent(true);
} catch(e) {
  setForgotErr(e.code==="auth/user-not-found"?"No account found with that email.":"Failed to send email. Please try again.");
}
setForgotBusy(false);
};

const signInWithGoogle = async () => {
setAuthErr(""); setAuthBusy(true);
try {
const { Capacitor } = await import("@capacitor/core");
if (Capacitor.isNativePlatform()) {
const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
const googleUser = await GoogleAuth.signIn();
const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
await signInWithCredential(auth, credential);
} else {
const provider = new GoogleAuthProvider();
provider.addScope("email");
provider.addScope("profile");
try {
await signInWithPopup(auth, provider, browserPopupRedirectResolver);
} catch (popupErr) {
// popup-closed-by-user = user dismissed it intentionally, not an error
if (popupErr?.code === "auth/popup-closed-by-user" || popupErr?.code === "auth/cancelled-popup-request") {
setAuthBusy(false);
return;
}
// popup blocked → fall back to redirect flow
if (popupErr?.code === "auth/popup-blocked") {
await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
return;
}
throw popupErr;
}
}
} catch(e) {
const code = e?.code || "";
const msg = code === "auth/unauthorized-domain"
  ? `Google sign-in isn't enabled for this domain (${window.location.hostname}). Contact support.`
  : code === "auth/network-request-failed"
  ? "Network error — check your connection and try again."
  : code === "auth/user-disabled"
  ? "This account has been disabled."
  : "Google sign-in failed. Please try again.";
setAuthErr(msg);
setAuthBusy(false);
}
};

const ta = ts => {
if (!ts) return "Just now";
const s = Math.floor((Date.now()-(ts.toMillis?.()??0))/1000);
if (s<60) return "Just now";
if (s<3600) return `${Math.floor(s/60)}m ago`;
if (s<86400) return `${Math.floor(s/3600)}h ago`;
return `${Math.floor(s/86400)}d ago`;
};

const haversine = (lat1, lon1, lat2, lon2) => {
const R = 3958.8;
const dLat = (lat2-lat1)*Math.PI/180;
const dLon = (lon2-lon1)*Math.PI/180;
const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const geocodeLocation = async (locationText) => {
if (!locationText || locationText === "Nearby") return null;
try {
const res = await fetch(
  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationText)}&format=json&limit=1&addressdetails=1`,
  { headers: { "Accept-Language": "en" } }
);
const data = await res.json();
if (data?.[0]?.lat && data?.[0]?.lon) {
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}
} catch {}
return null;
};

const detectLocation = () => {
if (!navigator.geolocation) return;
setLocLoading(true);
navigator.geolocation.getCurrentPosition(async pos => {
const {latitude: lat, longitude: lng} = pos.coords;
try {
const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
const data = await res.json();
const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.neighbourhood || "";
const state = data.address?.state_code || data.address?.state || "";
const loc = city && state ? `${city}, ${state}` : city || state || "Nearby";
setForm(p=>({...p,location:loc,_lat:lat,_lng:lng}));
if (autocompleteRef.current) autocompleteRef.current.value = loc;
} catch {
  setForm(p=>({...p,location:"Nearby",_lat:lat,_lng:lng}));
  if (autocompleteRef.current) autocompleteRef.current.value = "Nearby";
}
setLocLoading(false);
}, () => setLocLoading(false));
};

const autoDetectLocation = (onDone) => {
if (!navigator.geolocation) { setLocDenied(true); return; }
setLocDetecting(true);
navigator.geolocation.getCurrentPosition(async pos => {
  const {latitude: lat, longitude: lng} = pos.coords;
  setUserLatLng({lat, lng});
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.neighbourhood || "";
    const state = data.address?.state_code || data.address?.state || "";
    const loc = city && state ? `${city}, ${state}` : city || state || "";
    if (loc) setUserLocation(loc);
    if (onDone) onDone(loc, {lat, lng});
  } catch {}
  setLocDetecting(false);
}, () => {
  setLocDetecting(false);
  setLocDenied(true);
}, { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false });
};

const submitLocPrompt = async () => {
const val = locPromptVal.trim();
if (!val) return;
const coords = await geocodeLocation(val);
if (coords) {
  setUserLatLng(coords);
  setLocDenied(false);
}
setUserLocation(val);
setLocPromptVal("");
};

const handlePhoto = e => {
const f=e.target.files[0]; if(!f) return;
setPhotoFile(f);
const r=new FileReader();
r.onload=ev=>{ setPhotoPrev(ev.target.result); };
r.readAsDataURL(f);
};

const handleAddPostPhotos = async (e) => {
if (postPhotoPicking) return;
setPostPhotoPicking(true);
setPostPhotoErr("");
const webFiles = e?.target?.files ? Array.from(e.target.files) : null;
if (e?.target) e.target.value = "";
try {
  const isNative = !!(window.Capacitor?.isNativePlatform?.());
  if (isNative) {
    const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
    const limit = 3 - postPhotos.length;
    if (limit <= 0) return;
    if (e?.nativeSource === "camera") {
      const photo = await Camera.getPhoto({ source: CameraSource.Camera, quality: 90, resultType: CameraResultType.Uri, allowEditing: false, saveToGallery: false });
      const blob = await fetch(photo.webPath).then(r => r.blob());
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
      setPostPhotos(p => [...p, file]);
      setPostPhotoPreviews(p => [...p, photo.webPath]);
    } else {
      const result = await Camera.pickImages({ limit });
      const newFiles = [];
      const newPreviews = [];
      for (const photo of result.photos) {
        const blob = await fetch(photo.webPath).then(r => r.blob());
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
        newFiles.push(file);
        newPreviews.push(photo.webPath);
      }
      if (newFiles.length > 0) {
        setPostPhotos(p => [...p, ...newFiles]);
        setPostPhotoPreviews(p => [...p, ...newPreviews]);
      }
    }
    return;
  }
  if (!webFiles?.length) return;
  const toAdd = webFiles.slice(0, 3 - postPhotos.length);
  const validErr = validateImageFiles(toAdd);
  if (validErr) { setPostPhotoErr(validErr); return; }
  const previews = await Promise.all(toAdd.map(f => new Promise(res => {
    const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(f);
  })));
  setPostPhotos(p => [...p, ...toAdd]);
  setPostPhotoPreviews(p => [...p, ...previews]);
} catch(err) {
  const msg = err?.message || "";
  if (msg.toLowerCase().includes("cancel")) return;
  console.warn("Photo pick failed:", err);
  setPostPhotoErr("Could not load the selected photo. Please try again.");
} finally {
  setPostPhotoPicking(false);
}
};

const removePostPhoto = idx => {
setPostPhotos(p => p.filter((_,i)=>i!==idx));
setPostPhotoPreviews(p => p.filter((_,i)=>i!==idx));
};

const distMiles = distFilter === "Any Distance" ? null : parseInt(distFilter.replace("Within ",""));
const filtered = wants.filter(w=>{
if (w.status === "sold") return false;
const ms=w.title?.toLowerCase().includes(search.toLowerCase())||w.description?.toLowerCase().includes(search.toLowerCase());
const catOk = cat==="All"||w.category===cat;
const distOk = !distMiles || !userLatLng || !w.lat || !w.lng
  ? true
  : haversine(userLatLng.lat, userLatLng.lng, w.lat, w.lng) <= distMiles;
const BUDGET_RANGES = {"Any budget":[null,null],"Under $50":[0,50],"$50 – $200":[50,200],"$200 – $500":[200,500],"$500 – $1,000":[500,1000],"$1,000 – $5,000":[1000,5000],"$5,000+":[5000,null]};
const [bMin,bMax] = BUDGET_RANGES[budgetMin] ?? [null,null];
const budgetOk = (bMin===null||w.budget>=bMin) && (bMax===null||w.budget<=bMax);
return ms && catOk && distOk && budgetOk;
});
const myWants = wants.filter(w=>w.userId===user?.uid);

const seedTestData = async () => {
const posts = [
  { title:"Looking for a vintage leather couch", description:"Brown or tan, mid-century modern style, good condition. Not interested in fabric. Must be able to deliver to Miami.", budget:600, category:"Furniture", location:"Miami, FL", lat:25.7617, lng:-80.1918 },
  { title:"Need a road bike — Trek or Specialized preferred", description:"Looking for a quality road bike, 54cm or 56cm frame. Carbon or aluminum both fine. Budget is firm.", budget:450, category:"Sports & Outdoors", location:"Miami, FL", lat:25.7617, lng:-80.1918 },
  { title:"ISO a KitchenAid stand mixer — any color", description:"Moving into a new place and would love a stand mixer. Any color works, preferably 5qt or larger. Attachments are a bonus!", budget:150, category:"Electronics", location:"Fort Lauderdale, FL", lat:26.1224, lng:-80.1373 },
  { title:"Looking for a MacBook Pro 13\" or 14\"", description:"Need a reliable laptop for design work. M1 or M2 chip preferred. Must have at least 16GB RAM. Cracked screens OK if price reflects it.", budget:800, category:"Electronics", location:"Miami, FL", lat:25.7617, lng:-80.1918 },
  { title:"Baby gear — high chair + stroller combo", description:"Expecting our first! Looking for a Uppababy, Nuna, or similar quality stroller + a high chair. Open to bundles. Good condition only.", budget:350, category:"Baby & Kids", location:"Coral Gables, FL", lat:25.7215, lng:-80.2684 },
  { title:"Vintage denim jacket — men's L or XL", description:"Hunting for an 80s or 90s Levi's or Lee denim jacket in a larger size. Distressed/worn is perfectly fine — actually preferred!", budget:80, category:"Clothing", location:"Wynwood, Miami, FL", lat:25.8007, lng:-80.1996 },
  { title:"Golf clubs — full set or irons only", description:"Getting back into golf after years away. Looking for a mid-range set, any brand. Driver + irons + putter ideal but will take irons-only deal too.", budget:300, category:"Sports & Outdoors", location:"Doral, FL", lat:25.8195, lng:-80.3556 },
  { title:"Record player / turntable — belt drive preferred", description:"Getting into vinyl. Audio-Technica, Pro-Ject, or similar. Belt drive only please. Must be fully working with no skipping.", budget:120, category:"Electronics", location:"Little Havana, Miami, FL", lat:25.7689, lng:-80.2205 },
];
let count = 0;
for (const p of posts) {
  await addDoc(collection(db,"wants"),{
    ...p,
    user: user.displayName || user.email,
    userId: user.uid,
    offers: [],
    createdAt: serverTimestamp(),
  });
  count++;
}
alert(`✅ ${count} test posts added!`);
};

const postWant = async () => {
if (!form.title||!form.budget||!user) return;
setPosting(true); setPostPhotoErr("");
const lat = userLatLng?.lat ?? null;
const lng = userLatLng?.lng ?? null;
let docRef;
try {
  docRef = await addDoc(collection(db,"wants"),{
    title:form.title, description:form.description,
    budget:parseInt(form.budget)||0, category:form.category||"Other",
    location:userLocation||"", user:user.displayName||user.email,
    userId:user.uid, offers:[], createdAt:serverTimestamp(),
    ...(lat && lng ? {lat, lng} : {}),
  });
} catch(e) {
  console.error("Failed to create want:", e);
  setPostPhotoErr("Failed to post your want. Please try again.");
  setPosting(false); return;
}
let photoUploadFailed = false;
if (postPhotos.length > 0) {
  setUploadingPhotos(true);
  try {
    const urls = await Promise.all(postPhotos.map(async (f, i) => {
      const compressed = await compressImage(f);
      const sRef = ref(storage, `wants/${docRef.id}/photos/${user.uid}_${i}_${Date.now()}.jpg`);
      const snap = await uploadBytes(sRef, compressed);
      return getDownloadURL(snap.ref);
    }));
    await updateDoc(doc(db,"wants",docRef.id), {photos: urls});
  } catch(e) {
    console.error("Photo upload failed:", e);
    photoUploadFailed = true;
    setPostPhotoErr("Your want was posted but photos failed to upload. You can add them by editing your post.");
  } finally {
    setUploadingPhotos(false);
  }
}
setPosting(false);
setPosted(true);
setForm({title:"",description:"",budget:"",category:"",location:""});
if (!photoUploadFailed) { setPostPhotos([]); setPostPhotoPreviews([]); }
};

const sendOffer = async wid => {
if (!oc.message||!oc.price||!user||sending) return;
const targetWant = wants.find(w=>w.id===wid);
if (targetWant?.status==="sold") { setOfferError("This want has been sold. New offers can no longer be sent."); return; }
setSending(true);
setOfferError("");
const offerMsg = oc.message;
const offerPrice = parseInt(oc.price)||0;
const senderName = user.displayName||user.email;
try {
  let photoUrl = null;
  if (photoFile) {
    const compressed = await compressImage(photoFile);
    const storageRef = ref(storage, `offers/${user.uid}/${Date.now()}_${photoFile.name}`);
    const snapshot = await uploadBytes(storageRef, compressed);
    photoUrl = await getDownloadURL(snapshot.ref);
  }
  await updateDoc(doc(db,"wants",wid),{offers:arrayUnion({
  from:senderName, fromId:user.uid,
  message:offerMsg, price:offerPrice,
  photoUrl:photoUrl,
  time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
  })});
  setSent(p=>({...p,[wid]:true}));
  setOc({message:"",price:"",photoUrl:""}); setPhotoPrev(null); setPhotoFile(null);
  setTimeout(()=>setSent(p=>({...p,[wid]:false})),3000);
  // Auto-create conversation and post offer as first message
  const want = wants.find(w=>w.id===wid);
  if (want && want.userId) {
    const ids = [user.uid, want.userId].sort();
    const cid = `${ids[0]}_${ids[1]}_${wid}`;
    const convoRef = doc(db,"conversations",cid);
    const convoSnap = await getDoc(convoRef);
    const firstMsgText = `💸 Offer: $${offerPrice.toLocaleString()}\n${offerMsg}`;
    if (!convoSnap.exists()) {
      await setDoc(convoRef,{
        participants:[user.uid,want.userId],
        participantNames:{[user.uid]:senderName,[want.userId]:want.user},
        wantId:wid, wantTitle:want.title, wantUserId:want.userId,
        offerPrice:offerPrice,
        offerPhotoUrl:photoUrl||null,
        updatedAt:serverTimestamp(),
        lastMessage:firstMsgText, lastSenderId:user.uid, lastSenderName:senderName,
        readBy:[user.uid],
      });
    } else {
      await updateDoc(convoRef,{offerPrice:offerPrice,offerPhotoUrl:photoUrl||null,updatedAt:serverTimestamp(),lastMessage:firstMsgText,lastSenderId:user.uid,lastSenderName:senderName,readBy:[user.uid]});
    }
    // Post offer as a message in the thread
    await addDoc(collection(db,"conversations",cid,"messages"),{
      text:firstMsgText,
      type:"offer",
      offerPrice:offerPrice,
      offerPhotoUrl:photoUrl||null,
      participants:[user.uid,want.userId],
      senderId:user.uid,
      senderName:senderName,
      createdAt:serverTimestamp(),
    });
    setSheet(null);
    setView("offers");
  }
} catch(err) {
  const msg = photoFile && err.code?.includes("storage")
    ? "Photo upload failed. Check your Storage rules in Firebase and try again."
    : "Something went wrong. Please try again.";
  setOfferError(msg);
} finally {
  setSending(false);
}
};

const openChat = async (want, offer) => {
// Both want poster AND offer maker can open chat
const otherId = user.uid === want.userId ? offer.fromId : want.userId;
const otherName = user.uid === want.userId ? offer.from : want.user;
if (!otherId) return;
const ids = [user.uid, otherId].sort();
const cid = `${ids[0]}_${ids[1]}_${want.id}`;
const convoRef = doc(db,"conversations",cid);
let data = {};
try {
  const snap = await getDoc(convoRef);
  if (!snap.exists()) {
    await setDoc(convoRef,{
      participants:[user.uid,otherId],
      participantNames:{[user.uid]:user.displayName||user.email,[otherId]:otherName},
      wantId:want.id, wantTitle:want.title, wantUserId:want.userId, updatedAt:serverTimestamp(),
    });
  } else {
    data = snap.data();
  }
} catch(e) {
  console.warn("openChat getDoc/create failed", e);
  // If reading failed (e.g. non-existent doc blocked by rules), still try to create
  try {
    await setDoc(convoRef,{
      participants:[user.uid,otherId],
      participantNames:{[user.uid]:user.displayName||user.email,[otherId]:otherName},
      wantId:want.id, wantTitle:want.title, wantUserId:want.userId, updatedAt:serverTimestamp(),
    });
  } catch(e2) {
    console.error("openChat setDoc also failed", e2);
  }
}
setMsgSendErr("");
setChat({
  convoId:cid,
  otherName,
  wantTitle:want.title,
  offerPrice:offer?.price||data.offerPrice||null,
  offerPhotoUrl:offer?.photoUrl||data.offerPhotoUrl||null,
  participants:[user.uid,otherId],
});
};

const sendMsg = async () => {
if (!ci.trim()||!chat) return;
const m=ci.trim(); setCi(""); setMsgSendErr("");
try {
  await addDoc(collection(db,"conversations",chat.convoId,"messages"),{
    text:m, participants:chat.participants||[], senderId:user.uid, senderName:user.displayName||user.email, createdAt:serverTimestamp(),
  });
  console.log("[sendMsg] message written to", chat.convoId, "participants:", chat.participants);
  await updateDoc(doc(db,"conversations",chat.convoId),{
    updatedAt:serverTimestamp(), lastMessage:m, lastSenderId:user.uid, lastSenderName:user.displayName||user.email,
    readBy:[user.uid],
  });
  console.log("[sendMsg] conversation updated", chat.convoId);
} catch(e) {
  console.error("sendMsg failed", e, chat?.convoId, chat?.participants);
  setCi(m);
  setMsgSendErr(`Send failed: ${e.message||e.code||"unknown"}`);
}
};

const deleteMsg = async (msgId) => {
if (!chat || !user) return;
const target = msgs.find(m => m.id === msgId);
if (!target || target.senderId !== user.uid) return;
await deleteDoc(doc(db,"conversations",chat.convoId,"messages",msgId));
};

const deleteConvo = async (convoId) => {
if (!window.confirm("Delete this conversation?")) return;
try {
  const msgsSnap = await getDocs(collection(db,"conversations",convoId,"messages"));
  await Promise.all(msgsSnap.docs.map(m => deleteDoc(doc(db,"conversations",convoId,"messages",m.id)).catch(()=>{})));
  await deleteDoc(doc(db,"conversations",convoId));
} catch (e) {
  console.error("deleteConvo failed", e);
  alert("Failed to delete conversation.");
}
};

const banUser = async (uid) => {
if (!isAdmin || !uid) return;
await updateDoc(doc(db,"config","banned"),{uids:arrayUnion(uid)}).catch(async()=>{
  const sd = setDoc;
  await sd(doc(db,"config","banned"),{uids:[uid]});
});
};

const unbanUser = async (uid) => {
if (!isAdmin || !uid) return;
await updateDoc(doc(db,"config","banned"),{uids:arrayRemove(uid)}).catch(()=>{});
};

const deployFirestoreRules = async () => {
if (!isAdmin) return;
const RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() { return request.auth != null; }
    function isAdmin() { return isAuth() && request.auth.token.email == "carrion.isaac85@gmail.com"; }
    match /wants/{wantId} {
      allow read: if isAuth();
      allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuth() && (resource.data.userId == request.auth.uid || isAdmin() || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['offers']) && request.resource.data.userId == resource.data.userId));
      allow delete: if isAuth() && (resource.data.userId == request.auth.uid || isAdmin());
    }
    match /users/{uid} {
      allow read: if isAuth();
      allow create, update: if isAuth() && (request.auth.uid == uid || isAdmin());
      allow delete: if isAuth() && (request.auth.uid == uid || isAdmin());
      match /reviews/{reviewId} {
        allow read: if isAuth();
        allow create: if isAuth();
        allow delete: if isAuth() && (request.auth.uid == uid || isAdmin());
      }
    }
    match /conversations/{convoId} {
      function isParticipant() { return isAuth() && request.auth.uid in resource.data.participants; }
      function willBeParticipant() { return isAuth() && request.auth.uid in request.resource.data.participants; }
      allow read: if isParticipant() || isAdmin();
      allow create: if willBeParticipant() || isAdmin();
      allow update: if isParticipant() || isAdmin();
      allow delete: if isParticipant() || isAdmin();
      match /messages/{msgId} {
        function isConvoParticipant() { return isAuth() && request.auth.uid in get(/databases/$(database)/documents/conversations/$(convoId)).data.participants; }
        allow read: if isConvoParticipant() || isAdmin();
        allow create: if isConvoParticipant() || isAdmin();
        allow delete: if isConvoParticipant() || isAdmin();
      }
    }
    match /config/{docId} {
      allow read: if isAuth();
      allow create, update: if isAuth();
      allow delete: if isAdmin();
    }
    match /reports/{reportId} {
      allow create: if isAuth();
      allow read, update: if isAuth();
      allow delete: if isAdmin();
    }
    match /{document=**} { allow read, write: if false; }
  }
}`;
try {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/firebase");
  // Use a separate Firebase app instance so it doesn't clash with the active session
  const secondaryApp = getApps().find(a => a.name === "admin-deploy")
    || initializeApp(firebaseConfig, "admin-deploy");
  const secondaryAuth = getAuth(secondaryApp);
  const result = await signInWithPopup(secondaryAuth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const oauthToken = credential.accessToken;
  if (!oauthToken) throw new Error("Could not get OAuth token — make sure you sign in with Google (not email/password).");
  const PROJECT = "marketplace305";
  // 1. Create new ruleset
  const rsRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT}/rulesets`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${oauthToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ source: { files: [{ name: "firestore.rules", content: RULES }] } }),
    }
  );
  if (!rsRes.ok) {
    const err = await rsRes.json();
    throw new Error(err.error?.message || JSON.stringify(err));
  }
  const rs = await rsRes.json();
  const rulesetName = rs.name;
  // 2. Update the cloud.firestore release
  const relRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT}/releases/cloud.firestore`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${oauthToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ release: { name: `projects/${PROJECT}/releases/cloud.firestore`, rulesetName } }),
    }
  );
  if (!relRes.ok) {
    const err = await relRes.json();
    throw new Error(err.error?.message || JSON.stringify(err));
  }
  alert("✅ Firestore rules deployed! Admin deletes are now active. You may need to refresh the app.");
} catch(e) {
  alert("❌ Deploy failed: " + e.message);
}
};

const adminDeleteWant = async (id) => {
if (!isAdmin) return;
if (!window.confirm("Delete this want permanently?")) return;
try {
  await deleteDoc(doc(db,"wants",id));
} catch(e) {
  if (e.code === "permission-denied") {
    alert("Permission denied. Update your Firestore rules in the Firebase Console to allow admin deletes — see the rules in firestore.rules in the project.");
  } else {
    alert("Delete failed: " + e.message);
  }
}
};

const clearAllData = async () => {
if (!isAdmin) return;
if (!window.confirm("⚠️ Delete ALL wants, messages, and conversations?\n\nThis cannot be undone.")) return;
if (!window.confirm("Are you absolutely sure? This wipes everything permanently.")) return;
let wantsFailed = 0, convosFailed = 0;
try {
  // Use in-memory state — avoids bulk-read permission errors
  await Promise.all(wants.map(w =>
    deleteDoc(doc(db,"wants",w.id)).catch(() => { wantsFailed++; })
  ));
  // Delete conversations the admin can see + their messages
  await Promise.all(convos.map(async c => {
    try {
      const msgsSnap = await getDocs(collection(db,"conversations",c.id,"messages"));
      await Promise.all(msgsSnap.docs.map(m =>
        deleteDoc(doc(db,"conversations",c.id,"messages",m.id)).catch(()=>{})
      ));
      await deleteDoc(doc(db,"conversations",c.id));
    } catch { convosFailed++; }
  }));
  const note = (wantsFailed || convosFailed)
    ? `\n\n⚠️ ${wantsFailed} post(s) and ${convosFailed} conversation(s) could not be deleted due to permissions. Update Firestore rules to allow full admin access.`
    : "";
  alert("✅ All accessible data cleared." + note);
} catch(err) {
  alert("Error: " + err.message);
}
};

const togglePin = async (c) => {
const isPinned = c.pinnedBy?.includes(user.uid);
await updateDoc(doc(db,"conversations",c.id),{
pinnedBy: isPinned ? arrayRemove(user.uid) : arrayUnion(user.uid),
});
};

const toggleArchive = async (c) => {
const isArchived = c.archivedBy?.includes(user.uid);
await updateDoc(doc(db,"conversations",c.id),{
archivedBy: isArchived ? arrayRemove(user.uid) : arrayUnion(user.uid),
});
};

const isUnreadConvo = (c) => c.lastSenderId && c.lastSenderId!==user?.uid && !c.readBy?.includes(user?.uid);

const displayedConvos = (() => {
const q = msgSearch.toLowerCase().trim();
let list = convos.filter(c => {
  const archived = c.archivedBy?.includes(user?.uid);
  if (showArchived ? !archived : archived) return false;
  if (msgFilter === "unread" && !isUnreadConvo(c)) return false;
  if (msgFilter === "buyer" && c.wantUserId !== user?.uid) return false;
  if (msgFilter === "seller" && c.wantUserId === user?.uid) return false;
  if (q) {
    const other = Object.entries(c.participantNames||{}).find(([id])=>id!==user?.uid)?.[1]||"";
    const hay = (other + " " + (c.wantTitle||"") + " " + (c.lastMessage||"")).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
});
const ts = c => c.updatedAt?.toMillis?.() ?? 0;
list.sort((a,b) => {
  const pa = a.pinnedBy?.includes(user?.uid) ? 1 : 0;
  const pb = b.pinnedBy?.includes(user?.uid) ? 1 : 0;
  if (pa !== pb) return pb - pa;
  if (msgSort === "unread") {
    const ua = isUnreadConvo(a) ? 1 : 0;
    const ub = isUnreadConvo(b) ? 1 : 0;
    if (ua !== ub) return ub - ua;
    return ts(b) - ts(a);
  }
  if (msgSort === "oldest") return ts(a) - ts(b);
  return ts(b) - ts(a);
});
return list;
})();

const groupedConvos = (() => {
if (!msgGroup) return null;
const groups = {};
displayedConvos.forEach(c => {
  const key = c.wantId || "_other";
  if (!groups[key]) groups[key] = { wantTitle: c.wantTitle || "Other", items: [] };
  groups[key].items.push(c);
});
return Object.entries(groups);
})();

const REPORT_REASONS = ["Spam or scam","Offensive / inappropriate","Wrong category","Already fulfilled","Other"];

const submitReport = async () => {
if (!reportReason) return;
setReportBusy(true);
try {
  const ad = addDoc, col = collection, st = serverTimestamp, ud = updateDoc, au = arrayUnion;
  await ad(col(db,"reports"),{
    wantId:reportSheet.id, wantTitle:reportSheet.title, wantUserId:reportSheet.userId, wantUser:reportSheet.user,
    reporterId:user.uid, reporterName:user.displayName||user.email,
    reason:reportReason, note:reportNote.trim(), createdAt:st(), resolved:false
  });
  await ud(doc(db,"users",user.uid),{reportedWants:au(reportSheet.id)});
  setMyReportedWants(r=>[...r,reportSheet.id]);
  setReportDone(true);
} catch(e){ alert("Failed to submit report."); }
setReportBusy(false);
};

const loadAdminReports = async () => {
if (adminReportsLoaded) return;
const gds = getDocs, col = collection, q2 = query, ob = orderBy;
const snap = await gds(q2(col(db,"reports"),ob("createdAt","desc")));
setAdminReports(snap.docs.map(d=>({id:d.id,...d.data()})));
setAdminReportsLoaded(true);
};

const resolveReport = async (reportId) => {
const ud = updateDoc;
await ud(doc(db,"reports",reportId),{resolved:true});
setAdminReports(r=>r.map(x=>x.id===reportId?{...x,resolved:true}:x));
};

const toggleSave = async (wantId, e) => {
if (e) e.stopPropagation();
if (!user) return;
const isSaved = savedWants.includes(wantId);
setSavedWants(s => isSaved ? s.filter(id=>id!==wantId) : [...s, wantId]);
try {
  const sd = setDoc, au = arrayUnion, ar = arrayRemove;
  await sd(doc(db,"users",user.uid), {savedWants: isSaved ? ar(wantId) : au(wantId)}, {merge:true});
} catch (err) {
  console.error("Bookmark save failed:", err);
  setSavedWants(s => isSaved ? [...s, wantId] : s.filter(id=>id!==wantId));
  alert("Couldn't save bookmark. " + (err?.message || "Please try again."));
}
};

const loadMyReviews = async () => {
if (myReviewsLoaded) return;
const gds = getDocs, col = collection, q2 = query, ob = orderBy;
const snap = await gds(q2(col(db,"users",user.uid,"reviews"),ob("createdAt","desc")));
setMyReviews(snap.docs.map(d=>({id:d.id,...d.data()})));
setMyReviewsLoaded(true);
};

const renderStars = (avg) => {
const full = Math.floor(avg);
const half = avg - full >= 0.4;
return [1,2,3,4,5].map(n=>(
  <span key={n} style={{color: n<=full?"#f59e0b": (n===full+1&&half)?"#f59e0b":"#d1d5db", fontSize:14}}>
    {n<=full?"★": (n===full+1&&half)?"⯨":"☆"}
  </span>
));
};

const openProfile = async (uid, name) => {
if (!uid) return;
setProfileUid(uid);
setProfileData(null);
setProfileReviews([]);
const gd = getDoc, gds = getDocs, col = collection, q2 = query, ob = orderBy, lim = limit;
const [snap, revSnap] = await Promise.all([
  gd(doc(db,"users",uid)),
  gds(q2(col(db,"users",uid,"reviews"),ob("createdAt","desc"),lim(20)))
]);
setProfileData(snap.exists() ? snap.data() : {name, uid});
setProfileReviews(revSnap.docs.map(d=>({id:d.id,...d.data()})));
};

const submitReview = async () => {
if (!reviewSheet || reviewStars<1) return;
setReviewBusy(true);
try {
  const ad = addDoc, ud = updateDoc, col = collection, st = serverTimestamp, au = arrayUnion, inc = increment;
  const {targetUid, targetName, wantId, wantTitle, offerKey} = reviewSheet;
  await ad(col(db,"users",targetUid,"reviews"),{
    stars:reviewStars, comment:reviewComment.trim(), fromId:user.uid, fromName:user.displayName||user.email,
    wantId, wantTitle, createdAt:st()
  });
  await ud(doc(db,"users",targetUid),{reviewCount:inc(1), ratingSum:inc(reviewStars)});
  await ud(doc(db,"users",user.uid),{reviewedKeys:au(offerKey)});
  setMyReviewedKeys(k=>[...k, offerKey]);
  setReviewSheet(null); setReviewStars(0); setReviewComment("");
} catch(e){ alert("Failed to submit review: "+e.message); }
setReviewBusy(false);
};

const delWant = async id => {
  if (!window.confirm("Delete this want?")) return;
  try {
    await deleteDoc(doc(db,"wants",id));
  } catch(e) {
    alert("Could not delete: " + (e.code === "permission-denied" ? "Permission denied. You can only delete your own posts." : e.message));
  }
};

const [deletingAccount, setDeletingAccount] = useState(false);
const deleteAccount = async () => {
if (!user || deletingAccount) return;
if (!window.confirm("Delete your account?\n\nThis permanently removes your profile, wants, offers, messages, reviews, saved items, and uploaded photos. This cannot be undone.")) return;
const typed = window.prompt('Type DELETE to confirm permanent account deletion:');
if (typed !== "DELETE") return;
setDeletingAccount(true);
try {
  const uid = user.uid;
  const gds = getDocs, col = collection, dd = deleteDoc, dc = doc, ud = updateDoc;
  const sref = ref;

  // 1. Delete user's own wants and strip offers the user made from others' wants
  await Promise.all(wants.map(async w => {
    if (w.userId === uid) {
      await dd(dc(db,"wants",w.id)).catch(e=>console.warn("del want",w.id,e));
    } else if ((w.offers||[]).some(o=>o.fromId===uid)) {
      const filtered = (w.offers||[]).filter(o=>o.fromId!==uid);
      await ud(dc(db,"wants",w.id),{offers:filtered}).catch(e=>console.warn("strip offers",w.id,e));
    }
  }));

  // 2. Delete conversations the user is part of (and their messages)
  await Promise.all(convos.map(async c => {
    if (!(c.participants||[]).includes(uid)) return;
    try {
      const msgsSnap = await gds(col(db,"conversations",c.id,"messages"));
      await Promise.all(msgsSnap.docs.map(m => dd(dc(db,"conversations",c.id,"messages",m.id))));
      await dd(dc(db,"conversations",c.id));
    } catch(e){ console.warn("del convo",c.id,e); }
  }));

  // 3. Delete user's reviews subcollection
  try {
    const reviewsSnap = await gds(col(db,"users",uid,"reviews"));
    await Promise.all(reviewsSnap.docs.map(r => dd(dc(db,"users",uid,"reviews",r.id))));
  } catch(e){ console.warn("del reviews",e); }

  // 4. Delete user profile doc
  await dd(dc(db,"users",uid)).catch(e=>console.warn("del user doc",e));

  // 5. Delete storage uploads under offers/{uid}/
  try {
    const folderRef = sref(storage, `offers/${uid}`);
    const list = await listAll(folderRef);
    await Promise.all(list.items.map(i => deleteObject(i).catch(()=>{})));
  } catch(e){ console.warn("storage cleanup",e); }

  // 6. Delete the auth user
  try {
    await deleteUser(user);
  } catch(e) {
    if (e.code === "auth/requires-recent-login") {
      alert("For security, please sign in again and then tap Delete Account once more to finish removing your account.");
      await signOut(auth);
      return;
    }
    throw e;
  }

  setView("browse");
} catch(e) {
  console.error("deleteAccount failed", e);
  alert("Failed to delete account: " + (e.message || e));
} finally {
  setDeletingAccount(false);
}
};

const setOfferStatus = async (want, idx, status) => {
const updated = (want.offers||[]).map((o,i)=>i===idx?{...o,status}:o);
await updateDoc(doc(db,"wants",want.id),{offers:updated});
};

// Post a system-style message into the (owner ↔ buyer) conversation for a want.
const postSystemChatMessage = async (want, buyerOffer, text) => {
if (!buyerOffer?.fromId || !want?.userId) return;
const ids = [want.userId, buyerOffer.fromId].sort();
const cid = `${ids[0]}_${ids[1]}_${want.id}`;
const convoRef = doc(db,"conversations",cid);
const snap = await getDoc(convoRef);
const senderName = user.displayName || user.email || "Seller";
if (!snap.exists()) {
  await setDoc(convoRef,{
    participants:[want.userId, buyerOffer.fromId],
    participantNames:{[want.userId]:want.user, [buyerOffer.fromId]:buyerOffer.from},
    wantId:want.id, wantTitle:want.title, wantUserId:want.userId,
    offerPrice:buyerOffer.price||null,
    offerPhotoUrl:buyerOffer.photoUrl||null,
    updatedAt:serverTimestamp(),
    lastMessage:text, lastSenderId:user.uid, lastSenderName:senderName,
    readBy:[user.uid],
  });
} else {
  await updateDoc(convoRef,{updatedAt:serverTimestamp(),lastMessage:text,lastSenderId:user.uid,lastSenderName:senderName,readBy:[user.uid]});
}
await addDoc(collection(db,"conversations",cid,"messages"),{
  text, type:"system", participants:[want.userId, buyerOffer.fromId], senderId:user.uid, senderName, createdAt:serverTimestamp(),
});
};

const acceptOffer = async (want, idx) => {
const offers = want.offers || [];
const accepted = offers[idx];
if (!accepted) return;
// Build new offers array: accept the chosen, auto-decline all other pending.
const updated = offers.map((o,i)=>{
  if (i===idx) return {...o, status:"accepted"};
  if (!o.status) return {...o, status:"declined", declineReason:"auto"};
  return o;
});
await updateDoc(doc(db,"wants",want.id),{
  offers: updated,
  status: "sold",
  soldTo: accepted.fromId || null,
  soldAt: serverTimestamp(),
});
// Notify buyers via system chat messages.
try {
  await postSystemChatMessage(want, accepted, `✅ Your offer of $${(accepted.price||0).toLocaleString()} was accepted!`);
  const otherPending = offers.map((o,i)=>({o,i})).filter(({o,i})=>i!==idx && !o.status);
  await Promise.all(otherPending.map(({o})=>postSystemChatMessage(want, o, "❌ This want was sold to another buyer.")));
} catch(e) { console.warn("acceptOffer notify failed", e); }
};

const declineOffer = async (want, idx) => {
const offers = want.offers || [];
const target = offers[idx];
if (!target) return;
const updated = offers.map((o,i)=>i===idx?{...o, status:"declined", declineReason:"manual"}:o);
await updateDoc(doc(db,"wants",want.id),{offers:updated});
try {
  await postSystemChatMessage(want, target, "❌ Your offer was declined.");
} catch(e) { console.warn("declineOffer notify failed", e); }
};

const handleAddEditPhotos = async (e) => {
if (editPhotoPicking) return;
setEditPhotoPicking(true);
setEditSaveErr("");
const webFiles = e?.target?.files ? Array.from(e.target.files) : null;
if (e?.target) e.target.value = "";
try {
  const isNative = !!(window.Capacitor?.isNativePlatform?.());
  if (isNative) {
    const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
    const limit = 3 - (ef.photos||[]).length - editPhotos.length;
    if (limit <= 0) return;
    if (e?.nativeSource === "camera") {
      const photo = await Camera.getPhoto({ source: CameraSource.Camera, quality: 90, resultType: CameraResultType.Uri, allowEditing: false, saveToGallery: false });
      const blob = await fetch(photo.webPath).then(r => r.blob());
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
      setEditPhotos(p=>[...p, file]);
      setEditPhotoPreviews(p=>[...p, photo.webPath]);
    } else {
      const result = await Camera.pickImages({ limit });
      const newFiles = [];
      const newPreviews = [];
      for (const photo of result.photos) {
        const blob = await fetch(photo.webPath).then(r => r.blob());
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
        newFiles.push(file);
        newPreviews.push(photo.webPath);
      }
      if (newFiles.length > 0) {
        setEditPhotos(p=>[...p, ...newFiles]);
        setEditPhotoPreviews(p=>[...p, ...newPreviews]);
      }
    }
    return;
  }
  if (!webFiles?.length) return;
  const remaining = 3 - (ef.photos||[]).length - editPhotos.length;
  const toAdd = webFiles.slice(0, remaining);
  const validErr = validateImageFiles(toAdd);
  if (validErr) { setEditSaveErr(validErr); return; }
  const previews = await Promise.all(toAdd.map(f => new Promise(res => { const r=new FileReader(); r.onload=ev=>res(ev.target.result); r.readAsDataURL(f); })));
  setEditPhotos(p=>[...p,...toAdd]);
  setEditPhotoPreviews(p=>[...p,...previews]);
} catch(err) {
  const msg = err?.message || "";
  if (msg.toLowerCase().includes("cancel")) return;
  console.warn("Edit photo pick failed:", err);
  setEditSaveErr("Could not load the selected photo. Please try again.");
} finally {
  setEditPhotoPicking(false);
}
};

const saveEdit = async () => {
setEditSaving(true);
setEditSaveErr("");
try {
  let photos = ef.photos || [];
  if (editPhotos.length > 0) {
    const newUrls = await Promise.all(editPhotos.map(async (f,i) => {
      const compressed = await compressImage(f);
      const sRef = ref(storage, `wants/${editId}/photos/${user.uid}_edit_${i}_${Date.now()}.jpg`);
      const snap = await uploadBytes(sRef, compressed);
      return getDownloadURL(snap.ref);
    }));
    photos = [...photos, ...newUrls];
  }
  await updateDoc(doc(db,"wants",editId),{
    title:ef.title, description:ef.description, budget:parseInt(ef.budget)||0,
    category:ef.category, location:ef.location, photos,
  });
  setEditSaving(false);
  setEditId(null);
  setEditPhotos([]); setEditPhotoPreviews([]);
} catch(err) {
  console.error("saveEdit failed:", err);
  setEditSaveErr(editPhotos.length > 0
    ? "Photo upload failed. Check your connection and try again."
    : "Failed to save changes. Please try again.");
  setEditSaving(false);
}
};

const unreadCount = convos.filter(c => c.lastSenderId && c.lastSenderId!==user?.uid && !c.readBy?.includes(user?.uid) && !c.archivedBy?.includes(user?.uid)).length;

if (authLoading) return <div className="loading" style={{paddingTop:100}}>Loading...</div>;

if (user && !isAdmin && banned.includes(user.uid)) return (
<><style>{css}</style>
<div className="banned-screen">
  <div className="banned-icon">🚫</div>
  <div className="banned-title">Account Suspended</div>
  <div className="banned-sub">Your account has been suspended. Please contact support if you believe this is a mistake.</div>
  <button className="auth-btn" style={{marginTop:8,maxWidth:260}} onClick={()=>signOut(auth)}>Sign Out</button>
</div></>
);

if (!user) return (
<>
<style>{css}</style>
<div className="auth-wrap">
<div className="auth-box">
<div className="auth-logo">Want<span style={{color:"var(--text)"}}> - Board</span></div>
<div className="auth-sub">Post what you want. Let sellers come to you.</div>
<div className="auth-tabs">
{["login","signup"].map(t=>(
<div key={t} className={`auth-tab ${authTab===t?"active":""}`} onClick={()=>{setAuthTab(t);setAuthErr("");}}>
{t==="login"?"Log In":"Sign Up"}
</div>
))}
</div>
<div className="auth-form">
{forgotMode?(
  forgotSent?(
    <>
      <div className="forgot-success">
        <div style={{fontSize:32,marginBottom:8}}>📬</div>
        <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Check your inbox!</div>
        <div style={{fontSize:13,color:"var(--text2)"}}>A password reset link was sent to <strong>{forgotEmail}</strong></div>
      </div>
      <button className="auth-btn" onClick={()=>{setForgotMode(false);setForgotSent(false);setForgotEmail("");}}>Back to Log In</button>
    </>
  ):(
    <>
      <div style={{fontSize:14,color:"var(--text2)",marginBottom:4}}>Enter your email and we'll send you a reset link.</div>
      <input className="auth-input" type="email" placeholder="Your email address" value={forgotEmail} onChange={e=>{setForgotEmail(e.target.value);setForgotErr("");}} onKeyDown={e=>e.key==="Enter"&&sendPasswordReset()} autoFocus />
      {forgotErr&&<div className="auth-err">{forgotErr}</div>}
      <button className="auth-btn" onClick={sendPasswordReset} disabled={forgotBusy}>{forgotBusy?"Sending…":"Send Reset Link ->"}</button>
      <button className="forgot-back" onClick={()=>{setForgotMode(false);setForgotErr("");}}>← Back to Log In</button>
    </>
  )
):(
  <>
    {authTab==="signup"&&<input className="auth-input" placeholder="Your name" value={af.name} onChange={e=>setAf(p=>({...p,name:e.target.value}))} />}
    <input className="auth-input" type="email" placeholder="Email" value={af.email} onChange={e=>setAf(p=>({...p,email:e.target.value}))} />
    <div className="auth-pass-wrap">
      <input className="auth-input" type={showPass?"text":"password"} placeholder="Password" value={af.password} onChange={e=>setAf(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doAuth()} autoComplete={showPass?"off":"current-password"} />
      <button type="button" className="auth-pass-toggle" onMouseDown={e=>e.preventDefault()} onClick={()=>setShowPass(v=>!v)} aria-label={showPass?"Hide password":"Show password"} tabIndex={-1}>
        {showPass?(
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        ):(
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        )}
      </button>
    </div>
    {authTab==="login"&&<button className="forgot-link" onClick={()=>{setForgotMode(true);setForgotEmail(af.email);setForgotErr("");}}>Forgot password?</button>}
    {authTab==="signup"&&(
      <label className="terms-check-row">
        <input type="checkbox" checked={agreeTerms} onChange={e=>setAgreeTerms(e.target.checked)} />
        <span>I agree to the <button className="terms-link" onClick={e=>{e.preventDefault();setLegalPage("terms");}}>Terms of Service</button> and <button className="terms-link" onClick={e=>{e.preventDefault();setLegalPage("privacy");}}>Privacy Policy</button></span>
      </label>
    )}
    {authErr&&<div className="auth-err">{authErr}</div>}
    <button className="auth-btn" onClick={doAuth} disabled={authBusy}>{authBusy?"...":authTab==="login"?"Log In ->":"Create Account ->"}</button>
    <div className="auth-divider">or</div>
  </>
)}
<button className="auth-google" onClick={signInWithGoogle} disabled={authBusy}>
<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.58-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
Continue with Google
</button>
</div>
<div className="auth-footer">
  <button className="terms-link" onClick={()=>setLegalPage("terms")}>Terms of Service</button>
  <span style={{color:"var(--border)"}}>·</span>
  <button className="terms-link" onClick={()=>setLegalPage("privacy")}>Privacy Policy</button>
</div>
</div>
</div>

{legalPage&&(
  <div className="legal-overlay">
    <div className="legal-page">
      <div className="legal-header">
        <button className="legal-back" onClick={()=>setLegalPage(null)}>← Back</button>
        <div className="legal-title">{legalPage==="terms"?"Terms of Service":"Privacy Policy"}</div>
      </div>
      <div className="legal-body">
        {legalPage==="terms"?(
          <>
            <p className="legal-updated">Last updated: May 18, 2025</p>
            <h3>1. Acceptance of Terms</h3>
            <p>By creating an account or using WantBoard, you agree to these Terms of Service. If you do not agree, do not use the platform.</p>
            <h3>2. Who Can Use WantBoard</h3>
            <p>You must be at least 13 years old to use WantBoard. By registering, you confirm that you meet this requirement.</p>
            <h3>3. Your Account</h3>
            <p>You are responsible for maintaining the security of your account and all activity that occurs under it. Do not share your password with others.</p>
            <h3>4. Posting Rules</h3>
            <p>You agree not to post content that is illegal, fraudulent, offensive, or misleading. WantBoard reserves the right to remove any post and suspend any account at any time.</p>
            <h3>5. Offers and Transactions</h3>
            <p>WantBoard facilitates connections between buyers and sellers but is not a party to any transaction. All deals are made directly between users. WantBoard is not responsible for the outcome of any transaction.</p>
            <h3>6. Prohibited Conduct</h3>
            <p>You may not: harass other users, post spam, attempt to circumvent platform safety features, or use the platform for any unlawful purpose.</p>
            <h3>7. Limitation of Liability</h3>
            <p>WantBoard is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform.</p>
            <h3>8. Changes to Terms</h3>
            <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
            <h3>9. Contact</h3>
            <p>For questions about these terms, contact us at support@wantboard.app.</p>
          </>
        ):(
          <>
            <p className="legal-updated">Last updated: May 18, 2025</p>
            <h3>1. Information We Collect</h3>
            <p>We collect the information you provide when you register (name, email) and the content you post on WantBoard (wants, offers, messages).</p>
            <h3>2. How We Use Your Information</h3>
            <p>We use your information to operate the platform, facilitate connections between users, and improve our services. We do not sell your personal data to third parties.</p>
            <h3>3. Data Storage</h3>
            <p>Your data is stored securely using Google Firebase. We follow industry-standard security practices to protect your information.</p>
            <h3>4. Communications</h3>
            <p>By creating an account, you may receive platform-related notifications. You can manage notification preferences in your device settings.</p>
            <h3>5. Third-Party Services</h3>
            <p>WantBoard uses Firebase (Google) for authentication and data storage, and Google Maps for location features. These services have their own privacy policies.</p>
            <h3>6. Your Rights</h3>
            <p>You may delete your account and associated data at any time by contacting us. You have the right to access and correct your personal information.</p>
            <h3>7. Cookies</h3>
            <p>WantBoard uses cookies and local storage solely for authentication and user preferences. We do not use tracking cookies for advertising.</p>
            <h3>8. Children's Privacy</h3>
            <p>WantBoard is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
            <h3>9. Contact</h3>
            <p>For privacy-related questions or data requests, contact us at privacy@wantboard.app.</p>
          </>
        )}
      </div>
    </div>
  </div>
)}
</>
);

return (
<>
<style>{css}</style>
<div className="app" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
{isOffline && <div className="offline-banner"><span className="dot"></span>You're offline — some features may not work until you're back online</div>}

```
    <header className="header">
      <div className="header-top">
        <div className="logo" onClick={()=>setView("browse")}>Want<span style={{color:"var(--text)"}}> - Board</span></div>
        <div className="huser" style={{position:"relative"}}>
          <button className="how-link" onClick={()=>{setOnboardingStep(0);setOnboardingOpen(true);}} title="How it works">?</button>
          <button className="bell-btn" onClick={()=>setNotifOpen(o=>!o)} title="Notifications">
            🔔{unreadCount>0&&<span className="bell-badge">{unreadCount>9?"9+":unreadCount}</span>}
          </button>
          {notifOpen&&(
            <div className="notif-panel">
              <div className="notif-panel-head">
                <span>Notifications</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {convos.some(c=>c.lastSenderId&&c.lastSenderId!==user.uid&&!c.readBy?.includes(user.uid))&&(
                    <button className="notif-clear-btn" onClick={async()=>{
                      const unread=convos.filter(c=>c.lastSenderId&&c.lastSenderId!==user.uid&&!c.readBy?.includes(user.uid));
                      await Promise.all(unread.map(c=>updateDoc(doc(db,"conversations",c.id),{readBy:arrayUnion(user.uid)})));
                      setNotifOpen(false);
                    }}>Clear all</button>
                  )}
                  <button className="notif-panel-close" onClick={()=>setNotifOpen(false)}>✕</button>
                </div>
              </div>
              {(()=>{
                const unreadConvos = convos.filter(c=>c.lastSenderId&&c.lastSenderId!==user.uid&&!c.readBy?.includes(user.uid)&&!c.archivedBy?.includes(user.uid));
                const myWantsWithOffers = wants.filter(w=>w.userId===user.uid&&(w.offers||[]).length>0).slice(0,5);
                if (unreadConvos.length===0&&myWantsWithOffers.length===0) return <div className="notif-empty">You're all caught up!</div>;
                return (
                  <>
                    {unreadConvos.map(c=>{
                      const on=Object.entries(c.participantNames||{}).find(([id])=>id!==user.uid)?.[1]||"Someone";
                      return (
                        <div key={c.id} className="notif-item" onClick={()=>{setChat({convoId:c.id,otherName:on,wantTitle:c.wantTitle,offerPrice:c.offerPrice||null,offerPhotoUrl:c.offerPhotoUrl||null,participants:c.participants||[]});setNotifOpen(false);}}>
                          <div className="notif-dot unread"/>
                          <div className="notif-body">
                            <div className="notif-name">💬 {on}</div>
                            <div className="notif-msg">{c.lastMessage||"New message"}</div>
                          </div>
                        </div>
                      );
                    })}
                    {myWantsWithOffers.map(w=>(
                      <div key={w.id} className="notif-item" onClick={()=>{setSheet(w);setNotifOpen(false);}}>
                        <div className="notif-dot read"/>
                        <div className="notif-body">
                          <div className="notif-name">🤝 {w.offers.length} offer{w.offers.length!==1?"s":""}</div>
                          <div className="notif-msg">{w.title}</div>
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      {view==="browse"&&(
        <div className="hsearch">
          <span style={{color:"var(--text2)"}}>🔍</span>
          <input placeholder="Search wants near you..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      )}
    </header>

    <main className="main">

      {/* PULL TO REFRESH INDICATOR */}
      {view==="browse"&&(pullY>20||refreshing)&&(
        <div className={`ptr ${refreshing?"active":""}`} style={{transform:`translateY(${Math.min(pullY/3,20)}px)`}}>
          <svg className="ptr-icon" viewBox="0 0 24 24" style={{transform:refreshing?"none":`rotate(${Math.min(pullY/80*180,180)}deg)`}}>
            {refreshing
              ? <circle cx="12" cy="12" r="9" strokeDasharray="28 56"/>
              : <circle cx="12" cy="12" r="9" strokeDasharray="56 0"/>}
          </svg>
        </div>
      )}

      {/* BROWSE */}
      {view==="browse"&&(
        <>
          {/* Location banner / GPS denied prompt */}
          {locDenied && !userLocation ? (
            <div className="loc-prompt">
              <span style={{fontSize:15,flexShrink:0}}>📍</span>
              <input
                className="loc-prompt-input"
                placeholder="Enter your city or zip code to get started"
                value={locPromptVal}
                onChange={e=>setLocPromptVal(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&submitLocPrompt()}
                autoFocus
              />
              <button className="loc-prompt-btn" onClick={submitLocPrompt}>Go</button>
            </div>
          ) : userLocation ? (
            <div className="loc-banner">
              <span>📍</span>
              <span>Showing results near <strong>{userLocation}</strong></span>
              {locDetecting && <span className="loc-banner-detect">↻</span>}
            </div>
          ) : null}

          {/* Filters */}
          <div className="frow">
            <select className="fsel" value={cat} onChange={e=>setCat(e.target.value)}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
            <span className="frow-sep"/>
            <span style={{fontSize:13,color:"var(--text2)",fontWeight:500}}>📍</span>
            <select className="fsel" value={distFilter} onChange={e=>{
              const v=e.target.value; setDistFilter(v);
              if (v!=="Any Distance" && !userLatLng) autoDetectLocation();
            }}>
              {["Any Distance","Within 5 miles","Within 10 miles","Within 25 miles","Within 50 miles"].map(d=><option key={d}>{d}</option>)}
            </select>
            <span className="frow-sep"/>
            <span style={{fontSize:13,color:"var(--text2)",fontWeight:500}}>💰</span>
            <select className="fsel" value={budgetMin} onChange={e=>setBudgetMin(e.target.value)}>
              {["Any budget","Under $50","$50 – $200","$200 – $500","$500 – $1,000","$1,000 – $5,000","$5,000+"].map(r=><option key={r}>{r}</option>)}
            </select>
            <span style={{marginLeft:"auto",fontSize:13,color:"var(--text2)",flexShrink:0}}><strong style={{color:"var(--text)"}}>{filtered.length}</strong> wants</span>
            {distMiles && !userLatLng && <span style={{fontSize:11,color:"var(--accent)"}}>⚠️</span>}
          </div>

          {loading?<div className="loading">Loading wants...</div>:
           filtered.length===0?(
            <div className="empty">
              <div className="eicon">📭</div>
              {distMiles?(
                <>
                  <div className="etitle">No requests near you right now</div>
                  <div className="esub">Try a wider distance or update your location on your profile</div>
                </>
              ):(
                <>
                  <div className="etitle">No wants yet</div>
                  <div className="esub">Be the first to post what you're looking for</div>
                </>
              )}
            </div>
           ):(
            <div className="feed-col">
              {filtered.map(w=>{
                const distMi = userLatLng && w.lat && w.lng
                  ? haversine(userLatLng.lat, userLatLng.lng, w.lat, w.lng)
                  : null;
                return (
                <div key={w.id} className="feed-card" onClick={()=>setSheet(w)}>
                  <div className="feed-urow">
                    <div className="av" onClick={e=>{e.stopPropagation();openProfile(w.userId,w.user);}}>{(w.user||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="wuser profile-link" onClick={e=>{e.stopPropagation();openProfile(w.userId,w.user);}}>{w.user}</div>
                      <div className="wtime">{ta(w.createdAt)}{w.location?` · 📍 ${w.location}`:""}</div>
                    </div>
                    <span className="wbudget-pill">${(w.budget||0).toLocaleString()}</span>
                  </div>
                  <div className="feed-body">
                    <div className="feed-title">{w.title}</div>
                    <div className="feed-desc">{w.description}</div>
                    <div className="feed-pills">
                      <span className="tag">{w.category}</span>
                      {distMi!==null&&<span className="dist-badge">📍 {distMi<0.1?"nearby":distMi.toFixed(1)+" mi away"}</span>}
                    </div>
                    {(w.photos||[]).length>0&&(
                      <img src={w.photos[0]} className="feed-img" style={{borderRadius:10,marginBottom:4}} alt="" onClick={e=>e.stopPropagation()} />
                    )}
                  </div>
                  <div className="feed-foot">
                    <div className="ocnt">💬 {(w.offers||[]).length===0?<span style={{color:"var(--text2)"}}>No offers yet</span>:<><strong>{w.offers.length}</strong> offer{w.offers.length!==1?"s":""}</>}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {w.userId!==user.uid&&<button className="save-btn" onClick={e=>toggleSave(w.id,e)}><span style={{color:savedWants.includes(w.id)?"var(--accent)":"var(--text2)",fontSize:17}}>{savedWants.includes(w.id)?"★":"☆"}</span></button>}
                      {w.userId!==user.uid&&<button className="obtn" onClick={e=>{e.stopPropagation();setSheet(w);}}>Contact</button>}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
           )}
        </>
      )}

      {/* MY PROFILE PAGE */}
      {view==="myprofile"&&(()=>{
        const myWants2 = wants.filter(w=>w.userId===user.uid);
        const myOffersGiven = wants.flatMap(w=>(w.offers||[]).map((o,i)=>({...o,wantId:w.id,wantTitle:w.title,wantUserId:w.userId,wantUser:w.user,idx:i}))).filter(o=>o.fromId===user.uid);
        const myAvgRating = myReviewsLoaded&&myReviews.length>0 ? (myReviews.reduce((s,r)=>s+r.stars,0)/myReviews.length) : null;
        const initLetter = (user.displayName||user.email||"?")[0].toUpperCase();
        return(
          <>
            <div className="prof-page">
              {/* Hero */}
              <div className="prof-hero">
                <div className="prof-hero-av">{initLetter}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="prof-hero-name">{user.displayName||user.email}</div>
                  {user.displayName&&<div className="prof-hero-email">{user.email}</div>}
                  {myAvgRating!==null&&(
                    <div className="prof-rating" style={{marginTop:4}}>
                      {renderStars(myAvgRating)}
                      <span className="prof-rating-text">{myAvgRating.toFixed(1)} ({myReviews.length} review{myReviews.length!==1?"s":""})</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Mini stats */}
              <div className="prof-mini-stats">
                <div className="prof-mini-stat">
                  <div className="prof-mini-num">{myWants2.length}</div>
                  <div className="prof-mini-label">Wants</div>
                </div>
                <div className="prof-mini-stat">
                  <div className="prof-mini-num">{myOffersGiven.length}</div>
                  <div className="prof-mini-label">Offers</div>
                </div>
                <div className="prof-mini-stat">
                  <div className="prof-mini-num">{savedWants.length}</div>
                  <div className="prof-mini-label">Saved</div>
                </div>
              </div>
              {/* Account */}
              <div className="prof-section-hd">Account</div>
              <div className="prof-card">
                <div className="prof-row" style={{alignItems:"flex-start",paddingBottom:profLocEditing?16:13}}>
                  <span className="prof-row-icon" style={{marginTop:1}}>📍</span>
                  <div className="prof-row-body" style={{flex:1}}>
                    <div className="prof-row-label">My Location</div>
                    {profLocEditing?(
                      <div className="prof-loc-edit-wrap">
                        <div className="prof-loc-edit-row">
                          <input
                            autoFocus
                            className="prof-loc-text-input"
                            placeholder="Search city or zip…"
                            value={profLocInput}
                            onChange={e=>setProfLocInput(e.target.value)}
                            onKeyDown={e=>e.key==="Escape"&&(setProfLocEditing(false))}
                          />
                          <button className="eedit" onClick={()=>setProfLocEditing(false)}>Cancel</button>
                        </div>
                        {profLocSugs.length>0&&(
                          <div className="prof-loc-sug-list">
                            {profLocSugs.map((s,i)=>(
                              <div key={i} className="prof-loc-sug-item" onMouseDown={async(e)=>{
                                e.preventDefault();
                                const addr = s.description||"";
                                setUserLocation(addr);
                                setProfLocEditing(false);
                                // Nominatim already gave us coords — no extra geocode needed
                                if (s.lat && s.lng) setUserLatLng({lat: s.lat, lng: s.lng});
                                try{await setDoc(doc(db,"users",user.uid),{location:addr},{merge:true});}catch{}
                              }}>
                                {s.description}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ):(
                      <div className="prof-row-sub">{userLocation||"Not set — tap Edit to add your city"}</div>
                    )}
                  </div>
                  {!profLocEditing&&(
                    <button className="eedit" style={{marginLeft:8,flexShrink:0}} onClick={()=>setProfLocEditing(true)}>Edit</button>
                  )}
                </div>
                <div className="prof-row">
                  <span className="prof-row-icon">🔒</span>
                  <div className="prof-row-body">
                    <div className="prof-row-label">Private profile</div>
                    <div className="prof-row-sub">Hide your profile from other users</div>
                  </div>
                  <button className={`prof-toggle${privacyEnabled?" on":""}`} onClick={async()=>{
                    const next=!privacyEnabled;
                    setPrivacyEnabled(next);
                    try{await setDoc(doc(db,"users",user.uid),{privacyEnabled:next},{merge:true});}
                    catch(err){console.error("Save privacy failed:",err);}
                  }}/>
                </div>
              </div>
              {/* Notifications */}
              <div className="prof-section-hd">Notifications</div>
              <div className="prof-card">
                {[
                  {key:"messages",icon:"💬",label:"New messages",sub:"When someone sends you a chat"},
                  {key:"offers",icon:"🤝",label:"New offers",sub:"When someone offers on your want"},
                  {key:"offerStatus",icon:"✅",label:"Offer status",sub:"When a seller accepts or declines"},
                ].map(opt=>(
                  <div key={opt.key} className="prof-row">
                    <span className="prof-row-icon">{opt.icon}</span>
                    <div className="prof-row-body">
                      <div className="prof-row-label">{opt.label}</div>
                      <div className="prof-row-sub">{opt.sub}</div>
                    </div>
                    <button className={`prof-toggle${notifPrefs[opt.key]?" on":""}`} onClick={async()=>{
                      const next={...notifPrefs,[opt.key]:!notifPrefs[opt.key]};
                      setNotifPrefs(next);
                      try{await setDoc(doc(db,"users",user.uid),{notifPrefs:next},{merge:true});}
                      catch(err){console.error("Save notif prefs failed:",err);}
                    }}/>
                  </div>
                ))}
              </div>
              {/* Reviews */}
              {myReviews.length>0&&(
                <>
                  <div className="prof-section-hd">Reviews ({myReviews.length})</div>
                  <div className="prof-card">
                    {myReviews.slice(0,5).map(r=>(
                      <div key={r.id} className="prof-row" style={{flexDirection:"column",alignItems:"flex-start",gap:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,width:"100%"}}>
                          <div className="av sm">{(r.fromName||"?")[0].toUpperCase()}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,fontSize:13,fontFamily:"var(--fb)"}}>{r.fromName}</div>
                            <div style={{marginTop:2}}>{renderStars(r.stars)}</div>
                          </div>
                          <div style={{fontSize:11,color:"var(--text2)"}}>{r.createdAt?.toDate?.()?.toLocaleDateString?.("en-US",{month:"short",day:"numeric"})||""}</div>
                        </div>
                        {r.comment&&<div style={{fontSize:12,color:"var(--text2)",fontStyle:"italic",paddingLeft:4}}>"{r.comment}"</div>}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {/* Actions */}
              <div className="prof-section-hd">Account Actions</div>
              <button className="prof-support-btn" onClick={()=>setView("support")}>🛟 Support</button>
              <button className="prof-action-btn" onClick={()=>{signOut(auth);setView("browse");}}>Sign Out</button>
              <button className="prof-danger-btn" onClick={deleteAccount} disabled={deletingAccount}>{deletingAccount?"Deleting…":"Delete Account"}</button>
            </div>
          </>
        );
      })()}


      {/* SUPPORT */}
      {view==="support"&&(
        <div className="support-page">
          <div className="support-topbar">
            <button className="support-back" onClick={()=>setView("myprofile")}>← Back</button>
            <div className="support-title">Support</div>
          </div>
          <div className="support-body">
            <div className="support-section-hd">Contact Us</div>
            <div className="support-card">
              <div className="support-row">
                <span className="support-icon">✉️</span>
                <div>
                  <div className="support-row-label">Email</div>
                  <a className="support-row-val" href="mailto:boardwant@gmail.com">boardwant@gmail.com</a>
                </div>
              </div>
            </div>
            <div className="support-section-hd">Frequently Asked Questions</div>
            {[
              {q:"How do I post a Want?",a:"Tap the + button at the bottom of the screen, fill in what you're looking for, add photos if you like, and tap Post."},
              {q:"How do I make an offer?",a:"Tap on any Want from the browse feed and tap 'Make Offer'. You can add a price, photo, and message."},
              {q:"How do I mark a Want as sold?",a:"Go to My Wants, open the Want, and tap 'Mark as Sold' once you've found what you were looking for."},
              {q:"Can I edit my Want after posting?",a:"Yes — go to My Wants, tap the Want, and tap Edit to update the title, description, photos, or price."},
              {q:"How do I delete my account?",a:"Go to Profile → Delete Account. This is permanent and removes all your data immediately."},
            ].map(({q,a},i)=>(
              <div key={i} className="support-faq-card">
                <div className="support-faq-q">{q}</div>
                <div className="support-faq-a">{a}</div>
              </div>
            ))}
            <div className="support-section-hd">App Info</div>
            <div className="support-card">
              <div className="support-row">
                <span className="support-icon">📱</span>
                <div>
                  <div className="support-row-label">App</div>
                  <div className="support-row-val">WantBoard</div>
                </div>
              </div>
              <div className="support-row" style={{borderTop:"1px solid var(--border)",marginTop:10,paddingTop:10}}>
                <span className="support-icon">🌐</span>
                <div>
                  <div className="support-row-label">Website</div>
                  <div className="support-row-val">want-board.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MY WANTS */}
      {view==="mine"&&(
        <>
          <div style={{marginBottom:14}}>
            <div className="stitle">My Wants</div>
            <div className="ssub">Tap any want to see offers and messages.</div>
          </div>
          <div className="mine-new-card" style={{marginBottom:14}} onClick={()=>{setShowPostSheet(true);setPosted(false);}}>
            <div className="mine-new-icon">➕</div>
            <div className="mine-new-title">Post a Want</div>
            <div className="mine-new-sub">Tell sellers what you're looking for. Let offers come to you.</div>
          </div>
          {myWants.length===0?(
            <div className="empty"><div className="eicon">📭</div><div className="etitle">No wants yet</div><div className="esub">Tap the card above to post your first want</div></div>
          ):(
            <div className="mine-feed-col">
              {myWants.map(w=>(
                <div key={w.id} className="mine-feed-card" onClick={()=>setSheet(w)}>
                  <div className="mine-feed-head">
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:4,lineHeight:1.3}}>{w.title}{w.status==="sold"&&<span style={{marginLeft:8,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#065f46",background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:999,verticalAlign:"middle"}}>SOLD</span>}</div>
                      <div style={{fontSize:12,color:"var(--text2)"}}>{w.category}{w.category?" · ":""} Up to ${(w.budget||0).toLocaleString()}{w.location?` · 📍 ${w.location}`:""}</div>
                    </div>
                    <span className={`badge ${(w.offers||[]).length>0?"bo":"bn"}`}>{(w.offers||[]).length>0?`${w.offers.length} offer${w.offers.length>1?"s":""}`:"No offers"}</span>
                  </div>
                  <div className="mine-feed-body">
                    <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{w.description}</div>
                    {(w.photos||[]).length>0&&(
                      <img src={w.photos[0]} style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:10,marginTop:8,display:"block"}} alt="" onClick={e=>e.stopPropagation()} />
                    )}
                  </div>
                  <div className="mine-feed-foot">
                    <span style={{fontSize:12,color:"var(--text2)"}}>{ta(w.createdAt)}</span>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <button className="eedit" style={{fontSize:12,padding:"4px 10px"}} onClick={e=>{e.stopPropagation();setEf({title:w.title,description:w.description,budget:w.budget,category:w.category,location:w.location,photos:w.photos||[]});setEditPhotos([]);setEditPhotoPreviews([]);setEditId(w.id);}}>✏️ Edit</button>
                      <button className="edel" style={{fontSize:12,padding:"4px 10px"}} onClick={e=>{e.stopPropagation();delWant(w.id);}}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MESSAGES TAB */}
      {view==="messages"&&(
        <>
          <div style={{marginBottom:14}}>
            <div className="stitle">Messages</div>
            <div className="ssub">Your conversations with buyers and sellers.</div>
          </div>
          {convos.filter(c=>!c.archivedBy?.includes(user.uid)).length===0?(
            <div className="empty"><div className="eicon">💬</div><div className="etitle">No messages yet</div><div className="esub">Contact a seller on any want to start a conversation</div></div>
          ):(
            <div className="msg-list">
              {convos.filter(c=>!c.archivedBy?.includes(user.uid)).map(c=>{
                const otherName=Object.entries(c.participantNames||{}).find(([id])=>id!==user.uid)?.[1]||"Someone";
                const isUnread=c.lastSenderId&&c.lastSenderId!==user.uid&&!c.readBy?.includes(user.uid);
                return(
                  <div key={c.id} className={`msg-item${isUnread?" unread":""}${swipedConvoId===c.id?" swiped":""}`}
                    onClick={()=>{if(swipedConvoId===c.id){setSwipedConvoId(null);return;}setChat({convoId:c.id,otherName,wantTitle:c.wantTitle,offerPrice:c.offerPrice||null,offerPhotoUrl:c.offerPhotoUrl||null,participants:c.participants||[]});}}
                    onTouchStart={(e)=>{const t=e.touches[0];swipeDidMove.current=false;swipeStartX.current=t.clientX;swipeStartY.current=t.clientY;}}
                    onTouchMove={()=>{swipeDidMove.current=true;}}
                    onTouchEnd={(e)=>{const t=e.changedTouches[0];const dx=swipeStartX.current-t.clientX;if(!swipeDidMove.current||dx<40){setSwipedConvoId(swipedConvoId===c.id?null:c.id);}}}
                  >
                    <div className="msg-item-av">{(otherName[0]||"?").toUpperCase()}</div>
                    <div className="msg-item-body">
                      <div className="msg-item-name">
                        {otherName}
                        {isUnread&&<span className="msg-item-new">NEW</span>}
                      </div>
                      <div className="msg-item-preview">{c.lastMessage||"No messages yet"}</div>
                      <div className="msg-item-want">Re: {c.wantTitle||"Unknown want"}</div>
                    </div>
                    <div className="msg-item-right">
                      <span className="msg-item-time">{ta(c.lastMessageAt||c.createdAt)}</span>
                      {isUnread&&<div className="msg-item-dot"/>}
                    </div>
                    {swipedConvoId===c.id&&(
                      <button className="msg-item-del"
                        onTouchStart={e=>e.stopPropagation()}
                        onTouchMove={e=>e.stopPropagation()}
                        onTouchEnd={e=>e.stopPropagation()}
                        onClick={e=>{e.stopPropagation();deleteConvo(c.id);}}
                      >Delete</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* OFFERS SENT (legacy — hidden, use Messages tab instead) */}
      {view==="offers"&&(()=>{
        const myOffersGiven = wants.flatMap(w=>(w.offers||[]).map((o,i)=>({...o,wantId:w.id,wantTitle:w.title,wantUserId:w.userId,wantUser:w.user,idx:i}))).filter(o=>o.fromId===user.uid);
        // Group by want
        const grouped = myOffersGiven.reduce((acc,o)=>{
          const key = o.wantId;
          if (!acc[key]) acc[key] = {wantId:o.wantId,wantTitle:o.wantTitle,wantUserId:o.wantUserId,wantUser:o.wantUser,offers:[]};
          acc[key].offers.push(o);
          return acc;
        },{});
        const groups = Object.values(grouped);
        return (
          <>
            <div className="stitle">Offers Sent</div>
            <div className="ssub">Your offers to sellers, grouped by want.</div>
            {groups.length===0?(
              <div className="empty"><div className="eicon">🤝</div><div className="etitle">No offers yet</div><div className="esub">Browse wants and send your first offer</div></div>
            ):(
              <div className="offers-list">
                {groups.map(g=>(
                  <div key={g.wantId} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
                    <div style={{padding:"12px 16px",background:"var(--surface2)",borderBottom:"1px solid var(--border)"}}>
                      <div style={{fontFamily:"var(--fd)",fontWeight:700,fontSize:15}}>{g.wantTitle}</div>
                      <div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>Seller: {g.wantUser}</div>
                    </div>
                    {g.offers.map((o,idx)=>{
                      const statusLabel = o.status==="accepted"?"Accepted":o.status==="declined"?"Declined":"Pending";
                      const statusCls = o.status==="accepted"?"accepted":o.status==="declined"?"declined":"pending";
                      return (
                        <div key={idx} className="offer-sent-card" style={{borderRadius:0,border:"none",borderBottom:"1px solid var(--border)"}} onClick={()=>openChat({id:o.wantId,userId:o.wantUserId,user:o.wantUser,title:o.wantTitle},o)}>
                          <div className="offer-sent-top">
                            <span className="offer-sent-price">${(o.price||0).toLocaleString()}</span>
                            <span className={`offer-sent-badge ${statusCls}`}>{statusLabel}</span>
                          </div>
                          {o.message&&<div style={{fontSize:12,color:"var(--text2)",marginBottom:8}}>"{o.message}"</div>}
                          <div className="offer-sent-row">
                            <span style={{fontSize:11,color:"var(--text2)"}}>{o.time||""}</span>
                            <span className="offer-sent-cta">💬 Open Chat →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </>
        );
      })()}


      {/* ADMIN PANEL */}
      {view==="admin"&&isAdmin&&(
        <>
          <div className="stitle">⚙️ Admin Panel</div>
          <div className="ssub">Manage posts, users, and platform activity.</div>

          <div className="admin-tabs">
            {[{id:"dashboard",label:"📊 Dashboard"},{id:"posts",label:"📋 All Posts"},{id:"users",label:"🚫 Banned Users"},{id:"reports",label:"🚩 Reports"}].map(t=>(
              <button key={t.id} className={`admin-tab${adminTab===t.id?" active":""}`} onClick={()=>{setAdminTab(t.id);if(t.id==="reports")loadAdminReports();}}>{t.label}</button>
            ))}
          </div>

          {adminTab==="dashboard"&&(
            <>
              <div className="admin-stats">
                <div className="admin-stat">
                  <div className="admin-stat-num">{wants.length}</div>
                  <div className="admin-stat-label">Total Posts</div>
                </div>
                <div className="admin-stat">
                  <div className="admin-stat-num">{[...new Set(wants.map(w=>w.userId))].length}</div>
                  <div className="admin-stat-label">Unique Users</div>
                </div>
                <div className="admin-stat">
                  <div className="admin-stat-num">{banned.length}</div>
                  <div className="admin-stat-label">Banned</div>
                </div>
              </div>
              <div className="admin-stats" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
                <div className="admin-stat">
                  <div className="admin-stat-num">{wants.reduce((s,w)=>s+(w.offers||[]).length,0)}</div>
                  <div className="admin-stat-label">Total Offers</div>
                </div>
                <div className="admin-stat">
                  <div className="admin-stat-num">{convos.length}</div>
                  <div className="admin-stat-label">Conversations</div>
                </div>
              </div>
              <div style={{marginTop:20,padding:"16px",background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:12}}>
                <div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:14,color:"#16a34a",marginBottom:4}}>🌱 Seed Test Data</div>
                <div style={{fontSize:12,color:"var(--text2)",marginBottom:10}}>Add 8 realistic fake posts (Miami area, various categories) so you can test browsing, offers, and messaging.</div>
                <button onClick={seedTestData} style={{background:"#16a34a",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontFamily:"var(--fb)",fontWeight:700,fontSize:13,cursor:"pointer"}}>🌱 Add Test Posts</button>
              </div>
              <div style={{marginTop:12,padding:"16px",background:"#fff5f5",border:"1.5px solid #fca5a5",borderRadius:12}}>
                <div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:14,color:"#dc2626",marginBottom:4}}>⚠️ Danger Zone</div>
                <div style={{fontSize:12,color:"var(--text2)",marginBottom:10}}>Permanently delete all posts, offers, messages, and conversations from the database.</div>
                <button onClick={clearAllData} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontFamily:"var(--fb)",fontWeight:700,fontSize:13,cursor:"pointer"}}>🗑 Clear All Data</button>
              </div>
              <div className="stitle" style={{fontSize:15,marginTop:16}}>Recent Posts</div>
              <div className="admin-table" style={{marginTop:8}}>
                {[...wants].sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0)).slice(0,5).map(w=>(
                  <div key={w.id} className="admin-row">
                    <div className="admin-row-info">
                      <div className="admin-row-title">{w.title}</div>
                      <div className="admin-row-sub">{w.user} · ${(w.budget||0).toLocaleString()} · {ta(w.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminTab==="posts"&&(
            <div className="admin-table">
              {[...wants].sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0)).map(w=>{
                const isBanned=banned.includes(w.userId);
                return(
                  <div key={w.id} className="admin-row">
                    <div className="admin-row-info">
                      <div className="admin-row-title">{w.title}</div>
                      <div className="admin-row-sub">{w.user} · ${(w.budget||0).toLocaleString()} · {(w.offers||[]).length} offer{(w.offers||[]).length!==1?"s":""} · {ta(w.createdAt)}</div>
                      <div className="admin-badges">
                        <span className="admin-badge">📍 {w.location||"No location"}</span>
                        {isBanned&&<span className="admin-badge" style={{background:"#fee2e2",color:"#dc2626"}}>🚫 User banned</span>}
                      </div>
                    </div>
                    <button className="admin-del" onClick={()=>adminDeleteWant(w.id)}>Delete</button>
                    {isBanned
                      ? <button className="admin-unban" onClick={()=>unbanUser(w.userId)}>Unban</button>
                      : <button className="admin-ban" onClick={()=>{if(window.confirm(`Ban ${w.user}?`))banUser(w.userId);}}>Ban</button>
                    }
                  </div>
                );
              })}
              {wants.length===0&&<div className="empty"><div className="eicon">📋</div><div className="etitle">No posts yet</div></div>}
            </div>
          )}

          {adminTab==="reports"&&(
            <div className="admin-table">
              {!adminReportsLoaded&&<div className="loading">Loading reports…</div>}
              {adminReportsLoaded&&adminReports.length===0&&<div className="empty"><div className="eicon">✅</div><div className="etitle">No reports</div><div className="esub">Reported posts will appear here</div></div>}
              {adminReports.map(r=>(
                <div key={r.id} className={`admin-row${r.resolved?" rpt-resolved":""}`}>
                  <div className="admin-row-info" style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div className="admin-row-title">{r.wantTitle}</div>
                      {r.resolved&&<span className="rpt-badge-resolved">Resolved</span>}
                    </div>
                    <div className="admin-row-sub">by {r.wantUser} · Reported by {r.reporterName} · {ta(r.createdAt)}</div>
                    <div className="admin-badges">
                      <span className="admin-badge" style={{background:"#fef3c7",color:"#92400e"}}>🚩 {r.reason}</span>
                    </div>
                    {r.note&&<div style={{fontSize:12,color:"var(--text2)",marginTop:4,fontStyle:"italic"}}>"{r.note}"</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                    {!r.resolved&&<button className="admin-unban" onClick={()=>resolveReport(r.id)}>Resolve</button>}
                    <button className="admin-del" onClick={()=>adminDeleteWant(r.wantId)}>Delete Post</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminTab==="users"&&(
            <div className="admin-table">
              {banned.length===0
                ? <div className="empty"><div className="eicon">✅</div><div className="etitle">No banned users</div><div className="esub">Banned accounts will appear here</div></div>
                : banned.map(uid=>{
                    const userWants = wants.filter(w=>w.userId===uid);
                    const name = userWants[0]?.user || "Unknown user";
                    return(
                      <div key={uid} className="admin-row">
                        <div className="av sm">{name[0]?.toUpperCase()}</div>
                        <div className="admin-row-info">
                          <div className="admin-row-title">{name}</div>
                          <div className="admin-row-sub">UID: {uid.slice(0,12)}… · {userWants.length} post{userWants.length!==1?"s":""}</div>
                        </div>
                        <button className="admin-unban" onClick={()=>unbanUser(uid)}>Unban</button>
                      </div>
                    );
                  })
              }
            </div>
          )}
        </>
      )}
    </main>

    {/* BOTTOM NAV */}
    <nav className="bnav">
      {[...NAV,...(isAdmin?[{id:"admin",icon:"⚙️",label:"Admin"}]:[])].map(n=>(
        <div key={n.id} className={`bitem ${view===n.id?"active":""}`} onClick={()=>{
          if (n.id==="myprofile") { setProfileTab("overview"); loadMyReviews(); }
          setView(n.id);
        }}>
          <span className="bicon">{n.icon}</span>
          {n.id==="messages"&&hasUnread&&<span className="notif-badge" />}
          <span>{n.label}</span>
        </div>
      ))}
    </nav>

    {/* USER PROFILE SHEET */}
    {profileUid&&(
      <div className="prof-overlay" onClick={()=>{setProfileUid(null);setProfileData(null);}}>
        <div className="prof-sheet" onClick={e=>e.stopPropagation()}>
          <div className="prof-handle"/>
          {!profileData?(
            <div className="loading">Loading profile…</div>
          ):(()=>{
            const uid = profileUid;
            const profWants = wants.filter(w=>w.userId===uid);
            const offersGiven = wants.reduce((s,w)=>s+(w.offers||[]).filter(o=>o.fromId===uid).length,0);
            const acceptedOffers = wants.reduce((s,w)=>s+(w.offers||[]).filter(o=>o.fromId===uid&&o.status==="accepted").length,0);
            const joinedDate = profileData.joinedAt?.toDate?.();
            const isMe = uid === user?.uid;
            return(
              <>
                <div className="prof-header">
                  <div className="prof-av">{(profileData.name||"?")[0].toUpperCase()}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="prof-name">{profileData.name}{isMe&&<span style={{fontSize:12,fontWeight:500,color:"var(--text2)",marginLeft:8}}>You</span>}</div>
                    <div className="prof-joined">Joined {joinedDate?joinedDate.toLocaleDateString("en-US",{month:"long",year:"numeric"}):"recently"}</div>
                    {(profileData.reviewCount>0)&&(
                      <div className="prof-rating">
                        {renderStars(profileData.ratingSum/profileData.reviewCount)}
                        <span className="prof-rating-text">{(profileData.ratingSum/profileData.reviewCount).toFixed(1)} ({profileData.reviewCount} review{profileData.reviewCount!==1?"s":""})</span>
                      </div>
                    )}
                  </div>
                  <button className="prof-close" onClick={()=>{setProfileUid(null);setProfileData(null);}}>✕</button>
                </div>
                <div className="prof-stats">
                  <div className="prof-stat">
                    <div className="prof-stat-num">{profWants.length}</div>
                    <div className="prof-stat-label">Wants Posted</div>
                  </div>
                  <div className="prof-stat">
                    <div className="prof-stat-num">{offersGiven}</div>
                    <div className="prof-stat-label">Offers Made</div>
                  </div>
                  <div className="prof-stat">
                    <div className="prof-stat-num">{acceptedOffers}</div>
                    <div className="prof-stat-label">Accepted</div>
                  </div>
                </div>
                {profWants.length>0&&(
                  <>
                    <div className="prof-section">Active Wants</div>
                    {profWants.map(w=>(
                      <div key={w.id} className="prof-want" onClick={()=>{setProfileUid(null);setProfileData(null);setSheet(w);}}>
                        <div className="prof-want-title">{w.title}</div>
                        <div className="prof-want-sub">${(w.budget||0).toLocaleString()} budget · {w.category} · {(w.offers||[]).length} offer{(w.offers||[]).length!==1?"s":""}</div>
                      </div>
                    ))}
                  </>
                )}
                {profWants.length===0&&(
                  <div className="empty" style={{padding:"20px 0"}}><div className="etitle">No wants posted yet</div></div>
                )}
                {profileReviews.length>0&&(
                  <>
                    <div className="prof-section" style={{marginTop:16}}>Reviews</div>
                    {profileReviews.map(r=>(
                      <div key={r.id} className="rev-item">
                        <div className="rev-top">
                          <div className="rev-av">{(r.fromName||"?")[0].toUpperCase()}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div className="rev-name">{r.fromName}</div>
                            <div className="rev-stars">{renderStars(r.stars)}</div>
                          </div>
                          <div className="rev-time">{r.createdAt?.toDate?.()?.toLocaleDateString?.("en-US",{month:"short",day:"numeric",year:"numeric"})||""}</div>
                        </div>
                        {r.comment&&<div className="rev-comment">"{r.comment}"</div>}
                        <div className="rev-want">Re: {r.wantTitle}</div>
                      </div>
                    ))}
                  </>
                )}
                {profileReviews.length===0&&profileData.reviewCount>0&&(
                  <div style={{fontSize:13,color:"var(--text2)",textAlign:"center",padding:"12px 0"}}>Loading reviews…</div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    )}

    {/* ONBOARDING */}
    {onboardingOpen&&(()=>{
      const steps = [
        {icon:"📝",title:"Post what you want",text:"Tell the community what you're looking for and set your budget."},
        {icon:"💬",title:"Sellers come to you",text:"People nearby will send offers with their price and a photo."},
        {icon:"🤝",title:"Chat & meet up",text:"Accept the best offer, message the seller, and make the deal."},
        {icon:"📍",title:"Where are you?",text:"Help sellers near you find your posts. You can always change this later."},
      ];
      const finish = async () => {
        setOnboardingOpen(false);
        try {
          const updates = {onboardingDone:true};
          if (onbLocation.trim()) updates.location = onbLocation.trim();
          await setDoc(doc(db,"users",user.uid), updates, {merge:true});
        } catch(err) { console.error("Onboarding save failed:",err); }
      };
      const detectOnbLocation = () => {
        if (!navigator.geolocation) return;
        setOnbLocLoading(true);
        navigator.geolocation.getCurrentPosition(async pos => {
          const {latitude:lat,longitude:lng} = pos.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const loc = data.address?.suburb||data.address?.neighbourhood||data.address?.city||data.address?.town||"Nearby";
            setOnbLocation(loc);
          } catch { setOnbLocation("Nearby"); }
          setOnbLocLoading(false);
        }, ()=>setOnbLocLoading(false));
      };
      const isLocStep = onboardingStep === steps.length-1;
      const next = () => onboardingStep < steps.length-1 ? setOnboardingStep(onboardingStep+1) : finish();
      const s = steps[onboardingStep];
      return (
        <div className="onb-overlay">
          <div className="onb-card">
            <button className="onb-skip" onClick={finish}>Skip</button>
            <div className="onb-icon">{s.icon}</div>
            <div className="onb-title">{s.title}</div>
            <div className="onb-text">{s.text}</div>
            {isLocStep&&(
              <div className="loc-row" style={{marginTop:14}}>
                <input className="fi" placeholder="Neighborhood or city" value={onbLocation} onChange={e=>setOnbLocation(e.target.value)} style={{flex:1}} />
                <button className="loc-btn" onClick={detectOnbLocation} title="Auto-detect location">{onbLocLoading?"⏳":"📍"}</button>
              </div>
            )}
            <div className="onb-dots">
              {steps.map((_,i)=>(<span key={i} className={`onb-dot${i===onboardingStep?" active":""}`} onClick={()=>setOnboardingStep(i)}/>))}
            </div>
            <button className="onb-next" onClick={next}>{isLocStep?"Get Started →":"Next →"}</button>
          </div>
        </div>
      );
    })()}

    {/* REPORT MODAL */}
    {reportSheet&&(
      <div className="rev-overlay" onClick={()=>setReportSheet(null)}>
        <div className="rev-modal" onClick={e=>e.stopPropagation()}>
          {reportDone?(
            <>
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:36,marginBottom:10}}>✅</div>
                <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:800,marginBottom:6}}>Report submitted</div>
                <div style={{fontSize:13,color:"var(--text2)"}}>Thanks for helping keep WantBoard safe. Our team will review it shortly.</div>
              </div>
              <button className="rev-submit" onClick={()=>setReportSheet(null)}>Done</button>
            </>
          ):(
            <>
              <div className="rev-modal-head">
                <div className="rev-modal-title">🚩 Report Post</div>
                <button className="prof-close" onClick={()=>setReportSheet(null)}>✕</button>
              </div>
              <div className="rev-modal-sub" style={{marginBottom:4}}>"{reportSheet.title}"</div>
              <div style={{fontSize:13,color:"var(--text2)",marginBottom:8}}>What's the issue?</div>
              <div className="rpt-reasons">
                {REPORT_REASONS.map(r=>(
                  <button key={r} className={`rpt-reason${reportReason===r?" active":""}`} onClick={()=>setReportReason(r)}>{r}</button>
                ))}
              </div>
              <textarea className="rev-textarea" placeholder="Additional details (optional)" value={reportNote} onChange={e=>setReportNote(e.target.value)} rows={2}/>
              <button className="rev-submit" disabled={!reportReason||reportBusy} onClick={submitReport}>
                {reportBusy?"Submitting…":"Submit Report"}
              </button>
            </>
          )}
        </div>
      </div>
    )}

    {/* REVIEW MODAL */}
    {reviewSheet&&(
      <div className="rev-overlay" onClick={()=>setReviewSheet(null)}>
        <div className="rev-modal" onClick={e=>e.stopPropagation()}>
          <div className="rev-modal-head">
            <div className="rev-modal-title">Rate {reviewSheet.targetName}</div>
            <button className="prof-close" onClick={()=>setReviewSheet(null)}>✕</button>
          </div>
          <div className="rev-modal-sub">Re: {reviewSheet.wantTitle}</div>
          <div className="rev-star-row">
            {[1,2,3,4,5].map(n=>(
              <button key={n} className="rev-star-btn"
                onMouseEnter={()=>setReviewHover(n)}
                onMouseLeave={()=>setReviewHover(0)}
                onClick={()=>setReviewStars(n)}>
                <span style={{color:(reviewHover||reviewStars)>=n?"#f59e0b":"#d1d5db",fontSize:36}}>★</span>
              </button>
            ))}
          </div>
          {reviewStars>0&&<div className="rev-star-label">{["","Terrible","Bad","Okay","Good","Excellent!"][reviewStars]}</div>}
          <textarea className="rev-textarea" placeholder="Share your experience (optional)..." value={reviewComment} onChange={e=>setReviewComment(e.target.value)} rows={3}/>
          <button className="rev-submit" disabled={reviewStars<1||reviewBusy} onClick={submitReview}>
            {reviewBusy?"Submitting…":"Submit Review"}
          </button>
        </div>
      </div>
    )}

    {/* EXPANDED WANT SHEET */}
    {sheet&&(
      <div className="soverlay" onClick={()=>{setSheet(null);setOfferFilter("all");}}>
        <div className="sheet" onClick={e=>e.stopPropagation()}>
          <div className="sh-head">
            <div className="sh-title">{sheet.title}</div>
            <button className="sh-close" onClick={()=>{setSheet(null);setOfferFilter("all");}}>✕</button>
          </div>
          <div className="sh-body">
            <div className="sh-budget">${(sheet.budget||0).toLocaleString()}</div>
            <div className="sh-meta">📍 {sheet.location} · {sheet.user} · {ta(sheet.createdAt)}</div>
            {(sheet.photos||[]).length>0&&(
              <div className="sh-photos">
                {(sheet.photos||[]).map((url,i)=><img key={i} src={url} className="sh-photo" alt="" />)}
              </div>
            )}
            <div className="sh-desc">{sheet.description}</div>
            {sheet.userId!==user.uid&&(
              <div style={{textAlign:"right",marginBottom:8}}>
                {myReportedWants.includes(sheet.id)
                  ? <span style={{fontSize:11,color:"var(--text2)"}}>✓ Reported</span>
                  : <button className="report-btn" onClick={()=>{setReportSheet(sheet);setReportReason("");setReportNote("");setReportDone(false);}}>🚩 Report</button>
                }
              </div>
            )}
            {sheet.userId===user.uid&&(sheet.offers||[]).length>0&&(()=>{
              const all = sheet.offers || [];
              const counts = {
                all: all.length,
                pending: all.filter(o=>!o.status).length,
                accepted: all.filter(o=>o.status==="accepted").length,
                declined: all.filter(o=>o.status==="declined").length,
              };
              const visible = all.map((o,i)=>({o,i})).filter(({o})=>
                offerFilter==="all" ? o.status!=="declined" || counts.declined===all.length :
                offerFilter==="pending" ? !o.status :
                offerFilter==="accepted" ? o.status==="accepted" :
                offerFilter==="declined" ? o.status==="declined" : true
              );
              const isSold = sheet.status==="sold";
              const pillStyle = (active)=>({padding:"5px 12px",borderRadius:999,fontSize:12,fontWeight:700,whiteSpace:"nowrap",cursor:"pointer",border:active?"1px solid var(--accent)":"1px solid var(--border)",background:active?"var(--accent)":"var(--surface2)",color:active?"#fff":"var(--text)"});
              return (
                <>
                  <div className="offers-ttl" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
                    <span>Offers ({all.length}){isSold&&<span style={{marginLeft:8,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#065f46",background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:999}}>SOLD</span>}</span>
                  </div>
                  <div style={{display:"flex",gap:6,overflowX:"auto",padding:"6px 0 10px",marginBottom:4}}>
                    <div onClick={()=>setOfferFilter("all")} style={pillStyle(offerFilter==="all")}>All {counts.all}</div>
                    <div onClick={()=>setOfferFilter("pending")} style={pillStyle(offerFilter==="pending")}>🟡 Pending {counts.pending}</div>
                    <div onClick={()=>setOfferFilter("accepted")} style={pillStyle(offerFilter==="accepted")}>✅ Accepted {counts.accepted}</div>
                    <div onClick={()=>setOfferFilter("declined")} style={pillStyle(offerFilter==="declined")}>❌ Declined {counts.declined}</div>
                  </div>
                  {visible.length===0?(
                    <div style={{padding:"16px",textAlign:"center",color:"var(--text2)",fontSize:13,background:"var(--surface2)",borderRadius:12,marginBottom:8}}>No offers in this filter.</div>
                  ):visible.map(({o,i})=>(
                    <div key={i} className={`oitem${o.status==="accepted"?" accepted":o.status==="declined"?" declined":""}`} style={o.status==="declined"?{opacity:.6}:{}}>
                      <div className="av sm profile-link" onClick={()=>openProfile(o.fromId,o.from)}>{(o.from||"?")[0].toUpperCase()}</div>
                      <div className="obody">
                        <div className="oname" style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          {o.from}
                          {!o.status&&<span style={{fontSize:11,fontWeight:700,color:"#92400e",background:"#fef3c7",border:"1px solid #fde68a",borderRadius:999,padding:"2px 8px"}}>🟡 Pending</span>}
                          {o.status==="accepted"&&<span className="offer-status-accepted">✅ Accepted</span>}
                          {o.status==="declined"&&<span className="offer-status-declined">❌ {o.declineReason==="auto"?"Auto-declined":"Declined"}</span>}
                        </div>
                        {o.photoUrl&&<img src={o.photoUrl} className="ophoto" alt="offer" />}
                        <div className="omsg">{o.message}</div>
                        <div className="orow" style={{flexWrap:"wrap",gap:6}}>
                          <span className="oprice">${(o.price||0).toLocaleString()}</span>
                          <span className="otime">{o.time}</span>
                          {o.fromId&&(
                            <button className="mbtn" onClick={()=>{openChat(sheet,o);setSheet(null);}}>💬 {o.status==="accepted"?"Arrange pickup":"Message"}</button>
                          )}
                          {!o.status&&!isSold&&<button className="offer-accept" onClick={()=>{if(window.confirm("Accept this offer? Your want will be marked SOLD and all other pending offers will be auto-declined.")) acceptOffer(sheet,i);}}>✅ Accept</button>}
                          {!o.status&&!isSold&&o.fromId&&<button className="mbtn" onClick={()=>{openChat(sheet,o);setSheet(null);}}>↔ Counter</button>}
                          {!o.status&&!isSold&&<button className="offer-decline" onClick={()=>declineOffer(sheet,i)}>❌ Decline</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
            {sheet.userId!==user.uid&&(()=>{
              const myAccepted = (sheet.offers||[]).map((o,i)=>({o,i})).find(({o})=>o.fromId===user.uid&&o.status==="accepted");
              const rateKey = myAccepted ? sheet.id+"_"+myAccepted.i+"_"+sheet.userId : null;
              return myAccepted&&rateKey&&!myReviewedKeys.includes(rateKey)?(
                <div style={{padding:"12px 0"}}>
                  <button className="rate-btn" style={{width:"100%"}} onClick={()=>{setReviewSheet({targetUid:sheet.userId,targetName:sheet.user,wantId:sheet.id,wantTitle:sheet.title,offerKey:rateKey});setReviewStars(0);setReviewComment("");}}>⭐ Rate {sheet.user}</button>
                </div>
              ):null;
            })()}
            {sheet.userId!==user.uid&&sheet.status==="sold"&&(
              <div style={{padding:"14px",textAlign:"center",background:"#f0fdf4",border:"1px solid #6ee7b7",borderRadius:12,marginTop:10,fontSize:13,fontWeight:600,color:"#065f46"}}>✅ This want has been sold. New offers can no longer be sent.</div>
            )}
            {sheet.userId!==user.uid&&sheet.status!=="sold"&&(
              <div className="compose">
                <div className="clabel">Send Your Offer</div>
                {sent[sheet.id]?(
                  <div className="sent">✅ Offer sent!</div>
                ):(
                  <>
                    <div>
                      <label className="photo-lbl">📷 Attach a photo<input type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto} /></label>
                      {photoPrev&&<img src={photoPrev} className="photo-prev" alt="preview" />}
                    </div>
                    <div className="crow" style={{marginTop:10}}>
                      <textarea className="cmsg" placeholder="Describe what you have..." value={oc.message} onChange={e=>{setOc(p=>({...p,message:e.target.value}));setOfferError("");}} />
                      <input type="number" className="cprice" placeholder="$" value={oc.price} onChange={e=>{setOc(p=>({...p,price:e.target.value}));setOfferError("");}} />
                      <button className="csend" onClick={()=>sendOffer(sheet.id)} disabled={sending} style={{opacity:sending?0.7:1,cursor:sending?"not-allowed":"pointer"}}>{sending?(photoFile?"Uploading...":"Sending..."):"Send ->"}</button>
                    </div>
                    {offerError&&<div style={{marginTop:8,fontSize:13,color:"var(--red)",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"8px 12px"}}>{offerError}</div>}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* POST WANT SHEET */}
    {showPostSheet&&(
      <div className="moverlay" onClick={()=>{setShowPostSheet(false);setPostPhotos([]);setPostPhotoPreviews([]);setPostPhotoErr("");}}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mhead">
            <div className="mttl">Post a Want</div>
            <button className="mclose" onClick={()=>{setShowPostSheet(false);setPostPhotos([]);setPostPhotoPreviews([]);setPostPhotoErr("");}}>✕</button>
          </div>
          <div className="ebody">
            {posted?(
              <div className="empty" style={{padding:"32px 0"}}>
                <div className="eicon">📬</div>
                <div className="etitle">Want Posted!</div>
                <div className="esub">Sellers will start sending offers soon.</div>
                <button className="sbtn" style={{marginTop:20}} onClick={()=>{setShowPostSheet(false);setPosted(false);setForm({title:"",description:"",budget:"",category:"",location:""});setPostPhotos([]);setPostPhotoPreviews([]);}}>Done</button>
              </div>
            ):(
              <>
                <div className="fg"><label className="fl">What do you want?</label><input className="fi" placeholder='e.g. "Looking for a vintage road bike"' value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></div>
                <div className="fg"><label className="fl">Describe it</label><textarea className="fi" placeholder="Brand, size, condition, color..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
                <div className="fr2">
                  <div className="fg"><label className="fl">Budget ($)</label><input type="number" className="fi" placeholder="0" value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))} /></div>
                  <div className="fg"><label className="fl">Category</label>
                    <select className="fi" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                      <option value="">Select...</option>
                      {["Electronics","Furniture","Tools","Sports","Home","Music","Fashion","Collectibles","Other"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="fg">
                  <label className="fl">Photos <span style={{color:"var(--text2)",fontWeight:400}}>(up to 3, optional — JPG, PNG, WebP)</span></label>
                  <div className="post-photos">
                    {postPhotoPreviews.map((src,i)=>(
                      <div key={i} className="post-photo-wrap">
                        <img src={src} className="post-photo-thumb" alt={`photo ${i+1}`} />
                        <button className="post-photo-rm" onClick={()=>removePostPhoto(i)}>✕</button>
                      </div>
                    ))}
                    {postPhotos.length<3&&(
                      <AddPhotoButton onPick={handleAddPostPhotos} disabled={postPhotoPicking||posting} />
                    )}
                  </div>
                  {postPhotoErr&&<div style={{marginTop:6,fontSize:12,color:"var(--red)",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"8px 10px",lineHeight:1.4}}>{postPhotoErr}</div>}
                </div>
                <button className="sbtn" onClick={postWant} disabled={posting||uploadingPhotos||!form.title||!form.budget}>
                  {uploadingPhotos ? `Uploading ${postPhotos.length} photo${postPhotos.length!==1?"s":""}…` : posting ? "Posting…" : "Post My Want →"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}

    {/* CHAT SCREEN */}
    {chat&&(
      <div className="chat-screen">
        <div className="chat-header">
          <button className="chat-back" onClick={()=>setChat(null)}>‹</button>
          <div className="chat-header-info">
            <div className="chat-header-name">{chat.otherName}</div>
            <div className="chat-header-sub">Re: {chat.wantTitle}</div>
          </div>
        </div>
        {chat.offerPrice&&(
          <div className="chat-offer-bar">
            {chat.offerPhotoUrl&&<img src={chat.offerPhotoUrl} className="chat-offer-thumb" alt=""/>}
            <div>
              <div className="chat-offer-label">Offer</div>
              <div className="chat-offer-price">${(chat.offerPrice).toLocaleString()}</div>
            </div>
          </div>
        )}
        <div className="chat-messages" ref={msgsRef}>
          {msgs.length===0&&(
            <div style={{textAlign:"center",color:"var(--text2)",fontSize:13,padding:"32px 0",margin:"auto"}}>No messages yet. Say hello!</div>
          )}
          {msgs.map(m=>{
            const isMine=m.senderId===user.uid;
            return(
              <div key={m.id} className={`chat-msg-wrap ${isMine?"mine":"theirs"}`}>
                {!isMine&&m.senderName&&<div className="chat-bubble-sender">{m.senderName}</div>}
                <div className={`chat-bubble ${isMine?"mine":"theirs"}${m.type==="offer"?" offer":""}`}>
                  {m.type==="offer"&&m.offerPhotoUrl&&<img src={m.offerPhotoUrl} className="chat-bubble-img" alt=""/>}
                  {m.text}
                  <span className="chat-bubble-time">{ta(m.createdAt)}</span>
                </div>
                {isMine&&<button className="chat-msg-del" onClick={()=>deleteMsg(m.id)}>Delete</button>}
              </div>
            );
          })}
          <div ref={btm}/>
        </div>
        {msgSendErr&&<div className="chat-send-err">{msgSendErr}</div>}
        <div className="chat-input-area">
          <input
            className="chat-input"
            placeholder="Message..."
            value={ci}
            onChange={e=>setCi(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMsg()}
          />
          <button className="chat-send-btn" onClick={sendMsg}>Send</button>
        </div>
      </div>
    )}

    {/* EDIT MODAL */}
    {editId&&(
      <div className="moverlay" onClick={()=>setEditId(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mhead">
            <div className="mttl">Edit Want</div>
            <button className="mclose" onClick={()=>setEditId(null)}>✕</button>
          </div>
          <div className="ebody">
            <div className="fg"><label className="fl">Title</label><input className="fi" value={ef.title} onChange={e=>setEf(p=>({...p,title:e.target.value}))} /></div>
            <div className="fg"><label className="fl">Description</label><textarea className="fi" value={ef.description} onChange={e=>setEf(p=>({...p,description:e.target.value}))} /></div>
            <div className="fr2">
              <div className="fg"><label className="fl">Budget ($)</label><input type="number" className="fi" value={ef.budget} onChange={e=>setEf(p=>({...p,budget:e.target.value}))} /></div>
              <div className="fg"><label className="fl">Category</label>
                <select className="fi" value={ef.category} onChange={e=>setEf(p=>({...p,category:e.target.value}))}>
                  {["Electronics","Furniture","Sports","Home","Music","Fashion","Collectibles","Other"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="fg"><label className="fl">Location</label><input className="fi" value={ef.location} onChange={e=>setEf(p=>({...p,location:e.target.value}))} /></div>
            <div className="fg">
              <label className="fl">Photos</label>
              <div className="post-photos">
                {(ef.photos||[]).map((url,i)=>(
                  <div key={`existing-${i}`} className="post-photo-wrap">
                    <img src={url} className="post-photo-thumb" alt="" />
                    <button className="post-photo-rm" onClick={()=>setEf(p=>({...p,photos:p.photos.filter((_,j)=>j!==i)}))}>✕</button>
                  </div>
                ))}
                {editPhotoPreviews.map((src,i)=>(
                  <div key={`new-${i}`} className="post-photo-wrap">
                    <img src={src} className="post-photo-thumb" alt="" />
                    <button className="post-photo-rm" onClick={()=>{setEditPhotos(p=>p.filter((_,j)=>j!==i));setEditPhotoPreviews(p=>p.filter((_,j)=>j!==i));}}>✕</button>
                  </div>
                ))}
                {((ef.photos||[]).length + editPhotos.length) < 3 && (
                  <AddPhotoButton onPick={handleAddEditPhotos} disabled={editPhotoPicking} />
                )}
              </div>
            </div>
            {editSaveErr&&<div style={{marginTop:8,fontSize:13,color:"var(--red)",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"8px 12px"}}>{editSaveErr}</div>}
            <button className="sbtn" onClick={saveEdit} disabled={editSaving}>
              {editSaving&&editPhotos.length>0?"Uploading photos…":editSaving?"Saving…":"Save Changes"}
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
</>
);
}