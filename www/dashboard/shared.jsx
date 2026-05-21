/* Shared SVG icon set + small components for Home Dashboard variations.
   Loaded as text/babel; everything attached to window at the bottom. */

const stroke = "currentColor";

const Icon = ({ name, size = 22, ...rest }) => {
  const s = size;
  const common = {
    width: s, height: s, viewBox: "0 0 24 24", fill: "none",
    stroke, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round",
    ...rest,
  };
  switch (name) {
    case "bulb": return (
      <svg {...common}><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/></svg>
    );
    case "thermo": return (
      <svg {...common}><path d="M14 14.76V4a2 2 0 1 0-4 0v10.76a4 4 0 1 0 4 0z"/></svg>
    );
    case "snow": return (
      <svg {...common}><path d="M12 2v20M2 12h20M4.5 4.5l15 15M19.5 4.5l-15 15"/></svg>
    );
    case "drop": return (
      <svg {...common}><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"/></svg>
    );
    case "wind": return (
      <svg {...common}><path d="M3 8h13a3 3 0 1 0-3-3"/><path d="M3 12h17a3 3 0 1 1-3 3"/><path d="M3 16h9"/></svg>
    );
    case "blinds": return (
      <svg {...common}><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 8h18M3 12h18M3 16h18M3 20h18"/></svg>
    );
    case "lock": return (
      <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>
    );
    case "shield": return (
      <svg {...common}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>
    );
    case "cam": return (
      <svg {...common}><path d="M2 7l5-3v16l-5-3z"/><rect x="7" y="5" width="15" height="14" rx="2"/></svg>
    );
    case "play": return (
      <svg {...common}><path d="M6 4l14 8-14 8V4z" fill={stroke}/></svg>
    );
    case "pause": return (
      <svg {...common}><rect x="6" y="4" width="4" height="16" fill={stroke}/><rect x="14" y="4" width="4" height="16" fill={stroke}/></svg>
    );
    case "skip-next": return (
      <svg {...common}><path d="M5 4l10 8-10 8V4z" fill={stroke}/><path d="M18 4v16" strokeWidth="2"/></svg>
    );
    case "skip-prev": return (
      <svg {...common}><path d="M19 4L9 12l10 8V4z" fill={stroke}/><path d="M6 4v16" strokeWidth="2"/></svg>
    );
    case "vacuum": return (
      <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
    );
    case "bolt": return (
      <svg {...common}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill={stroke}/></svg>
    );
    case "leaf": return (
      <svg {...common}><path d="M20 4c-9 0-16 4-16 12 0 2 1 4 2 4 8 0 14-7 14-16z"/><path d="M4 20c4-4 8-6 14-12"/></svg>
    );
    case "sun": return (
      <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>
    );
    case "moon": return (
      <svg {...common}><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/></svg>
    );
    case "cloud": return (
      <svg {...common}><path d="M7 18a4 4 0 1 1 1-7.9A6 6 0 0 1 20 12a4 4 0 0 1-1 8H7z"/></svg>
    );
    case "home": return (
      <svg {...common}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z"/></svg>
    );
    case "movie": return (
      <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5l-2 4M12 5l-2 4M17 5l-2 4M22 9H2"/></svg>
    );
    case "bed": return (
      <svg {...common}><path d="M3 19V8M21 19v-5a3 3 0 0 0-3-3H10v8M3 14h18"/></svg>
    );
    case "door-out": return (
      <svg {...common}><path d="M14 3h6v18h-6M3 12h11M11 8l4 4-4 4"/></svg>
    );
    case "settings": return (
      <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.6A7 7 0 0 0 7.4 6.8l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.6a7 7 0 0 0 2.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></svg>
    );
    case "wifi": return (
      <svg {...common}><path d="M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/></svg>
    );
    case "bell": return (
      <svg {...common}><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2zM10 21a2 2 0 0 0 4 0"/></svg>
    );
    case "co2": return (
      <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 10a3 3 0 1 0 0 4M14 10v4M14 10h3M14 12h3M14 14h3"/></svg>
    );
    case "wave": return (
      <svg {...common}><path d="M2 12c2 0 2-3 4-3s2 3 4 3 2-3 4-3 2 3 4 3 2-3 4-3"/></svg>
    );
    case "chevron-up": return (
      <svg {...common}><path d="M6 15l6-6 6 6"/></svg>
    );
    case "chevron-down": return (
      <svg {...common}><path d="M6 9l6 6 6-6"/></svg>
    );
    case "chevron-right": return (
      <svg {...common}><path d="M9 6l6 6-6 6"/></svg>
    );
    case "plus": return (
      <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
    );
    case "minus": return (
      <svg {...common}><path d="M5 12h14"/></svg>
    );
    case "expand": return (
      <svg {...common}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
    );
    case "dot-vert": return (
      <svg {...common}><circle cx="12" cy="5" r="1" fill={stroke}/><circle cx="12" cy="12" r="1" fill={stroke}/><circle cx="12" cy="19" r="1" fill={stroke}/></svg>
    );
    case "power": return (
      <svg {...common}><path d="M12 3v9M6.5 7.5a8 8 0 1 0 11 0"/></svg>
    );
    default: return null;
  }
};

