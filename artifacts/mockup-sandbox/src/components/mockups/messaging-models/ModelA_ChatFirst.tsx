export function ModelA_ChatFirst() {
  const orange = "#FF7A1A";
  const surface = "#0F1115";
  const surface2 = "#1A1D24";
  const text = "#EDEEF1";
  const muted = "#9AA0AA";
  const border = "#2A2E37";

  return (
    <div style={{ minHeight: "100vh", background: surface, color: text, fontFamily: "'Familjen Grotesk', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 22, color: muted }}>←</div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#3A2A1A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: orange }}>M</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Maya R.</div>
          <div style={{ fontSize: 11, color: muted }}>re: Vintage Polaroid camera</div>
        </div>
        <div style={{ fontSize: 18, color: muted }}>⋯</div>
      </div>

      {/* Offer context strip — pinned */}
      <div style={{ background: surface2, padding: "10px 14px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 6, background: "#2A2E37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📷</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: muted }}>Want — $40 budget</div>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Vintage Polaroid camera</div>
        </div>
        <div style={{ padding: "3px 8px", borderRadius: 999, background: "#3A2812", color: "#FFB077", fontSize: 11, fontWeight: 600 }}>Pending</div>
      </div>

      {/* Chat thread */}
      <div style={{ flex: 1, padding: "14px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        {/* Buyer offer card #1 */}
        <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
          <div style={{ background: surface2, border: `1px solid ${border}`, borderRadius: 14, padding: 12, borderTopLeftRadius: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: muted, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: orange }} />
              OFFER
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 50, height: 50, borderRadius: 6, background: "#2A2E37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📷</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>$35</div>
                <div style={{ fontSize: 11, color: muted }}>SX-70, working flash</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ flex: 1, padding: "7px", background: orange, border: "none", borderRadius: 8, color: "#0F1115", fontWeight: 700, fontSize: 12 }}>Accept</button>
              <button style={{ flex: 1, padding: "7px", background: "transparent", border: `1px solid ${border}`, borderRadius: 8, color: text, fontWeight: 600, fontSize: 12 }}>Counter</button>
              <button style={{ flex: 1, padding: "7px", background: "transparent", border: `1px solid ${border}`, borderRadius: 8, color: muted, fontWeight: 600, fontSize: 12 }}>Decline</button>
            </div>
          </div>
          <div style={{ fontSize: 10, color: muted, marginTop: 4, marginLeft: 4 }}>Maya · 2:14 PM</div>
        </div>

        {/* Buyer text */}
        <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
          <div style={{ background: surface2, padding: "8px 12px", borderRadius: 14, borderTopLeftRadius: 4, fontSize: 13 }}>
            Hey! Found this in my closet, works great. Can deliver if you're nearby.
          </div>
        </div>

        {/* Your counter */}
        <div style={{ alignSelf: "flex-end", maxWidth: "85%" }}>
          <div style={{ background: orange, color: "#0F1115", padding: "8px 12px", borderRadius: 14, borderTopRightRadius: 4, fontSize: 13, fontWeight: 500 }}>
            Looks good — would you take $30?
          </div>
        </div>

        {/* Buyer counter offer card */}
        <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
          <div style={{ background: surface2, border: `1px solid ${border}`, borderRadius: 14, padding: 12, borderTopLeftRadius: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: muted, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD600" }} />
              COUNTER-OFFER
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>$32 <span style={{ fontSize: 11, color: muted, fontWeight: 400 }}>· meets in the middle</span></div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ flex: 1, padding: "7px", background: orange, border: "none", borderRadius: 8, color: "#0F1115", fontWeight: 700, fontSize: 12 }}>Accept</button>
              <button style={{ flex: 1, padding: "7px", background: "transparent", border: `1px solid ${border}`, borderRadius: 8, color: text, fontWeight: 600, fontSize: 12 }}>Counter</button>
            </div>
          </div>
          <div style={{ fontSize: 10, color: muted, marginTop: 4, marginLeft: 4 }}>Maya · 2:18 PM</div>
        </div>
      </div>

      {/* Input bar */}
      <div style={{ borderTop: `1px solid ${border}`, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center", background: surface }}>
        <div style={{ color: muted, fontSize: 20 }}>＋</div>
        <div style={{ flex: 1, background: surface2, padding: "8px 12px", borderRadius: 20, fontSize: 13, color: muted }}>Message Maya…</div>
        <div style={{ color: orange, fontSize: 18, fontWeight: 700 }}>↑</div>
      </div>
    </div>
  );
}
