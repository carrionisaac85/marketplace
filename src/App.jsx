import { useState, useEffect } from “react”;
import { initializeApp } from “https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js”;
import {
getFirestore,
collection,
addDoc,
onSnapshot,
updateDoc,
deleteDoc,
doc,
serverTimestamp,
orderBy,
query,
arrayUnion,
} from “https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js”;

// ── Firebase config ──────────────────────────────────────────────
const firebaseConfig = {
apiKey: “AIzaSyCztet4RJW50L6N1uKWq0ClHnj_ud4TxFo”,
authDomain: “marketplace305.firebaseapp.com”,
projectId: “marketplace305”,
storageBucket: “marketplace305.firebasestorage.app”,
messagingSenderId: “445461567451”,
appId: “1:445461567451:web:aa2eb29f5e8449d405b9fe”,
measurementId: “G-WGWS8Y69F0”,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Styles ───────────────────────────────────────────────────────
const FONT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`;

const css = `
${FONT}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
–bg: #0F0F0F;
–surface: #1A1A1A;
–surface2: #222222;
–surface3: #2C2C2C;
–text: #F0EDE8;
–text2: #888580;
–accent: #F5C842;
–green: #34D399;
–border: #2E2E2E;
–radius: 16px;
–font-display: ‘Syne’, sans-serif;
–font-body: ‘DM Sans’, sans-serif;
}
body { font-family: var(–font-body); background: var(–bg); color: var(–text); -webkit-font-smoothing: antialiased; }
.app { min-height: 100vh; display: flex; flex-direction: column; }

