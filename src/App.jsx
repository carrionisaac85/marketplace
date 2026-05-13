import { useState, useEffect, useRef } from “react”;
import { initializeApp } from “https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js”;
import {
getFirestore, collection, addDoc, onSnapshot, updateDoc,
deleteDoc, doc, serverTimestamp, orderBy, query, arrayUnion,
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

const css = `
@import url(‘https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap’);
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
–bg:#F7F5F2;–surface:#FFFFFF;–surface2:#F0EDE8;–surface3:#E8E4DF;
–text:#1A1A1A;–text2:#6B6560;–accent:#E84B2A;–green:#16A34A;
–red:#DC2626;–border:#E2DDD8;–r:16px;
–fd:‘Syne’,sans-serif;–fb:‘DM Sans’,sans-serif;
}
body{font-family:var(–fb);background:var(–bg);color:var(–text);-webkit-font-smoothing:antialiased}
.app{min-height:100vh;display:flex;flex-direction:column;padding-bottom:80px}

/* AUTH */
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(–bg)}
.auth-box{background:var(–surface);border:1px solid var(–border);border-radius:20px;padding:36px;width:100%;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.auth-logo{font-family:var(–fd);font-weight:800;font-size:28px;margin-bottom:6px}
.auth-logo span{color:var(–accent)}
.auth-sub{font-size:14px;color:var(–text2);margin-bottom:24px}
.auth-tabs{display:flex;gap:4px;margin-bottom:24px;background:var(–surface2);border-radius:10px;padding:4px}
.auth-tab{flex:1;padding:8px;text-align:center;font-size:13px;font-weight:600;font-family:var(–fd);cursor:pointer;border-radius:8px;color:var(–text2);transition:all .15s}
.auth-tab.active{background:var(–accent);color:#fff}
.auth-form{display:flex;flex-direction:column;gap:12px}
.auth-input{width:100%;padding:12px 14px;border:1.5px solid var(–border);border-radius:10px;font-family:var(–fb);font-size:14px;color:var(–text);background:var(–surface2);outline:none;transition:border-color .15s}
.auth-input:focus{border-color:var(–accent)}
.auth-btn{width:100%;padding:14px;background:var(–accent);color:#fff;border:none;border-radius:10px;font-weight:800;font-size:15px;cursor:pointer;font-family:var(–fd);margin-top:4px}
.auth-btn:hover{background:#c73d22}
.auth-btn:disabled{opacity:.5;cursor:not-allowed}
.auth-err{font-size:13px;color:var(–red);text-align:center}

/* HEADER */
.header{background:var(–surface);border-bottom:1px solid var(–border);position:sticky;top:0;z-index:100;padding:14px 20px 12px;box-shadow:0 1px 8px rgba(0,0,0,.06)}
.header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.logo{font-family:var(–fd);font-weight:800;font-size:22px;color:var(–text);cursor:pointer}
.logo span{color:var(–accent)}
.huser{display:flex;align-items:center;gap:8px}
.huser-name{font-size:12px;color:var(–text2)}
.huser-name strong{color:var(–accent)}
.signout{font-size:12px;font-weight:600;padding:5px 12px;border-radius:100px;border:1.5px solid var(–border);background:transparent;color:var(–text2);cursor:pointer;font-family:var(–fb)}
.signout:hover{border-color:var(–red);color:var(–red)}
.hsearch{display:flex;align-items:center;background:var(–surface2);border:1.5px solid var(–border);border-radius:100px;padding:0 16px;gap:8px}
.hsearch:focus-within{border-color:var(–accent)}
.hsearch input{border:none;background:transparent;font-family:var(–fb);font-size:14px;color:var(–text);outline:none;flex:1;padding:10px 0}
.hsearch input::placeholder{color:var(–text2)}

/* BOTTOM NAV */
.bnav{position:fixed;bottom:0;left:0;right:0;z-index:100;background:var(–surface);border-top:1px solid var(–border);display:flex;align-items:center;justify-content:space-around;padding:8px 0 14px;box-shadow:0 -2px 12px rgba(0,0,0,.06)}
.bitem{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 12px;color:var(–text2);font-family:var(–fd);font-size:11px;font-weight:600;transition:color .15s}
.bitem:hover,.bitem.active{color:var(–accent)}
.bicon{font-size:22px;line-height:1}

/* MAIN */
.main{max-width:1100px;margin:0 auto;padding:20px 16px;flex:1;width:100%}

/* CATEGORIES */
.cats{display:flex;gap:8px;overflow-x:auto;margin-bottom:12px;scrollbar-width:none}
.cats::-webkit-scrollbar{display:none}
.chip{padding:7px 14px;border-radius:100px;border:1.5px solid var(–border);background:var(–surface);cursor:pointer;font-size:13px;font-weight:500;color:var(–text2);white-space:nowrap;transition:all .15s}
.chip:hover{border-color:var(–accent);color:var(–accent)}
.chip.active{background:var(–accent);border-color:var(–accent);color:#fff;font-weight:700}

/* FILTERS */
.frow{display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.fsel{font-family:var(–fb);font-size:13px;border:1.5px solid var(–border);border-radius:100px;padding:7px 14px;background:var(–surface);color:var(–text);cursor:pointer;outline:none}
.fsel:focus{border-color:var(–accent)}

/* TWO COLUMN GRID */
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* WANT CARD */
.wcard{background:var(–surface);border:1px solid var(–border);border-radius:var(–r);overflow:hidden;display:flex;flex-direction:column;transition:box-shadow .2s;cursor:pointer}
.wcard:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
.wcard-body{padding:14px 14px 10px;flex:1}
.wcard-urow{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.av{width:30px;height:30px;border-radius:50%;background:var(–accent);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(–fd);font-weight:800;font-size:12px;flex-shrink:0}
.av.sm{background:var(–surface3);color:var(–text2)}
.wuser{font-size:12px;font-weight:600;color:var(–text)}
.wtime{font-size:11px;color:var(–text2)}
.wbudget{font-family:var(–fd);font-weight:800;font-size:18px;color:var(–green)}
.blabel{font-size:9px;color:var(–text2);text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px}
.wtitle{font-family:var(–fd);font-weight:700;font-size:13px;margin-bottom:6px;line-height:1.3;color:var(–text)}
.wdesc{font-size:12px;color:var(–text2);line-height:1.5;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:100px;background:var(–surface2);color:var(–text2);display:inline-block}
.wfoot{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-top:1px solid var(–border);background:var(–surface2);gap:4px}
.ocnt{font-size:11px;color:var(–text2)}
.ocnt strong{color:var(–text)}
.obtn{font-family:var(–fb);font-size:11px;font-weight:600;background:var(–accent);color:#fff;border:none;cursor:pointer;border-radius:100px;padding:5px 10px;white-space:nowrap}
.obtn:hover{background:#c73d22}

/* BOTTOM SHEET */
.soverlay{position:fixed;inset:0;z-index:150;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding-bottom:80px;animation:fi .2s}
@keyframes fi{from{opacity:0}to{opacity:1}}
.sheet{background:var(–surface);border-radius:20px 20px 0 0;width:100%;max-width:640px;max-height:80vh;overflow-y:auto;animation:su .25s ease;box-shadow:0 -8px 32px rgba(0,0,0,.15)}
@keyframes su{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
.sh-head{padding:16px 20px;border-bottom:1px solid var(–border);display:flex;justify-content:space-between;align-items:flex-start}
.sh-title{font-family:var(–fd);font-weight:700;font-size:17px;line-height:1.3;flex:1;padding-right:12px}
.sh-close{width:30px;height:30px;border-radius:50%;background:var(–surface2);border:none;cursor:pointer;font-size:14px;color:var(–text2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sh-close:hover{background:var(–surface3)}
.sh-body{padding:16px 20px 24px}
.sh-budget{font-family:var(–fd);font-weight:800;font-size:24px;color:var(–green);margin-bottom:4px}
.sh-meta{font-size:12px;color:var(–text2);margin-bottom:12px}
.sh-desc{font-size:14px;color:var(–text2);line-height:1.6;margin-bottom:16px}
.offers-ttl{font-family:var(–fd);font-size:12px;font-weight:700;color:var(–text2);letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px}
.oitem{padding:12px;border:1px solid var(–border);border-radius:12px;display:flex;gap:10px;margin-bottom:8px;background:var(–surface2)}
.obody{flex:1}
.oname{font-size:13px;font-weight:600;margin-bottom:4px;color:var(–text)}
.ophoto{width:70px;height:70px;border-radius:8px;object-fit:cover;margin-bottom:8px;border:1px solid var(–border);display:block}
.omsg{font-size:13px;color:var(–text2);line-height:1.5;margin-bottom:8px}
.orow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.oprice{font-family:var(–fd);font-weight:700;font-size:16px;color:var(–green)}
.otime{font-size:11px;color:var(–text2);flex:1}
.mbtn{font-size:12px;font-weight:600;padding:5px 12px;border-radius:100px;border:1.5px solid var(–border);background:var(–surface);color:var(–text2);cursor:pointer;font-family:var(–fb);transition:all .15s}
.mbtn:hover{border-color:var(–accent);color:var(–accent)}
.compose{margin-top:16px;padding-top:16px;border-top:1px solid var(–border)}
.clabel{font-size:12px;font-weight:700;color:var(–text2);margin-bottom:8px;font-family:var(–fd);letter-spacing:.3px}
.photo-lbl{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border:1.5px dashed var(–border);border-radius:10px;cursor:pointer;font-size:13px;color:var(–text2);background:var(–surface);margin-bottom:8px}
.photo-lbl:hover{border-color:var(–accent);color:var(–accent)}
.photo-prev{width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid var(–border);margin-top:6px;display:block}
.crow{display:flex;gap:10px;align-items:flex-end}
.cmsg{flex:1;padding:10px 14px;border:1.5px solid var(–border);border-radius:10px;font-family:var(–fb);font-size:13.5px;background:var(–surface);color:var(–text);outline:none;resize:none;min-height:60px}
.cmsg:focus{border-color:var(–accent)}
.cprice{width:80px;padding:10px;border:1.5px solid var(–border);border-radius:10px;font-family:var(–fd);font-size:15px;font-weight:700;background:var(–surface);color:var(–green);outline:none}
.csend{padding:10px 16px;background:var(–accent);color:#fff;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:var(–fb);white-space:nowrap}
.csend:hover{background:#c73d22}
.sent{color:var(–green);font-size:13px;font-weight:600;padding:10px 0}

/* FORM */
.pform{max-width:540px;margin:0 auto;padding-bottom:20px}
.ftitle{font-family:var(–fd);font-size:24px;font-weight:800;margin-bottom:6px}
.fsub{font-size:14px;color:var(–text2);margin-bottom:24px}
.fg{margin-bottom:16px}
.fl{display:block;font-size:12px;font-weight:700;color:var(–text2);margin-bottom:7px;font-family:var(–fd);letter-spacing:.5px;text-transform:uppercase}
.fi{width:100%;padding:12px 14px;border:1.5px solid var(–border);border-radius:10px;font-family:var(–fb);font-size:14px;color:var(–text);background:var(–surface);outline:none;transition:border-color .15s}
.fi:focus{border-color:var(–accent)}
textarea.fi{resize:vertical;min-height:80px}
.fr2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sbtn{width:100%;padding:14px;background:var(–accent);color:#fff;border:none;border-radius:12px;font-weight:800;font-size:15px;cursor:pointer;font-family:var(–fd);margin-top:8px}
.sbtn:hover{background:#c73d22}
.sbtn:disabled{opacity:.5;cursor:not-allowed}

/* MY POSTS */
.stitle{font-family:var(–fd);font-size:20px;font-weight:800;margin-bottom:6px}
.ssub{font-size:13px;color:var(–text2);margin-bottom:16px}
.mcard{background:var(–surface);border:1px solid var(–border);border-radius:var(–r);padding:16px;margin-bottom:12px}
.mtop{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:10px}
.mtitle{font-family:var(–fd);font-weight:700;font-size:15px}
.badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;font-family:var(–fd);white-space:nowrap}
.bo{background:rgba(232,75,42,.1);color:var(–accent)}
.bn{background:var(–surface2);color:var(–text2)}
.mbudget{font-family:var(–fd);font-size:14px;color:var(–green);font-weight:700;margin-bottom:6px}
.mdesc{font-size:13px;color:var(–text2);line-height:1.5;margin-bottom:10px}
.cacts{display:flex;gap:8px;margin-bottom:10px}
.eedit{font-size:12px;font-weight:600;padding:6px 14px;border-radius:100px;border:1.5px solid var(–border);background:transparent;color:var(–text2);cursor:pointer;font-family:var(–fb)}
.eedit:hover{border-color:var(–accent);color:var(–accent)}
.edel{font-size:12px;font-weight:600;padding:6px 14px;border-radius:100px;border:1.5px solid var(–border);background:transparent;color:var(–red);cursor:pointer;font-family:var(–fb)}
.edel:hover{border-color:var(–red);background:rgba(220,38,38,.05)}
.moffer{background:var(–surface2);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:10px;margin-bottom:6px;cursor:pointer}
.moffer:hover{background:var(–surface3)}
.mon{font-size:13px;font-weight:600;flex-shrink:0}
.mom{font-size:12px;color:var(–text2);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mop{font-family:var(–fd);font-size:14px;font-weight:700;color:var(–green);flex-shrink:0}

/* MESSAGES */
.clist{display:flex;flex-direction:column;gap:10px}
.citem{background:var(–surface);border:1px solid var(–border);border-radius:12px;padding:14px 16px;cursor:pointer;transition:border-color .15s;display:flex;align-items:center;gap:12px}
.citem:hover{border-color:var(–accent)}
.cinfo{flex:1}
.cwith{font-size:14px;font-weight:600;margin-bottom:3px}
.cprev{font-size:12px;color:var(–text2)}
.ctime{font-size:11px;color:var(–text2)}

/* CHAT MODAL */
.moverlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(–surface);border-radius:20px;width:100%;max-width:500px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(0,0,0,.2);border:1px solid var(–border)}
.mhead{padding:16px 20px;border-bottom:1px solid var(–border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.mttl{font-family:var(–fd);font-size:16px;font-weight:700}
.msub{font-size:12px;color:var(–text2);margin-top:2px}
.mclose{width:30px;height:30px;border-radius:50%;background:var(–surface2);border:none;cursor:pointer;font-size:14px;color:var(–text2);display:flex;align-items:center;justify-content:center}
.msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;min-height:200px;max-height:340px}
.bubble{max-width:80%;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.5}
.bubble.mine{background:var(–accent);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.bubble.theirs{background:var(–surface2);color:var(–text);align-self:flex-start;border-bottom-left-radius:4px}
.bsender{font-size:10px;font-weight:700;margin-bottom:3px;opacity:.7}
.btime{font-size:10px;opacity:.6;margin-top:4px;text-align:right}
.minput-row{display:flex;gap:10px;padding:12px 16px;border-top:1px solid var(–border);flex-shrink:0}
.minput{flex:1;padding:10px 14px;border:1.5px solid var(–border);border-radius:10px;font-family:var(–fb);font-size:14px;color:var(–text);background:var(–surface2);outline:none}
.minput:focus{border-color:var(–accent)}
.msend{padding:10px 18px;background:var(–accent);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:var(–fb)}

/* EDIT MODAL BODY */
.ebody{padding:20px;overflow-y:auto}

/* EMPTY / LOADING */
.empty{text-align:center;padding:50px 20px;color:var(–text2)}
.eicon{font-size:44px;margin-bottom:12px}
.etitle{font-family:var(–fd);font-size:18px;font-weight:700;color:var(–text)}
.esub{font-size:13px;margin-top:6px}
.loading{text-align:center;padding:60px 20px;color:var(–text2);font-size:14px}
`;

const CATS = [“All”,“Electronics”,“Furniture”,“Sports”,“Home”,“Music”,“Fashion”,“Other”];
const DISTS = [“5 miles”,“10 miles”,“20 miles”,“50 miles”,“Any distance”];
const NAV = [{id:“browse”,icon:“🏠”,label:“Browse”},{id:“post”,icon:“➕”,label:“Post Want”},{id:“mine”,icon:“📋”,label:“My Posts”},{id:“messages”,icon:“💬”,label:“Messages”}];

export default function App() {
const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [authTab, setAuthTab] = useState(“login”);
const [af, setAf] = useState({ name:””, email:””, password:”” });
const [authErr, setAuthErr] = useState(””);
const [authBusy, setAuthBusy] = useState(false);

const [view, setView] = useState(“browse”);
const [search, setSearch] = useState(””);
const [cat, setCat] = useState(“All”);
const [dist, setDist] = useState(“Any distance”);
const [wants, setWants] = useState([]);
const [loading, setLoading] = useState(true);
const [sheet, setSheet] = useState(null);

const [oc, setOc] = useState({ message:””, price:””, photoUrl:”” });
const [photoPrev, setPhotoPrev] = useState(null);
const [sent, setSent] = useState({});

const [form, setForm] = useState({ title:””, description:””, budget:””, category:””, location:”” });
const [posting, setPosting] = useState(false);
const [posted, setPosted] = useState(false);

const [editId, setEditId] = useState(null);
const [ef, setEf] = useState({});

const [convos, setConvos] = useState([]);
const [chat, setChat] = useState(null);
const [msgs, setMsgs] = useState([]);
const [ci, setCi] = useState(””);
const btm = useRef(null);

useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setAuthLoading(false); }), []);
useEffect(() => {
const q = query(collection(db,“wants”), orderBy(“createdAt”,“desc”));
return onSnapshot(q, snap => { setWants(snap.docs.map(d=>({id:d.id,…d.data()}))); setLoading(false); });
}, []);
useEffect(() => {
if (!user) return;
const q = query(collection(db,“conversations”), orderBy(“updatedAt”,“desc”));
return onSnapshot(q, snap => {
setConvos(snap.docs.map(d=>({id:d.id,…d.data()})).filter(c=>c.participants?.includes(user.uid)));
});
}, [user]);
useEffect(() => {
if (!chat) return;
const q = query(collection(db,“conversations”,chat.convoId,“messages”), orderBy(“createdAt”,“asc”));
return onSnapshot(q, snap => {
setMsgs(snap.docs.map(d=>({id:d.id,…d.data()})));
setTimeout(()=>btm.current?.scrollIntoView({behavior:“smooth”}),100);
});
}, [chat]);

