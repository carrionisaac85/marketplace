const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

exports.notifyOnNewMessage = functions.firestore
  .document("conversations/{convoId}/messages/{msgId}")
  .onCreate(async (snap, context) => {
    const msg = snap.data();
    const { convoId } = context.params;

    if (!msg.senderId) return null;

    const convoSnap = await db.doc(`conversations/${convoId}`).get();
    if (!convoSnap.exists) return null;
    const convo = convoSnap.data();

    const recipientUid = (convo.participants || []).find(uid => uid !== msg.senderId);
    if (!recipientUid) return null;

    const tokenSnap = await db.doc(`fcmTokens/${recipientUid}`).get();
    if (!tokenSnap.exists) return null;
    const { token } = tokenSnap.data();
    if (!token) return null;

    const senderName = msg.senderName || "Someone";
    const messageBody = msg.text || "New message";

    try {
      await messaging.send({
        token,
        notification: {
          title: `New message from ${senderName}`,
          body: messageBody,
        },
        data: {
          convoId,
          senderId: msg.senderId,
        },
        webpush: {
          notification: {
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            tag: convoId,
            requireInteraction: false,
          },
          fcmOptions: {
            link: `/?convo=${convoId}`,
          },
        },
      });
    } catch (err) {
      if (err.code === "messaging/registration-token-not-registered") {
        await db.doc(`fcmTokens/${recipientUid}`).delete();
      } else {
        console.error("FCM send error:", err);
      }
    }

    return null;
  });
