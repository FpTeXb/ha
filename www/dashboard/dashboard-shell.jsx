/* HA-aware wrapper that loads the same V2Refined component but
   binds React state to real HA entities via window.__haStates. */

const { useState, useEffect, useCallback, useMemo } = React;

const SetupOverlay = ({ onSave, error }) => {
  const saved = window.HADashboard.loadConn() || {};
  const [url, setUrl] = useState(saved.url || (location.protocol + "//" + location.hostname + ":8123"));
  const [token, setToken] = useState(saved.token || "");
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(8,10,16,0.92)", zIndex: 100, backdropFilter: "blur(12px)"
    }}>
      <div className="glass" style={{ width: 420, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="home" size={22} style={{ color: "var(--amber)" }}/>
          <span style={{ fontSize: 18, fontWeight: 500 }}>连接 Home Assistant</span>
        </div>
        <div className="lab" style={{ fontSize: 12, lineHeight: 1.5 }}>
          首次使用需要提供 HA 地址 + 长期访问令牌（在 HA: 用户头像 → 安全 → 长期访问令牌 → 创建）。
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="lab" style={{ fontSize: 10 }}>HA 地址</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)}
                 placeholder="http://homeassistant.local:8123"
                 style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--stroke)",
                          background: "rgba(255,255,255,0.04)", color: "var(--fg)", fontSize: 13, fontFamily: "inherit", outline: "none" }}/>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="lab" style={{ fontSize: 10 }}>长期访问令牌 (Token)</span>
          <input value={token} onChange={(e) => setToken(e.target.value)}
                 type="password" placeholder="eyJ..."
                 style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--stroke)",
                          background: "rgba(255,255,255,0.04)", color: "var(--fg)", fontSize: 13, fontFamily: "inherit", outline: "none" }}/>
        </div>
        {error && <div style={{ fontSize: 12, color: "var(--rose)", padding: "8px 10px", borderRadius: 8, background: "rgba(220,120,140,0.10)", border: "1px solid rgba(220,120,140,0.3)" }}>
          {error}
        </div>}
        <div className="tap glass-strong" style={{
          padding: "12px", borderRadius: 12, textAlign: "center", fontSize: 14,
          background: "var(--amber)", color: "#0a0a0a", fontWeight: 500, marginTop: 4
        }} onClick={() => onSave(url, token)}>
          连接
        </div>
      </div>
    </div>
  );
};

const ConnectingOverlay = () => (
  <div style={{
    position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(8,10,16,0.92)", zIndex: 100, color: "var(--fg-2)", fontSize: 14
  }}>
    正在连接 Home Assistant…
  </div>
);

const isPreviewMode = () => new URLSearchParams(location.search).has("preview");

const buildPreviewStates = () => {
  const states = {};
  for (const l of LIGHTS) {
    states[l.id] = {
      state: DEFAULT_ON.has(l.id) ? "on" : "off",
      attributes: { brightness: 220 },
    };
  }
  for (const c of CLIMATES) {
    states[c.id] = {
      state: c.room === "living" || c.room === "master" ? "cool" : "off",
      attributes: {
        temperature: c.target,
        current_temperature: c.current,
        hvac_modes: ["off", "cool", "heat"],
      },
    };
  }
  for (const c of CURTAINS) {
    states[c.id] = {
      state: c.open > 0 ? "open" : "closed",
      attributes: { current_position: c.open },
    };
  }
  states["weather.home"] = {
    state: "partlycloudy",
    attributes: { temperature: 26, humidity: 61 },
  };
  return states;
};