const doAuth = async () => {
setAuthErr(””); setAuthBusy(true);
try {
if (authTab===“signup”) {
const c = await createUserWithEmailAndPassword(auth, af.email, af.password);
await updateProfile(c.user,{displayName:af.name});
setUser({…c.user,displayName:af.name});
} else {
await signInWithEmailAndPassword(auth, af.email, af.password);
}
} catch(e) { setAuthErr(e.message.replace(“Firebase:”,””).replace(/(auth.*).?/,””)); }
setAuthBusy(false);
};

const ta = ts => {
if (!ts) return “Just now”;
const s = Math.floor((Date.now()-(ts.toMillis?.()??0))/1000);
if (s<60) return “Just now”;
if (s<3600) return `${Math.floor(s/60)}m ago`;
if (s<86400) return `${Math.floor(s/3600)}h ago`;
return `${Math.floor(s/86400)}d ago`;
};

const handlePhoto = e => {
const f=e.target.files[0]; if(!f) return;
const r=new FileReader();
r.onload=ev=>{ setPhotoPrev(ev.target.result); setOc(p=>({…p,photoUrl:ev.target.result})); };
r.readAsDataURL(f);
};

const filtered = wants.filter(w=>{
const ms=w.title?.toLowerCase().includes(search.toLowerCase())||w.description?.toLowerCase().includes(search.toLowerCase());
return ms && (cat===“All”||w.category===cat);
});
const myWants = wants.filter(w=>w.userId===user?.uid);

