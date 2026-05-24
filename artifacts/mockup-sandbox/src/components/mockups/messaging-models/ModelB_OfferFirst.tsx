export function ModelB_OfferFirst() {
  const orange = "#FF7A1A";
  const surface = "#0F1115";
  const surface2 = "#1A1D24";
  const text = "#EDEEF1";
  const muted = "#9AA0AA";
  const border = "#2A2E37";

  const offers = [
    { name: "Maya R.", price: "$35", status: "Pending", color: "#FFB077", bg: "#3A2812", note: "+ note + photo", time: "2m" },
    { name: "Devon K.", price: "$28", status: "Countered", color: "#FFD600", bg: "#3A3212", note: "you offered $32", time: "1h" },
    { name: "Sara L.", price: "$40", status: "Accepted", color: "#7CE38B", bg: "#143018", note: "awaiting pickup", time: "3h" },
    { name: "Jin P.", price: "$15", status: "Declined", color: "#FF8A8A", bg: "#3A1818", note: "lowball", time: "1d" },
    { name: "Alex T.", price: "$33", status: "Pending", color: "#FFB077", bg: "#3A2812", note: "asks about lens", time: "1d" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: surface, color: text, fontFamily: "'Familjen Grotesk', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ color: muted, fontSize: 18 }}>←</span>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Offers on your want</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 6, background: "#2A2E37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📷</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Vintage Polaroid camera</div>
            <div style={{ fontSize: 11, color: muted }}>Budget $40 · 5 offers</div>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ padding: "10px 12px", display: "flex", gap: 6, borderBottom: `1px solid ${border}`, overflowX: "auto" }}>
        {["All 5", "Pending 2", "Countered 1", "Accepted 1", "Declined 1"].map((p, i) => (
          <div key={p} style={{ padding: "5px 10px", borderRadius: 999, background: i === 0 ? orange : surface2, color: i === 0 ? "#0F1115" : text, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{p}</div>
        ))}
      </div>

      {/* Offer rows */}
      <div style={{ padding: "8px 0" }}>
        {offers.map((o, i) => (
          <div key={i} style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, display: "flex", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#2A2E37", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{o.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{o.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: orange }}>{o.price}</div>
              </div>
              <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>{o.note} · {o.time} ago</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ padding: "3px 8px", borderRadius: 999, background: o.bg, color: o.color, fontSize: 10, fontWeight: 700 }}>{o.status.toUpperCase()}</div>
                {o.status === "Pending" && (
                  <>
                    <button style={{ padding: "4px 10px", background: orange, border: "none", borderRadius: 6, color: "#0F1115", fontWeight: 700, fontSize: 11 }}>Accept</button>
                    <button style={{ padding: "4px 10px", background: "transparent", border: `1px solid ${border}`, borderRadius: 6, color: text, fontWeight: 600, fontSize: 11 }}>Counter</button>
                    <div style={{ marginLeft: "auto", fontSize: 11, color: muted }}>💬</div>
                  </>
                )}
                {o.status === "Countered" && (
                  <>
                    <button style={{ padding: "4px 10px", background: "transparent", border: `1px solid ${border}`, borderRadius: 6, color: muted, fontWeight: 600, fontSize: 11 }}>Waiting…</button>
                    <div style={{ marginLeft: "auto", fontSize: 11, color: muted }}>💬</div>
                  </>
                )}
                {o.status === "Accepted" && (
                  <>
                    <button style={{ padding: "4px 10px", background: "#143018", border: `1px solid #1F4828`, borderRadius: 6, color: "#7CE38B", fontWeight: 600, fontSize: 11 }}>Arrange pickup</button>
                    <div style={{ marginLeft: "auto", fontSize: 11, color: muted }}>💬</div>
                  </>
                )}
                {o.status === "Declined" && <div style={{ fontSize: 11, color: muted }}>Hidden after 7d</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
