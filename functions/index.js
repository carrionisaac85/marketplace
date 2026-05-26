const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

async function sendPush(recipientUid, notification, data = {}) {
  const tokenSnap = await db.doc(`fcmTokens/${recipientUid}`).get();
  if (!tokenSnap.exists) return;
  const { token } = tokenSnap.data();
  if (!token) return;

  try {
    await messaging.send({
      token,
      notification,
      data,
      webpush: {
        notification: {
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          requireInteraction: false,
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
}

// New chat message → notify the other participant
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

    const senderName = msg.senderName || "Someone";
    const body = msg.text
      ? msg.text.length > 80 ? msg.text.slice(0, 77) + "…" : msg.text
      : "Sent a photo";

    await sendPush(
      recipientUid,
      { title: `💬 ${senderName}`, body },
      { convoId, senderId: msg.senderId }
    );

    return null;
  });

// New offer on a want → notify the want owner
exports.notifyOnNewOffer = functions.firestore
  .document("wants/{wantId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    const prevOffers = before.offers || [];
    const currOffers = after.offers || [];

    if (currOffers.length <= prevOffers.length) return null;

    const newOffer = currOffers[currOffers.length - 1];
    const ownerUid = after.userId;
    if (!ownerUid || !newOffer) return null;
    if (newOffer.fromId === ownerUid) return null;

    const wantTitle = after.title || "your want";
    const offerFrom = newOffer.fromName || "Someone";
    const offerPrice = newOffer.price ? ` — $${newOffer.price}` : "";
    const body = newOffer.message
      ? newOffer.message.length > 60 ? newOffer.message.slice(0, 57) + "…" : newOffer.message
      : `${offerFrom} made an offer${offerPrice}`;

    const convoId = newOffer.convoId || null;

    await sendPush(
      ownerUid,
      { title: `🤝 New offer on "${wantTitle}"`, body },
      convoId ? { convoId } : {}
    );

    return null;
  });

// Offer accepted or declined → notify the offer sender
exports.notifyOnOfferStatus = functions.firestore
  .document("wants/{wantId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    const prevOffers = before.offers || [];
    const currOffers = after.offers || [];

    for (let i = 0; i < currOffers.length; i++) {
      const prev = prevOffers[i];
      const curr = currOffers[i];
      if (!prev || !curr) continue;
      if (prev.status === curr.status) continue;

      const { status, fromId, convoId } = curr;
      if (!fromId || !["accepted", "declined"].includes(status)) continue;

      const wantTitle = after.title || "your offer";
      const emoji = status === "accepted" ? "🎉" : "😔";
      const verb = status === "accepted" ? "accepted" : "declined";

      await sendPush(
        fromId,
        { title: `${emoji} Offer ${verb}`, body: `Your offer on "${wantTitle}" was ${verb}.` },
        convoId ? { convoId } : {}
      );
    }

    return null;
  });
