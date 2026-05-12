import { useState, useEffect, useRef } from “react”;
import { initializeApp } from “https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js”;
import {
getFirestore, collection, addDoc, onSnapshot,
updateDoc, deleteDoc, doc, serverTimestamp,
orderBy, query, arrayUnion,
} from “https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js”;
import {
getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
signOut, onAuthStateChanged, updateProfile,
} from “https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js”;

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
const auth = getAuth(app);

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`;

const css = `
${FONT}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
–bg: #F7F5F2;
–surface: #FFFFFF;
–surface2: #F0EDE8;
–surface3: #E8E4DF;
–text: #1A1A1A;
–text2: #6B6560;
–accent: #E84B2A;
–green: #16A34A;
–red: #DC2626;
–border: #E2DDD8;
–radius: 16px;
–font-display: ‘Syne’, sans-serif;
–font-body: ‘DM Sans’, sans-serif;
}
body { font-family: var(–font-body); background: var(–bg); color: var(–text); -webkit-font-smoothing: antialiased; }
.app { min-height: 100vh; display: flex; flex-direction: column; }

/* AUTH */
.auth-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: var(–bg); }
.auth-box { background: var(–surface); border: 1px solid var(–border); border-radius: 20px; padding: 36px; width: 100%; max-width: 400px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
.auth-logo { font-family: var(–font-display); font-weight: 800; font-size: 28px; margin-bottom: 6px; color: var(–text); }
.auth-logo span { color: var(–accent); }
.auth-subtitle { font-size: 14px; color: var(–text2); margin-bottom: 24px; }
.auth-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(–surface2); border-radius: 10px; padding: 4px; }
.auth-tab { flex: 1; padding: 8px; text-align: center; font-size: 13px; font-weight: 600; font-family: var(–font-display); cursor: pointer; border-radius: 8px; color: var(–text2); transition: all 0.15s; }
.auth-tab.active { background: var(–accent); color: white; }
.auth-form { display: flex; flex-direction: column; gap: 12px; }
.auth-input { width: 100%; padding: 12px 14px; border: 1.5px solid var(–border); border-radius: 10px; font-family: var(–font-body); font-size: 14px; color: var(–text); background: var(–surface2); outline: none; transition: border-color 0.15s; }
.auth-input:focus { border-color: var(–accent); }
.auth-btn { width: 100%; padding: 14px; background: var(–accent); color: white; border: none; border-radius: 10px; font-weight: 800; font-size: 15px; cursor: pointer; font-family: var(–font-display); transition: all 0.15s; margin-top: 4px; }
.auth-btn:hover { background: #c73d22; }
.auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.auth-error { font-size: 13px; color: var(–red); text-align: center; padding: 4px 0; }

/* HEADER */
.header { background: var(–surface); border-bottom: 1px solid var(–border); position: sticky; top: 0; z-index: 100; padding: 0 20px; box-shadow: 0 1px 8px rgba(0,0,0,0.06); }
.header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 12px; height: 60px; }
.logo { font-family: var(–font-display); font-weight: 800; font-size: 20px; color: var(–text); cursor: pointer; white-space: nowrap; }
.logo span { color: var(–accent); }
.search-bar { flex: 1; display: flex; align-items: center; background: var(–surface2); border: 1.5px solid var(–border); border-radius: 100px; padding: 0 16px; gap: 8px; transition: border-color 0.2s; }
.search-bar:focus-within { border-color: var(–accent); }
.search-bar input { border: none; background: transparent; font-family: var(–font-body); font-size: 14px; color: var(–text); outline: none; flex: 1; padding: 10px 0; }
.search-bar input::placeholder { color: var(–text2); }
.btn { font-family: var(–font-body); font-size: 13px; font-weight: 600; border: none; cursor: pointer; border-radius: 100px; padding: 8px 16px; transition: all 0.15s; white-space: nowrap; }
.btn-outline { background: transparent; color: var(–text); border: 1.5px solid var(–border); }
.btn-outline:hover { border-color: var(–text2); }
.btn-primary { background: var(–accent); color: white; }
.btn-primary:hover { background: #c73d22; }

/* TABS */
.nav-tabs { display: flex; padding: 0 20px; background: var(–surface); border-bottom: 1px solid var(–border); overflow-x: auto; scrollbar-width: none; }
.nav-tabs::-webkit-scrollbar { display: none; }
.nav-tab { padding: 13px 16px; font-size: 13px; font-weight: 600; font-family: var(–font-display); cursor: pointer; color: var(–text2); border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap; }
.nav-tab:hover { color: var(–text); }
.nav-tab.active { color: var(–accent); border-bottom-color: var(–accent); }

/* MAIN */
.main { max-width: 1100px; margin: 0 auto; padding: 28px 20px; flex: 1; width: 100%; }

/* FILTERS ROW */
.filters-row { display: flex; gap: 10px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
.filter-select { font-family: var(–font-body); font-size: 13px; border: 1.5px solid var(–border); border-radius: 100px; padding: 7px 14px; background: var(–surface); color: var(–text); cursor: pointer; outline: none; transition: border-color 0.15s; }
.filter-select:focus { border-color: var(–accent); }

/* CATEGORIES */
.categories { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 12px; scrollbar-width: none; }
.categories::-webkit-scrollbar { display: none; }
.cat-chip { padding: 7px 14px; border-radius: 100px; border: 1.5px solid var(–border); background: var(–surface); cursor: pointer; font-size: 13px; font-weight: 500; color: var(–text2); white-space: nowrap; transition: all 0.15s; }
.cat-chip:hover { border-color: var(–accent); color: var(–accent); }
.cat-chip.active { background: var(–accent); border-color: var(–accent); color: white; font-weight: 700; }

/* CARDS */
.wants-list { display: flex; flex-direction: column; gap: 16px; }
.want-card { background: var(–surface); border: 1px solid var(–border); border-radius: var(–radius); overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
.want-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.want-card.expanded { border-color: var(–accent); }
.want-header { padding: 20px 20px 0; cursor: pointer; }
.want-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: var(–accent); color: white; display: flex; align-items: center; justify-content: center; font-family: var(–font-display); font-weight: 800; font-size: 15px; flex-shrink: 0; }
.avatar.sm { width: 34px; height: 34px; font-size: 13px; background: var(–surface3); color: var(–text2); }
.want-meta { flex: 1; }
.want-user { font-size: 13px; font-weight: 600; color: var(–text); }
.want-time { font-size: 12px; color: var(–text2); margin-top: 1px; }
.want-budget { font-family: var(–font-display); font-weight: 800; font-size: 20px; color: var(–green); white-space: nowrap; }
.budget-label { font-size: 10px; color: var(–text2); text-align: right; }
.want-title { font-family: var(–font-display); font-weight: 700; font-size: 17px; margin-bottom: 8px; line-height: 1.3; color: var(–text); }
.want-desc { font-size: 13.5px; color: var(–text2); line-height: 1.6; margin-bottom: 14px; }
.want-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.tag { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px; background: var(–surface2); color: var(–text2); }
.want-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid var(–border); background: var(–surface2); }
.offers-count { font-size: 13px; color: var(–text2); }
.offers-count strong { color: var(–text); }
.offer-btn { font-family: var(–font-body); font-size: 13px; font-weight: 600; background: var(–accent); color: white; border: none; cursor: pointer; border-radius: 100px; padding: 8px 16px; transition: all 0.15s; }
.offer-btn:hover { background: #c73d22; }

/* OFFERS PANEL */
.offers-panel { border-top: 1px solid var(–border); animation: slideDown 0.2s ease; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.offers-panel-title { padding: 16px 20px 8px; font-family: var(–font-display); font-size: 12px; font-weight: 700; color: var(–text2); letter-spacing: 0.5px; text-transform: uppercase; }
.offer-item { padding: 14px 20px; border-top: 1px solid var(–border); display: flex; gap: 12px; align-items: flex-start; }
.offer-body { flex: 1; }
.offer-name { font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(–text); }
.offer-message { font-size: 13.5px; color: var(–text2); line-height: 1.5; margin-bottom: 8px; }
.offer-photo { width: 80px; height: 80px; border-radius: 10px; object-fit: cover; margin-bottom: 8px; border: 1px solid var(–border); }
.offer-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.offer-price { font-family: var(–font-display); font-weight: 700; font-size: 17px; color: var(–green); }
.offer-time { font-size: 11px; color: var(–text2); flex: 1; }
.msg-btn { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 100px; border: 1.5px solid var(–border); background: transparent; color: var(–text2); cursor: pointer; font-family: var(–font-body); transition: all 0.15s; }
.msg-btn:hover { border-color: var(–accent); color: var(–accent); }

/* COMPOSE OFFER */
.offer-compose { padding: 16px 20px 20px; border-top: 1px solid var(–border); background: var(–surface2); }
.compose-label { font-size: 12px; font-weight: 700; color: var(–text2); margin-bottom: 8px; letter-spacing: 0.3px; font-family: var(–font-display); }
.compose-row { display: flex; gap: 10px; align-items: flex-end; }
.compose-message { flex: 1; padding: 10px 14px; border: 1.5px solid var(–border); border-radius: 10px; font-family: var(–font-body); font-size: 13.5px; background: var(–surface); color: var(–text); outline: none; resize: none; min-height: 60px; transition: border-color 0.15s; }
.compose-message:focus { border-color: var(–accent); }
.compose-price { width: 90px; padding: 10px 12px; border: 1.5px solid var(–border); border-radius: 10px; font-family: var(–font-display); font-size: 15px; font-weight: 700; background: var(–surface); color: var(–green); outline: none; }
.compose-send { padding: 10px 18px; background: var(–accent); color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: var(–font-body); white-space: nowrap; }
.compose-send:hover { background: #c73d22; }
.sent-confirm { color: var(–green); font-size: 13px; font-weight: 600; padding: 10px 0; }
.photo-upload-row { margin-bottom: 10px; }
.photo-upload-label { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border: 1.5px dashed var(–border); border-radius: 10px; cursor: pointer; font-size: 13px; color: var(–text2); transition: border-color 0.15s; background: var(–surface); }
.photo-upload-label:hover { border-color: var(–accent); color: var(–accent); }
.photo-preview { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid var(–border); margin-top: 8px; display: block; }

/* FORM */
.post-form { max-width: 540px; margin: 0 auto; padding-bottom: 40px; }
.form-title { font-family: var(–font-display); font-size: 26px; font-weight: 800; margin-bottom: 6px; color: var(–text); }
.form-subtitle { font-size: 14px; color: var(–text2); margin-bottom: 28px; }
.form-group { margin-bottom: 18px; }
.form-label { display: block; font-size: 12px; font-weight: 700; color: var(–text2); margin-bottom: 7px; font-family: var(–font-display); letter-spacing: 0.5px; text-transform: uppercase; }
.form-input { width: 100%; padding: 12px 14px; border: 1.5px solid var(–border); border-radius: 10px; font-family: var(–font-body); font-size: 14px; color: var(–text); background: var(–surface); outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: var(–accent); }
textarea.form-input { resize: vertical; min-height: 90px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.submit-btn { width: 100%; padding: 15px; background: var(–accent); color: white; border: none; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; font-family: var(–font-display); transition: all 0.15s; margin-top: 8px; }
.submit-btn:hover { background: #c73d22; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* MY POSTS */
.section-title { font-family: var(–font-display); font-size: 20px; font-weight: 800; margin-bottom: 6px; color: var(–text); }
.section-sub { font-size: 13px; color: var(–text2); margin-bottom: 20px; }
.my-want-card { background: var(–surface); border: 1px solid var(–border); border-radius: var(–radius); padding: 18px 20px; margin-bottom: 12px; }
.my-want-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 10px; }
.my-want-title { font-family: var(–font-display); font-weight: 700; font-size: 16px; color: var(–text); }
.badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; font-family: var(–font-display); white-space: nowrap; }
.badge-offers { background: rgba(232,75,42,0.1); color: var(–accent); }
.badge-none { background: var(–surface2); color: var(–text2); }
.my-want-budget { font-family: var(–font-display); font-size: 14px; color: var(–green); font-weight: 700; margin-bottom: 6px; }
.my-want-desc { font-size: 13px; color: var(–text2); line-height: 1.5; margin-bottom: 12px; }
.card-actions { display: flex; gap: 8px; margin-bottom: 12px; }
.btn-edit { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 100px; border: 1.5px solid var(–border); background: transparent; color: var(–text2); cursor: pointer; font-family: var(–font-body); transition: all 0.15s; }
.btn-edit:hover { border-color: var(–accent); color: var(–accent); }
.btn-delete { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 100px; border: 1.5px solid var(–border); background: transparent; color: var(–red); cursor: pointer; font-family: var(–font-body); transition: all 0.15s; }
.btn-delete:hover { border-color: var(–red); background: rgba(220,38,38,0.05); }
.mini-offer { background: var(–surface2); border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 6px; cursor: pointer; transition: background 0.15s; }
.mini-offer:hover { background: var(–surface3); }
.mini-offer-name { font-size: 13px; font-weight: 600; flex-shrink: 0; color: var(–text); }
.mini-offer-msg { font-size: 12px; color: var(–text2); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini-offer-price { font-family: var(–font-display); font-size: 14px; font-weight: 700; color: var(–green); flex-shrink: 0; }

/* MESSAGES */
.convo-list { display: flex; flex-direction: column; gap: 10px; }
.convo-item { background: var(–surface); border: 1px solid var(–border); border-radius: 12px; padding: 14px 18px; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; display: flex; align-items: center; gap: 12px; }
.convo-item:hover { border-color: var(–accent); box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.convo-info { flex: 1; }
.convo-with { font-size: 14px; font-weight: 600; margin-bottom: 3px; color: var(–text); }
.convo-preview { font-size: 12px; color: var(–text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.convo-time { font-size: 11px; color: var(–text2); }

/* CHAT MODAL */
.modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal { background: var(–surface); border-radius: 20px; width: 100%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; animation: slideUp 0.25s ease; box-shadow: 0 12px 40px rgba(0,0,0,0.2); border: 1px solid var(–border); }
@keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
.modal-header { padding: 18px 20px; border-bottom: 1px solid var(–border); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.modal-title-text { font-family: var(–font-display); font-size: 16px; font-weight: 700; color: var(–text); }
.modal-sub { font-size: 12px; color: var(–text2); margin-top: 2px; }
.modal-close { width: 32px; height: 32px; border-radius: 50%; background: var(–surface2); border: none; cursor: pointer; font-size: 16px; color: var(–text2); display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
.modal-close:hover { background: var(–surface3); color: var(–text); }
.chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; min-height: 200px; max-height: 360px; }
.chat-bubble { max-width: 80%; padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; }
.chat-bubble.mine { background: var(–accent); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
.chat-bubble.theirs { background: var(–surface2); color: var(–text); align-self: flex-start; border-bottom-left-radius: 4px; }
.bubble-sender { font-size: 10px; font-weight: 700; margin-bottom: 3px; opacity: 0.7; }
.bubble-time { font-size: 10px; opacity: 0.6; margin-top: 4px; text-align: right; }
.chat-input-row { display: flex; gap: 10px; padding: 14px 16px; border-top: 1px solid var(–border); flex-shrink: 0; }
.chat-input { flex: 1; padding: 10px 14px; border: 1.5px solid var(–border); border-radius: 10px; font-family: var(–font-body); font-size: 14px; color: var(–text); background: var(–surface2); outline: none; }
.chat-input:focus { border-color: var(–accent); }
.chat-send { padding: 10px 18px; background: var(–accent); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-family: var(–font-body); }
.edit-modal-body { padding: 20px; overflow-y: auto; }

/* EMPTY / LOADING */
.empty-state { text-align: center; padding: 60px 20px; color: var(–text2); }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { font-family: var(–font-display); font-size: 18px; font-weight: 700; color: var(–text); }
.empty-sub { font-size: 13px; margin-top: 6px; }
.loading { text-align: center; padding: 60px 20px; color: var(–text2); font-size: 14px; }
`;

const CATEGORIES = [“All”, “Electronics”, “Furniture”, “Sports”, “Home”, “Music”, “Fashion”, “Other”];
const DISTANCES = [“5 miles”, “10 miles”, “20 miles”, “50 miles”, “Any distance”];

export default function App() {
const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [authTab, setAuthTab] = useState(“login”);
const [authForm, setAuthForm] = useState({ name: “”, email: “”, password: “” });
const [authError, setAuthError] = useState(””);
const [authBusy, setAuthBusy] = useState(false);

const [view, setView] = useState(“browse”);
const [search, setSearch] = useState(””);
const [category, setCategory] = useState(“All”);
const [distance, setDistance] = useState(“Any distance”);
const [wants, setWants] = useState([]);
const [loading, setLoading] = useState(true);
const [expanded, setExpanded] = useState(null);
const [offerCompose, setOfferCompose] = useState({ message: “”, price: “”, photoUrl: “” });
const [offerPhotoPreview, setOfferPhotoPreview] = useState(null);
const [sentOffers, setSentOffers] = useState({});

const [form, setForm] = useState({ title: “”, description: “”, budget: “”, category: “”, location: “” });
const [posting, setPosting] = useState(false);
const [posted, setPosted] = useState(false);

const [editModal, setEditModal] = useState(null);
const [editForm, setEditForm] = useState({});

const [conversations, setConversations] = useState([]);
const [chatModal, setChatModal] = useState(null);
const [chatMessages, setChatMessages] = useState([]);
const [chatInput, setChatInput] = useState(””);
const chatBottomRef = useRef(null);

useEffect(() => {
return onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
}, []);

useEffect(() => {
const q = query(collection(db, “wants”), orderBy(“createdAt”, “desc”));
return onSnapshot(q, (snap) => {
setWants(snap.docs.map(d => ({ id: d.id, …d.data() })));
setLoading(false);
});
}, []);

useEffect(() => {
if (!user) return;
const q = query(collection(db, “conversations”), orderBy(“updatedAt”, “desc”));
return onSnapshot(q, (snap) => {
const all = snap.docs.map(d => ({ id: d.id, …d.data() }));
setConversations(all.filter(c => c.participants?.includes(user.uid)));
});
}, [user]);

useEffect(() => {
if (!chatModal) return;
const q = query(collection(db, “conversations”, chatModal.convoId, “messages”), orderBy(“createdAt”, “asc”));
return onSnapshot(q, (snap) => {
setChatMessages(snap.docs.map(d => ({ id: d.id, …d.data() })));
setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: “smooth” }), 100);
});
}, [chatModal]);

const handleAuth = async () => {
setAuthError(””); setAuthBusy(true);
try {
if (authTab === “signup”) {
const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
await updateProfile(cred.user, { displayName: authForm.name });
setUser({ …cred.user, displayName: authForm.name });
} else {
await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
}
} catch (e) {
setAuthError(e.message.replace(“Firebase: “, “”).replace(/(auth.*).?/, “”));
}
setAuthBusy(false);
};

const handleSignOut = () => { signOut(auth); setView(“browse”); };

const timeAgo = (ts) => {
if (!ts) return “Just now”;
const secs = Math.floor((Date.now() - (ts.toMillis?.() || 0)) / 1000);
if (secs < 60) return “Just now”;
if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
return `${Math.floor(secs / 86400)}d ago`;
};

const handleOfferPhoto = (e) => {
const file = e.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = (ev) => {
setOfferPhotoPreview(ev.target.result);
setOfferCompose(p => ({ …p, photoUrl: ev.target.result }));
};
reader.readAsDataURL(file);
};

const filtered = wants.filter(w => {
const ms = w.title?.toLowerCase().includes(search.toLowerCase()) || w.description?.toLowerCase().includes(search.toLowerCase());
const mc = category === “All” || w.category === category;
return ms && mc;
});

const myWants = wants.filter(w => w.userId === user?.uid);

const postWant = async () => {
if (!form.title || !form.budget || !user) return;
setPosting(true);
await addDoc(collection(db, “wants”), {
title: form.title, description: form.description,
budget: parseInt(form.budget) || 0,
category: form.category || “Other”,
location: form.location || “Nearby”,
user: user.displayName || user.email,
userId: user.uid,
offers: [], createdAt: serverTimestamp(),
});
setPosting(false); setPosted(true);
setForm({ title: “”, description: “”, budget: “”, category: “”, location: “” });
setTimeout(() => { setPosted(false); setView(“mine”); }, 1800);
};

const sendOffer = async (wantId) => {
if (!offerCompose.message || !offerCompose.price || !user) return;
const newOffer = {
from: user.displayName || user.email,
fromId: user.uid,
message: offerCompose.message,
price: parseInt(offerCompose.price) || 0,
photoUrl: offerCompose.photoUrl || null,
time: new Date().toLocaleTimeString([], { hour: “2-digit”, minute: “2-digit” }),
};
await updateDoc(doc(db, “wants”, wantId), { offers: arrayUnion(newOffer) });
setSentOffers(p => ({ …p, [wantId]: true }));
setOfferCompose({ message: “”, price: “”, photoUrl: “” });
setOfferPhotoPreview(null);
setTimeout(() => setSentOffers(p => ({ …p, [wantId]: false })), 3000);
};

const openChat = async (want, offer) => {
const ids = [user.uid, offer.fromId].sort();
const convoId = `${ids[0]}_${ids[1]}_${want.id}`;
const { getDoc: gd, setDoc: sd } = await import(“https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js”);
const ref = doc(db, “conversations”, convoId);
const snap = await gd(ref);
if (!snap.exists()) {
await sd(ref, {
participants: [user.uid, offer.fromId],
participantNames: { [user.uid]: user.displayName || user.email, [offer.fromId]: offer.from },
wantId: want.id, wantTitle: want.title,
updatedAt: serverTimestamp(),
});
}
const otherName = user.uid === offer.fromId ? want.user : offer.from;
setChatModal({ convoId, otherName, wantTitle: want.title });
};

const sendMessage = async () => {
if (!chatInput.trim() || !chatModal) return;
const msg = chatInput.trim(); setChatInput(””);
await addDoc(collection(db, “conversations”, chatModal.convoId, “messages”), {
text: msg, senderId: user.uid,
senderName: user.displayName || user.email,
createdAt: serverTimestamp(),
});
await updateDoc(doc(db, “conversations”, chatModal.convoId), { updatedAt: serverTimestamp(), lastMessage: msg });
};

const deleteWant = async (id) => {
if (!window.confirm(“Delete this want?”)) return;
await deleteDoc(doc(db, “wants”, id));
};

const saveEdit = async () => {
await updateDoc(doc(db, “wants”, editModal), {
title: editForm.title, description: editForm.description,
budget: parseInt(editForm.budget) || 0,
category: editForm.category, location: editForm.location,
});
setEditModal(null);
};

if (authLoading) return <div className=“loading” style={{ paddingTop: 100 }}>Loading…</div>;

if (!user) return (
<>
<style>{css}</style>
<div className="auth-screen">
<div className="auth-box">
<div className="auth-logo">Want<span>Board</span></div>
<div className="auth-subtitle">Post what you want. Let sellers come to you.</div>
<div className="auth-tabs">
{[“login”, “signup”].map(t => (
<div key={t} className={`auth-tab ${authTab === t ? "active" : ""}`} onClick={() => { setAuthTab(t); setAuthError(””); }}>
{t === “login” ? “Log In” : “Sign Up”}
</div>
))}
</div>
<div className="auth-form">
{authTab === “signup” && <input className=“auth-input” placeholder=“Your name” value={authForm.name} onChange={e => setAuthForm(p => ({ …p, name: e.target.value }))} />}
<input className=“auth-input” type=“email” placeholder=“Email” value={authForm.email} onChange={e => setAuthForm(p => ({ …p, email: e.target.value }))} />
<input className=“auth-input” type=“password” placeholder=“Password” value={authForm.password} onChange={e => setAuthForm(p => ({ …p, password: e.target.value }))} onKeyDown={e => e.key === “Enter” && handleAuth()} />
{authError && <div className="auth-error">{authError}</div>}
<button className="auth-btn" onClick={handleAuth} disabled={authBusy}>
{authBusy ? “…” : authTab === “login” ? “Log In →” : “Create Account →”}
</button>
</div>
</div>
</div>
</>
);

return (
<>
<style>{css}</style>
<div className="app">
<header className="header">
<div className="header-inner">
<div className=“logo” onClick={() => setView(“browse”)}>Want<span>Board</span></div>
{view === “browse” && (
<div className="search-bar">
<span style={{ color: “var(–text2)” }}>🔍</span>
<input placeholder=“Search wants…” value={search} onChange={e => setSearch(e.target.value)} />
</div>
)}
<div style={{ display: “flex”, alignItems: “center”, gap: 10 }}>
<span style={{ fontSize: 13, color: “var(–text2)” }}>👤 <strong style={{ color: “var(–accent)” }}>{user.displayName || user.email}</strong></span>
<button className=“btn btn-outline” style={{ fontSize: 12, padding: “6px 12px” }} onClick={handleSignOut}>Sign Out</button>
</div>
</div>
</header>

```
    <div className="nav-tabs">
      {[["browse", "Browse"], ["post", "Post a Want"], ["mine", "My Posts"], ["messages", "Messages"]].map(([id, label]) => (
        <div key={id} className={`nav-tab ${view === id ? "active" : ""}`} onClick={() => setView(id)}>{label}</div>
      ))}
    </div>

    <main className="main">

      {view === "browse" && (
        <>
          <div className="categories">
            {CATEGORIES.map(c => (
              <div key={c} className={`cat-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</div>
            ))}
          </div>
          <div className="filters-row">
            <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>Distance:</span>
            <select className="filter-select" value={distance} onChange={e => setDistance(e.target.value)}>
              {DISTANCES.map(d => <option key={d}>{d}</option>)}
            </select>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text2)" }}><strong style={{ color: "var(--text)" }}>{filtered.length}</strong> wants near you</span>
          </div>

          {loading ? <div className="loading">Loading wants...</div> :
            filtered.length === 0 ? (
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
                          <div className="want-user">{want.user}</div>
                          <div className="want-time">📍 {want.location} · {timeAgo(want.createdAt)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="want-budget">${(want.budget || 0).toLocaleString()}</div>
                          <div className="budget-label">MAX BUDGET</div>
                        </div>
                      </div>
                      <div className="want-title">{want.title}</div>
                      <div className="want-desc">{want.description}</div>
                      <div className="want-tags"><span className="tag">{want.category}</span></div>
                    </div>
                    <div className="want-footer">
                      <div className="offers-count">
                        {(want.offers || []).length === 0
                          ? <span>No offers — <strong>be first!</strong></span>
                          : <><strong>{want.offers.length}</strong> offer{want.offers.length !== 1 ? "s" : ""}</>}
                      </div>
                      {want.userId !== user.uid && (
                        <button className="offer-btn" onClick={e => { e.stopPropagation(); setExpanded(want.id); }}>Make an Offer →</button>
                      )}
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
                                  {offer.photoUrl && <img src={offer.photoUrl} className="offer-photo" alt="offer" />}
                                  <div className="offer-message">{offer.message}</div>
                                  <div className="offer-row">
                                    <span className="offer-price">${(offer.price || 0).toLocaleString()}</span>
                                    <span className="offer-time">{offer.time}</span>
                                    {(want.userId === user.uid || offer.fromId === user.uid) && offer.fromId && (
                                      <button className="msg-btn" onClick={() => openChat(want, offer)}>💬 Message</button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        {want.userId !== user.uid && (
                          <div className="offer-compose">
                            <div className="compose-label">Your Offer</div>
                            {sentOffers[want.id] ? (
                              <div className="sent-confirm">✅ Offer sent!</div>
                            ) : (
                              <>
                                <div className="photo-upload-row">
                                  <label className="photo-upload-label">
                                    📷 Attach a photo
                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleOfferPhoto} />
                                  </label>
                                  {offerPhotoPreview && <img src={offerPhotoPreview} className="photo-preview" alt="preview" />}
                                </div>
                                <div className="compose-row">
                                  <textarea className="compose-message" placeholder="Describe what you have..." value={offerCompose.message} onChange={e => setOfferCompose(p => ({ ...p, message: e.target.value }))} />
                                  <input type="number" className="compose-price" placeholder="$" value={offerCompose.price} onChange={e => setOfferCompose(p => ({ ...p, price: e.target.value }))} />
                                  <button className="compose-send" onClick={() => sendOffer(want.id)}>Send →</button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
        </>
      )}

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
              <button className="submit-btn" onClick={postWant} disabled={posting || !form.title || !form.budget}>
                {posting ? "Posting..." : "Post My Want →"}
              </button>
            </>
          )}
        </div>
      )}

      {view === "mine" && (
        <>
          <div className="section-title">My Posts</div>
          <div className="section-sub">Manage your wants and review incoming offers.</div>
          {myWants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No posts yet</div>
              <div className="empty-sub">Post your first want and let sellers come to you</div>
            </div>
          ) : myWants.map(want => (
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
                <button className="btn-edit" onClick={() => { setEditForm({ title: want.title, description: want.description, budget: want.budget, category: want.category, location: want.location }); setEditModal(want.id); }}>✏️ Edit</button>
                <button className="btn-delete" onClick={() => deleteWant(want.id)}>🗑 Delete</button>
              </div>
              {(want.offers || []).map((offer, i) => (
                <div key={i} className="mini-offer" onClick={() => offer.fromId && openChat(want, offer)}>
                  <div className="avatar sm">{(offer.from || "?")[0].toUpperCase()}</div>
                  <div className="mini-offer-name">{offer.from}</div>
                  <div className="mini-offer-msg">{offer.message}</div>
                  <div className="mini-offer-price">${(offer.price || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {view === "messages" && (
        <>
          <div className="section-title">Messages</div>
          <div className="section-sub">Your conversations with buyers and sellers.</div>
          {conversations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-text">No messages yet</div>
              <div className="empty-sub">Messages appear here when you start chatting with someone</div>
            </div>
          ) : (
            <div className="convo-list">
              {conversations.map(c => {
                const otherName = Object.entries(c.participantNames || {}).find(([id]) => id !== user.uid)?.[1] || "Unknown";
                return (
                  <div key={c.id} className="convo-item" onClick={() => setChatModal({ convoId: c.id, otherName, wantTitle: c.wantTitle })}>
                    <div className="avatar sm">{otherName[0]?.toUpperCase()}</div>
                    <div className="convo-info">
                      <div className="convo-with">{otherName}</div>
                      <div className="convo-preview">Re: {c.wantTitle}</div>
                    </div>
                    <div className="convo-time">{timeAgo(c.updatedAt)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>

    {chatModal && (
      <div className="modal-overlay" onClick={() => setChatModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <div className="modal-title-text">💬 {chatModal.otherName}</div>
              <div className="modal-sub">Re: {chatModal.wantTitle}</div>
            </div>
            <button className="modal-close" onClick={() => setChatModal(null)}>✕</button>
          </div>
          <div className="chat-messages">
            {chatMessages.length === 0 && <div style={{ textAlign: "center", color: "var(--text2)", fontSize: 13 }}>No messages yet. Say hello!</div>}
            {chatMessages.map(msg => (
              <div key={msg.id} className={`chat-bubble ${msg.senderId === user.uid ? "mine" : "theirs"}`}>
                {msg.senderId !== user.uid && <div className="bubble-sender">{msg.senderName}</div>}
                {msg.text}
                <div className="bubble-time">{timeAgo(msg.createdAt)}</div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
          <div className="chat-input-row">
            <input className="chat-input" placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
            <button className="chat-send" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    )}

    {editModal && (
      <div className="modal-overlay" onClick={() => setEditModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title-text">Edit Want</div>
            <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
          </div>
          <div className="edit-modal-body">
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