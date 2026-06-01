const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

function isPendingOffer(o) {
  if (!o) return false;
  const s = o.status;
  return !s || s === "pending";
}

async function computeUnreadBadge(uid, forceUnreadConvoId = null) {
  try {
    const [convoSnap, wantsSnap] = await Promise.all([
      db.collection("conversations").where("participants", "array-contains", uid).get(),
      db.collection("wants").where("userId", "==", uid).get(),
    ]);
    let count = 0;
    let forcedAlreadyCounted = false;
    convoSnap.forEach(doc => {
      const c = doc.data();
      const archivedBy = c.archivedBy || [];
      if (archivedBy.includes(uid)) return;
      const readBy = c.readBy || [];
      const isUnread = c.lastSenderId && c.lastSenderId !== uid && !readBy.includes(uid);
      if (isUnread) {
        count += 1;
        if (forceUnreadConvoId && doc.id === forceUnreadConvoId) forcedAlreadyCounted = true;
      }
    });
    // The trigger that calls us can race ahead of the conversation-doc update
    // (lastSenderId / readBy). If the convo that just received a message is
    // not yet reflected as unread, count it explicitly so the badge is right.
    if (forceUnreadConvoId && !forcedAlreadyCounted) count += 1;
    wantsSnap.forEach(doc => {
      const w = doc.data();
      const offers = w.offers || [];
      for (const o of offers) {
        if (o && o.fromId !== uid && isPendingOffer(o)) count += 1;
      }
    });
    return count;
  } catch (err) {
    console.warn("computeUnreadBadge failed:", err);
    return null;
  }
}

async function isMuted(recipientUid, category) {
  try {
    const userSnap = await db.doc(`users/${recipientUid}`).get();
    if (!userSnap.exists) return false;
    const prefs = userSnap.data().notifPrefs || {};
    return prefs[category] === false;
  } catch (err) {
    console.warn("isMuted lookup failed:", err);
    return false;
  }
}

async function sendPush(recipientUid, notification, data = {}, badge = null) {
  const tokenSnap = await db.doc(`fcmTokens/${recipientUid}`).get();
  if (!tokenSnap.exists) return;
  const { token } = tokenSnap.data();
  if (!token) return;

  const message = {
    token,
    notification,
    data: { ...data, ...(badge != null ? { badge: String(badge) } : {}) },
    webpush: {
      notification: {
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        requireInteraction: false,
      },
    },
    // Always include APNs overrides so every iOS notification has sound + banner.
    // badge is optional — only set it when we have a real count.
    apns: {
      payload: {
        aps: {
          sound: "default",
          ...(badge != null ? { badge } : {}),
        },
      },
      headers: {
        "apns-priority": "10",
      },
    },
    android: {
      notification: {
        sound: "default",
        ...(badge != null ? { notificationCount: badge } : {}),
      },
      priority: "high",
    },
  };

  try {
    await messaging.send(message);
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

    if (await isMuted(recipientUid, "messages")) return null;

    const senderName = msg.senderName || "Someone";
    const body = msg.text
      ? msg.text.length > 80 ? msg.text.slice(0, 77) + "…" : msg.text
      : "Sent a photo";

    const badge = await computeUnreadBadge(recipientUid, convoId);

    await sendPush(
      recipientUid,
      { title: `💬 ${senderName}`, body },
      { convoId, senderId: msg.senderId },
      badge,
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

    if (await isMuted(ownerUid, "offers")) return null;

    const wantTitle = after.title || "your want";
    const offerFrom = newOffer.fromName || "Someone";
    const offerPrice = newOffer.price ? ` — $${newOffer.price}` : "";
    const body = newOffer.message
      ? newOffer.message.length > 60 ? newOffer.message.slice(0, 57) + "…" : newOffer.message
      : `${offerFrom} made an offer${offerPrice}`;

    const convoId = newOffer.convoId || null;
    const badge = await computeUnreadBadge(ownerUid);

    await sendPush(
      ownerUid,
      { title: `🤝 New offer on "${wantTitle}"`, body },
      convoId ? { convoId } : {},
      badge,
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

      if (await isMuted(fromId, "offerStatus")) continue;

      const wantTitle = after.title || "your offer";
      const emoji = status === "accepted" ? "🎉" : "😔";
      const verb = status === "accepted" ? "accepted" : "declined";
      const badge = await computeUnreadBadge(fromId);

      await sendPush(
        fromId,
        { title: `${emoji} Offer ${verb}`, body: `Your offer on "${wantTitle}" was ${verb}.` },
        convoId ? { convoId } : {},
        badge,
      );
    }

    return null;
  });
