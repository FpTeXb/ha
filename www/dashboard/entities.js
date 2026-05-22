/* Real entities from Home Assistant picture-elements YAML.
   Positions are in % of floorplan image (top, left). */

const FLOORPLAN_BASE = "assets/floorplan/base.png";

// hasRender = a corresponding lighten-blend PNG exists in assets/floorplan/
// (only the ones the user uploaded — others still toggle but no overlay).
const LIGHTS = [
  { id: "light.yeelink_cn_2027394738_ceil47_s_2_light", name: "客厅", room: "living",  x: 43.88, y: 52.33, hasRender: true,  kind: "ceil" },
  { id: "light.zoudao",                                  name: "走道",  room: "hall",    x: 65.59, y: 42.93, hasRender: true,  kind: "ceil" },
  { id: "light.yeelink_cn_2008384777_ceil45_s_2_light", name: "姐姐房", room: "sister",  x: 83.32, y: 60.57, hasRender: true,  kind: "ceil" },
  { id: "light.yeelink_cn_2076746268_ml13_s_2_light",   name: "窗台射灯", room: "living", x: 59.33, y: 68.74, hasRender: true, kind: "spot" },
  { id: "light.zhuwei",                                  name: "主卫",  room: "mbath",   x: 21.72, y: 44.80, hasRender: true,  kind: "ceil" },
  { id: "light.xiaomi_cn_995127909_pro2_s_3_light",     name: "阳台",  room: "balcony", x: 47.13, y: 75.17, hasRender: true,  kind: "ceil" },
  { id: "light.yeelink_cn_2001142567_ml13_s_2_light",   name: "窗台筒灯", room: "living", x: 66.46, y: 68.85, hasRender: true,  kind: "spot" },
  { id: "light.yeelink_cn_962306557_ceil45_s_2_light",  name: "书房",  room: "study",   x: 52.84, y: 31.81, hasRender: true,  kind: "ceil" },
  { id: "light.yeelink_cn_2103176439_ml13_s_2_light",   name: "洗手台", room: "mbath",   x: 41.63, y: 37.14, hasRender: true,  kind: "spot" },
  { id: "light.yeelink_cn_950517169_panel6_s_2_light",  name: "厨房",  room: "kitchen", x: 66.29, y: 37.23, hasRender: true,  kind: "ceil" },
  { id: "light.yeelink_cn_2104008081_ml13_s_2_light",   name: "厨房射灯", room: "kitchen", x: 65.61, y: 31.84, hasRender: true, kind: "spot" },
  { id: "light.kewei",                                   name: "客卫",  room: "gbath",   x: 40.85, y: 32.12, hasRender: true,  kind: "ceil" },
  { id: "light.yeelink_cn_2080481036_ml13_s_2_light",   name: "主卧射灯", room: "master", x: 28.51, y: 44.73, hasRender: true,  kind: "spot" },
  { id: "light.yeelink_cn_2007278289_ceil45_s_2_light", name: "主卧",  room: "master",  x: 18.74, y: 62.91, hasRender: true,  kind: "ceil" },
  { id: "light.ruhu",                                    name: "入户",  room: "hall",    x: 80.92, y: 42.87, hasRender: true,  kind: "ceil" },
  { id: "light.lemesh_cn_782316947_wy02_s_2_light",     name: "餐厅",  room: "dining",  x: 60.33, y: 52.56, hasRender: true,  kind: "ceil" },
  { id: "light.yeelink_cn_2006173280_ceil45_s_2_light", name: "弟弟房", room: "brother", x: 28.26, y: 31.26, hasRender: true,  kind: "ceil" },
];

const CLIMATES = [
  { id: "climate.yj1226_cn_2141905176_air", name: "客厅空调 1", room: "living",  x: 71.65, y: 40.83, target: 22, current: 23 },
  { id: "climate.yj1226_cn_2141895500_air", name: "客厅空调 2", room: "living",  x: 45.42, y: 40.61, target: 22, current: 23 },
  { id: "climate.yj1226_cn_2141905191_air", name: "主卧空调", room: "master",  x: 24.29, y: 49.13, target: 20, current: 21 },
  { id: "climate.yj1226_cn_2141905179_air", name: "姐姐空调", room: "sister",  x: 79.67, y: 47.68, target: 24, current: 26 },
  { id: "climate.yj1226_cn_2141895509_air", name: "弟弟空调", room: "brother", x: 28.55, y: 39.24, target: 24, current: 25 },
  { id: "climate.yj1226_cn_2141895501_air", name: "书房空调", room: "study",   x: 55.43, y: 39.78, target: 23, current: 24 },
];

const CURTAINS = [
  { id: "cover.xiaomi_cn_875660422_acn010_s_2_curtain", name: "客厅窗帘",    room: "living",  x: 46.73, y: 69.89, open: 0 },
  { id: "cover.xiaomi_cn_877631852_acn010_s_2_curtain", name: "书房窗帘",    room: "study",   x: 48.80, y: 26.40, open: 0 },
  { id: "cover.xiaomi_cn_877633736_acn010_s_2_curtain", name: "弟弟窗帘",    room: "brother", x: 26.40, y: 26.40, open: 0 },
  { id: "cover.xiaomi_cn_877631863_acn010_s_2_curtain", name: "主卧窗纱",    room: "master",  x: 15.80, y: 76.20, open: 0 },
  { id: "cover.xiaomi_cn_876990609_acn010_s_2_curtain", name: "主卧窗帘",    room: "master",  x: 19.30, y: 76.20, open: 0 },
  { id: "cover.xiaomi_cn_875659223_acn010_s_2_curtain", name: "姐姐窗帘",    room: "sister",  x: 81.94, y: 73.70, open: 0 },
];

const ROOMS = [
  { id: "living",  name: "客厅",   icon: "home"   },
  { id: "dining",  name: "餐厅",   icon: "movie"  },
  { id: "kitchen", name: "厨房",   icon: "leaf"   },
  { id: "master",  name: "主卧",   icon: "bed"    },
  { id: "brother", name: "弟弟房", icon: "bed"    },
  { id: "sister",  name: "姐姐房", icon: "bed"    },
  { id: "study",   name: "书房",   icon: "settings" },
  { id: "mbath",   name: "主卫",   icon: "drop"   },
  { id: "gbath",   name: "客卫",   icon: "drop"   },
  { id: "balcony", name: "阳台",   icon: "sun"    },
  { id: "hall",    name: "入户/走道", icon: "door-out" },
];

// Scenes
const SCENES = [
  { id: "scene.home", name: "回家", icon: "home" },
  { id: "scene.away", name: "离家", icon: "door-out" },
  { id: "scene.cool", name: "降温", icon: "snow" },
];

// Default initial ON lights — sets a believable evening state.
const DEFAULT_ON = new Set([
  "light.yeelink_cn_2027394738_ceil47_s_2_light", // 客厅
  "light.lemesh_cn_782316947_wy02_s_2_light",     // 餐厅
  "light.ruhu",                                    // 入户
  "light.yeelink_cn_2001142567_ml13_s_2_light",   // 窗台筒灯
]);

Object.assign(window, {
  FLOORPLAN_BASE, LIGHTS, CLIMATES, CURTAINS, ROOMS, SCENES, DEFAULT_ON,
});
