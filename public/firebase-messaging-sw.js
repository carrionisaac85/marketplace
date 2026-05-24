importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCztet4RJW50L6N1uKWq0ClHnj_ud4TxFo",
  authDomain: "marketplace305.firebaseapp.com",
  projectId: "marketplace305",
  storageBucket: "marketplace305.firebasestorage.app",
  messagingSenderId: "445461567451",
  appId: "1:445461567451:web:aa2eb29f5e8449d405b9fe",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || "New message";
  const body = payload.notification?.body || "You have a new message";
  const convoId = payload.data?.convoId;
  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: convoId || "new-message",
    data: { convoId },
  });
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const convoId = event.notification.data?.convoId;
  const targetUrl = convoId ? `/?convo=${convoId}` : "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.postMessage({ type: "OPEN_CONVERSATION", convoId });
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