const postWant = async () => {
if (!form.title||!form.budget||!user) return;
setPosting(true);
await addDoc(collection(db,“wants”),{
title:form.title, description:form.description,
budget:parseInt(form.budget)||0, category:form.category||“Other”,
location:form.location||“Nearby”, user:user.displayName||user.email,
userId:user.uid, offers:[], createdAt:serverTimestamp(),
});
setPosting(false); setPosted(true);
setForm({title:””,description:””,budget:””,category:””,location:””});
setTimeout(()=>{setPosted(false);setView(“mine”);},1800);
};

const sendOffer = async wid => {
if (!oc.message||!oc.price||!user) return;
await updateDoc(doc(db,“wants”,wid),{offers:arrayUnion({
from:user.displayName||user.email, fromId:user.uid,
message:oc.message, price:parseInt(oc.price)||0,
photoUrl:oc.photoUrl||null,
time:new Date().toLocaleTimeString([],{hour:“2-digit”,minute:“2-digit”}),
})});
setSent(p=>({…p,[wid]:true}));
setOc({message:””,price:””,photoUrl:””}); setPhotoPrev(null);
setTimeout(()=>setSent(p=>({…p,[wid]:false})),3000);
};

const openChat = async (want, offer) => {
const ids=[user.uid,offer.fromId].sort();
const cid=`${ids[0]}_${ids[1]}_${want.id}`;
const {getDoc:gd,setDoc:sd}=await import(“https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js”);
const ref=doc(db,“conversations”,cid);
const snap=await gd(ref);
if(!snap.exists()) await sd(ref,{
participants:[user.uid,offer.fromId],
participantNames:{[user.uid]:user.displayName||user.email,[offer.fromId]:offer.from},
wantId:want.id, wantTitle:want.title, updatedAt:serverTimestamp(),
});
setChat({convoId:cid,otherName:user.uid===offer.fromId?want.user:offer.from,wantTitle:want.title});
};

