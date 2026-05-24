export function ModelC_OneThreadPerWant() {
  const orange = "#FF7A1A";
  const surface = "#0F1115";
  const surface2 = "#1A1D24";
  const text = "#EDEEF1";
  const muted = "#9AA0AA";
  const border = "#2A2E37";

  const buyers = [
    { name: "Maya R.", price: "$35", last: "works great, can deliver", time: "2m", unread: 2, active: true },
    { name: "Devon K.", price: "$28", last: "you: would you take $32?", time: "1h", unread: 0, active: false },
    { name: "Sara L.", price: "$40", last: "✓ accepted — meet at park?", time: "3h", unread: 0, active: false, badge: "✓" },
    { name: "Alex T.", price: "$33", last: "is the lens clean?", time: "1d", unread: 1, active: false },
    { name: "Jin P.", price: "$15", last: "you: that's too low, sorry", time: "1d", unread: 0, active: false, badge: "✕" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: surface, color: text, fontFamily: "'Familjen Grotesk', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header — want as context */}
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, background: surface2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ color: muted, fontSize: 18 }}>←</span>
          <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Inbox for want</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 6, background: "#2A2E37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📷</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Vintage Polaroid camera</div>
            <div style={{ fontSize: 11, color: muted }}>$40 budget · 5 buyers interested</div>
          </div>
        </div>
      </div>

      {/* Buyer list — left column, full width on mobile */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {buyers.map((b, i) => (
          <div key={i} style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, display: "flex", gap: 10, alignItems: "center", background: b.active ? "#15191F" : "transparent", borderLeft: b.active ? `3px solid ${orange}` : "3px solid transparent" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#2A2E37", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{b.name[0]}</div>
              {b.badge && <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: b.badge === "✓" ? "#1F4828" : "#3A1818", color: b.badge === "✓" ? "#7CE38B" : "#FF8A8A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, border: `2px solid ${surface}` }}>{b.badge}</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name} <span style={{ color: orange, fontWeight: 700 }}>· {b.price}</span></div>
                <div style={{ fontSize: 10, color: muted }}>{b.time}</div>
              </div>
              <div style={{ fontSize: 12, color: muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{b.last}</div>
            </div>
            {b.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: "50%", background: orange, color: "#0F1115", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{b.unread}</div>}
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${border}`, background: surface2, fontSize: 11, color: muted, textAlign: "center" }}>
        Tap a buyer to open their chat thread
      </div>
    </div>
  );
}
