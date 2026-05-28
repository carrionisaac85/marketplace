---
name: UI redesign decisions
description: Major nav/view overhaul completed May 2026 — what changed and why
---

## Nav tabs (NAV constant)
Changed from `[browse, mine, post, offers]` to `[browse, mine, messages, myprofile]`.

**Why:** Post Want moved to a modal sheet opened from the "Post a Want" card in My Wants. Offers tab removed — offers are accessed inline from the want sheet. Dedicated Messages tab added. Profile moved to nav.

## Post form → modal sheet
`showPostSheet` state controls visibility. Opened by tapping the "Post a Want" dotted card in My Wants. After success, shows a success state with "Done" button to close. `postWant` function no longer auto-navigates (removed `setView("mine")` setTimeout).

**Why:** Keeps user in My Wants context; avoids a separate "Post Want" tab.

## Home feed → single column
Changed from `<div className="grid2">` + `wcard` to `<div className="feed-col">` + `feed-card`. Cards now show avatar, name, time+location, title, description, category pill, first photo, offer count, save/contact buttons.

## My Wants tab
Top: "Post a Want" dotted card (`.mine-new-card`). Below: social feed cards (`.mine-feed-card`) — title, category/budget row, description excerpt, photo, time + Edit/Delete buttons. Tapping card opens existing setSheet(w) mechanism.

## Messages tab (view==="messages")
New tab showing all conversations. Uses `convos` state. Each item: avatar (first letter), name, last message preview, want title, time, unread dot. Tapping opens the existing chat modal.

## Profile (view==="myprofile")
No tabs — single scroll. Sections: hero (avatar + name + email + rating), mini stats (Wants / Offers / Saved), Account (location input + privacy toggle), Notifications (3 toggles), Reviews, Account Actions (Sign Out + Delete Account). Sign Out removed from header.

## Nav badge
Changed `n.id==="offers"&&hasUnread` to `n.id==="messages"&&hasUnread`.

## CSS classes added
- `.feed-col`, `.feed-card`, `.feed-urow`, `.feed-body`, `.feed-title`, `.feed-desc`, `.feed-pills`, `.feed-foot`, `.feed-img`
- `.mine-new-card`, `.mine-new-icon`, `.mine-new-title`, `.mine-new-sub`
- `.mine-feed-col`, `.mine-feed-card`, `.mine-feed-head`, `.mine-feed-body`, `.mine-feed-foot`
- `.msg-tab-list`, `.msg-tab-item`, `.msg-tab-av`, `.msg-tab-body`, `.msg-tab-name`, `.msg-tab-preview`, `.msg-tab-want`, `.msg-tab-right`, `.msg-tab-time`, `.msg-unread-dot`
- `.prof-page`, `.prof-hero`, `.prof-hero-av`, `.prof-hero-name`, `.prof-hero-email`, `.prof-mini-stats`, `.prof-mini-stat`, `.prof-mini-num`, `.prof-mini-label`, `.prof-section-hd`, `.prof-card`, `.prof-row`, `.prof-row-icon`, `.prof-row-body`, `.prof-row-label`, `.prof-row-sub`, `.prof-toggle`, `.prof-loc-input`, `.prof-action-btn`, `.prof-danger-btn`

## State added
- `showPostSheet` (bool) — controls post form modal
- `privacyEnabled` (bool) — loaded from user doc, saved to Firestore
- `userLocation` (string) — loaded from user doc, saved to Firestore on blur