/* Camera placeholder — soft stripes + label */
const CamStub = ({ label, live = true }) => (
  <div className="cam-stub" style={{
    position: "relative", width: "100%", height: "100%", borderRadius: 14, overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)",
    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em"
  }}>
    <span style={{ textTransform: "uppercase" }}>{label}</span>
    {live && (
      <div style={{
        position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 6,
        background: "rgba(0,0,0,0.4)", padding: "3px 8px", borderRadius: 999,
        fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", color: "#ffb4b4"
      }}>
        <span className="dot rose" style={{ width: 6, height: 6 }}></span> LIVE
      </div>
    )}
  </div>
);

/* Clock — locks to a fake but stable time for screenshots */
const ClockBlock = ({ time = "21:14", date = "Wed · May 20" }) => (
  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
    <div className="huge num" style={{ fontWeight: 200 }}>{time}</div>
    <div style={{ marginTop: 8, color: "var(--fg-3)", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>{date}</div>
  </div>
);

/* Weather chip */
const WeatherChip = ({ temp = 22, label = "Clear · 35% rh", icon = "moon" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <Icon name={icon} size={28} style={{ color: "var(--fg-2)" }} />
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span className="num" style={{ fontSize: 22, fontWeight: 500 }}>{temp}°</span>
      <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{label}</span>
    </div>
  </div>
);

/* Radial dial — used for climate & energy */
const Dial = ({ value, min = 16, max = 32, size = 160, label, unit = "°", color = "var(--cyan)", thickness = 8 }) => {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = (value - min) / (max - min);
  const dash = c * 0.78; // 280° sweep
  const offset = dash * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(130deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} className="ring-bg" strokeWidth={thickness}
                strokeDasharray={`${dash} ${c}`} strokeLinecap="round"/>
        <circle cx={size/2} cy={size/2} r={r} className="ring-fg" strokeWidth={thickness}
                stroke={color}
                strokeDasharray={`${dash} ${c}`} strokeDashoffset={offset}
                style={{ filter: `drop-shadow(0 0 8px ${color})` }}/>
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center"
      }}>
        <div className="num" style={{ fontSize: size * 0.30, fontWeight: 300, lineHeight: 1 }}>
          {value}<span style={{ fontSize: size * 0.14, color: "var(--fg-3)" }}>{unit}</span>
        </div>
        {label && <div style={{ marginTop: 4, fontSize: 11, color: "var(--fg-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>}
      </div>
    </div>
  );
};

/* Floorplan with optional room highlight dots */
const Floorplan = ({ rooms = [], style = {}, dim = 0.78 }) => (
  <div style={{ position: "relative", ...style }}>
    <img src="assets/floorplan.png" className="floor-img" style={{ opacity: dim }} alt=""/>
    {rooms.map((r, i) => (
      <div key={i} style={{
        position: "absolute", left: `${r.x}%`, top: `${r.y}%`,
        transform: "translate(-50%, -50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4
      }}>
        <span className={`dot ${r.color || "amber"}`} style={{ width: 10, height: 10 }}></span>
        {r.label && <span style={{
          fontSize: 10, color: "var(--fg)", background: "rgba(0,0,0,0.45)",
          padding: "2px 7px", borderRadius: 999, fontFamily: "var(--font-mono)",
          letterSpacing: "0.06em", whiteSpace: "nowrap"
        }}>{r.label}</span>}
      </div>
    ))}
  </div>
);

/* Tiny sparkline */
const Spark = ({ data = [3,4,3,5,6,5,7,6,8,7,6,7,9,8], color = "var(--mint)", w = 120, h = 32 }) => {
  const mn = Math.min(...data), mx = Math.max(...data);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d - mn) / (mx - mn || 1)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/* Common Status header bar — time + weather + status pills */
const StatusBar = ({ compact = false }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--fg-2)" }}>
      <span className="dot mint"></span>
      <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>Home · Armed Stay</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 18, color: "var(--fg-2)" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <Icon name="wifi" size={14}/> Mesh
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <Icon name="bell" size={14}/> 2
      </span>
      {!compact && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <Icon name="settings" size={14}/>
      </span>}
    </div>
  </div>
);

Object.assign(window, {
  Icon, CamStub, ClockBlock, WeatherChip, Dial, Floorplan, Spark, StatusBar,
});
