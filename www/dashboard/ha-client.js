/* HA WebSocket client — connects to Home Assistant, mirrors entity states,
   exposes callService. Stores URL + token in localStorage. */

(function () {
  const STORAGE = "ha-dashboard-conn";

  class HAClient {
    constructor(baseUrl, token) {
      this.baseUrl = baseUrl.replace(/\/+$/, "");
      this.token = token;
      this.ws = null;
      this.msgId = 1;
      this.states = {};
      this.listeners = new Set();
      this.connected = false;
      this.error = null;
    }
    async connect() {
      const wsUrl = this.baseUrl.replace(/^http/, "ws") + "/api/websocket";
      this.ws = new WebSocket(wsUrl);
      return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => reject(new Error("连接超时")), 8000);
        this.ws.onerror = () => { clearTimeout(timeout); reject(new Error("WebSocket 错误")); };
        this.ws.onclose = () => { this.connected = false; this._notify(); };
        this.ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === "auth_required") {
            this.ws.send(JSON.stringify({ type: "auth", access_token: this.token }));
          } else if (msg.type === "auth_ok") {
            clearTimeout(timeout);
            this.connected = true;
            this._notify();
            this.ws.send(JSON.stringify({ id: this.msgId++, type: "subscribe_entities" }));
            resolve();
          } else if (msg.type === "auth_invalid") {
            clearTimeout(timeout);
            this.error = "Token 无效";
            reject(new Error(this.error));
            this.ws.close();
          } else if (msg.type === "event" && msg.event) {
            // forecast subscription push?
            if (this.forecastCallbacks && this.forecastCallbacks.has(msg.id) && msg.event.forecast) {
              try { this.forecastCallbacks.get(msg.id)(msg.event.forecast); } catch (e) { console.error(e); }
            }
            this._handleEvent(msg.event);
          } else if (msg.type === "result" && msg.success && msg.result && Array.isArray(msg.result.forecast) && this.forecastCallbacks && this.forecastCallbacks.has(msg.id)) {
            try { this.forecastCallbacks.get(msg.id)(msg.result.forecast); } catch (e) { console.error(e); }
          }
        };
      });
    }
    _handleEvent(ev) {
      // subscribe_entities returns compressed "a" (added/initial) and "c" (changed)
      if (ev.a) {
        for (const [id, info] of Object.entries(ev.a)) {
          this.states[id] = {
            state: info.s,
            attributes: info.a || {},
            last_changed: info.lc,
          };
        }
        this._notify();
      }
      if (ev.c) {
        for (const [id, change] of Object.entries(ev.c)) {
          if (!this.states[id]) this.states[id] = { state: null, attributes: {} };
          const cur = this.states[id];
          if (change["+"]) {
            if (change["+"].s !== undefined) cur.state = change["+"].s;
            if (change["+"].a) cur.attributes = { ...cur.attributes, ...change["+"].a };
          }
          if (change["-"] && change["-"].a) {
            for (const k of Object.keys(change["-"].a)) delete cur.attributes[k];
          }
        }
        this._notify();
      }
    }
    callService(domain, service, data) {
      if (!this.connected) return;
      this.ws.send(JSON.stringify({
        id: this.msgId++,
        type: "call_service",
        domain,
        service,
        service_data: data,
      }));
    }
    subscribeForecast(entityId, callback, forecastType = "daily") {
      if (!this.connected) return () => {};
      const id = this.msgId++;
      if (!this.forecastCallbacks) this.forecastCallbacks = new Map();
      this.forecastCallbacks.set(id, callback);
      this.ws.send(JSON.stringify({
        id, type: "weather/subscribe_forecast",
        forecast_type: forecastType, entity_id: entityId,
      }));
      return () => {
        try {
          this.ws.send(JSON.stringify({
            id: this.msgId++, type: "unsubscribe_events", subscription: id,
          }));
        } catch {}
        this.forecastCallbacks.delete(id);
      };
    }
    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    _notify() { this.listeners.forEach(fn => { try { fn(this.states); } catch (e) { console.error(e); } }); }
    disconnect() { if (this.ws) this.ws.close(); }
  }

  function loadConn() {
    try { return JSON.parse(localStorage.getItem(STORAGE) || "null"); } catch { return null; }
  }
  function saveConn(url, token) {
    localStorage.setItem(STORAGE, JSON.stringify({ url, token }));
  }
  function clearConn() { localStorage.removeItem(STORAGE); }

  window.HAClient = HAClient;
  window.HADashboard = { loadConn, saveConn, clearConn };
})();
