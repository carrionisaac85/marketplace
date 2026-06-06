import { useState } from "react";

export default function OfferCard() {
  const [offerStatus, setOfferStatus] = useState<"pending"|"accepted"|"declined">("pending");

  return (
    <div style={{ minHeight:"100vh", background:"#F7F5F2", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      .msg-input:focus { border-color:#E84B2A; outline:none; }
      `}</style>
      <div style={{ width:390, height:720, background:"#fff", borderRadius:32, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.18)", display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <div style={{ background:"#fff", borderBottom:"1px solid #E2DDD8", padding:"16px 16px 14px", display:"flex", alignItems:"center", gap:12 }}>
          <button style={{ background:"#F7F5F2", border:"none", color:"#1A1A1A", borderRadius:10, width:34, height:34, cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>‹</button>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"#E84B2A", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, flexShrink:0 }}>U</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#1A1A1A", lineHeight:1.2 }}>Uppy</div>
            <div style={{ fontSize:11, color:"#6B6560" }}>Re: Pen · <span style={{ color:"#16A34A", fontWeight:600 }}>Budget $25</span></div>
          </div>
          <div style={{ fontSize:11, color:"#999" }}>Active</div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 14px", display:"flex", flexDirection:"column", gap:10, background:"#F7F5F2" }}>
          <div style={{ textAlign:"center", fontSize:11, color:"#aaa", marginBottom:2 }}>Today</div>

          {/* Regular message from them */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
            <div style={{ maxWidth:"76%", padding:"10px 13px", borderRadius:18, background:"#fff", color:"#1A1A1A", fontSize:13.5, lineHeight:1.5, border:"1px solid #E2DDD8", borderBottomLeftRadius:4 }}>
              Hey! Is this pen still available?
            </div>
            <div style={{ fontSize:10, color:"#bbb", marginTop:3 }}>2m ago</div>
          </div>

          {/* Regular message from me */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
            <div style={{ maxWidth:"76%", padding:"10px 13px", borderRadius:18, background:"#E84B2A", color:"#fff", fontSize:13.5, lineHeight:1.5, borderBottomRightRadius:4 }}>
              Yep! Barely used, works great.
            </div>
            <div style={{ fontSize:10, color:"#bbb", marginTop:3 }}>2m ago</div>
          </div>

          {/* OFFER CARD — the main event */}
          <div style={{ margin:"6px 0" }}>
            <div style={{ fontSize:10, color:"#aaa", marginBottom:6, textAlign:"left" }}>Uppy sent an offer</div>
            <div style={{ background:"#fff", borderRadius:18, border:"2px solid #E84B2A", overflow:"hidden", boxShadow:"0 4px 16px rgba(232,75,42,.12)" }}>
              <div style={{ background:"linear-gradient(135deg,#1A1A1A,#2d2d2d)", padding:"16px 18px 14px", display:"flex", alignItems:"center", gap:14 }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, color:"rgba(255,255,255,.45)", textTransform:"uppercase", marginBottom:4 }}>Offer for Pen</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:40, color:"#fff", lineHeight:1 }}>$4</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:4 }}>vs your $25 budget</div>
                </div>
                <div style={{ marginLeft:"auto", display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
                  <div style={{ background:"rgba(255,255,255,.08)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"rgba(255,255,255,.5)" }}>Just now</div>
                </div>
              </div>

              {offerStatus === "pending" ? (
                <div style={{ padding:"12px 14px", display:"flex", gap:8 }}>
                  <button onClick={()=>setOfferStatus("accepted")} style={{ flex:1, padding:"12px", background:"#16A34A", color:"#fff", border:"none", borderRadius:12, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13.5, cursor:"pointer" }}>
                    Accept Deal ✓
                  </button>
                  <button onClick={()=>setOfferStatus("declined")} style={{ padding:"12px 16px", background:"#F7F5F2", color:"#6B6560", border:"1px solid #E2DDD8", borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>
                    Decline
                  </button>
                </div>
              ) : offerStatus === "accepted" ? (
                <div style={{ padding:"14px", textAlign:"center", background:"#f0fdf4" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#16A34A", fontSize:14 }}>🎉 Deal accepted!</div>
                  <div style={{ fontSize:12, color:"#6B6560", marginTop:3 }}>Coordinate pickup details below</div>
                </div>
              ) : (
                <div style={{ padding:"14px", textAlign:"center", background:"#fef2f2" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#dc2626", fontSize:13 }}>Offer declined</div>
                </div>
              )}
            </div>
          </div>

          {offerStatus === "accepted" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
              <div style={{ maxWidth:"76%", padding:"10px 13px", borderRadius:18, background:"#fff", color:"#1A1A1A", fontSize:13.5, lineHeight:1.5, border:"1px solid #E2DDD8", borderBottomLeftRadius:4 }}>
                Awesome! When can you pick it up? 📦
              </div>
              <div style={{ fontSize:10, color:"#bbb", marginTop:3 }}>Just now</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding:"10px 12px 20px", background:"#fff", borderTop:"1px solid #E2DDD8", display:"flex", gap:8, alignItems:"center" }}>
          <input className="msg-input" placeholder="Message..." style={{ flex:1, padding:"10px 14px", borderRadius:22, border:"1.5px solid #E2DDD8", fontFamily:"'DM Sans',sans-serif", fontSize:14, background:"#F7F5F2", transition:"border-color .15s" }} />
          <button style={{ padding:"10px 18px", background:"#E84B2A", color:"#fff", border:"none", borderRadius:22, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Send</button>
        </div>
      </div>
    </div>
  );
}
