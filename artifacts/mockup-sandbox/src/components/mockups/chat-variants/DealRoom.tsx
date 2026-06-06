import { useState } from "react";

const msgs = [
  { id: 1, mine: false, text: "Hey! Is this still available?", time: "2m ago" },
  { id: 2, mine: true, text: "Yeah, it's in great condition. Barely used.", time: "2m ago" },
  { id: 3, mine: false, text: "Offer: $4 — yes I know it's low but I'm just testing this", time: "Just now", offer: true },
];

export default function DealRoom() {
  const [status, setStatus] = useState<"pending"|"accepted"|"declined"|"countered">("pending");
  const [counter, setCounter] = useState(false);
  const [counterVal, setCounterVal] = useState("12");

  return (
    <div style={{ minHeight:"100vh", background:"#F7F5F2", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ width:390, height:720, background:"#fff", borderRadius:32, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.18)", display:"flex", flexDirection:"column", position:"relative" }}>

        {/* Header */}
        <div style={{ background:"#1A1A1A", paddingTop:16, paddingBottom:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 16px 14px" }}>
            <button style={{ background:"rgba(255,255,255,.1)", border:"none", color:"#fff", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#fff", fontSize:15, lineHeight:1.2 }}>Uppy</div>
              <div style={{ color:"rgba(255,255,255,.45)", fontSize:11 }}>Re: Pen</div>
            </div>
          </div>

          {/* Deal Panel */}
          <div style={{ background:"#111", margin:"0 12px", borderRadius:"16px 16px 0 0", padding:"20px 20px 22px" }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:"rgba(255,255,255,.35)", textTransform:"uppercase", marginBottom:6 }}>Active Offer</div>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:52, color:"#fff", lineHeight:1 }}>$4</div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>Your budget</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"#16A34A" }}>$25</div>
              </div>
            </div>

            {/* Budget bar */}
            <div style={{ height:4, background:"rgba(255,255,255,.1)", borderRadius:2, marginBottom:16, overflow:"hidden" }}>
              <div style={{ height:"100%", width:"16%", background:"linear-gradient(90deg,#E84B2A,#ff7c5c)", borderRadius:2 }} />
            </div>

            {status === "pending" && !counter && (
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setStatus("accepted")} style={{ flex:1, padding:"11px 8px", background:"#16A34A", color:"#fff", border:"none", borderRadius:12, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>✓ Accept</button>
                <button onClick={()=>setCounter(true)} style={{ flex:1, padding:"11px 8px", background:"#E84B2A", color:"#fff", border:"none", borderRadius:12, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>↕ Counter</button>
                <button onClick={()=>setStatus("declined")} style={{ flex:1, padding:"11px 8px", background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.6)", border:"1px solid rgba(255,255,255,.12)", borderRadius:12, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>✕</button>
              </div>
            )}
            {counter && status === "pending" && (
              <div style={{ display:"flex", gap:8 }}>
                <div style={{ flex:1, display:"flex", alignItems:"center", background:"rgba(255,255,255,.08)", borderRadius:12, padding:"0 12px", border:"1px solid rgba(255,255,255,.15)" }}>
                  <span style={{ color:"rgba(255,255,255,.4)", fontSize:14 }}>$</span>
                  <input value={counterVal} onChange={e=>setCounterVal(e.target.value)} style={{ flex:1, background:"none", border:"none", color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, outline:"none", padding:"10px 6px" }} />
                </div>
                <button onClick={()=>setStatus("countered")} style={{ padding:"10px 16px", background:"#E84B2A", color:"#fff", border:"none", borderRadius:12, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Send</button>
                <button onClick={()=>setCounter(false)} style={{ padding:"10px 12px", background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.5)", border:"none", borderRadius:12, cursor:"pointer", fontSize:13 }}>✕</button>
              </div>
            )}
            {status === "accepted" && <div style={{ textAlign:"center", padding:"10px 0 4px", fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#4ade80", fontSize:14 }}>✓ Offer accepted — great deal!</div>}
            {status === "declined" && <div style={{ textAlign:"center", padding:"10px 0 4px", fontFamily:"'Syne',sans-serif", fontWeight:700, color:"rgba(255,255,255,.4)", fontSize:13 }}>Offer declined</div>}
            {status === "countered" && <div style={{ textAlign:"center", padding:"10px 0 4px", fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#E84B2A", fontSize:13 }}>Counter offer ${counterVal} sent</div>}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:8, background:"#F7F5F2" }}>
          <div style={{ textAlign:"center", fontSize:11, color:"#999", marginBottom:4 }}>Today</div>
          {msgs.map(m => (
            <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems:m.mine?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"78%", padding:"9px 13px", borderRadius:16, background:m.mine?"#1A1A1A":"#fff", color:m.mine?"#fff":"#1A1A1A", fontSize:13, lineHeight:1.5, border:m.mine?"none":"1px solid #E2DDD8", borderBottomRightRadius:m.mine?4:16, borderBottomLeftRadius:m.mine?16:4 }}>
                {m.text}
              </div>
              <div style={{ fontSize:10, color:"#aaa", marginTop:3 }}>{m.time}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding:"10px 12px 20px", background:"#fff", borderTop:"1px solid #E2DDD8", display:"flex", gap:8, alignItems:"center" }}>
          <input placeholder="Message..." style={{ flex:1, padding:"10px 14px", borderRadius:22, border:"1.5px solid #E2DDD8", fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", background:"#F7F5F2" }} />
          <button style={{ padding:"10px 18px", background:"#E84B2A", color:"#fff", border:"none", borderRadius:22, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Send</button>
        </div>
      </div>
    </div>
  );
}
