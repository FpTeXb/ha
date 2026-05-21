# Home Assistant 部署 · 1:1 原型还原

把项目里的 Home Dashboard 原型**整个嵌入 HA**，作为侧边栏面板。视觉 100% 还原 + 通过 WebSocket 与真实实体双向绑定。

## 🎯 选择哪种方式

| 方案 | 视觉还原度 | 部署难度 | 真实交互 |
|---|---|---|---|
| **A. iframe 面板**（推荐） | ⭐⭐⭐⭐⭐ 100% | 简单 | ✅ WebSocket 实时双向 |
| B. Mushroom + card-mod 重写 | ⭐⭐⭐ 70% | 复杂 | ✅ HA 原生 |
| C. 标准 Lovelace tile | ⭐⭐ 40% | 简单 | ✅ HA 原生 |

本文件包默认走 **方案 A**。

## 📦 文件清单

```
ha-export/
├── README.md                       ← 本文件
├── configuration-snippet.yaml      ← panel_iframe 配置片段
├── scenes.yaml                     ← 场景：回家 / 离家
├── scripts.yaml                    ← 脚本：降温 / 22° / 30° / 关闭
├── lovelace-dashboard.yaml         ← (可选) Mushroom+card-mod 方案
└── www/
    ├── floorplan/                  ← 平面图 + 各灯叠加 PNG
    └── dashboard/                  ← 1:1 原型（HTML/JSX/CSS/资源）
```

## 🚀 部署步骤（方案 A · 推荐）

### 1. 复制资源到 HA

把 `www/` 文件夹下的所有内容复制到你的 HA `/config/www/`：

```
/config/www/floorplan/base.png + 17 个灯叠加 PNG
/config/www/dashboard/index.html
/config/www/dashboard/ha-client.js
/config/www/dashboard/styles.css
/config/www/dashboard/entities.js
/config/www/dashboard/shared.jsx
/config/www/dashboard/v2-refined.jsx
/config/www/dashboard/dashboard-shell.jsx
/config/www/dashboard/assets/floorplan/   (17 个灯叠加 PNG 副本)
```

### 2. 添加 scenes / scripts（可选但推荐）

把 `scenes.yaml` 和 `scripts.yaml` 的内容追加到你的：
- `/config/scenes.yaml`
- `/config/scripts.yaml`

（确认 `configuration.yaml` 里有 `scene: !include scenes.yaml` 和 `script: !include scripts.yaml`）

### 3. 配置 panel_iframe

把 `configuration-snippet.yaml` 的内容追加到 `/config/configuration.yaml`，或者直接写：

```yaml
panel_iframe:
  home_dashboard:
    title: '我的家'
    url: '/local/dashboard/index.html'
    icon: mdi:home-variant
    require_admin: false
```

### 4. 重启 Home Assistant

设置 → 系统 → 重启。

### 5. 首次连接

- 左侧栏出现 **"我的家"** 入口，点进去
- 弹出连接对话框，填：
  - **HA 地址**：你访问 HA 的完整 URL（如 `http://homeassistant.local:8123` 或 `http://192.168.x.x:8123`，**不要有末尾斜杠**）
  - **长期访问令牌**：HA → 用户头像 → 安全 → 长期访问令牌 → 创建（**复制全文粘贴**）
- 点 **连接**

完成。所有灯/空调/窗帘的点击都会调用真实 HA 服务，状态变化会实时同步回界面（包括别处操作）。

## 🔐 关于令牌

- 长期访问令牌存在浏览器 `localStorage`，不会上传到任何地方
- 想换设备 / 换浏览器：再走一遍连接流程即可
- 想撤销：HA → 用户头像 → 安全 → 删除对应令牌

## 🐛 常见问题

**Q: 进入面板后空白 / 不显示？**
A: HA 默认禁止页面内嵌 iframe。检查 `configuration.yaml` 是否有 `http: use_x_forwarded_for: ...` 之类的限制。或者临时改成在浏览器单开一个标签页访问 `http://你的HA地址/local/dashboard/index.html` 测试。

**Q: 连接报错 "WebSocket 错误" 或 "Auth invalid"？**
A:
- 检查地址格式：必须包含端口（`:8123`），不带末尾 `/`
- 检查令牌是否完整复制（很长一串以 `eyJ` 开头）
- 如果 HA 走 HTTPS，地址也必须用 `https://`，且必须证书有效

**Q: 有些灯点击没反应 / 显示"不可用"？**
A: 那些灯的 entity_id 在你 HA 里不存在或不在线。打开 HA → 开发者工具 → 状态，搜索看看真实的 ID 是什么，然后修改 `dashboard/entities.js` 里对应的 `id` 字段。

**Q: 平面图叠加发光效果对吗？**
A: 是。打开任意有 `hasRender: true` 的灯（共 17 盏），户型图对应房间应该亮起来。

**Q: 想嵌进现有 Lovelace 而不是单独面板？**
A: 加一张 iframe 卡：

```yaml
type: iframe
url: /local/dashboard/index.html
aspect_ratio: 75%
```

## 📊 实体统计

- 灯：17 盏（12 吸顶 + 5 射灯/筒灯）
- 空调：6 台
- 窗帘：6 路
- 场景：2 个（回家 / 离家）
- 脚本：4 个（降温 / 22° / 30° / 关闭）
# ha
