import { useState } from “react”;

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');`;

const WANTS = [
{
id: 1, user: “Isaac M.”, avatar: “I”, posted: “1h ago”,
title: “Looking for a vintage road bike”,
description: “Ideally 54–56cm frame, any brand. Willing to do minor fixes. No carbon please.”,
budget: 350, category: “Sports”, location: “Brooklyn, NY”, distance: “0.2 mi”,
offers: [
{ id: 1, from: “Jake T.”, avatar: “J”, message: “I have a 1987 Peugeot 55cm, blue, great shape. Minor rust on kickstand only.”, price: 280, time: “30m ago”, rating: 4.9, sales: 22 },
{ id: 2, from: “Maria S.”, avatar: “M”, message: “Trek 520 touring bike, 54cm, just tuned up last month. Includes panniers.”, price: 340, time: “45m ago”, rating: 4.7, sales: 8 },
],
},
{
id: 2, user: “Priya K.”, avatar: “P”, posted: “3h ago”,
title: “Need a standing desk, motorized preferred”,
description: “Looking for something sturdy, at least 55" wide. White or walnut top. Must be able to pick up locally.”,
budget: 250, category: “Furniture”, location: “Williamsburg”, distance: “1.1 mi”,
offers: [
{ id: 1, from: “Dan R.”, avatar: “D”, message: “Uplift V2 60" walnut top, works perfectly, selling because I’m moving.”, price: 240, time: “2h ago”, rating: 5.0, sales: 41 },
],
},
{
id: 3, user: “Carlos F.”, avatar: “C”, posted: “6h ago”,
title: “ISO: espresso machine — any prosumer brand”,
description: “Breville, Rancilio, Gaggia, etc. Doesn’t need to be perfect but must pull a shot. Budget is flexible for the right machine.”,
budget: 400, category: “Home”, location: “Park Slope”, distance: “2.0 mi”,
offers: [],
},
{
id: 4, user: “Amy L.”, avatar: “A”, posted: “12h ago”,
title: “Wanted: a good acoustic guitar for beginner”,
description: “Getting into guitar. Looking for something playable, doesn’t need to be fancy. Case would be a bonus.”,
budget: 120, category: “Music”, location: “Bushwick”, distance: “2.4 mi”,
offers: [
{ id: 1, from: “Tom W.”, avatar: “T”, message: “Yamaha FG800, barely used, bought it then life got busy. Great starter guitar.”, price: 95, time: “8h ago”, rating: 4.6, sales: 5 },
{ id: 2, from: “Lena G.”, avatar: “L”, message: “Fender CD-60S with a soft case. Sounds really nice, just upgrading.”, price: 115, time: “10h ago”, rating: 4.8, sales: 14 },
{ id: 3, from: “Sam O.”, avatar: “S”, message: “Takamine G-series. Setup by a luthier last year. Very easy to play.”, price: 110, time: “11h ago”, rating: 4.9, sales: 31 },
],
},
{
id: 5, user: “Derek N.”, avatar: “D”, posted: “1d ago”,
title: “Looking for a DSLR or mirrorless camera body”,
description: “Sony E-mount or Canon RF preferred. Doesn’t need to come with a lens. For street photography.”,
budget: 600, category: “Electronics”, location: “DUMBO”, distance: “3.0 mi”,
offers: [
{ id: 1, from: “Wei Z.”, avatar: “W”, message: “Sony A6400 body only, ~8k shutter actuations. Comes with original box.”, price: 580, time: “20h ago”, rating: 4.9, sales: 19 },
],
},
{
id: 6, user: “Fatima O.”, avatar: “F”, posted: “2d ago”,
title: “ISO: dining table for 4, round or square”,
description: “Apartment is small so max ~42". Wood preferred, no glass tops. Can disassemble for transport.”,
budget: 180, category: “Furniture”, location: “Crown Heights”, distance: “3.5 mi”,
offers: [],
},
];

const CATEGORIES = [“All”, “Electronics”, “Furniture”, “Sports”, “Home”, “Music”, “Fashion”];

const css = `
${FONT}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
–bg: #0F0F0F;
–surface: #1A1A1A;
–surface2: #242424;
–surface3: #2E2E2E;
–text: #F0EDE8;
–text2: #888580;
–accent: #F5C842;
–accent2: #3B82F6;
–green: #34D399;
–border: #2E2E2E;
–shadow: 0 2px 16px rgba(0,0,0,0.4);
–shadow-lg: 0 12px 40px rgba(0,0,0,0.6);
–radius: 16px;
–font-display: ‘Syne’, sans-serif;
–font-body: ‘DM Sans’, sans-serif;
}
body { font-family: var(–font-body); background: var(–bg); color: var(–text); }
.app { min-height: 100vh; display: flex; flex-direction: column; }

/* HEADER */
.header {
background: var(–surface);
border-bottom: 1px solid var(–border);
position: sticky; top: 0; z-index: 100;
padding: 0 20px;
}
.header-inner {
max-width: 1100px; margin: 0 auto;
display: flex; align-items: center; gap: 16px; height: 60px;
}
.logo {
font-family: var(–font-display); font-weight: 800; font-size: 20px;
color: var(–text); letter-spacing: -0.5px; cursor: pointer; white-space: nowrap;
}
.logo span { color: var(–accent); }
.search-bar {
flex: 1; display: flex; align-items: center;
background: var(–surface2); border: 1.5px solid var(–border);
border-radius: 100px; padding: 0 16px; gap: 8px;
transition: border-color 0.2s;
}
.search-bar:focus-within { border-color: var(–accent); }
.search-bar input {
border: none; background: transparent;
font-family: var(–font-body); font-size: 14px;
color: var(–text); outline: none; flex: 1; padding: 10px 0;
}
.search-bar input::placeholder { color: var(–text2); }
.btn {
font-family: var(–font-body); font-size: 13px; font-weight: 600;
border: none; cursor: pointer; border-radius: 100px;
padding: 9px 18px; transition: all 0.18s; letter-spacing: 0.1px;
}
.btn-outline {
background: transparent; color: var(–text);
border: 1.5px solid var(–border);
}
.btn-outline:hover { border-color: var(–text2); }
.btn-primary { background: var(–accent); color: #0F0F0F; }
.btn-primary:hover { background: #f0bc2a; transform: translateY(-1px); }

/* TABS */
.nav-tabs {
display: flex; gap: 2px; padding: 0 20px;
background: var(–surface); border-bottom: 1px solid var(–border);
max-width: 100%;
}
.nav-tab {
padding: 13px 18px; font-size: 13px; font-weight: 600;
font-family: var(–font-display); cursor: pointer;
color: var(–text2); border-bottom: 2px solid transparent;
transition: color 0.15s, border-color 0.15s; white-space: nowrap;
}
.nav-tab:hover { color: var(–text); }
.nav-tab.active { color: var(–accent); border-bottom-color: var(–accent); }

/* MAIN */
.main { max-width: 1100px; margin: 0 auto; padding: 28px 20px; flex: 1; width: 100%; }

/* CATEGORIES */
.categories {
display: flex; gap: 8px; overflow-x: auto; margin-bottom: 20px;
scrollbar-width: none; padding-bottom: 2px;
}
.categories::-webkit-scrollbar { display: none; }
.cat-chip {
padding: 7px 14px; border-radius: 100px;
border: 1.5px solid var(–border); background: var(–surface);
cursor: pointer; font-size: 13px; font-weight: 500;
color: var(–text2); white-space: nowrap; transition: all 0.15s;
}
.cat-chip:hover { border-color: var(–accent); color: var(–accent); }
.cat-chip.active { background: var(–accent); border-color: var(–accent); color: #0F0F0F; font-weight: 700; }

/* WANT CARDS */
.wants-list { display: flex; flex-direction: column; gap: 16px; }
.want-card {
background: var(–surface); border: 1px solid var(–border);
border-radius: var(–radius); overflow: hidden;
transition: border-color 0.2s, transform 0.2s;
cursor: pointer;
}
.want-card:hover { border-color: #444; transform: translateY(-1px); }
.want-card.expanded { border-color: var(–accent); }
.want-header { padding: 20px 20px 0; }
.want-top {
display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;
}
.avatar {
width: 38px; height: 38px; border-radius: 50%;
background: var(–accent); color: #0F0F0F;
display: flex; align-items: center; justify-content: center;
font-family: var(–font-display); font-weight: 800; font-size: 15px;
flex-shrink: 0;
}
.avatar.seller-av {
width: 34px; height: 34px; font-size: 13px;
background: var(–surface3); color: var(–text2);
}
.want-meta { flex: 1; }
.want-user { font-size: 13px; font-weight: 600; color: var(–text); }
.want-time { font-size: 12px; color: var(–text2); margin-top: 1px; }
.want-budget {
font-family: var(–font-display); font-weight: 800; font-size: 20px;
color: var(–green); white-space: nowrap;
}
.budget-label { font-size: 10px; color: var(–text2); text-align: right; font-weight: 400; }
.want-title {
font-family: var(–font-display); font-weight: 700; font-size: 17px;
color: var(–text); margin-bottom: 8px; line-height: 1.3;
}
.want-desc { font-size: 13.5px; color: var(–text2); line-height: 1.6; margin-bottom: 14px; }
.want-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.tag {
font-size: 11px; font-weight: 600; padding: 3px 10px;
border-radius: 100px; background: var(–surface2); color: var(–text2);
letter-spacing: 0.2px;
}
.want-footer {
display: flex; align-items: center; justify-content: space-between;
padding: 12px 20px; border-top: 1px solid var(–border);
background: var(–surface2);
}
.offers-count { font-size: 13px; color: var(–text2); }
.offers-count strong { color: var(–text); }
.offer-btn {
font-family: var(–font-body); font-size: 13px; font-weight: 600;
background: var(–accent); color: #0F0F0F;
border: none; cursor: pointer; border-radius: 100px;
padding: 8px 16px; transition: all 0.15s;
}
.offer-btn:hover { background: #f0bc2a; }

/* OFFERS PANEL */
.offers-panel {
border-top: 1px solid var(–border);
background: var(–surface);
animation: slideDown 0.2s ease;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.offers-panel-title {
padding: 16px 20px 8px;
font-family: var(–font-display); font-size: 13px; font-weight: 700;
color: var(–text2); letter-spacing: 0.5px; text-transform: uppercase;
}
.offer-item {
padding: 14px 20px; border-top: 1px solid var(–border);
display: flex; gap: 12px; align-items: flex-start;
transition: background 0.15s;
}
.offer-item:hover { background: var(–surface2); }
.offer-body { flex: 1; }
.offer-from {
display: flex; align-items: center; gap: 8px; margin-bottom: 5px;
}
.offer-name { font-size: 13px; font-weight: 600; color: var(–text); }
.offer-rating { font-size: 11px; color: var(–text2); }
.offer-message { font-size: 13.5px; color: var(–text2); line-height: 1.5; margin-bottom: 8px; }
.offer-footer { display: flex; align-items: center; gap: 10px; }
.offer-price {
font-family: var(–font-display); font-weight: 700; font-size: 17px; color: var(–green);
}
.offer-time { font-size: 11px; color: var(–text2); flex: 1; }
.small-btn {
font-size: 12px; font-weight: 600; padding: 6px 12px;
border-radius: 100px; border: none; cursor: pointer;
transition: all 0.15s; font-family: var(–font-body);
}
.btn-accept { background: var(–green); color: #0F0F0F; }
.btn-accept:hover { background: #28c087; }
.btn-msg { background: var(–surface3); color: var(–text); }
.btn-msg:hover { background: #3a3a3a; }

/* OFFER COMPOSE */
.offer-compose {
padding: 16px 20px 20px; border-top: 1px solid var(–border);
background: var(–surface2);
}
.compose-label { font-size: 12px; font-weight: 600; color: var(–text2); margin-bottom: 8px; letter-spacing: 0.3px; font-family: var(–font-display); }
.compose-row { display: flex; gap: 10px; align-items: flex-end; }
.compose-message {
flex: 1; padding: 10px 14px;
border: 1.5px solid var(–border); border-radius: 10px;
font-family: var(–font-body); font-size: 13.5px;
background: var(–surface); color: var(–text); outline: none;
resize: none; min-height: 60px; transition: border-color 0.15s;
}
.compose-message:focus { border-color: var(–accent); }
.compose-price-wrap { display: flex; flex-direction: column; gap: 4px; }
.compose-price-label { font-size: 11px; color: var(–text2); font-weight: 500; }
.compose-price {
width: 90px; padding: 10px 12px;
border: 1.5px solid var(–border); border-radius: 10px;
font-family: var(–font-display); font-size: 15px; font-weight: 700;
background: var(–surface); color: var(–green); outline: none;
transition: border-color 0.15s;
}
.compose-price:focus { border-color: var(–green); }
.compose-send {
padding: 10px 18px; background: var(–accent); color: #0F0F0F;
border: none; border-radius: 10px; font-weight: 700; font-size: 13px;
cursor: pointer; font-family: var(–font-body); transition: background 0.15s;
white-space: nowrap; align-self: flex-end;
}
.compose-send:hover { background: #f0bc2a; }
.sent-confirm {
display: flex; align-items: center; gap: 8px;
color: var(–green); font-size: 13px; font-weight: 600; padding: 10px 0;
}

/* EMPTY */
.empty-state { text-align: center; padding: 60px 20px; color: var(–text2); }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { font-family: var(–font-display); font-size: 18px; font-weight: 700; color: var(–text); }
.empty-sub { font-size: 13px; margin-top: 6px; }

/* POST WANT FORM */
.post-form { max-width: 540px; margin: 0 auto; padding-bottom: 40px; }
.form-title { font-family: var(–font-display); font-size: 26px; font-weight: 800; margin-bottom: 6px; }
.form-subtitle { font-size: 14px; color: var(–text2); margin-bottom: 28px; line-height: 1.5; }
.form-group { margin-bottom: 18px; }
.form-label { display: block; font-size: 12px; font-weight: 700; color: var(–text2); margin-bottom: 7px; font-family: var(–font-display); letter-spacing: 0.5px; text-transform: uppercase; }
.form-input {
width: 100%; padding: 12px 14px;
border: 1.5px solid var(–border); border-radius: 10px;
font-family: var(–font-body); font-size: 14px;
color: var(–text); background: var(–surface2); outline: none;
transition: border-color 0.15s;
}
.form-input:focus { border-color: var(–accent); }
textarea.form-input { resize: vertical; min-height: 90px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.price-input-wrap { position: relative; }
.price-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(–green); font-weight: 700; font-family: var(–font-display); font-size: 15px; }
.price-input { padding-left: 28px !important; color: var(–green) !important; font-weight: 700; font-family: var(–font-display) !important; }
.submit-btn {
width: 100%; padding: 15px; background: var(–accent); color: #0F0F0F;
border: none; border-radius: 12px; font-weight: 800; font-size: 15px;
cursor: pointer; font-family: var(–font-display); transition: all 0.15s;
margin-top: 8px; letter-spacing: 0.2px;
}
.submit-btn:hover { background: #f0bc2a; transform: translateY(-1px); }
.success-screen { text-align: center; padding: 60px 20px; }
.success-icon { font-size: 56px; margin-bottom: 16px; }
.success-title { font-family: var(–font-display); font-size: 24px; font-weight: 800; margin-bottom: 8px; }
.success-sub { font-size: 14px; color: var(–text2); }

/* MODAL */
.modal-overlay {
position: fixed; inset: 0; z-index: 200;
background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
display: flex; align-items: center; justify-content: center; padding: 20px;
animation: fadeIn 0.2s;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
background: var(–surface); border-radius: 20px;
width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
animation: slideUp 0.25s ease; box-shadow: var(–shadow-lg);
border: 1px solid var(–border);
}
@keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
.modal-header { padding: 22px 22px 16px; border-bottom: 1px solid var(–border); display: flex; justify-content: space-between; align-items: flex-start; }
.modal-title-text { font-family: var(–font-display); font-size: 17px; font-weight: 700; line-height: 1.3; flex: 1; padding-right: 12px; }
.modal-close { width: 32px; height: 32px; border-radius: 50%; background: var(–surface2); border: none; cursor: pointer; font-size: 16px; color: var(–text2); display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
.modal-close:hover { background: var(–surface3); color: var(–text); }
.modal-body { padding: 20px 22px; }

/* MY WANTS */
.my-want-card {
background: var(–surface); border: 1px solid var(–border);
border-radius: var(–radius); padding: 18px 20px; margin-bottom: 12px;
}
.my-want-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.my-want-title { font-family: var(–font-display); font-weight: 700; font-size: 16px; }
.badge {
font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px;
font-family: var(–font-display);
}
.badge-offers { background: rgba(245,200,66,0.15); color: var(–accent); }
.badge-none { background: var(–surface2); color: var(–text2); }
.my-want-budget { font-family: var(–font-display); font-size: 14px; color: var(–green); font-weight: 700; margin-bottom: 6px; }
.my-want-desc { font-size: 13px; color: var(–text2); line-height: 1.5; margin-bottom: 12px; }
.my-offers-preview { display: flex; flex-direction: column; gap: 8px; }
.mini-offer {
background: var(–surface2); border-radius: 10px; padding: 10px 14px;
display: flex; align-items: center; gap: 10px; cursor: pointer;
transition: background 0.15s;
}
.mini-offer:hover { background: var(–surface3); }
.mini-offer-name { font-size: 13px; font-weight: 600; flex: 1; }
.mini-offer-price { font-family: var(–font-display); font-size: 14px; font-weight: 700; color: var(–green); }
.mini-offer-msg { font-size: 12px; color: var(–text2); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.section-title { font-family: var(–font-display); font-size: 20px; font-weight: 800; margin-bottom: 6px; }
.section-sub { font-size: 13px; color: var(–text2); margin-bottom: 20px; }
`;

export default function App() {
const [view, setView] = useState(“browse”);
const [search, setSearch] = useState(””);
const [category, setCategory] = useState(“All”);
const [wants, setWants] = useState(WANTS);
const [expanded, setExpanded] = useState(null);
const [offerModal, setOfferModal] = useState(null); // { wantId }
const [compose, setCompose] = useState({ message: “”, price: “” });
const [sentOffers, setSentOffers] = useState({}); // wantId -> bool
const [detailModal, setDetailModal] = useState(null); // { want, offer }
const [form, setForm] = useState({ title: “”, description: “”, budget: “”, category: “”, location: “” });
const [posted, setPosted] = useState(false);

const myWants = wants.slice(0, 2); // pretend first 2 are “mine”

const filtered = wants.filter(w => {
const matchSearch = w.title.toLowerCase().includes(search.toLowerCase()) || w.description.toLowerCase().includes(search.toLowerCase());
const matchCat = category === “All” || w.category === category;
return matchSearch && matchCat;
});

const sendOffer = (wantId) => {
if (!compose.message || !compose.price) return;
const newOffer = {
id: Date.now(), from: “You”, avatar: “Y”,
message: compose.message, price: parseInt(compose.price) || 0,
time: “Just now”, rating: 5.0, sales: 0,
};
setWants(prev => prev.map(w => w.id === wantId ? { …w, offers: […w.offers, newOffer] } : w));
setSentOffers(prev => ({ …prev, [wantId]: true }));
setCompose({ message: “”, price: “” });
setTimeout(() => setSentOffers(prev => ({ …prev, [wantId]: false })), 3000);
};

const postWant = () => {
if (!form.title || !form.budget) return;
const newWant = {
id: Date.now(), user: “You”, avatar: “Y”, posted: “Just now”,
title: form.title, description: form.description,
budget: parseInt(form.budget) || 0,
category: form.category || “Other”,
location: form.location || “Your Location”, distance: “0 mi”,
offers: [],
};
setWants(prev => [newWant, …prev]);
setPosted(true);
setTimeout(() => { setPosted(false); setView(“mine”); setForm({ title: “”, description: “”, budget: “”, category: “”, location: “” }); }, 1800);
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
<input placeholder=“Search wants near you…” value={search} onChange={e => setSearch(e.target.value)} />
</div>
)}
<div style={{ display: “flex”, gap: 8 }}>
<button className=“btn btn-outline” onClick={() => setView(“mine”)}>My Wants</button>
<button className=“btn btn-primary” onClick={() => setView(“post”)}>+ Post a Want</button>
</div>
</div>
</header>

```
    {/* TABS */}
    <div className="nav-tabs">
      {[["browse", "Browse Wants"], ["post", "Post a Want"], ["mine", "My Wants & Offers"]].map(([id, label]) => (
        <div key={id} className={`nav-tab ${view === id ? "active" : ""}`} onClick={() => setView(id)}>{label}</div>
      ))}
    </div>

    <main className="main">

      {/* BROWSE */}
      {view === "browse" && (
        <>
          <div className="categories">
            {CATEGORIES.map(c => (
              <div key={c} className={`cat-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</div>
            ))}
          </div>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, color: "var(--text2)" }}><strong style={{ color: "var(--text)" }}>{filtered.length}</strong> requests near you</div>
            <select style={{ fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", padding: "6px 10px", borderRadius: 8, outline: "none", fontFamily: "var(--font-body)" }}>
              <option>Sort: Nearest</option><option>Sort: Highest Budget</option><option>Sort: Newest</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-text">No wants found</div>
              <div className="empty-sub">Try a different search or category</div>
            </div>
          ) : (
            <div className="wants-list">
              {filtered.map(want => (
                <div key={want.id} className={`want-card ${expanded === want.id ? "expanded" : ""}`}>
                  <div className="want-header" onClick={() => setExpanded(expanded === want.id ? null : want.id)}>
                    <div className="want-top">
                      <div className="avatar">{want.avatar}</div>
                      <div className="want-meta">
                        <div className="want-user">{want.user}</div>
                        <div className="want-time">📍 {want.distance} · {want.posted}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="want-budget">${want.budget.toLocaleString()}</div>
                        <div className="budget-label">MAX BUDGET</div>
                      </div>
                    </div>
                    <div className="want-title">{want.title}</div>
                    <div className="want-desc">{want.description}</div>
                    <div className="want-tags">
                      <span className="tag">{want.category}</span>
                      <span className="tag">📍 {want.location}</span>
                    </div>
                  </div>
                  <div className="want-footer">
                    <div className="offers-count">
                      {want.offers.length === 0
                        ? <span>No offers yet — <strong>be first!</strong></span>
                        : <><strong>{want.offers.length}</strong> offer{want.offers.length !== 1 ? "s" : ""}</>}
                    </div>
                    <button className="offer-btn" onClick={(e) => { e.stopPropagation(); setOfferModal(want.id); setExpanded(want.id); }}>
                      Make an Offer →
                    </button>
                  </div>

                  {/* EXPANDED: OFFERS + COMPOSE */}
                  {expanded === want.id && (
                    <div className="offers-panel">
                      {want.offers.length > 0 && (
                        <>
                          <div className="offers-panel-title">Offers ({want.offers.length})</div>
                          {want.offers.map(offer => (
                            <div key={offer.id} className="offer-item">
                              <div className="avatar seller-av">{offer.avatar}</div>
                              <div className="offer-body">
                                <div className="offer-from">
                                  <span className="offer-name">{offer.from}</span>
                                  <span className="offer-rating">⭐ {offer.rating} · {offer.sales} sales</span>
                                </div>
                                <div className="offer-message">{offer.message}</div>
                                <div className="offer-footer">
                                  <span className="offer-price">${offer.price.toLocaleString()}</span>
                                  <span className="offer-time">{offer.time}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {/* COMPOSE OFFER */}
                      <div className="offer-compose">
                        <div className="compose-label">Your Offer</div>
                        {sentOffers[want.id] ? (
                          <div className="sent-confirm">✅ Offer sent! The buyer will be notified.</div>
                        ) : (
                          <>
                            <div className="compose-row">
                              <textarea
                                className="compose-message"
                                placeholder="Describe what you have and why it's a great match..."
                                value={compose.message}
                                onChange={e => setCompose(p => ({ ...p, message: e.target.value }))}
                              />
                              <div className="compose-price-wrap">
                                <div className="compose-price-label">Your Price</div>
                                <input
                                  type="number"
                                  className="compose-price"
                                  placeholder="$"
                                  value={compose.price}
                                  onChange={e => setCompose(p => ({ ...p, price: e.target.value }))}
                                />
                              </div>
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

      {/* POST A WANT */}
      {view === "post" && (
        <div className="post-form">
          {posted ? (
            <div className="success-screen">
              <div className="success-icon">📬</div>
              <div className="success-title">Want Posted!</div>
              <div className="success-sub">Sellers near you will start sending offers shortly.</div>
            </div>
          ) : (
            <>
              <div className="form-title">Post a Want</div>
              <div className="form-subtitle">Tell sellers exactly what you're looking for. Set your budget and let offers come to you.</div>
              <div className="form-group">
                <label className="form-label">What do you want?</label>
                <input className="form-input" placeholder='e.g. "Looking for a vintage road bike, 54cm frame"' value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Describe it in detail</label>
                <textarea className="form-input" placeholder="Brand preferences, condition requirements, color, size, anything relevant..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max Budget</label>
                  <div className="price-input-wrap">
                    <span className="price-prefix">$</span>
                    <input type="number" className="form-input price-input" placeholder="0" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
                  </div>
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
                <label className="form-label">Your Location</label>
                <input className="form-input" placeholder="Neighborhood or city" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <button className="submit-btn" onClick={postWant}>Post My Want →</button>
            </>
          )}
        </div>
      )}

      {/* MY WANTS */}
      {view === "mine" && (
        <>
          <div className="section-title">My Wants</div>
          <div className="section-sub">Track your requests and review incoming offers.</div>
          {myWants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No wants posted yet</div>
              <div className="empty-sub">Post your first want and let sellers come to you</div>
            </div>
          ) : (
            myWants.map(want => (
              <div key={want.id} className="my-want-card">
                <div className="my-want-top">
                  <div className="my-want-title">{want.title}</div>
                  <span className={`badge ${want.offers.length > 0 ? "badge-offers" : "badge-none"}`}>
                    {want.offers.length > 0 ? `${want.offers.length} offer${want.offers.length > 1 ? "s" : ""}` : "No offers"}
                  </span>
                </div>
                <div className="my-want-budget">Up to ${want.budget.toLocaleString()}</div>
                <div className="my-want-desc">{want.description}</div>
                {want.offers.length > 0 && (
                  <div className="my-offers-preview">
                    {want.offers.map(offer => (
                      <div key={offer.id} className="mini-offer" onClick={() => setDetailModal({ want, offer })}>
                        <div className="avatar seller-av">{offer.avatar}</div>
                        <div className="mini-offer-name">{offer.from}</div>
                        <div className="mini-offer-msg">{offer.message}</div>
                        <div className="mini-offer-price">${offer.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </main>

    {/* OFFER DETAIL MODAL */}
    {detailModal && (
      <div className="modal-overlay" onClick={() => setDetailModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title-text">{detailModal.want.title}</div>
            <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
          </div>
          <div className="modal-body">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
              <div className="avatar seller-av" style={{ width: 44, height: 44, fontSize: 18 }}>{detailModal.offer.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{detailModal.offer.from}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>⭐ {detailModal.offer.rating} · {detailModal.offer.sales} sales · {detailModal.offer.time}</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--green)" }}>${detailModal.offer.price.toLocaleString()}</div>
            </div>
            <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 20, background: "var(--surface2)", padding: 14, borderRadius: 10 }}>
              {detailModal.offer.message}
            </div>
            {detailModal.offer.price <= detailModal.want.budget && (
              <div style={{ fontSize: 12, color: "var(--green)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                ✓ Within your budget of ${detailModal.want.budget.toLocaleString()}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="small-btn btn-accept" style={{ flex: 1, padding: "12px", fontSize: 14 }}>✓ Accept Offer</button>
              <button className="small-btn btn-msg" style={{ flex: 1, padding: "12px", fontSize: 14 }}>💬 Message Seller</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</>
```

);
}