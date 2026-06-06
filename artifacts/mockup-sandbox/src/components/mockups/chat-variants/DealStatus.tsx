import { useState } from "react";

const STAGES = ["Offer sent", "In review", "Agreed"] as const;

export default function DealStatus() {
  const [stage, setStage] = useState(1);
  const [showCounter, setShowCounter] = useState(false);

  return (
    <div style={{ minHeight:"100vh", background:"#F7F5F2", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.15)} }
      .pulse-dot { animation: pulse 1.6s ease-in-out infinite; }
      `}</style>
      <div style={{ width:390, height:720, background:"#fff", borderRadius:32, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.18)", display:"flex", flexDirection:"column" }}>

        {/* Header — deal focused */}
        <div style={{ background:"#E84B2A", paddingTop:16, paddingBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 16px 16px" }}>
            <button style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#fff", fontSize:15 }}>Uppy · Pen</div>
            </div>
            <div style={{ background:"rgba(255,255,255,.2)", borderRadius:100, padding:"4px 12px", fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#fff", fontSize:13 }}>$4 offer</div>
          </div>

          {/* Stage timeline */}
          <div style={{ padding:"0 20px" }}>
            <div style={{ display:"flex", alignItems:"center", position:"relative" }}>
              {/* Track line */}
              <div style={{ position:"absolute", top:"50%", left:16, right:16, height:2, background:"rgba(255,255,255,.25)", transform:"translateY(-50%)", zIndex:0 }} />
              <div style={{ position:"absolute", top:"50%", left:16, height:2, background:"rgba(255,255,255,.7)", transform:"translateY(-50%)", zIndex:0, width:`${stage === 0 ? 0 : stage === 1 ? 50 : 100}%`, transition:"width .4s ease" }} />
              {STAGES.map((label, i) => (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", position:"relative", zIndex:1 }}>
                  <div className={stage === i ? "pulse-dot" : ""} style={{ width:24, height:24, borderRadius:"50%", background:i <= stage ? "#fff" : "rgba(255,255,255,.25)", border:`2px solid ${i <= stage ? "#fff" : "rgba(255,255,255,.3)"}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:6, cursor:i < 2 ? "pointer":"default" }}
                    onClick={()=>{ if(i < STAGES.length) { setStage(i); } }}>
                    {i < stage && <span style={{ color:"#E84B2A", fontWeight:800, fontSize:11 }}>✓</span>}
                    {i === stage && <span style={{ width:8, height:8, borderRadius:"50%", background:"#E84B2A", display:"block" }} />}
                  </div>
                  <div style={{ fontSize:10, fontWeight:600, color:i <= stage ? "#fff" : "rgba(255,255,255,.45)", textAlign:"center", whiteSpace:"nowrap" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions strip */}
        {stage < 2 && (
          <div style={{ background:"#fff9f8", borderBottom:"1px solid #fde8e2", padding:"10px 14px", display:"flex", gap:8 }}>
            <button onClick={()=>setStage(2)} style={{ flex:1, padding:"9px 8px", background:"#16A34A", color:"#fff", border:"none", borderRadius:10, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12.5, cursor:"pointer" }}>Accept $4</button>
            <button onClick={()=>setShowCounter(!showCounter)} style={{ flex:1, padding:"9px 8px", background:"#E84B2A", color:"#fff", border:"none", borderRadius:10, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12.5, cursor:"pointer" }}>Counter →</button>
            <button style={{ padding:"9px 14px", background:"transparent", color:"#6B6560", border:"1px solid #E2DDD8", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>Pass</button>
          </div>
        )}
        {stage === 2 && (
          <div style={{ background:"#f0fdf4", borderBottom:"1px solid #bbf7d0", padding:"11px 16px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#15803d", fontSize:13 }}>🎉 Deal agreed at $4 — coordinate pickup below</div>
          </div>
        )}
        {showCounter && (
          <div style={{ background:"#fff", borderBottom:"1px solid #E2DDD8", padding:"10px 14px", display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ color:"#6B6560", fontSize:13 }}>Counter with:</span>
            <div style={{ flex:1, display:"flex", alignItems:"center", background:"#F7F5F2", borderRadius:10, padding:"0 10px", border:"1.5px solid #E84B2A" }}>
              <span style={{ color:"#E84B2A", fontWeight:700 }}>$</span>
              <input defaultValue="12" style={{ flex:1, background:"none", border:"none", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#1A1A1A", outline:"none", padding:"8px 6px" }} />
            </div>
            <button onClick={()=>{setShowCounter(false);setStage(1);}} style={{ padding:"9px 14px", background:"#E84B2A", color:"#fff", border:"none", borderRadius:10, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Send</button>
          </div>
        )}

        {/* Message log — editorial, understated */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:0, background:"#F7F5F2" }}>
          <div style={{ fontSize:10, color:"#bbb", textAlign:"center", marginBottom:12, textTransform:"uppercase", letterSpacing:1 }}>Conversation</div>

          {[
            { mine:false, name:"Uppy", text:"Hey! Is this still available?", time:"2m ago" },
            { mine:true, name:"You", text:"Yeah, it's in great condition. Barely used.", time:"2m ago" },
            { mine:false, name:"Uppy", text:"💸 Offer: $4 — yes", time:"Just now" },
          ].map((m, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:12, flexDirection:m.mine?"row-reverse":"row" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:m.mine?"#1A1A1A":"#E84B2A", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:10, flexShrink:0, marginTop:2 }}>
                {m.name[0]}
              </div>
              <div style={{ flex:1, maxWidth:"75%" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4, justifyContent:m.mine?"flex-end":"flex-start" }}>
                  <span style={{ fontSize:11, fontWeight:600, color:"#1A1A1A" }}>{m.name}</span>
                  <span style={{ fontSize:10, color:"#bbb" }}>{m.time}</span>
                </div>
                <div style={{ fontSize:13.5, lineHeight:1.55, color:"#1A1A1A", background:m.mine?"#1A1A1A":"#fff", color:m.mine?"#fff":"#1A1A1A", borderRadius:14, padding:"9px 13px", border:m.mine?"none":"1px solid #E2DDD8", display:"inline-block", maxWidth:"100%" }}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding:"10px 12px 20px", background:"#fff", borderTop:"1px solid #E2DDD8", display:"flex", gap:8, alignItems:"center" }}>
          <input placeholder="Reply..." style={{ flex:1, padding:"10px 14px", borderRadius:22, border:"1.5px solid #E2DDD8", fontFamily:"'DM Sans',sans-serif", fontSize:14, background:"#F7F5F2", outline:"none" }} />
          <button style={{ padding:"10px 18px", background:"#E84B2A", color:"#fff", border:"none", borderRadius:22, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Send</button>
        </div>
      </div>
    </div>
  );
}