const sendMsg = async () => {
if (!ci.trim()||!chat) return;
const m=ci.trim(); setCi(””);
await addDoc(collection(db,“conversations”,chat.convoId,“messages”),{
text:m, senderId:user.uid, senderName:user.displayName||user.email, createdAt:serverTimestamp(),
});
await updateDoc(doc(db,“conversations”,chat.convoId),{updatedAt:serverTimestamp(),lastMessage:m});
};

const delWant = async id => { if(!window.confirm(“Delete this want?”)) return; await deleteDoc(doc(db,“wants”,id)); };
const saveEdit = async () => {
await updateDoc(doc(db,“wants”,editId),{
title:ef.title, description:ef.description, budget:parseInt(ef.budget)||0, category:ef.category, location:ef.location,
});
setEditId(null);
};

if (authLoading) return <div className="loading" style={{paddingTop:100}}>Loading…</div>;

if (!user) return (
<>
<style>{css}</style>
<div className="auth-wrap">
<div className="auth-box">
<div className="auth-logo">Want<span>Board</span></div>
<div className="auth-sub">Post what you want. Let sellers come to you.</div>
<div className="auth-tabs">
{[“login”,“signup”].map(t=>(
<div key={t} className={`auth-tab ${authTab===t?"active":""}`} onClick={()=>{setAuthTab(t);setAuthErr(””);}}>
{t===“login”?“Log In”:“Sign Up”}
</div>
))}
</div>
<div className="auth-form">
{authTab===“signup”&&<input className=“auth-input” placeholder=“Your name” value={af.name} onChange={e=>setAf(p=>({…p,name:e.target.value}))} />}
<input className=“auth-input” type=“email” placeholder=“Email” value={af.email} onChange={e=>setAf(p=>({…p,email:e.target.value}))} />
<input className=“auth-input” type=“password” placeholder=“Password” value={af.password} onChange={e=>setAf(p=>({…p,password:e.target.value}))} onKeyDown={e=>e.key===“Enter”&&doAuth()} />
{authErr&&<div className="auth-err">{authErr}</div>}
<button className="auth-btn" onClick={doAuth} disabled={authBusy}>{authBusy?”…”:authTab===“login”?“Log In →”:“Create Account →”}</button>
</div>
</div>
</div>
</>
);