const enablePreviewMode = () => {
  window.__haStates = buildPreviewStates();
  const listeners = new Set();
  const coverTimers = new Map();
  const notify = () => listeners.forEach(fn => {
    try { fn(window.__haStates); } catch (e) { console.error(e); }
  });
  const updateEntity = (entityId, patch) => {
    window.__haStates = {
      ...window.__haStates,
      [entityId]: {
        ...(window.__haStates[entityId] || { state: "unknown", attributes: {} }),
        ...patch,
        attributes: {
          ...(window.__haStates[entityId]?.attributes || {}),
          ...(patch.attributes || {}),
        },
      },
    };
    notify();
  };
  window.haClient = {
    connected: true,
    callService(domain, service, data) {
      console.log("[preview] callService", domain, service, data);
      const entityIds = Array.isArray(data?.entity_id) ? data.entity_id : [data?.entity_id].filter(Boolean);
      for (const entityId of entityIds) {
        if (domain === "light") {
          const cur = window.__haStates[entityId]?.state;
          const state = service === "toggle" ? (cur === "on" ? "off" : "on") : service === "turn_on" ? "on" : "off";
          updateEntity(entityId, { state });
        } else if (domain === "climate") {
          if (service === "set_hvac_mode") {
            updateEntity(entityId, { state: data.hvac_mode });
          } else if (service === "set_temperature") {
            updateEntity(entityId, { attributes: { temperature: data.temperature } });
          } else if (service === "turn_off") {
            updateEntity(entityId, { state: "off" });
          }
        } else if (domain === "cover") {
          if (service === "stop_cover") {
            const timer = coverTimers.get(entityId);
            if (timer) {
              clearInterval(timer);
              coverTimers.delete(entityId);
            }
            updateEntity(entityId, {
              state: "paused",
              attributes: {
                moving_direction: window.__haStates[entityId]?.attributes?.moving_direction || "closing",
              },
            });
            continue;
          }
          const opening = service === "open_cover";
          const target = opening ? 100 : 0;
          const current = window.__haStates[entityId]?.attributes?.current_position ?? (opening ? 0 : 100);
          const timer = coverTimers.get(entityId);
          if (timer) clearInterval(timer);
          updateEntity(entityId, {
            state: opening ? "opening" : "closing",
            attributes: { moving_direction: opening ? "opening" : "closing" },
          });
          let step = 0;
          const steps = 25;
          const nextTimer = setInterval(() => {
            step += 1;
            const t = step / steps;
            const pos = Math.round(current + (target - current) * t);
            updateEntity(entityId, {
              state: step >= steps ? (opening ? "open" : "closed") : (opening ? "opening" : "closing"),
              attributes: {
                current_position: pos,
                moving_direction: opening ? "opening" : "closing",
              },
            });
            if (step >= steps) {
              clearInterval(nextTimer);
              coverTimers.delete(entityId);
            }
          }, 200);
          coverTimers.set(entityId, nextTimer);
        } else if (domain === "scene" && service === "turn_on") {
          if (entityId === "scene.home_return") {
            updateEntity("light.ruhu", { state: "on" });
            updateEntity("light.yeelink_cn_2027394738_ceil47_s_2_light", { state: "on" });
          } else if (entityId === "scene.home_away") {
            for (const l of LIGHTS) updateEntity(l.id, { state: "off" });
            for (const c of CLIMATES) updateEntity(c.id, { state: "off" });
          }
        }
      }
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    subscribeForecast(entityId, callback) {
      callback([
        { datetime: "2026-05-21", condition: "partlycloudy", temperature: 28, templow: 22 },
        { datetime: "2026-05-22", condition: "sunny", temperature: 30, templow: 23 },
        { datetime: "2026-05-23", condition: "rainy", temperature: 25, templow: 21 },
      ]);
      return () => {};
    },
  };
};

const Dashboard = () => {
  const [phase, setPhase] = useState(() => {
    if (isPreviewMode()) {
      enablePreviewMode();
      return "connected";
    }
    const saved = window.HADashboard.loadConn();
    return saved && saved.token ? "connecting" : "setup";
  });
  const [error, setError] = useState(null);
  const [, forceRender] = useState(0);

  // Connect on mount if creds exist
  useEffect(() => {
    if (phase !== "connecting") return;
    const saved = window.HADashboard.loadConn();
    const client = new window.HAClient(saved.url, saved.token);
    client.connect().then(() => {
      window.haClient = client;
      window.__haStates = client.states;
      client.subscribe((s) => { window.__haStates = {...s}; forceRender(x => x + 1); });
      setPhase("connected");
    }).catch(err => {
      setError(err.message);
      setPhase("setup");
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== "connected" || !isPreviewMode() || !window.haClient?.subscribe) return;
    return window.haClient.subscribe((s) => {
      window.__haStates = { ...s };
      forceRender(x => x + 1);
    });
  }, [phase]);

  const onSetup = useCallback((url, token) => {
    if (!url || !token) { setError("请填写地址和令牌"); return; }
    window.HADashboard.saveConn(url, token);
    setError(null);
    setPhase("connecting");
  }, []);

  if (phase === "setup") return <SetupOverlay onSave={onSetup} error={error}/>;
  if (phase === "connecting") return <ConnectingOverlay/>;

  return <V2RefinedHA/>;
};

window.Dashboard = Dashboard;