/* HEADER */
.header { background: var(–surface); border-bottom: 1px solid var(–border); position: sticky; top: 0; z-index: 100; padding: 0 20px; }
.header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 16px; height: 60px; }
.logo { font-family: var(–font-display); font-weight: 800; font-size: 20px; color: var(–text); letter-spacing: -0.5px; cursor: pointer; white-space: nowrap; }
.logo span { color: var(–accent); }
.search-bar { flex: 1; display: flex; align-items: center; background: var(–surface2); border: 1.5px solid var(–border); border-radius: 100px; padding: 0 16px; gap: 8px; transition: border-color 0.2s; }
.search-bar:focus-within { border-color: var(–accent); }
.search-bar input { border: none; background: transparent; font-family: var(–font-body); font-size: 14px; color: var(–text); outline: none; flex: 1; padding: 10px 0; }
.search-bar input::placeholder { color: var(–text2); }
.btn { font-family: var(–font-body); font-size: 13px; font-weight: 600; border: none; cursor: pointer; border-radius: 100px; padding: 9px 18px; transition: all 0.18s; }
.btn-outline { background: transparent; color: var(–text); border: 1.5px solid var(–border); }
.btn-outline:hover { border-color: var(–text2); }
.btn-primary { background: var(–accent); color: #0F0F0F; }
.btn-primary:hover { background: #f0bc2a; transform: translateY(-1px); }

/* TABS */
.nav-tabs { display: flex; gap: 2px; padding: 0 20px; background: var(–surface); border-bottom: 1px solid var(–border); }
.nav-tab { padding: 13px 18px; font-size: 13px; font-weight: 600; font-family: var(–font-display); cursor: pointer; color: var(–text2); border-bottom: 2px solid transparent; transition: color 0.15s, border-color 0.15s; white-space: nowrap; }
.nav-tab:hover { color: var(–text); }
.nav-tab.active { color: var(–accent); border-bottom-color: var(–accent); }

/* MAIN */
.main { max-width: 1100px; margin: 0 auto; padding: 28px 20px; flex: 1; width: 100%; }

/* CATEGORIES */
.categories { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 20px; scrollbar-width: none; padding-bottom: 2px; }
.categories::-webkit-scrollbar { display: none; }
.cat-chip { padding: 7px 14px; border-radius: 100px; border: 1.5px solid var(–border); background: var(–surface); cursor: pointer; font-size: 13px; font-weight: 500; color: var(–text2); white-space: nowrap; transition: all 0.15s; }
.cat-chip:hover { border-color: var(–accent); color: var(–accent); }
.cat-chip.active { background: var(–accent); border-color: var(–accent); color: #0F0F0F; font-weight: 700; }

/* WANT CARDS */
.wants-list { display: flex; flex-direction: column; gap: 16px; }
.want-card { background: var(–surface); border: 1px solid var(–border); border-radius: var(–radius); overflow: hidden; transition: border-color 0.2s; }
.want-card.expanded { border-color: var(–accent); }
.want-header { padding: 20px 20px 0; cursor: pointer; }
.want-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: var(–accent); color: #0F0F0F; display: flex; align-items: center; justify-content: center; font-family: var(–font-display); font-weight: 800; font-size: 15px; flex-shrink: 0; }
.avatar.sm { width: 34px; height: 34px; font-size: 13px; background: var(–surface3); color: var(–text2); }
.want-meta { flex: 1; }
.want-user { font-size: 13px; font-weight: 600; }
.want-time { font-size: 12px; color: var(–text2); margin-top: 1px; }
.want-budget { font-family: var(–font-display); font-weight: 800; font-size: 20px; color: var(–green); white-space: nowrap; }
.budget-label { font-size: 10px; color: var(–text2); text-align: right; }
.want-title { font-family: var(–font-display); font-weight: 700; font-size: 17px; margin-bottom: 8px; line-height: 1.3; }
.want-desc { font-size: 13.5px; color: var(–text2); line-height: 1.6; margin-bottom: 14px; }
.want-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.tag { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px; background: var(–surface2); color: var(–text2); }
.want-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid var(–border); background: var(–surface2); }
.offers-count { font-size: 13px; color: var(–text2); }
.offers-count strong { color: var(–text); }
.offer-btn { font-family: var(–font-body); font-size: 13px; font-weight: 600; background: var(–accent); color: #0F0F0F; border: none; cursor: pointer; border-radius: 100px; padding: 8px 16px; transition: all 0.15s; }
.offer-btn:hover { background: #f0bc2a; }

/* OFFERS PANEL */
.offers-panel { border-top: 1px solid var(–border); animation: slideDown 0.2s ease; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.offers-panel-title { padding: 16px 20px 8px; font-family: var(–font-display); font-size: 12px; font-weight: 700; color: var(–text2); letter-spacing: 0.5px; text-transform: uppercase; }
.offer-item { padding: 14px 20px; border-top: 1px solid var(–border); display: flex; gap: 12px; align-items: flex-start; }
.offer-body { flex: 1; }
.offer-name { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.offer-message { font-size: 13.5px; color: var(–text2); line-height: 1.5; margin-bottom: 8px; }
.offer-price { font-family: var(–font-display); font-weight: 700; font-size: 17px; color: var(–green); }
.offer-time { font-size: 11px; color: var(–text2); margin-left: 10px; }

/* COMPOSE */
.offer-compose { padding: 16px 20px 20px; border-top: 1px solid var(–border); background: var(–surface2); }
.compose-label { font-size: 12px; font-weight: 700; color: var(–text2); margin-bottom: 8px; letter-spacing: 0.3px; font-family: var(–font-display); }
.compose-row { display: flex; gap: 10px; align-items: flex-end; }
.compose-message { flex: 1; padding: 10px 14px; border: 1.5px solid var(–border); border-radius: 10px; font-family: var(–font-body); font-size: 13.5px; background: var(–surface); color: var(–text); outline: none; resize: none; min-height: 60px; transition: border-color 0.15s; }
.compose-message:focus { border-color: var(–accent); }
.compose-price { width: 90px; padding: 10px 12px; border: 1.5px solid var(–border); border-radius: 10px; font-family: var(–font-display); font-size: 15px; font-weight: 700; background: var(–surface); color: var(–green); outline: none; transition: border-color 0.15s; }
.compose-price:focus { border-color: var(–green); }
.compose-send { padding: 10px 18px; background: var(–accent); color: #0F0F0F; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: var(–font-body); transition: background 0.15s; white-space: nowrap; }
.compose-send:hover { background: #f0bc2a; }
.sent-confirm { color: var(–green); font-size: 13px; font-weight: 600; padding: 10px 0; }

/* FORM */
.post-form { max-width: 540px; margin: 0 auto; padding-bottom: 40px; }
.form-title { font-family: var(–font-display); font-size: 26px; font-weight: 800; margin-bottom: 6px; }
.form-subtitle { font-size: 14px; color: var(–text2); margin-bottom: 28px; line-height: 1.5; }
.form-group { margin-bottom: 18px; }
.form-label { display: block; font-size: 12px; font-weight: 700; color: var(–text2); margin-bottom: 7px; font-family: var(–font-display); letter-spacing: 0.5px; text-transform: uppercase; }
.form-input { width: 100%; padding: 12px 14px; border: 1.5px solid var(–border); border-radius: 10px; font-family: var(–font-body); font-size: 14px; color: var(–text); background: var(–surface2); outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: var(–accent); }
textarea.form-input { resize: vertical; min-height: 90px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.submit-btn { width: 100%; padding: 15px; background: var(–accent); color: #0F0F0F; border: none; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; font-family: var(–font-display); transition: all 0.15s; margin-top: 8px; }
.submit-btn:hover { background: #f0bc2a; transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* MY POSTS */
.my-want-card { background: var(–surface); border: 1px solid var(–border); border-radius: var(–radius); padding: 18px 20px; margin-bottom: 12px; }
.my-want-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 10px; }
.my-want-title { font-family: var(–font-display); font-weight: 700; font-size: 16px; }
.badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; font-family: var(–font-display); white-space: nowrap; }
.badge-offers { background: rgba(245,200,66,0.15); color: var(–accent); }
.badge-none { background: var(–surface2); color: var(–text2); }
.my-want-budget { font-family: var(–font-display); font-size: 14px; color: var(–green); font-weight: 700; margin-bottom: 6px; }
.my-want-desc { font-size: 13px; color: var(–text2); line-height: 1.5; margin-bottom: 12px; }
.card-actions { display: flex; gap: 8px; margin-bottom: 12px; }
.btn-edit { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 100px; border: 1.5px solid var(–border); background: transparent; color: var(–text2); cursor: pointer; font-family: var(–font-body); transition: all 0.15s; }
.btn-edit:hover { border-color: var(–accent); color: var(–accent); }
.btn-delete { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 100px; border: 1.5px solid var(–border); background: transparent; color: #ff6b6b; cursor: pointer; font-family: var(–font-body); transition: all 0.15s; }
.btn-delete:hover { border-color: #ff6b6b; background: rgba(255,107,107,0.1); }
.mini-offer { background: var(–surface2); border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.mini-offer-name { font-size: 13px; font-weight: 600; flex-shrink: 0; }
.mini-offer-msg { font-size: 12px; color: var(–text2); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini-offer-price { font-family: var(–font-display); font-size: 14px; font-weight: 700; color: var(–green); flex-shrink: 0; }

/* EDIT MODAL */
.modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal { background: var(–surface); border-radius: 20px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.25s ease; box-shadow: 0 12px 40px rgba(0,0,0,0.6); border: 1px solid var(–border); }
@keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
.modal-header { padding: 22px 22px 16px; border-bottom: 1px solid var(–border); display: flex; justify-content: space-between; align-items: center; }
.modal-title-text { font-family: var(–font-display); font-size: 18px; font-weight: 700; }
.modal-close { width: 32px; height: 32px; border-radius: 50%; background: var(–surface2); border: none; cursor: pointer; font-size: 16px; color: var(–text2); display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
.modal-close:hover { background: var(–surface3); color: var(–text); }
.modal-body { padding: 20px 22px; }

/* EMPTY / LOADING */
.empty-state { text-align: center; padding: 60px 20px; color: var(–text2); }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { font-family: var(–font-display); font-size: 18px; font-weight: 700; color: var(–text); }
.empty-sub { font-size: 13px; margin-top: 6px; }
.loading { text-align: center; padding: 60px 20px; color: var(–text2); font-size: 14px; }
.section-title { font-family: var(–font-display); font-size: 20px; font-weight: 800; margin-bottom: 6px; }
.section-sub { font-size: 13px; color: var(–text2); margin-bottom: 20px; }
.name-prompt { background: var(–surface2); border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; gap: 10px; align-items: center; }
.name-input { flex: 1; padding: 10px 14px; border: 1.5px solid var(–border); border-radius: 10px; font-family: var(–font-body); font-size: 14px; color: var(–text); background: var(–surface); outline: none; }
.name-input:focus { border-color: var(–accent); }
.name-save { padding: 10px 18px; background: var(–accent); color: #0F0F0F; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: var(–font-body); white-space: nowrap; }
`;

const CATEGORIES = [“All”, “Electronics”, “Furniture”, “Sports”, “Home”, “Music”, “Fashion”, “Other”];

export default function App() {
const [view, setView] = useState(“browse”);
const [search, setSearch] = useState(””);
const [category, setCategory] = useState(“All”);
const [wants, setWants] = useState([]);
const [loading, setLoading] = useState(true);
const [expanded, setExpanded] = useState(null);
const [compose, setCompose] = useState({ message: “”, price: “”, name: “” });
const [sentOffers, setSentOffers] = useState({});
const [editModal, setEditModal] = useState(null);
const [editForm, setEditForm] = useState({});
const [form, setForm] = useState({ title: “”, description: “”, budget: “”, category: “”, location: “” });
const [posting, setPosting] = useState(false);
const [posted, setPosted] = useState(false);
const [userName, setUserName] = useState(() => localStorage.getItem(“wb_username”) || “”);
const [nameInput, setNameInput] = useState(””);

// Live sync from Firestore
useEffect(() => {
const q = query(collection(db, “wants”), orderBy(“createdAt”, “desc”));
const unsub = onSnapshot(q, (snap) => {
setWants(snap.docs.map(d => ({ id: d.id, …d.data() })));
setLoading(false);
});
return unsub;
}, []);

const saveName = () => {
if (!nameInput.trim()) return;
localStorage.setItem(“wb_username”, nameInput.trim());
setUserName(nameInput.trim());
setNameInput(””);
};

const filtered = wants.filter(w => {
const matchSearch = w.title?.toLowerCase().includes(search.toLowerCase()) || w.description?.toLowerCase().includes(search.toLowerCase());
const matchCat = category === “All” || w.category === category;
return matchSearch && matchCat;
});

const myWants = wants.filter(w => w.user === userName);

const postWant = async () => {
if (!form.title || !form.budget || !userName) return;
setPosting(true);
await addDoc(collection(db, “wants”), {
title: form.title,
description: form.description,
budget: parseInt(form.budget) || 0,
category: form.category || “Other”,
location: form.location || “Nearby”,
user: userName,
offers: [],
createdAt: serverTimestamp(),
});
setPosting(false);
setPosted(true);
setForm({ title: “”, description: “”, budget: “”, category: “”, location: “” });
setTimeout(() => { setPosted(false); setView(“mine”); }, 1800);
};

const sendOffer = async (wantId) => {
if (!compose.message || !compose.price) return;
const newOffer = {
from: compose.name || “Anonymous”,
message: compose.message,
price: parseInt(compose.price) || 0,
time: new Date().toLocaleTimeString([], { hour: “2-digit”, minute: “2-digit” }),
};
const wantRef = doc(db, “wants”, wantId);
await updateDoc(wantRef, { offers: arrayUnion(newOffer) });
setSentOffers(p => ({ …p, [wantId]: true }));
setCompose({ message: “”, price: “”, name: “” });
setTimeout(() => setSentOffers(p => ({ …p, [wantId]: false })), 3000);
};

const deleteWant = async (id) => {
if (!window.confirm(“Delete this want?”)) return;
await deleteDoc(doc(db, “wants”, id));
};

const openEdit = (want) => {
setEditForm({ title: want.title, description: want.description, budget: want.budget, category: want.category, location: want.location });
setEditModal(want.id);
};

const saveEdit = async () => {
await updateDoc(doc(db, “wants”, editModal), {
title: editForm.title,
description: editForm.description,
budget: parseInt(editForm.budget) || 0,
category: editForm.category,
location: editForm.location,
});
setEditModal(null);
};

const timeAgo = (ts) => {
if (!ts) return “Just now”;
const secs = Math.floor((Date.now() - ts.toMillis()) / 1000);
if (secs < 60) return “Just now”;
if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
return `${Math.floor(secs / 86400)}d ago`;
};

return (
<>
<style>{css}</style>
<div className="app">
{/* HEADER */}
<header className="header">
<div className="header-inner">
<div className=“logo” onClick={() => setView(“browse”)}>Want<span>Board</span></div>
{view === “browse” && (
<div className="search-bar">
<span style={{ color: “var(–text2)” }}>🔍</span>
<input placeholder=“Search wants…” value={search} onChange={e => setSearch(e.target.value)} />
</div>
)}
<div style={{ display: “flex”, gap: 8 }}>
<button className=“btn btn-outline” onClick={() => setView(“mine”)}>My Posts</button>
<button className=“btn btn-primary” onClick={() => setView(“post”)}>+ Post a Want</button>
</div>
</div>
</header>

```
    {/* TABS */}
    <div className="nav-tabs">
      {[["browse", "Browse"], ["post", "Post a Want"], ["mine", "My Posts"]].map(([id, label]) => (
        <div key={id} className={`nav-tab ${view === id ? "active" : ""}`} onClick={() => setView(id)}>{label}</div>
      ))}
    </div>

    <main className="main">

      {/* ── BROWSE ── */}
      {view === "browse" && (
        <>
          <div className="categories">
            {CATEGORIES.map(c => (
              <div key={c} className={`cat-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</div>
            ))}
          </div>
          {loading ? (
            <div className="loading">Loading wants...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No wants yet</div>
              <div className="empty-sub">Be the first to post what you're looking for</div>
            </div>
          ) : (
            <div className="wants-list">
              {filtered.map(want => (
                <div key={want.id} className={`want-card ${expanded === want.id ? "expanded" : ""}`}>
                  <div className="want-header" onClick={() => setExpanded(expanded === want.id ? null : want.id)}>
                    <div className="want-top">
                      <div className="avatar">{(want.user || "?")[0].toUpperCase()}</div>
                      <div className="want-meta">
                        <div className="want-user">{want.user || "Anonymous"}</div>
                        <div className="want-time">📍 {want.location} · {timeAgo(want.createdAt)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="want-budget">${(want.budget || 0).toLocaleString()}</div>
                        <div className="budget-label">MAX BUDGET</div>
                      </div>
                    </div>
                    <div className="want-title">{want.title}</div>
                    <div className="want-desc">{want.description}</div>
                    <div className="want-tags">
                      <span className="tag">{want.category}</span>
                    </div>
                  </div>
                  <div className="want-footer">
                    <div className="offers-count">
                      {(want.offers || []).length === 0
                        ? <span>No offers — <strong>be first!</strong></span>
                        : <><strong>{want.offers.length}</strong> offer{want.offers.length !== 1 ? "s" : ""}</>}
                    </div>
                    <button className="offer-btn" onClick={e => { e.stopPropagation(); setExpanded(want.id); }}>
                      Make an Offer →
                    </button>
                  </div>

                  {expanded === want.id && (
                    <div className="offers-panel">
                      {(want.offers || []).length > 0 && (
                        <>
                          <div className="offers-panel-title">Offers ({want.offers.length})</div>
                          {want.offers.map((offer, i) => (
                            <div key={i} className="offer-item">
                              <div className="avatar sm">{(offer.from || "?")[0].toUpperCase()}</div>
                              <div className="offer-body">
                                <div className="offer-name">{offer.from}</div>
                                <div className="offer-message">{offer.message}</div>
                                <div>
                                  <span className="offer-price">${(offer.price || 0).toLocaleString()}</span>
                                  <span className="offer-time">{offer.time}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      <div className="offer-compose">
                        <div className="compose-label">Send Your Offer</div>
                        {sentOffers[want.id] ? (
                          <div className="sent-confirm">✅ Offer sent!</div>
                        ) : (
                          <>
                            <div style={{ marginBottom: 8 }}>
                              <input
                                className="form-input"
                                placeholder="Your name"
                                value={compose.name}
                                onChange={e => setCompose(p => ({ ...p, name: e.target.value }))}
                                style={{ marginBottom: 8 }}
                              />
                            </div>
                            <div className="compose-row">
                              <textarea
                                className="compose-message"
                                placeholder="Describe what you have..."
                                value={compose.message}
                                onChange={e => setCompose(p => ({ ...p, message: e.target.value }))}
                              />
                              <input
                                type="number"
                                className="compose-price"
                                placeholder="$"
                                value={compose.price}
                                onChange={e => setCompose(p => ({ ...p, price: e.target.value }))}
                              />
                              <button className="compose-send" onClick={() => sendOffer(want.id)}>Send →</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── POST A WANT ── */}
      {view === "post" && (
        <div className="post-form">
          {posted ? (
            <div className="empty-state">
              <div className="empty-icon">📬</div>
              <div className="empty-text">Want Posted!</div>
              <div className="empty-sub">Sellers will start sending offers soon.</div>
            </div>
          ) : (
            <>
              <div className="form-title">Post a Want</div>
              <div className="form-subtitle">Tell sellers what you're looking for. Set your budget and let offers come to you.</div>

              {!userName ? (
                <div className="name-prompt">
                  <input className="name-input" placeholder="Your name" value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveName()} />
                  <button className="name-save" onClick={saveName}>Save</button>
                </div>
              ) : (
                <div style={{ marginBottom: 20, fontSize: 13, color: "var(--text2)" }}>
                  Posting as <strong style={{ color: "var(--accent)" }}>{userName}</strong> · <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => { localStorage.removeItem("wb_username"); setUserName(""); }}>change</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">What do you want?</label>
                <input className="form-input" placeholder='e.g. "Looking for a vintage road bike"' value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Describe it</label>
                <textarea className="form-input" placeholder="Brand, size, condition, color..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max Budget ($)</label>
                  <input type="number" className="form-input" placeholder="0" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select...</option>
                    {["Electronics","Furniture","Sports","Home","Music","Fashion","Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="Neighborhood or city" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <button className="submit-btn" onClick={postWant} disabled={posting || !userName || !form.title || !form.budget}>
                {posting ? "Posting..." : "Post My Want →"}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── MY POSTS ── */}
      {view === "mine" && (
        <>
          <div className="section-title">My Posts</div>
          <div className="section-sub">Manage your wants and review incoming offers.</div>

          {!userName ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <div className="empty-text">Set your name first</div>
              <div className="empty-sub">Go to Post a Want to set your name</div>
            </div>
          ) : myWants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No posts yet</div>
              <div className="empty-sub">Post your first want and let sellers come to you</div>
            </div>
          ) : (
            myWants.map(want => (
              <div key={want.id} className="my-want-card">
                <div className="my-want-top">
                  <div className="my-want-title">{want.title}</div>
                  <span className={`badge ${(want.offers || []).length > 0 ? "badge-offers" : "badge-none"}`}>
                    {(want.offers || []).length > 0 ? `${want.offers.length} offer${want.offers.length > 1 ? "s" : ""}` : "No offers"}
                  </span>
                </div>
                <div className="my-want-budget">Up to ${(want.budget || 0).toLocaleString()}</div>
                <div className="my-want-desc">{want.description}</div>
                <div className="card-actions">
                  <button className="btn-edit" onClick={() => openEdit(want)}>✏️ Edit</button>
                  <button className="btn-delete" onClick={() => deleteWant(want.id)}>🗑 Delete</button>
                </div>
                {(want.offers || []).map((offer, i) => (
                  <div key={i} className="mini-offer">
                    <div className="avatar sm">{(offer.from || "?")[0].toUpperCase()}</div>
                    <div className="mini-offer-name">{offer.from}</div>
                    <div className="mini-offer-msg">{offer.message}</div>
                    <div className="mini-offer-price">${(offer.price || 0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ))
          )}
        </>
      )}
    </main>

    {/* EDIT MODAL */}
    {editModal && (
      <div className="modal-overlay" onClick={() => setEditModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title-text">Edit Want</div>
            <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Budget ($)</label>
                <input type="number" className="form-input" value={editForm.budget} onChange={e => setEditForm(p => ({ ...p, budget: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}>
                  {["Electronics","Furniture","Sports","Home","Music","Fashion","Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <button className="submit-btn" onClick={saveEdit}>Save Changes</button>
          </div>
        </div>
      </div>
    )}
  </div>
</>
```

);
}