return (
<>
<style>{css}</style>
<div className="app">

```
    <header className="header">
      <div className="header-top">
        <div className="logo" onClick={()=>setView("browse")}>Want<span>Board</span></div>
        <div className="huser">
          <span className="huser-name">👤 <strong>{user.displayName||user.email}</strong></span>
          <button className="signout" onClick={()=>{signOut(auth);setView("browse");}}>Sign Out</button>
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

      {view==="browse"&&(
        <>
          <div className="cats">
            {CATS.map(c=><div key={c} className={`chip ${cat===c?"active":""}`} onClick={()=>setCat(c)}>{c}</div>)}
          </div>
          <div className="frow">
            <span style={{fontSize:13,color:"var(--text2)",fontWeight:500}}>📍 Distance:</span>
            <select className="fsel" value={dist} onChange={e=>setDist(e.target.value)}>
              {DISTS.map(d=><option key={d}>{d}</option>)}
            </select>
            <span style={{marginLeft:"auto",fontSize:13,color:"var(--text2)"}}><strong style={{color:"var(--text)"}}>{filtered.length}</strong> wants</span>
          </div>
          {loading?<div className="loading">Loading wants...</div>:
           filtered.length===0?(
            <div className="empty"><div className="eicon">📭</div><div className="etitle">No wants yet</div><div className="esub">Be the first to post what you're looking for</div></div>
           ):(
            <div className="grid2">
              {filtered.map(w=>(
                <div key={w.id} className="wcard" onClick={()=>setSheet(w)}>
                  <div className="wcard-body">
                    <div className="wcard-urow">
                      <div className="av">{(w.user||"?")[0].toUpperCase()}</div>
                      <div><div className="wuser">{w.user}</div><div className="wtime">{ta(w.createdAt)}</div></div>
                    </div>
                    <div className="wbudget">${(w.budget||0).toLocaleString()}</div>
                    <div className="blabel">Max Budget</div>
                    <div className="wtitle">{w.title}</div>
                    <div className="wdesc">{w.description}</div>
                    <span className="tag">{w.category}</span>
                  </div>
                  <div className="wfoot">
                    <div className="ocnt">{(w.offers||[]).length===0?<span>No offers</span>:<><strong>{w.offers.length}</strong> offer{w.offers.length!==1?"s":""}</>}</div>
                    {w.userId!==user.uid&&<button className="obtn" onClick={e=>{e.stopPropagation();setSheet(w);}}>Offer →</button>}
                  </div>
                </div>
              ))}
            </div>
           )}
        </>
      )}

      {view==="post"&&(
        <div className="pform">
          {posted?(
            <div className="empty"><div className="eicon">📬</div><div className="etitle">Want Posted!</div><div className="esub">Sellers will start sending offers soon.</div></div>
          ):(
            <>
              <div className="ftitle">Post a Want</div>
              <div className="fsub">Tell sellers what you need. Set your budget and let offers come to you.</div>
              <div className="fg"><label className="fl">What do you want?</label><input className="fi" placeholder='e.g. "Looking for a vintage road bike"' value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></div>
              <div className="fg"><label className="fl">Describe it</label><textarea className="fi" placeholder="Brand, size, condition, color..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
              <div className="fr2">
                <div className="fg"><label className="fl">Max Budget ($)</label><input type="number" className="fi" placeholder="0" value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))} /></div>
                <div className="fg"><label className="fl">Category</label>
                  <select className="fi" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    <option value="">Select...</option>
                    {["Electronics","Furniture","Sports","Home","Music","Fashion","Other"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="fg"><label className="fl">Location</label><input className="fi" placeholder="Neighborhood or city" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} /></div>
              <button className="sbtn" onClick={postWant} disabled={posting||!form.title||!form.budget}>{posting?"Posting...":"Post My Want →"}</button>
            </>
          )}
        </div>
      )}

      {view==="mine"&&(
        <>
          <div className="stitle">My Posts</div>
          <div className="ssub">Manage your wants and review incoming offers.</div>
          {myWants.length===0?(
            <div className="empty"><div className="eicon">📭</div><div className="etitle">No posts yet</div><div className="esub">Post your first want and let sellers come to you</div></div>
          ):myWants.map(w=>(
            <div key={w.id} className="mcard">
              <div className="mtop">
                <div className="mtitle">{w.title}</div>
                <span className={`badge ${(w.offers||[]).length>0?"bo":"bn"}`}>{(w.offers||[]).length>0?`${w.offers.length} offer${w.offers.length>1?"s":""}`:"No offers"}</span>
              </div>
              <div className="mbudget">Up to ${(w.budget||0).toLocaleString()}</div>
              <div className="mdesc">{w.description}</div>
              <div className="cacts">
                <button className="eedit" onClick={()=>{setEf({title:w.title,description:w.description,budget:w.budget,category:w.category,location:w.location});setEditId(w.id);}}>✏️ Edit</button>
                <button className="edel" onClick={()=>delWant(w.id)}>🗑 Delete</button>
              </div>
              {(w.offers||[]).map((o,i)=>(
                <div key={i} className="moffer" onClick={()=>o.fromId&&openChat(w,o)}>
                  <div className="av sm">{(o.from||"?")[0].toUpperCase()}</div>
                  <div className="mon">{o.from}</div>
                  <div className="mom">{o.message}</div>
                  <div className="mop">${(o.price||0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {view==="messages"&&(
        <>
          <div className="stitle">Messages</div>
          <div className="ssub">Your conversations with buyers and sellers.</div>
          {convos.length===0?(
            <div className="empty"><div className="eicon">💬</div><div className="etitle">No messages yet</div><div className="esub">Messages appear here when you start chatting</div></div>
          ):(
            <div className="clist">
              {convos.map(c=>{
                const on=Object.entries(c.participantNames||{}).find(([id])=>id!==user.uid)?.[1]||"Unknown";
                return(
                  <div key={c.id} className="citem" onClick={()=>setChat({convoId:c.id,otherName:on,wantTitle:c.wantTitle})}>
                    <div className="av sm">{on[0]?.toUpperCase()}</div>
                    <div className="cinfo"><div className="cwith">{on}</div><div className="cprev">Re: {c.wantTitle}</div></div>
                    <div className="ctime">{ta(c.updatedAt)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>

    {/* BOTTOM NAV */}
    <nav className="bnav">
      {NAV.map(n=><div key={n.id} className={`bitem ${view===n.id?"active":""}`} onClick={()=>setView(n.id)}><span className="bicon">{n.icon}</span><span>{n.label}</span></div>)}
    </nav>

    {/* EXPANDED WANT SHEET */}
    {sheet&&(
      <div className="soverlay" onClick={()=>setSheet(null)}>
        <div className="sheet" onClick={e=>e.stopPropagation()}>
          <div className="sh-head">
            <div className="sh-title">{sheet.title}</div>
            <button className="sh-close" onClick={()=>setSheet(null)}>✕</button>
          </div>
          <div className="sh-body">
            <div className="sh-budget">${(sheet.budget||0).toLocaleString()}</div>
            <div className="sh-meta">📍 {sheet.location} · {sheet.user} · {ta(sheet.createdAt)}</div>
            <div className="sh-desc">{sheet.description}</div>

            {(sheet.offers||[]).length>0&&(
              <>
                <div className="offers-ttl">Offers ({sheet.offers.length})</div>
                {sheet.offers.map((o,i)=>(
                  <div key={i} className="oitem">
                    <div className="av sm">{(o.from||"?")[0].toUpperCase()}</div>
                    <div className="obody">
                      <div className="oname">{o.from}</div>
                      {o.photoUrl&&<img src={o.photoUrl} className="ophoto" alt="offer" />}
                      <div className="omsg">{o.message}</div>
                      <div className="orow">
                        <span className="oprice">${(o.price||0).toLocaleString()}</span>
                        <span className="otime">{o.time}</span>
                        {(sheet.userId===user.uid||o.fromId===user.uid)&&o.fromId&&(
                          <button className="mbtn" onClick={()=>{openChat(sheet,o);setSheet(null);}}>💬 Message</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {sheet.userId!==user.uid&&(
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
                      <textarea className="cmsg" placeholder="Describe what you have..." value={oc.message} onChange={e=>setOc(p=>({...p,message:e.target.value}))} />
                      <input type="number" className="cprice" placeholder="$" value={oc.price} onChange={e=>setOc(p=>({...p,price:e.target.value}))} />
                      <button className="csend" onClick={()=>sendOffer(sheet.id)}>Send →</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* CHAT MODAL */}
    {chat&&(
      <div className="moverlay" onClick={()=>setChat(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mhead">
            <div><div className="mttl">💬 {chat.otherName}</div><div className="msub">Re: {chat.wantTitle}</div></div>
            <button className="mclose" onClick={()=>setChat(null)}>✕</button>
          </div>
          <div className="msgs">
            {msgs.length===0&&<div style={{textAlign:"center",color:"var(--text2)",fontSize:13}}>No messages yet. Say hello!</div>}
            {msgs.map(m=>(
              <div key={m.id} className={`bubble ${m.senderId===user.uid?"mine":"theirs"}`}>
                {m.senderId!==user.uid&&<div className="bsender">{m.senderName}</div>}
                {m.text}
                <div className="btime">{ta(m.createdAt)}</div>
              </div>
            ))}
            <div ref={btm} />
          </div>
          <div className="minput-row">
            <input className="minput" placeholder="Type a message..." value={ci} onChange={e=>setCi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} />
            <button className="msend" onClick={sendMsg}>Send</button>
          </div>
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
                  {["Electronics","Furniture","Sports","Home","Music","Fashion","Other"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="fg"><label className="fl">Location</label><input className="fi" value={ef.location} onChange={e=>setEf(p=>({...p,location:e.target.value}))} /></div>
            <button className="sbtn" onClick={saveEdit}>Save Changes</button>
          </div>
        </div>
      </div>
    )}

  </div>
</>
```

);
}