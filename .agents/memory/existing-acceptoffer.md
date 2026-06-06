---
name: Existing acceptOffer name clash
description: App already has an acceptOffer function for want-level offer acceptance; chat-level offer functions need distinct names
---

The app has `acceptOffer(want, idx)` (~line 2367) that accepts an offer on a want (updates the want doc's offers array, sends notifications). It has nothing to do with chat.

When adding chat-level offer acceptance, use distinct names:
- `acceptChatOffer()` — marks conversation `offerStatus: 'accepted'`
- `declineChatOffer()` — marks conversation `offerStatus: 'declined'`
- `sendCounterOffer(amt)` — updates `offerPrice`, sends counter message

**Why:** `const acceptOffer` declared twice causes a Babel parser error at build time.

**How to apply:** Any future chat offer actions must not reuse `acceptOffer`, `declineOffer`, or any name already used at the want/offer level.
