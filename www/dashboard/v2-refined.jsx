/* V2 Refined — Real Home Assistant entities.
   Interactive: click light dots to toggle, see lighten-blend overlays appear.
   Layout: top bar / left rooms rail / centre floorplan / right climate rail / bottom strip.
*/

const { useState, useMemo, useCallback, useEffect } = React;

/* Dual-axis sparkline: temperature (amber) + humidity (cyan), 24h */
const TempHumidChart = () => {
  // 24h hourly data — believable evening curve
  const temps = [20.8,20.5,20.3,20.1,20.0,20.2,20.7,21.4,22.0,22.6,23.1,23.5,
                 23.9,24.1,24.2,24.0,23.7,23.3,22.9,22.6,22.3,22.0,21.7,22.4];
  const hums  = [52,53,54,55,55,55,54,52,49,47,45,43,41,40,39,40,42,44,46,48,49,50,51,48];
  const W = 172, H = 56, PAD = 2;
  const tMin = 18, tMax = 26;
  const hMin = 30, hMax = 60;
  const x = (i) => PAD + (i / (temps.length - 1)) * (W - PAD * 2);
  const yT = (v) => PAD + (1 - (v - tMin) / (tMax - tMin)) * (H - PAD * 2);
  const yH = (v) => PAD + (1 - (v - hMin) / (hMax - hMin)) * (H - PAD * 2);
  const path = (data, fy) => data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${fy(v).toFixed(1)}`).join(" ");
  const nowI = temps.length - 1;

  return (
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
        <span className="num" style={{ fontSize: 17, color: "var(--amber)" }}>{temps[nowI].toFixed(1)}<span style={{ fontSize: 9, color: "var(--fg-3)" }}>°C</span></span>
        <span className="num" style={{ fontSize: 17, color: "var(--cyan)" }}>{hums[nowI]}<span style={{ fontSize: 9, color: "var(--fg-3)" }}>%</span></span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <defs>
          <linearGradient id="tFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="var(--amber)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* gridline midpoint */}
        <line x1={PAD} x2={W - PAD} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3"/>
        {/* temp fill */}
        <path d={`${path(temps, yT)} L${x(nowI)},${H - PAD} L${x(0)},${H - PAD} Z`} fill="url(#tFill)"/>
        {/* humidity line */}
        <path d={path(hums, yH)} fill="none" stroke="var(--cyan)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
        {/* temp line */}
        <path d={path(temps, yT)} fill="none" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        {/* now markers */}
        <circle cx={x(nowI)} cy={yT(temps[nowI])} r="2.2" fill="var(--amber)"/>
        <circle cx={x(nowI)} cy={yH(hums[nowI])} r="2.2" fill="var(--cyan)"/>
      </svg>
    </div>
  );
};

const ROOM_GROUPS = [
  { id: "living_area", name: "客厅", icon: "home", rooms: ["living", "balcony", "dining", "hall"] },
  { id: "bedrooms", name: "卧室", icon: "bed", rooms: ["master", "brother", "sister"] },
  { id: "bathrooms", name: "卫生间", icon: "drop", rooms: ["mbath", "gbath"] },
  { id: "kitchen", name: "厨房", icon: "leaf", rooms: ["kitchen"] },
  { id: "study", name: "书房", icon: "settings", rooms: ["study"] },
];
const WAKE_CURTAIN_IDS = [
  "cover.xiaomi_cn_877631863_acn010_s_2_curtain",
  "cover.xiaomi_cn_876990609_acn010_s_2_curtain",
  "cover.xiaomi_cn_877633736_acn010_s_2_curtain",
  "cover.xiaomi_cn_875659223_acn010_s_2_curtain",
];
const CURTAIN_FULL_TRAVEL_MS = 30000; // fallback; real value read from sensor
const curtainJourneySensorId = (coverId) =>
  coverId.replace("cover.", "sensor.").replace("_s_2_curtain", "_whole_journey_time_p_2_13");
const mapCurtainService = (service) => {
  if (service === "open_cover") return "close_cover";
  if (service === "close_cover") return "open_cover";
  return service;
};
const DAY_FLOORPLAN_BASE = "../floorplan-day/base.png";
const DAY_CURTAIN_RENDERS = [
  { file: "../floorplan-day-overlay/keting.png", ids: ["cover.xiaomi_cn_875660422_acn010_s_2_curtain"] },
  { file: "../floorplan-day-overlay/shufang.png", ids: ["cover.xiaomi_cn_877631852_acn010_s_2_curtain"] },
  { file: "../floorplan-day-overlay/didi.png", ids: ["cover.xiaomi_cn_877633736_acn010_s_2_curtain"] },
  { file: "../floorplan-day-overlay/zhuwo.png", ids: ["cover.xiaomi_cn_877631863_acn010_s_2_curtain", "cover.xiaomi_cn_876990609_acn010_s_2_curtain"] },
  { file: "../floorplan-day-overlay/jiejie.png", ids: ["cover.xiaomi_cn_875659223_acn010_s_2_curtain"] },
];
const CLIMATE_LAST_MODE_KEY = "ha-dashboard-last-climate-modes";
const ROBOROCK_VACUUM_ID = "vacuum.g20";
const ROBOROCK_STATUS_SENSOR = "sensor.g20_status";
const ROBOROCK_AFTER_MEAL_BUTTON = "button.g20_fan_hou_qing_ji";
const INDOOR_PM25_SENSOR = "sensor.zhimi_cn_44409495_m1_pm2_5_density_p_3_2";

const ROBOT_STATE_LABELS = {
  cleaning: "清扫中",
  docked: "已停靠",
  idle: "待机",
  paused: "已暂停",
  returning: "回充中",
  unavailable: "离线",
  unknown: "未知",
  "充电中": "充电中",
  "返回充电": "返回充电",
  "清洗拖布": "清洗拖布",
  "正在清扫": "正在清扫",
};

const ROBOT_CONSUMABLES = [
  { label: "主刷", id: "sensor.g20_main_brush_time_left", baselineHours: 279, baselinePercent: 93 },
  { label: "边刷", id: "sensor.g20_side_brush_time_left", baselineHours: 120, baselinePercent: 61 },
  { label: "滤网", id: "sensor.g20_filter_time_left", baselineHours: 130, baselinePercent: 87 },
  { label: "传感器", id: "sensor.g20_sensor_time_left", baselineHours: 8, baselinePercent: 25 },
];

const ROBOT_DOCK_ITEMS = [
  { label: "过滤器剩余寿命", id: "sensor.g20_dock_strainer_time_left", kind: "hours" },
  { label: "基座出错", id: "sensor.g20_dock_dock_error", kind: "error" },
  { label: "清洁液", id: "binary_sensor.g20_dock_cleaning_fluid", kind: "fluid" },
  { label: "拖把干燥", id: "sensor.g20_dock_mop_drying_remaining_time", kind: "time" },
  { label: "维护刷剩余寿命", id: "sensor.g20_dock_maintenance_brush_time_left", kind: "hours" },
];

const consumablePercentColor = (percent) => {
  if (percent <= 25) return "var(--rose)";
  if (percent <= 50) return "var(--amber)";
  return "var(--mint)";
};

const assetUrl = (path) => {
  const version = new URLSearchParams(location.search).get("v");
  return version ? `${path}?v=${encodeURIComponent(version)}` : path;
};

const lightFixtureClass = (light) => {
  if (light.name === "客厅") return "ceiling-xl";
  if (light.name === "餐厅") return "linear dining-linear";
  if (light.id === "light.yeelink_cn_2006173280_ceil45_s_2_light" || light.id === "light.yeelink_cn_962306557_ceil45_s_2_light") return "ceiling-md compact-room-light";
  if (["主卧", "弟弟房", "姐姐房", "书房"].includes(light.name)) return "ceiling-md";
  if (["主卫", "客卫"].includes(light.name)) return "ceiling-sm";
  if (["走道", "入户", "窗台射灯", "窗台筒灯", "主卧射灯", "洗手台"].includes(light.name)) return "spot";
  if (light.kind === "spot") return "spot";
  return "ceiling-sm";
};

const V2RefinedHA = () => {
  // Real HA state — derive from window.__haStates (updated on every WS push)
  const haStates = window.__haStates || {};
  const hc = window.haClient;
  const isOn = (id) => haStates[id]?.state === "on";
  const climateActive = (id) => {
    const s = haStates[id]?.state;
    return s && s !== "off" && s !== "unavailable" && s !== "unknown";
  };
  const coverPos = (id) => {
    const st = haStates[id];
    if (!st) return 0;
    const p = st.attributes?.current_position;
    if (typeof p === "number") return 100 - p;
    return st.state === "open" ? 0 : 100;
  };

  const onLights = useMemo(() => {
    const s = new Set();
    for (const l of LIGHTS) if (isOn(l.id)) s.add(l.id);
    return s;
  }, [haStates]);

  const acOn = useMemo(() => {
    const s = new Set();
    for (const c of CLIMATES) if (climateActive(c.id)) s.add(c.id);
    return s;
  }, [haStates]);

  const [curtainAnimPos, setCurtainAnimPos] = useState({});

  const curtainOpen = useMemo(() => {
    const m = {};
    for (const c of CURTAINS) {
      const anim = curtainAnimPos[c.id];
      m[c.id] = anim !== undefined ? 100 - anim : coverPos(c.id);
    }
    return m;
  }, [haStates, curtainAnimPos]);

  const acTargets = useMemo(() => {
    const m = {};
    for (const c of CLIMATES) {
      const t = haStates[c.id]?.attributes?.temperature;
      m[c.id] = typeof t === "number" ? Math.round(t) : c.target;
    }
    return m;
  }, [haStates]);
  const hasCooling = useMemo(() => CLIMATES.some(c => haStates[c.id]?.state === "cool"), [haStates]);
  const hasHeating = useMemo(() => CLIMATES.some(c => haStates[c.id]?.state === "heat"), [haStates]);
  const canUseClimateMode = useCallback((mode) => {
    if (mode === "cool" && hasHeating) return false;
    if (mode === "heat" && hasCooling) return false;
    return true;
  }, [hasCooling, hasHeating]);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeScene, setActiveScene] = useState(null);
  const [showAll, setShowAll] = useState(true);
  const [floorplanModeOverride, setFloorplanModeOverride] = useState(null);
  const [selectedClimateId, setSelectedClimateId] = useState(null);
  const [localClimateTemps, setLocalClimateTemps] = useState({});
  const [robotButtonStatus, setRobotButtonStatus] = useState(null);
  const [showDockStatus, setShowDockStatus] = useState(false);
  const [lastClimateModes, setLastClimateModes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CLIMATE_LAST_MODE_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const curtainClickTimersRef = React.useRef({});
  const curtainSceneTimersRef = React.useRef([]);
  const curtainStartRef = React.useRef({});
  // debug expose
  useEffect(() => { window.__curtainStartRef = curtainStartRef; window.__setCurtainAnimPos = setCurtainAnimPos; }, []);
  const selectedRooms = useMemo(() => {
    if (!selectedRoom) return null;
    return new Set(ROOM_GROUPS.find(r => r.id === selectedRoom)?.rooms || [selectedRoom]);
  }, [selectedRoom]);

  // Live clock — tick every 20s
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(t);
  }, []);
  const timeStr = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = `周${"日一二三四五六"[now.getDay()]} · ${now.getMonth()+1}月${now.getDate()}日`;

  // Weather — auto-pick first weather.* entity
  const weatherEntity = useMemo(() => {
    for (const k of Object.keys(haStates)) if (k.startsWith("weather.")) return k;
    return null;
  }, [haStates]);
  const weather = weatherEntity ? haStates[weatherEntity] : null;
  const WX_ICON = {
    "sunny": "sun", "clear-night": "moon", "cloudy": "cloud", "partlycloudy": "cloud",
    "rainy": "drop", "pouring": "drop", "snowy": "snow", "windy": "wind",
    "fog": "cloud", "hail": "drop", "lightning": "bolt", "lightning-rainy": "bolt",
  };
  const WX_LABEL = {
    "sunny": "晴", "clear-night": "夜间晴", "cloudy": "多云", "partlycloudy": "少云",
    "rainy": "雨", "pouring": "大雨", "snowy": "雪", "windy": "大风",
    "fog": "雾", "hail": "冰雹", "lightning": "雷", "lightning-rainy": "雷雨",
  };
  const wxIcon = weather ? (WX_ICON[weather.state] || "cloud") : "moon";
  const wxLabel = weather ? (WX_LABEL[weather.state] || weather.state) : "—";
  const wxTemp = weather?.attributes?.temperature;
  const isRaining = ["rainy", "pouring", "lightning-rainy"].includes(weather?.state);
  const robotState = haStates[ROBOROCK_VACUUM_ID]?.state || "unknown";
  const robotStatusState = haStates[ROBOROCK_STATUS_SENSOR]?.state;
  const robotAttrs = haStates[ROBOROCK_VACUUM_ID]?.attributes || {};
  const robotBattery = typeof robotAttrs.battery_level === "number" ? robotAttrs.battery_level : null;
  const robotFanSpeed = robotAttrs.fan_speed || robotAttrs.fan_speed_list?.[0] || "默认";
  const robotStatusLabel = ROBOT_STATE_LABELS[robotStatusState] || ROBOT_STATE_LABELS[robotState] || robotStatusState || robotState;
  const robotDocked = robotState === "docked" || robotStatusState === "充电中";
  const indoorPm25Value = Number.parseFloat(haStates[INDOOR_PM25_SENSOR]?.state);
  const indoorPm25 = Number.isFinite(indoorPm25Value) ? Math.round(indoorPm25Value) : null;
  const robotConsumables = ROBOT_CONSUMABLES.map(item => {
    const raw = haStates[item.id]?.state;
    const remaining = Number.parseFloat(raw);
    const totalHours = item.baselineHours / (item.baselinePercent / 100);
    const percent = Number.isFinite(remaining)
      ? Math.max(0, Math.min(100, Math.round((remaining / totalHours) * 100)))
      : item.baselinePercent;
    return {
      label: item.label,
      v: percent,
      c: consumablePercentColor(percent),
    };
  });
  const readDockNumber = (id) => Number.parseFloat(haStates[id]?.state);
  const readDockValue = (id) => {
    const st = haStates[id];
    if (!st || st.state === "unknown" || st.state === "unavailable") return "--";
    return st.state;
  };
  const formatDockTime = (item) => {
    const value = readDockValue(item.id);
    if (value === "--") return value;
    const unit = haStates[item.id]?.attributes?.unit_of_measurement || "小时";
    return `${value}${unit}`;
  };
  const isDockErrorState = (value) => {
    if (!value || value === "--") return false;
    const normal = ["0", "none", "ok", "off", "无", "正常", "无错误", "无故障"];
    return !normal.includes(String(value).trim().toLowerCase());
  };
  const dockStatusItems = ROBOT_DOCK_ITEMS.map(item => {
    const raw = readDockValue(item.id);
    if (item.kind === "error") {
      const hasError = isDockErrorState(raw);
      return { ...item, value: hasError ? raw : "正常", error: hasError };
    }
    if (item.kind === "fluid") {
      const error = raw === "on";
      return { ...item, value: raw === "off" ? "正常" : raw === "on" ? "不足" : raw, error };
    }
    const num = readDockNumber(item.id);
    const error = item.kind === "hours" && Number.isFinite(num) && num <= 0;
    return { ...item, value: formatDockTime(item), error };
  });
  const dockErrors = dockStatusItems.filter(item => item.error).map(item => `${item.label}: ${item.value}`);
  const dockStatusText = dockErrors.length ? dockErrors.join(" / ") : "基座正常";

  // Curtain travel animation — interpolate position since Xiaomi covers don't push mid-travel updates
  useEffect(() => {
    for (const c of CURTAINS) {
      const state = haStates[c.id]?.state;
      const pos = haStates[c.id]?.attributes?.current_position;
      const moving = state === "opening" || state === "closing";
      const tracked = curtainStartRef.current[c.id];
      if (moving && !tracked) {
        const fromPos = typeof pos === "number" ? pos : (state === "opening" ? 0 : 100);
        const toPos = state === "opening" ? 100 : 0;
        const journeySecs = parseFloat(haStates[curtainJourneySensorId(c.id)]?.state);
        const fullTravelMs = Number.isFinite(journeySecs) ? journeySecs * 1000 : CURTAIN_FULL_TRAVEL_MS;
        curtainStartRef.current[c.id] = { time: Date.now(), fromPos, toPos, fullTravelMs };
      } else if (!moving && tracked) {
        // Only clear when HA position has settled at the expected destination.
        // Xiaomi curtains sometimes emit a transient state=open/closed with pos still
        // at the old value, which would cause a 1-frame flash back to the start position.
        const posSettled = typeof pos === "number" && Math.abs(pos - tracked.toPos) <= 5;
        if (posSettled) {
          delete curtainStartRef.current[c.id];
          setCurtainAnimPos(prev => { const n = { ...prev }; delete n[c.id]; return n; });
        } else {
          // Keep animPos pinned at toPos until position settles
          setCurtainAnimPos(prev => ({ ...prev, [c.id]: tracked.toPos }));
        }
      }
    }
  }, [haStates]);
  useEffect(() => {
    const timer = setInterval(() => {
      const starts = curtainStartRef.current;
      if (!Object.keys(starts).length) return;
      setCurtainAnimPos(() => {
        const next = {};
        for (const [id, { time, fromPos, toPos, fullTravelMs }] of Object.entries(starts)) {
          const dist = Math.abs(toPos - fromPos);
          const totalMs = (dist / 100) * fullTravelMs;
          const t = totalMs > 0 ? Math.min((Date.now() - time) / totalMs, 1) : 1;
          next[id] = Math.round(fromPos + (toPos - fromPos) * t);
        }
        return next;
      });
    }, 250);
    return () => clearInterval(timer);
  }, []);

  // Weather forecast — subscribe when weather entity known
  const [forecast, setForecast] = useState([]);
  const [shanghaiAir, setShanghaiAir] = useState(null);
  useEffect(() => {
    if (!weatherEntity || !hc) return;
    const unsub = hc.subscribeForecast(weatherEntity, (f) => {
      setForecast(Array.isArray(f) ? f : []);
    }, "daily");
    return unsub;
  }, [weatherEntity, hc]);
  useEffect(() => {
    let alive = true;
    const loadAir = () => {
      fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=31.2304&longitude=121.4737&current=european_aqi,pm2_5")
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!alive || !data?.current) return;
          setShanghaiAir({
            aqi: Math.round(data.current.european_aqi),
            pm25: Math.round(data.current.pm2_5),
          });
        })
        .catch(() => {});
    };
    loadAir();
    const t = setInterval(loadAir, 30 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  useEffect(() => {
    setLastClimateModes(prev => {
      let changed = false;
      const next = { ...prev };
      for (const c of CLIMATES) {
        const mode = haStates[c.id]?.state;
        if (mode === "cool" || mode === "heat" || mode === "fan_only") {
          if (next[c.id] !== mode) {
            next[c.id] = mode;
            changed = true;
          }
        }
      }
      if (changed) localStorage.setItem(CLIMATE_LAST_MODE_KEY, JSON.stringify(next));
      return changed ? next : prev;
    });
  }, [haStates]);
  const bulkAcStaggerRef = React.useRef(null);
  const bulkAc = useCallback((target, mode = "cool") => {
    if (!canUseClimateMode(mode)) return;
    if (bulkAcStaggerRef.current) {
      bulkAcStaggerRef.current.forEach(t => clearTimeout(t));
    }
    const timers = [];
    CLIMATES.forEach((c, i) => {
      const t = setTimeout(() => {
        hc?.callService("climate", "set_hvac_mode", { entity_id: c.id, hvac_mode: mode });
        hc?.callService("climate", "set_temperature", { entity_id: c.id, temperature: target });
      }, (i + 1) * 2000);
      timers.push(t);
    });
    bulkAcStaggerRef.current = timers;
  }, [canUseClimateMode, hc]);

  const applyScene = useCallback((sceneId) => {
    setActiveScene(sceneId);
    if (sceneId === "scene.home") {
      hc?.callService("scene", "turn_on", { entity_id: "scene.home_return" });
    } else if (sceneId === "scene.away") {
      hc?.callService("scene", "turn_on", { entity_id: "scene.home_away" });
    } else if (sceneId === "scene.wake") {
      curtainSceneTimersRef.current.forEach(t => clearTimeout(t));
      curtainSceneTimersRef.current = [];
      const target = 70;
      WAKE_CURTAIN_IDS.forEach(id => {
        const current = curtainOpen[id] || 0;
        const delta = target - current;
        if (Math.abs(delta) < 2) return;
        const service = delta > 0 ? "open_cover" : "close_cover";
        const duration = Math.max(400, Math.round(Math.abs(delta) * CURTAIN_FULL_TRAVEL_MS / 100));
        hc?.callService("cover", mapCurtainService(service), { entity_id: id });
        const timer = setTimeout(() => {
          hc?.callService("cover", "stop_cover", { entity_id: id });
        }, duration);
        curtainSceneTimersRef.current.push(timer);
      });
    }
  }, [curtainOpen, hc]);

  const toggleLight = useCallback((id) => {
    hc?.callService("light", "toggle", { entity_id: id });
  }, [hc]);
  const toggleAc = (id) => {
    if (climateActive(id)) {
      const mode = haStates[id]?.state;
      if (mode === "cool" || mode === "heat" || mode === "fan_only") {
        setLastClimateModes(prev => {
          const next = { ...prev, [id]: mode };
          localStorage.setItem(CLIMATE_LAST_MODE_KEY, JSON.stringify(next));
          return next;
        });
      }
      hc?.callService("climate", "set_hvac_mode", { entity_id: id, hvac_mode: "off" });
    } else {
      const rememberedMode = hasHeating ? "heat" : hasCooling ? "cool" : lastClimateModes[id] || "cool";
      const mode = canUseClimateMode(rememberedMode) ? rememberedMode : "fan_only";
      hc?.callService("climate", "set_hvac_mode", { entity_id: id, hvac_mode: mode });
    }
  };
  const setClimateMode = (id, mode) => {
    if (!canUseClimateMode(mode)) return;
    if (mode === "cool" || mode === "heat" || mode === "fan_only") {
      setLastClimateModes(prev => {
        const next = { ...prev, [id]: mode };
        localStorage.setItem(CLIMATE_LAST_MODE_KEY, JSON.stringify(next));
        return next;
      });
    }
    hc?.callService("climate", "set_hvac_mode", { entity_id: id, hvac_mode: mode });
  };
  const setClimateTemp = (id, temperature) => {
    const temp = Number(temperature);
    setLocalClimateTemps(prev => ({ ...prev, [id]: temp }));
    hc?.callService("climate", "set_temperature", { entity_id: id, temperature: temp });
  };
  const setFanMode = (id, fan_mode) => {
    hc?.callService("climate", "set_fan_mode", { entity_id: id, fan_mode });
  };
  const allOff = () => {
    for (const l of LIGHTS) if (isOn(l.id)) hc?.callService("light", "turn_off", { entity_id: l.id });
  };
  const runRobotButton = (entityId) => {
    if (!hc?.connected) {
      setRobotButtonStatus("未连接");
      setTimeout(() => setRobotButtonStatus(null), 1400);
      return;
    }
    setRobotButtonStatus("发送中");
    Promise.resolve(hc.callService("button", "press", { entity_id: entityId }))
      .then(() => {
        setRobotButtonStatus("已发送");
        setTimeout(() => setRobotButtonStatus(null), 1400);
      })
      .catch(() => {
        setRobotButtonStatus("失败");
        setTimeout(() => setRobotButtonStatus(null), 1800);
      });
  };
  const runRobotService = (service) => {
    if (!hc?.connected) {
      setRobotButtonStatus("未连接");
      setTimeout(() => setRobotButtonStatus(null), 1400);
      return;
    }
    setRobotButtonStatus("发送中");
    Promise.resolve(hc.callService("vacuum", service, { entity_id: ROBOROCK_VACUUM_ID }))
      .then(() => {
        setRobotButtonStatus("已发送");
        setTimeout(() => setRobotButtonStatus(null), 1200);
      })
      .catch(() => {
        setRobotButtonStatus("失败");
        setTimeout(() => setRobotButtonStatus(null), 1800);
      });
  };
  const setCurtainOpen = (updater) => {
    const newMap = typeof updater === "function" ? updater(curtainOpen) : updater;
    for (const c of CURTAINS) {
      const cur = curtainOpen[c.id];
      const next = newMap[c.id];
      if (cur === next || next === undefined) continue;
      if (next > 0) hc?.callService("cover", mapCurtainService("open_cover"), { entity_id: c.id });
      else hc?.callService("cover", mapCurtainService("close_cover"), { entity_id: c.id });
    }
  };
  const curtainPercent = (id) => curtainOpen[id] || 0;
  const curtainDirection = (id) => {
    const direction = haStates[id]?.attributes?.moving_direction || haStates[id]?.state;
    if (direction === "opening") return "closing";
    if (direction === "closing") return "opening";
    return direction;
  };
  const runCurtain = (id, service) => hc?.callService("cover", mapCurtainService(service), { entity_id: id });
  const toggleCurtain = (id) => {
    const state = haStates[id]?.state;
    const percent = curtainPercent(id);
    const direction = curtainDirection(id);
    if (state === "opening" || state === "closing") {
      runCurtain(id, "stop_cover");
    } else if (state === "paused") {
      runCurtain(id, direction === "opening" ? "open_cover" : "close_cover");
    } else {
      runCurtain(id, percent >= 100 ? "close_cover" : "open_cover");
    }
  };
  const reverseCurtain = (id) => {
    const direction = curtainDirection(id);
    const percent = curtainPercent(id);
    if (direction === "opening") {
      runCurtain(id, "close_cover");
    } else if (direction === "closing") {
      runCurtain(id, "open_cover");
    } else {
      runCurtain(id, percent > 0 ? "close_cover" : "open_cover");
    }
  };
  const handleCurtainClick = (id) => {
    const timers = curtainClickTimersRef.current;
    if (timers[id]) clearTimeout(timers[id]);
    timers[id] = setTimeout(() => {
      delete timers[id];
      toggleCurtain(id);
    }, 230);
  };
  const handleCurtainDoubleClick = (id) => {
    const timers = curtainClickTimersRef.current;
    if (timers[id]) {
      clearTimeout(timers[id]);
      delete timers[id];
    }
    reverseCurtain(id);
  };

  // Stats
  const roomCounts = useMemo(() => {
    const m = {};
    for (const group of ROOM_GROUPS) {
      const rooms = new Set(group.rooms);
      m[group.id] = { total: 0, on: 0 };
      for (const l of LIGHTS) {
        if (!rooms.has(l.room)) continue;
        m[group.id].total += 1;
        if (onLights.has(l.id)) m[group.id].on += 1;
      }
    }
    return m;
  }, [onLights]);
  const totalLightsOn = onLights.size;
  const totalAcOn = acOn.size;

  // Filter lights by selected room (for highlighting)
  const visibleLights = LIGHTS;

  // Approx live power: 35W per active ceil + 15W per active spot + 700W per active AC
  const livePower = useMemo(() => {
    let w = 0;
    for (const l of LIGHTS) if (onLights.has(l.id)) w += (l.kind === "spot" ? 15 : 35);
    w += acOn.size * 720;
    return w;
  }, [onLights, acOn]);
  const params = new URLSearchParams(location.search);
  const previewHour = params.has("preview") ? Number(params.get("hour")) : NaN;
  const floorplanHour = Number.isFinite(previewHour) ? previewHour : now.getHours();
  const autoDayFloorplan = floorplanHour >= 6 && floorplanHour < 17;
  const isDayFloorplan = floorplanModeOverride ? floorplanModeOverride === "day" : autoDayFloorplan;
  const floorplanBase = isDayFloorplan ? DAY_FLOORPLAN_BASE : FLOORPLAN_BASE;
  const toggleFloorplanMode = () => {
    setFloorplanModeOverride(isDayFloorplan ? "night" : "day");
  };
  const toggleFullscreen = () => {
    const root = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    const request = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
    request?.call(root);
  };

  return (
    <div className="tablet">
      <div className="wallpaper"/>

      {/* ===== Top bar ===== */}
      <div style={{
        position: "absolute", top: 16, left: 20, right: 20, height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button type="button" className="home-fullscreen-btn" onClick={toggleFullscreen} title="全屏">
            <Icon name="home" size={20} style={{ color: "var(--amber)" }}/>
          </button>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="num" style={{ fontSize: 28, fontWeight: 200, letterSpacing: "-0.01em" }}>{timeStr}</span>
            <span className="lab">{dateStr}</span>
          </div>
          <span className="chip"><span className="dot mint"></span> 全部正常</span>
          <span className="chip"><Icon name="bulb" size={11} style={{ color: "var(--amber)" }}/> {totalLightsOn} 盏开启</span>
          <span className="chip"><Icon name="snow" size={11} style={{ color: "var(--cyan)" }}/> {totalAcOn} 台空调</span>
          <span className="chip"><Icon name="cam" size={11} style={{ color: "var(--mint)" }}/> 4 摄像头</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--fg-2)" }}>
          <WeatherChip temp={typeof wxTemp === "number" ? Math.round(wxTemp) : "--"} label={wxLabel} icon={wxIcon}/>
          {forecast.length > 0 && <div style={{ width: 1, height: 36, background: "var(--stroke)" }}/>}
          {forecast.slice(0, 3).map((f, i) => {
            const d = new Date(f.datetime);
            const wd = "周" + "日一二三四五六"[d.getDay()];
            const ic = WX_ICON[f.condition] || "cloud";
            const hi = f.temperature;
            const lo = f.templow;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, minWidth: 38 }}>
                <span className="lab" style={{ fontSize: 9 }}>{wd}</span>
                <Icon name={ic} size={14} style={{ color: "var(--fg-2)" }}/>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span className="num" style={{ fontSize: 11, color: "var(--fg)", fontWeight: 500 }}>{typeof hi === "number" ? Math.round(hi) : "--"}°</span>
                  <span className="num" style={{ fontSize: 9, color: "var(--fg-3)" }}>{typeof lo === "number" ? Math.round(lo) : "--"}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Left rail — rooms ===== */}
      <div className="glass" style={{
        position: "absolute", left: 20, top: 84, bottom: 176, width: 184,
        padding: 12, display: "flex", flexDirection: "column", gap: 6
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 6px 6px" }}>
          <span className="eyebrow">房间</span>
          <span className="num lab">{ROOM_GROUPS.length}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }} className="no-scrollbar">
          {ROOM_GROUPS.map(r => {
            const c = roomCounts[r.id] || { total: 0, on: 0 };
            const sel = selectedRoom === r.id;
            const hasOn = c.on > 0;
            return (
              <div key={r.id}
                   className={`room-row ${sel ? "sel" : ""} ${hasOn ? "has-on" : ""}`}
                   onClick={() => setSelectedRoom(sel ? null : r.id)}>
                <div className="ico"><Icon name={r.icon} size={15}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: sel ? "var(--fg)" : "var(--fg-2)" }}>{r.name}</div>
                  <div className="lab" style={{ fontSize: 10, marginTop: 1 }}>
                    {c.on}/{c.total} 灯
                  </div>
                </div>
                {hasOn && <span className="dot amber" style={{ width: 6, height: 6 }}/>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6, paddingTop: 6, borderTop: "1px solid var(--stroke)" }}>
          <div className="tap glass-strong" style={{ flex: 1, padding: "8px", borderRadius: 10, textAlign: "center", fontSize: 12, color: "var(--fg-2)" }}
               onClick={allOff}>
            全部关闭
          </div>
          <div className="tap glass-strong" style={{ width: 36, padding: "8px", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-2)" }}
               onClick={() => setShowAll(v => !v)} title="开关其他">
            <Icon name={showAll ? "wifi" : "wifi"} size={13}/>
          </div>
        </div>
      </div>

      {/* ===== Centre — floorplan ===== */}
      <div className="glass" style={{
        position: "absolute", left: 216, right: 216, top: 84, bottom: 176,
        padding: 12, display: "flex", flexDirection: "column", gap: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="eyebrow">
            {selectedRoom ? ROOMS.find(r => r.id === selectedRoom)?.name : "我的家 · 户型"}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {(() => {
              const indoorPmColor = indoorPm25 == null ? "var(--fg-3)" : indoorPm25 < 50 ? "var(--mint)" : indoorPm25 < 100 ? "var(--amber)" : "var(--rose)";
              return (
                <span className="chip">
                  <Icon name="thermo" size={11}/> 室内 22.4° · 湿 48% · PM2.5 <span className="num" style={{ color: indoorPmColor }}>{indoorPm25 ?? "--"}</span>
                </span>
              );
            })()}
            {(() => {
              const aqi = shanghaiAir?.aqi;
              const outdoorPm = shanghaiAir?.pm25;
              const col = !aqi ? "var(--fg-3)" : aqi < 50 ? "var(--mint)" : aqi < 100 ? "var(--amber)" : "var(--rose)";
              const pmCol = outdoorPm == null ? "var(--fg-3)" : outdoorPm < 50 ? "var(--mint)" : outdoorPm < 100 ? "var(--amber)" : "var(--rose)";
              return (
                <span className="chip" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="wave" size={11} style={{ color: col }}/>
                  <span style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: "0.04em" }}>上海 AQI</span>
                  <span className="num" style={{ fontSize: 15, color: col, fontWeight: 500, lineHeight: 1 }}>{aqi ?? "--"}</span>
                  {outdoorPm != null && <span className="lab" style={{ fontSize: 9 }}>PM2.5 <span className="num" style={{ color: pmCol }}>{outdoorPm}</span></span>}
                </span>
              );
            })()}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
          <div style={{ position: "relative", width: "100%", height: "100%", maxHeight: "100%" }}>
            <div className="fp-stack">
              <div className="fp-zoom-layer">
                <img className="fp-base" src={assetUrl(floorplanBase)} alt=""/>
                {isDayFloorplan && DAY_CURTAIN_RENDERS.map(item => {
                  const opacity = Math.max(...item.ids.map(id => curtainOpen[id] || 0)) / 100;
                  return (
                    <img key={item.file}
                         className="fp-curtain-render"
                         src={assetUrl(item.file)} alt=""
                         style={{ opacity }}/>
                  );
                })}
                {/* Light render overlays */}
                {!isDayFloorplan && LIGHTS.filter(l => l.hasRender).map(l => (
                  <img key={l.id}
                       className={`fp-on ${onLights.has(l.id) ? "active" : ""}`}
                       src={assetUrl(`assets/floorplan/${l.id}.png`)} alt=""/>
                ))}

              {/* Light dots */}
              {visibleLights.map(l => {
                const on = onLights.has(l.id);
                const dim = selectedRooms && !selectedRooms.has(l.room);
                if (!showAll && !on) return null;
                return (
                  <div key={l.id}
                       className={`lite-dot ${lightFixtureClass(l)} ${on ? "on" : ""}`}
                       style={{
                          left: `${l.x}%`, top: `${l.name === "餐厅" ? l.y + 1.5 : l.y}%`,
                          opacity: dim ? 0.25 : 1,
                        }}
                       onClick={() => toggleLight(l.id)}>
                    <span className="fixture-core"/>
                    <span className="dot-tip">{l.name}</span>
                  </div>
                );
              })}

              {/* Climate dots */}
              {CLIMATES.map(c => {
                const on = acOn.has(c.id);
                const mode = haStates[c.id]?.state;
                const heat = mode === "heat";
                const fan = mode === "fan_only";
                const dim = selectedRooms && !selectedRooms.has(c.room);
                const flipped = c.room === "brother" || c.room === "study";
                const topOffset = c.room === "study" ? -3.5 : flipped ? -2 : 0;
                return (
                  <div key={c.id}
                       className={`ac-flow ${on ? "on" : ""} ${fan ? "fan" : heat ? "heat" : "cool"} ${flipped ? "flip" : ""}`}
                       style={{ left: `${c.x}%`, top: `${c.y + topOffset}%`, opacity: dim ? 0.25 : 1 }}
                       onClick={() => toggleAc(c.id)}>
                    <span className="ac-vent"/>
                    <span className="air air-1"/>
                    <span className="air air-2"/>
                    <span className="air air-3"/>
                    <span className="dot-tip">{c.name} · {acTargets[c.id] ?? c.target}°</span>
                  </div>
                );
              })}

              {/* Curtain dots */}
              {CURTAINS.map(cv => {
                const open = curtainOpen[cv.id] || 0;
                const active = open > 0;
                const state = haStates[cv.id]?.state;
                const moving = state === "opening" || state === "closing";
                const dim = selectedRooms && !selectedRooms.has(cv.room);
                return (
                  <div key={cv.id}
                       className={`dev-dot cur ${active ? "on" : ""} ${moving ? "moving" : ""}`}
                       style={{ left: `${cv.x}%`, top: `${cv.y}%`, opacity: dim ? 0.25 : active ? 1 : 0.28 }}
                       onClick={() => handleCurtainClick(cv.id)}
                       onDoubleClick={() => handleCurtainDoubleClick(cv.id)}>
                    <Icon name="blinds" size={10}/>
                    <span className="dot-tip">{cv.name} · {open}%</span>
                  </div>
                );
              })}

              </div>
              {isRaining && <div className="rain-overlay" aria-hidden="true"/>}

              <button className={`fp-mode-toggle ${isDayFloorplan ? "day" : "night"}`}
                      type="button"
                      title={isDayFloorplan ? "切换夜间图" : "切换白天图"}
                      onClick={toggleFloorplanMode}>
                <span className="mode-knob"/>
                <span className="mode-icon sun-icon"><Icon name="sun" size={12}/></span>
                <span className="mode-icon moon-icon"><Icon name="moon" size={12}/></span>
              </button>

              {/* Legend */}
              <div className="fp-overlay-chip" style={{ right: 10, bottom: 10 }}>
                <span className="dot amber" style={{ width: 6, height: 6 }}/> 灯
                <span className="dot cyan" style={{ width: 6, height: 6, marginLeft: 8 }}/> 空调
                <span className="dot mint" style={{ width: 6, height: 6, marginLeft: 8 }}/> 窗帘
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Right rail — climate + sensors ===== */}
      <div style={{
        position: "absolute", right: 20, top: 84, bottom: 176, width: 184,
        display: "flex", flexDirection: "column", gap: 12
      }}>
        {/* Climate compact list */}
        <div className="glass" style={{ flex: 1, minHeight: 0, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="eyebrow">空调</span>
            <span className="num lab">{acOn.size}/{CLIMATES.length}</span>
          </div>
          <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {CLIMATES.map(c => {
            const on = acOn.has(c.id);
            const tgt = acTargets[c.id];
            const mode = haStates[c.id]?.state;
            const heat = mode === "heat";
            const fan = mode === "fan_only";
            const accent = fan ? "var(--fg)" : heat ? "var(--amber)" : "var(--cyan)";
            const accentBg = fan ? "rgba(255,255,255,0.07)" : heat ? "rgba(228,170,90,0.10)" : "rgba(120,180,230,0.10)";
            const accentBorder = fan ? "rgba(255,255,255,0.22)" : heat ? "rgba(228,170,90,0.3)" : "rgba(120,180,230,0.3)";
            return (
              <div key={c.id} className={`ac-row ${on ? "on" : ""}`}
                   style={on ? { background: accentBg, borderColor: accentBorder } : undefined}>
                <div style={{ minWidth: 0, cursor: "pointer" }}
                     onClick={() => setSelectedClimateId(id => id === c.id ? null : c.id)}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: on ? "var(--fg)" : "var(--fg-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                  <div className="lab" style={{ fontSize: 11, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {on ? `现 ${c.current}°` : `待机 · 现 ${c.current}°`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {on && <span className="num" style={{ fontSize: 14, color: accent, marginRight: 4 }}>{acTargets[c.id]}°</span>}
                  <span className={`sw sw-mini ${on ? "on" : ""}`} style={{ width: 32, height: 18, background: on ? accent : "rgba(255,255,255,0.10)" }}
                        onClick={(e) => { e.stopPropagation(); toggleAc(c.id); }}>
                    <span style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 200ms" }}/>
                  </span>
                </div>
              </div>
            );
          })}
          </div>
          <div style={{ display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid var(--stroke)" }}>
            <div className="tap glass-strong" style={{ flex: 1, padding: "6px 5px", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 11, color: "var(--cyan)" }}
                 onClick={() => bulkAc(22, "cool")}>
              <Icon name="snow" size={11}/> 22°
            </div>
            <div className="tap glass-strong" style={{ flex: 1, padding: "6px 5px", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 11, color: "var(--amber)" }}
                 onClick={() => bulkAc(30, "heat")}>
              <Icon name="sun" size={11}/> 30°
            </div>
            <div className="tap glass-strong" style={{ flex: 1, padding: "6px 5px", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 11, color: "var(--fg-2)" }}
                  onClick={() => {
                    for (const c of CLIMATES) hc?.callService("climate", "set_hvac_mode", { entity_id: c.id, hvac_mode: "off" });
                  }}>
              <Icon name="power" size={11}/> 关闭
            </div>
          </div>
        </div>

        {/* Energy */}
      </div>

      {(() => {
        const selected = CLIMATES.find(c => c.id === selectedClimateId);
        if (!selected) return null;
        const mode = haStates[selected.id]?.state || "off";
        const attrs = haStates[selected.id]?.attributes || {};
        const modalMode = mode === "cool" ? "cool" : mode === "heat" ? "heat" : mode === "fan_only" ? "fan" : mode === "dry" ? "dry" : "off";
        const temp = localClimateTemps[selected.id] ?? acTargets[selected.id] ?? selected.target;
        const coolDisabled = !canUseClimateMode("cool");
        const heatDisabled = !canUseClimateMode("heat");
        const fanMode = attrs.fan_mode || "";
        const FAN_MODES = [
          { ha: "自动", label: "自动", cls: "auto" },
          { ha: "低风", label: "低速", cls: "low" },
          { ha: "中风", label: "中速", cls: "mid" },
          { ha: "高风", label: "高速", cls: "high" },
        ];
        return (
          <div className="ac-modal-backdrop" onClick={() => setSelectedClimateId(null)}>
            <div className={`ac-modal ${modalMode}`} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: "var(--fg)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selected.name}</div>
                  <div className="lab" style={{ fontSize: 11, marginTop: 2 }}>{mode === "off" ? "待机" : "运行中"}</div>
                </div>
                <button className="ac-modal-close" type="button" onClick={() => setSelectedClimateId(null)}>×</button>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 12 }}>
                <span className="num ac-modal-temp">{temp}</span>
                <span style={{ fontSize: 16, color: "var(--fg-2)" }}>°C</span>
              </div>
              <div className="ac-mode-grid ac-mode-grid-4">
                <button type="button" className={`ac-mode-btn cool ${mode === "cool" ? "on" : ""}`} disabled={coolDisabled} title={coolDisabled ? "已有空调在制热" : undefined} onClick={() => setClimateMode(selected.id, "cool")}>
                  <Icon name="snow" size={12}/> 制冷
                </button>
                <button type="button" className={`ac-mode-btn heat ${mode === "heat" ? "on" : ""}`} disabled={heatDisabled} title={heatDisabled ? "已有空调在制冷" : undefined} onClick={() => setClimateMode(selected.id, "heat")}>
                  <Icon name="sun" size={12}/> 制热
                </button>
                <button type="button" className={`ac-mode-btn fan ${mode === "fan_only" ? "on" : ""}`} onClick={() => setClimateMode(selected.id, "fan_only")}>
                  <Icon name="wave" size={12}/> 送风
                </button>
                <button type="button" className={`ac-mode-btn dry ${mode === "dry" ? "on" : ""}`} onClick={() => setClimateMode(selected.id, "dry")}>
                  <Icon name="drop" size={12}/> 除湿
                </button>
              </div>
              <div className="ac-fan-grid" style={{ marginTop: 8 }}>
                {FAN_MODES.map(f => (
                  <button key={f.ha} type="button"
                    className={`ac-fan-btn ${f.cls} ${fanMode === f.ha ? "on" : ""}`}
                    onClick={() => setFanMode(selected.id, f.ha)}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                <span className="lab" style={{ fontSize: 11 }}>18</span>
                <input className="ac-temp-slider" type="range" min="18" max="30" step="1" value={temp}
                       onChange={(e) => setClimateTemp(selected.id, e.target.value)}/>
                <span className="lab" style={{ fontSize: 11 }}>30</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Bottom strip — scenes, curtains, media ===== */}
      {showDockStatus && (
        <div className="ac-modal-backdrop" onClick={() => setShowDockStatus(false)}>
          <div className="dock-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, color: "var(--fg)", fontWeight: 600 }}>G20 基座状态</div>
                <div className="lab" style={{ fontSize: 11, marginTop: 2 }}>{dockErrors.length ? `${dockErrors.length} 条异常` : "全部正常"}</div>
              </div>
              <button className="ac-modal-close" type="button" onClick={() => setShowDockStatus(false)}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {dockStatusItems.map(item => (
                <div key={item.id} className={`dock-status-row ${item.error ? "error" : ""}`}>
                  <span className={`dock-status-dot ${item.error ? "error" : "ok"}`}/>
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                  <span className="num" style={{ color: item.error ? "var(--rose)" : "var(--fg)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: "absolute", left: 20, right: 20, bottom: 16, height: 148,
        display: "flex", gap: 12
      }}>
        {/* Scenes */}
        <div className="glass" style={{ flex: 0.85, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="eyebrow">场景</span>
            <span className="lab" style={{ fontSize: 10 }}>{SCENES.length}</span>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 6 }}>
            {SCENES.map(s => (
              <div key={s.id} className={`scene-tile ${activeScene === s.id ? "on" : ""}`}
                   title={s.id === "scene.wake" ? "双击启用" : undefined}
                   onClick={() => s.id !== "scene.wake" && applyScene(s.id)}
                   onDoubleClick={() => s.id === "scene.wake" && applyScene(s.id)}>
                <Icon name={s.icon} size={18}/>
                <span style={{ fontSize: 11 }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Curtains */}
        <div className="glass" style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 6, minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="eyebrow">窗帘</span>
            <span className="num lab" style={{ fontSize: 10 }}>打开 {Object.values(curtainOpen).filter(v => v > 0).length}/{CURTAINS.length}</span>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(3, minmax(0, 1fr))", gap: 5 }}>
            {CURTAINS.map(cv => {
              const v = curtainOpen[cv.id] || 0;
              const state = haStates[cv.id]?.state;
              const moving = state === "opening" || state === "closing";
              return (
                <div key={cv.id} className={`tap curtain-card ${moving ? "moving" : ""}`} style={{
                  padding: "4px 8px", borderRadius: 8, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, minHeight: 0,
                  background: v > 0 ? "rgba(140,220,180,0.10)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${moving || v > 0 ? "rgba(140,220,180,0.34)" : "var(--stroke)"}`,
                }}
                     onClick={() => handleCurtainClick(cv.id)}
                     onDoubleClick={() => handleCurtainDoubleClick(cv.id)}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, minWidth: 0 }}>
                    <span style={{ fontSize: 11, color: v > 0 ? "var(--fg)" : "var(--fg-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cv.name}</span>
                    <span style={{ fontSize: 10, color: v > 0 ? "var(--mint)" : "var(--fg-2)", flexShrink: 0 }} className="num">{v}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div className={`curtain-fill ${moving ? "moving" : ""}`} style={{ width: `${v}%`, height: "100%", transition: "width 210ms linear" }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Robot vacuum quick card */}
        <div className="glass" style={{ flex: "0 0 240px", padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="vacuum" size={14} style={{ color: "var(--fg-2)" }}/>
            <span className="eyebrow">G20</span>
            <span className="chip" style={{ marginLeft: "auto", padding: "2px 6px", fontSize: 9 }}>
              <span className={`dot ${robotDocked ? "mint" : "cyan"}`} style={{ width: 5, height: 5 }}/> {robotStatusLabel}{robotBattery !== null ? ` · ${robotBattery}%` : ""}
            </span>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <div className="tap glass-strong" onClick={() => runRobotService("start")} style={{ flex: 1, padding: "6px 4px", borderRadius: 9, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 10 }}>
              <Icon name="play" size={12} style={{ color: "var(--cyan)" }}/>
              全屋
            </div>
            <div className="tap glass-strong" data-testid="roborock-after-meal" onClick={() => runRobotButton(ROBOROCK_AFTER_MEAL_BUTTON)} style={{ flex: 1, padding: "6px 4px", borderRadius: 9, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 10 }}>
              <Icon name="leaf" size={12} style={{ color: "var(--mint)" }}/>
              {robotButtonStatus || "饭后"}
            </div>
            <div className="tap glass-strong" onClick={() => runRobotService("return_to_base")} style={{ flex: 1, padding: "6px 4px", borderRadius: 9, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 10 }}>
              <Icon name="home" size={12} style={{ color: "var(--amber)" }}/>
              回充
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {robotConsumables.map((s, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ fontSize: 10, color: "var(--fg-2)" }}>{s.label}</div>
                <div style={{ width: "100%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${s.v}%`, height: "100%", background: s.c }}/>
                </div>
                <div className="num" style={{ fontSize: 10, color: s.c, lineHeight: 1 }}>{s.v}%</div>
              </div>
            ))}
          </div>
          <div className={`dock-status-bar tap ${dockErrors.length ? "error" : "ok"}`} onClick={() => setShowDockStatus(true)}>
            <span className={`dock-status-dot ${dockErrors.length ? "error" : "ok"}`}/>
            <div className="dock-status-marquee">
              <span>{dockStatusText}</span>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="glass" style={{ flex: 1.1, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "linear-gradient(135deg, oklch(0.55 0.16 290), oklch(0.45 0.18 320))", flexShrink: 0 }}/>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>晚安城市</div>
            <div className="lab" style={{ fontSize: 11 }}>陈奕迅 · 客厅 Sonos</div>
            <div className="track" style={{ height: 3 }}>
              <div className="fill" style={{ width: "42%", background: "var(--violet)" }}/>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="tap" style={{ width: 36, height: 36, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--violet)", color: "#0a0a0a" }}>
              <Icon name="pause" size={14}/>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <div className="tap glass-strong" style={{ width: 16, height: 16, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="skip-prev" size={9}/></div>
              <div className="tap glass-strong" style={{ width: 16, height: 16, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="skip-next" size={9}/></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

window.V2RefinedHA = V2RefinedHA;
