export function ModelD_InboxStatus() {
  const orange = "#FF7A1A";
  const surface = "#0F1115";
  const surface2 = "#1A1D24";
  const text = "#EDEEF1";
  const muted = "#9AA0AA";
  const border = "#2A2E37";

  const convos = [
    { name: "Maya R.", want: "Vintage Polaroid camera", price: "$35", last: "works great, can deliver", time: "2m", unread: 2, status: "Pending", sc: "#FFB077", sbg: "#3A2812", emoji: "📷" },
    { name: "Devon K.", want: "Vintage Polaroid camera", price: "$32", last: "you: would you take $32?", time: "1h", unread: 0, status: "Countered", sc: "#FFD600", sbg: "#3A3212", emoji: "📷" },
    { name: "Sara L.", want: "Vintage Polaroid camera", price: "$40", last: "meet at the park at 5?", time: "3h", unread: 1, status: "Accepted", sc: "#7CE38B", sbg: "#143018", emoji: "📷" },
    { name: "Theo B.", want: "Studio desk lamp", price: "$22", last: "sounds good!", time: "5h", unread: 0, status: "Accepted", sc: "#7CE38B", sbg: "#143018", emoji: "💡" },
    { name: "Riley M.", want: "Bike helmet (M)", price: "$18", last: "you: thanks for the offer", time: "1d", unread: 0, status: "Declined", sc: "#FF8A8A", sbg: "#3A1818", emoji: "🪖" },
    { name: "Alex T.", want: "Vintage Polaroid camera", price: "$33", last: "is the lens clean?", time: "1d", unread: 1, status: "Pending", sc: "#FFB077", sbg: "#3A2812", emoji: "📷" },
    { name: "Nora W.", want: "Wool sweater XL", price: "$45", last: "shipping included?", time: "2d", unread: 0, status: "Pending", sc: "#FFB077", sbg: "#3A2812", emoji: "🧶" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: surface, color: text, fontFamily: "'Familjen Grotesk', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Messages</div>
          <div style={{ fontSize: 18, color: muted }}>🔍</div>
        </div>
      </div>

      {/* Status filter pills */}
      <div style={{ padding: "10px 12px", display: "flex", gap: 6, borderBottom: `1px solid ${border}`, overflowX: "auto" }}>
        {[
          { label: "All 7", active: true },
          { label: "🟡 Pending 3", active: false },
          { label: "🔁 Countered 1", active: false },
          { label: "✅ Accepted 2", active: false },
          { label: "❌ Declined 1", active: false },
        ].map((p, i) => (
          <div key={i} style={{ padding: "5px 10px", borderRadius: 999, background: p.active ? orange : surface2, color: p.active ? "#0F1115" : text, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{p.label}</div>
        ))}
      </div>

      {/* Conversation rows */}
      <div>
        {convos.map((c, i) => (
          <div key={i} style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2A2E37", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{c.name[0]}</div>
              <div style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: 5, background: surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: `2px solid ${surface}` }}>{c.emoji}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 10, color: muted }}>{c.time}</div>
              </div>
              <div style={{ fontSize: 11, color: muted, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                re: <span style={{ color: text }}>{c.want}</span> · <span style={{ color: orange, fontWeight: 600 }}>{c.price}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12, color: c.unread > 0 ? text : muted, fontWeight: c.unread > 0 ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{c.last}</div>
                <div style={{ padding: "2px 7px", borderRadius: 999, background: c.sbg, color: c.sc, fontSize: 9, fontWeight: 700, whiteSpace: "nowrap" }}>{c.status.toUpperCase()}</div>
              </div>
            </div>
            {c.unread > 0 && <div style={{ width: 8, height: 8, borderRadius: "50%", background: orange, marginTop: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
