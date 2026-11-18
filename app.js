(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const PRESETS = [
    { id: "cool", name: "冷白", kelvin: 7200 },
    { id: "day", name: "自然", kelvin: 5500 },
    { id: "warm", name: "暖陽", kelvin: 3200 },
    { id: "ivory", name: "象牙", kelvin: 4500 },
    { id: "pink", name: "粉光", color: "#FFD6DC" },
    { id: "rose", name: "玫瑰", color: "#FFC2CC" },
    { id: "peach", name: "蜜桃", color: "#FFD1B8" },
    { id: "lavender", name: "薰衣", color: "#E6D6FF" },
    { id: "custom", name: "自訂", color: "#FFE4F0" },
  ];

  const FILTERS = [
    { id: "none", name: "原圖", css: "none" },
    { id: "soft", name: "柔光", css: "brightness(1.08) contrast(0.94) saturate(1.05)" },
    { id: "bright", name: "明亮", css: "brightness(1.14) contrast(1.04) saturate(1.04)" },
    { id: "warm", name: "暖色", css: "sepia(0.18) saturate(1.12) brightness(1.05)" },
    { id: "cool", name: "冷色", css: "brightness(1.06) saturate(0.92) hue-rotate(8deg)" },
    { id: "cream", name: "奶油", css: "sepia(0.22) brightness(1.1) contrast(0.9) saturate(0.88)" },
    { id: "fade", name: "褪色", css: "saturate(0.62) contrast(0.9) brightness(1.06)" },
  ];

  const ASPECTS = ["4:3", "1:1", "16:9", "full"];
  const TIMERS = [0, 3, 10];
  const FLASH_MODES = ["off", "on", "torch"];
  const BEAUTY_CSS = "brightness(1.06) contrast(0.96) saturate(1.08)";

  const state = {
    mode: "photo",
    facing: "user",
    deviceId: null,
    devices: [],
    flash: "off",
    timer: 0,
    aspect: "4:3",
    grid: false,
    filter: "none",
    zoom: 1,
    zoomCap: { min: 1, max: 1, native: false },
    beauty: false,
    mirrorSave: true,
    screenFlash: true,
    mic: true,
    lightOn: true,
    light: { preset: "day", kelvin: 5500, color: null, custom: "#FFE4F0", brightness: 80, frame: 20 },
    stream: null,
    recorder: null,
    recChunks: [],
    recording: false,
    recStarted: 0,
    recTimer: null,
    capturing: false,
    countdown: null,
    items: [],
    currentItem: null,
    showFilters: false,
    capabilities: {},
  };

  const el = {
    light: $("#light"),
    gate: $("#gate"),
    startBtn: $("#start-btn"),
    camera: $("#camera"),
    stage: $("#stage"),
    finder: $("#viewfinder"),
    video: $("#video"),
    fx: $("#fx"),
    grid: $("#grid"),
    focus: $("#focus"),
    countdown: $("#countdown"),
    recBadge: $("#rec-badge"),
    recTime: $("#rec-time"),
    btnFlash: $("#btn-flash"),
    btnTimer: $("#btn-timer"),
    btnAspect: $("#btn-aspect"),
    btnGrid: $("#btn-grid"),
    btnFilter: $("#btn-filter"),
    btnSettings: $("#btn-settings"),
    zoomRail: $("#zoom-rail"),
    filters: $("#filters"),
    presets: $("#presets"),
    kelvin: $("#kelvin"),
    kelvinVal: $("#kelvin-val"),
    brightness: $("#brightness"),
    brightnessVal: $("#brightness-val"),
    frame: $("#frame"),
    frameVal: $("#frame-val"),
    btnLightOff: $("#btn-light-off"),
    modes: $("#modes"),
    thumb: $("#thumb"),
    shutter: $("#shutter"),
    flip: $("#flip"),
    camPick: $("#cam-pick"),
    camMenu: $("#cam-menu"),
    review: $("#review"),
    reviewStage: $("#review-stage"),
    sheetBg: $("#sheet-bg"),
    sheet: $("#sheet"),
    toast: $("#toast"),
    lightTray: $("#light-tray"),
  };

  const icons = {
    flashOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M7 3h8l-3 7h5L8 21l2-8H6l1-10z"/><path d="M4 4l16 16"/></svg>`,
    flashOn: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M7 2h9l-3.5 8H18L8 22l2.2-8H6.5L7 2z"/></svg>`,
    torch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M8 2h8v6l2 3v11H6V11l2-3V2z"/><path d="M10 15h4"/></svg>`,
    timer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 13V9M9 2h6"/></svg>`,
    aspect: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="6" width="16" height="12" rx="2"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12h16M12 4v16"/></svg>`,
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="8" cy="10" r="4"/><circle cx="16" cy="10" r="4" opacity=".85"/><circle cx="12" cy="15" r="4" opacity=".7"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4"/></svg>`,
    lamp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="11" r="5"/><path d="M12 2v2M12 18v2M4 11H2M22 11h-2M5.5 4.5l1.4 1.4M17.1 16.1l1.4 1.4M18.5 4.5l-1.4 1.4M6.9 16.1l-1.4 1.4"/></svg>`,
    flip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v6H7zM4 17h16"/><path d="M8 20l-3-3 3-3M16 14l3 3-3 3"/></svg>`,
    cams: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 8h4l2-2h4l2 2h4v11H4z"/><circle cx="12" cy="13.5" r="3.5"/></svg>`,
  };

  function loadSettings() {
    try {
      const raw = localStorage.getItem("meiguang-settings");
      if (!raw) return;
      const s = JSON.parse(raw);
      Object.assign(state, {
        beauty: !!s.beauty,
        mirrorSave: s.mirrorSave !== false,
        screenFlash: s.screenFlash !== false,
        mic: s.mic !== false,
        aspect: ASPECTS.includes(s.aspect) ? s.aspect : "4:3",
        grid: !!s.grid,
        filter: FILTERS.some((f) => f.id === s.filter) ? s.filter : "none",
        lightOn: s.lightOn !== false,
        facing: s.facing === "environment" ? "environment" : "user",
      });
      if (s.light) Object.assign(state.light, s.light);
    } catch {}
  }

  function saveSettings() {
    const { beauty, mirrorSave, screenFlash, mic, aspect, grid, filter, lightOn, facing, light } = state;
    localStorage.setItem("meiguang-settings", JSON.stringify({ beauty, mirrorSave, screenFlash, mic, aspect, grid, filter, lightOn, facing, light }));
  }

  function kelvinToRgb(kelvin) {
    const k = Math.min(40000, Math.max(1000, kelvin)) / 100;
    let r, g, b;
    if (k <= 66) {
      r = 255;
      g = 99.4708025861 * Math.log(k) - 161.1195681661;
      b = k <= 19 ? 0 : 138.5177312231 * Math.log(k - 10) - 305.0447927307;
    } else {
      r = 329.698727446 * Math.pow(k - 60, -0.1332047592);
      g = 288.1221695283 * Math.pow(k - 60, -0.0755148492);
      b = 255;
    }
    return [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))));
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function currentLightRgb() {
    if (!state.lightOn || state.light.brightness <= 0) return [0, 0, 0];
    const preset = PRESETS.find((p) => p.id === state.light.preset);
    let rgb;
    if (state.light.color) rgb = hexToRgb(state.light.color);
    else if (preset && preset.color) rgb = hexToRgb(preset.id === "custom" ? state.light.custom : preset.color);
    else rgb = kelvinToRgb(state.light.kelvin);
    const t = Math.pow(state.light.brightness / 100, 0.45);
    return rgb.map((v) => Math.round(v * t));
  }

  function applyLight() {
    const [r, g, b] = currentLightRgb();
    el.light.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    const pad = state.lightOn && state.light.brightness > 0 ? state.light.frame : 8;
    const portrait = matchMedia("(orientation: portrait)").matches;
    const landscapeTight = matchMedia("(orientation: landscape) and (max-height: 560px)").matches;
    if (landscapeTight) {
      el.stage.style.padding = `calc(12px + var(--safe-t) + ${pad * 0.4}vh) calc(110px + var(--safe-r) + ${pad * 0.2}vw) calc(12px + var(--safe-b) + ${pad * 0.4}vh) calc(110px + var(--safe-l) + ${pad * 0.2}vw)`;
    } else {
      el.stage.style.padding = `calc(${portrait ? 58 : 24}px + var(--safe-t) + ${pad * 0.55}vh) calc(16px + var(--safe-r) + ${pad * 0.45}vw) calc(${portrait ? 210 : 24}px + var(--safe-b) + ${pad * 0.35}vh) calc(16px + var(--safe-l) + ${pad * 0.45}vw)`;
    }
    el.kelvin.value = String(state.light.kelvin);
    el.kelvinVal.textContent = `${state.light.kelvin}K`;
    el.brightness.value = String(state.light.brightness);
    el.brightnessVal.textContent = `${state.light.brightness}%`;
    el.frame.value = String(state.light.frame);
    el.frameVal.textContent = `${state.light.frame}%`;
    el.btnLightOff.textContent = state.lightOn && state.light.brightness > 0 ? "關閉補光" : "開啟補光";
    $$("#presets button").forEach((b) => b.classList.toggle("on", b.dataset.id === state.light.preset));
    const usingColor = !!(state.light.color || (PRESETS.find((p) => p.id === state.light.preset) || {}).color);
    el.kelvin.disabled = usingColor;
    el.kelvin.closest("label").style.opacity = usingColor ? 0.4 : 1;
    saveSettings();
  }

  function filterCss() {
    const f = FILTERS.find((x) => x.id === state.filter)?.css || "none";
    if (!state.beauty) return f;
    return f === "none" ? BEAUTY_CSS : `${f} ${BEAUTY_CSS}`;
  }

  function applyFilterPreview() {
    const css = filterCss();
    el.video.style.filter = css;
    el.fx.style.filter = css;
  }

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.toast.classList.remove("show"), 1800);
  }

  function haptic(ms = 10) {
    try { navigator.vibrate?.(ms); } catch {}
  }

  function playClick() {
    try {
      const ctx = playClick.ctx || (playClick.ctx = new AudioContext());
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 1400;
      g.gain.value = 0.04;
      o.connect(g).connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      o.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  async function keepAwake() {
    try {
      if (keepAwake.lock) { try { await keepAwake.lock.release(); } catch {} }
      if (navigator.wakeLock) keepAwake.lock = await navigator.wakeLock.request("screen");
    } catch {}
  }

  function svgBtn(btn, svg, label) {
    btn.innerHTML = svg + (label ? `<span class="sub">${label}</span>` : "");
  }

  function updateTopbar() {
    const flashLabel = { off: "", on: "閃光", torch: "常亮" }[state.flash];
    svgBtn(el.btnFlash, state.flash === "off" ? icons.flashOff : state.flash === "torch" ? icons.torch : icons.flashOn, flashLabel);
    el.btnFlash.classList.toggle("active", state.flash !== "off");
    svgBtn(el.btnTimer, icons.timer, state.timer ? `${state.timer}s` : "");
    el.btnTimer.classList.toggle("active", !!state.timer);
    svgBtn(el.btnAspect, icons.aspect, state.aspect === "full" ? "滿版" : state.aspect);
    el.btnGrid.classList.toggle("active", state.grid);
    svgBtn(el.btnGrid, icons.grid);
    el.grid.classList.toggle("on", state.grid);
    el.btnFilter.classList.toggle("active", state.showFilters || state.filter !== "none");
    svgBtn(el.btnFilter, icons.filter);
    svgBtn(el.btnSettings, icons.settings);
    if (el.btnLight) {
      svgBtn(el.btnLight, icons.lamp);
      el.btnLight.classList.toggle("active", state.lightOn && state.light.brightness > 0);
    }
    el.flip.innerHTML = icons.flip;
    el.camPick.innerHTML = icons.cams;
    el.shutter.classList.toggle("video", state.mode === "video");
    el.shutter.classList.toggle("recording", state.recording);
    $$("#modes button").forEach((b) => b.classList.toggle("on", b.dataset.mode === state.mode));
    syncAspectBox();
    applyMirrorClass();
  }

  function isFront() {
    if (state.deviceId) {
      const d = state.devices.find((x) => x.deviceId === state.deviceId);
      if (d) return /front|user|前置|facetime/i.test(d.label) || d.facing === "user";
    }
    return state.facing === "user";
  }

  function applyMirrorClass() {
    applyPreviewTransform();
  }

  function applyPreviewTransform() {
    const front = isFront();
    const z = state.zoomCap.native ? 1 : state.zoom;
    const parts = [];
    if (front) parts.push("scaleX(-1)");
    if (z && z !== 1) parts.push(`scale(${z})`);
    el.video.style.transform = parts.join(" ");
    el.video.classList.remove("mirror-preview");
  }

  function aspectRatio() {
    const portrait = matchMedia("(orientation: portrait)").matches;
    if (state.aspect === "full") return null;
    if (state.aspect === "1:1") return 1;
    if (state.aspect === "4:3") return portrait ? 3 / 4 : 4 / 3;
    if (state.aspect === "16:9") return portrait ? 9 / 16 : 16 / 9;
    return null;
  }

  function syncAspectBox() {
    const r = aspectRatio();
    const box = el.finder;
    if (!r) {
      box.style.aspectRatio = "";
      box.style.width = "100%";
      box.style.height = "100%";
      return;
    }
    box.style.aspectRatio = `${r}`;
    box.style.width = "100%";
    box.style.height = "auto";
    requestAnimationFrame(() => {
      const stage = el.stage.getBoundingClientRect();
      const fr = box.getBoundingClientRect();
      if (fr.height > stage.height) {
        box.style.height = "100%";
        box.style.width = "auto";
      }
    });
  }

  function videoConstraints() {
    const c = {
      width: { ideal: 1920 },
      height: { ideal: 1440 },
      frameRate: { ideal: 30 },
    };
    if (state.deviceId) c.deviceId = { exact: state.deviceId };
    else c.facingMode = { ideal: state.facing };
    return c;
  }

  async function stopStream() {
    if (state.stream) {
      state.stream.getTracks().forEach((t) => t.stop());
      state.stream = null;
    }
    el.video.srcObject = null;
  }

  async function startStream() {
    const wantAudio = state.mic;
    const constraints = { video: videoConstraints(), audio: wantAudio ? { echoCancellation: true, noiseSuppression: true } : false };
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (wantAudio) {
        stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints(), audio: false });
      } else {
        throw err;
      }
    }
    await stopStream();
    state.stream = stream;
    el.video.srcObject = stream;
    await el.video.play().catch(() => {});
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings?.() || {};
    if (settings.facingMode) state.facing = settings.facingMode === "environment" ? "environment" : "user";
    if (settings.deviceId) state.deviceId = settings.deviceId;
    await listDevices();
    readCapabilities();
    applyFlash();
    applyZoom(state.zoom, true);
    applyMirrorClass();
    applyFilterPreview();
    syncAspectBox();
  }

  async function listDevices() {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      state.devices = all.filter((d) => d.kind === "videoinput");
      const extras = state.devices.length > 2;
      el.camPick.classList.toggle("hidden", !extras);
    } catch {
      state.devices = [];
    }
  }

  function cameraLabel(d, i) {
    const raw = (d.label || "").toLowerCase();
    if (/ultra|超廣/.test(raw)) return "超廣角";
    if (/tele|長焦|telephoto/.test(raw)) return "長焦";
    if (/wide|廣角/.test(raw) && !/ultra/.test(raw)) return "廣角";
    if (/front|user|前置|facetime/.test(raw)) return "前置";
    if (/back|rear|environment|後置/.test(raw)) return "後置";
    return d.label || `鏡頭 ${i + 1}`;
  }

  function readCapabilities() {
    const track = state.stream?.getVideoTracks()[0];
    const caps = track?.getCapabilities?.() || {};
    state.capabilities = caps;
    const z = caps.zoom;
    if (z && z.max > z.min) {
      state.zoomCap = { min: z.min || 1, max: z.max, native: true };
    } else {
      state.zoomCap = { min: 1, max: 5, native: false };
    }
    renderZoom();
  }

  function renderZoom() {
    const { min, max } = state.zoomCap;
    if (max <= min) {
      el.zoomRail.classList.add("hidden");
      return;
    }
    const marks = [];
    marks.push(min);
    if (max >= 2 && min < 2) marks.push(2);
    if (max >= 3 && min < 3) marks.push(Math.min(3, max));
    if (max > 3 && !marks.includes(max)) marks.push(max);
    el.zoomRail.innerHTML = marks
      .map((z) => {
        const label = `${Number(z.toFixed(1))}x`;
        const on = Math.abs(state.zoom - z) < 0.15 ? "on" : "";
        return `<button data-zoom="${z}" class="${on}">${label}</button>`;
      })
      .join("");
    el.zoomRail.classList.remove("hidden");
  }

  async function applyZoom(z, fromStart = false) {
    const { min, max, native } = state.zoomCap;
    state.zoom = Math.min(max, Math.max(min, z));
    const track = state.stream?.getVideoTracks()[0];
    if (native && track) {
      try { await track.applyConstraints({ advanced: [{ zoom: state.zoom }] }); } catch {}
    }
    applyPreviewTransform();
    if (!fromStart) renderZoom();
  }

  async function applyFlash() {
    const track = state.stream?.getVideoTracks()[0];
    const hasTorch = !!(state.capabilities.torch || track?.getCapabilities?.().torch);
    if (!hasTorch || isFront()) return;
    const on = state.flash === "torch" || (state.flash === "on" && state.mode === "video");
    try { await track.applyConstraints({ advanced: [{ torch: on }] }); } catch {}
  }

  async function pulseTorch(ms = 180) {
    const track = state.stream?.getVideoTracks()[0];
    if (!track?.getCapabilities?.().torch || isFront()) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: true }] });
      await new Promise((r) => setTimeout(r, ms));
      await track.applyConstraints({ advanced: [{ torch: state.flash === "torch" }] });
    } catch {}
  }

  async function screenFlashOnce() {
    if (!state.screenFlash || !isFront()) return;
    const prev = el.light.style.backgroundColor;
    const pad = el.stage.style.padding;
    el.light.style.transition = "none";
    el.light.style.backgroundColor = "#fff";
    el.stage.style.padding = "0";
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 80));
    el.light.style.transition = "";
    el.light.style.backgroundColor = prev;
    el.stage.style.padding = pad;
  }

  function getCropRect() {
    const vw = el.video.videoWidth;
    const vh = el.video.videoHeight;
    if (!vw || !vh) return { x: 0, y: 0, w: 0, h: 0 };
    const r = aspectRatio();
    if (!r) return { x: 0, y: 0, w: vw, h: vh };
    const src = vw / vh;
    if (src > r) {
      const w = vh * r;
      return { x: (vw - w) / 2, y: 0, w, h: vh };
    }
    const h = vw / r;
    return { x: 0, y: (vh - h) / 2, w: vw, h };
  }

  function digitalZoomCrop(crop) {
    if (state.zoomCap.native || state.zoom <= 1) return crop;
    const z = state.zoom;
    const w = crop.w / z;
    const h = crop.h / z;
    return { x: crop.x + (crop.w - w) / 2, y: crop.y + (crop.h - h) / 2, w, h };
  }

  function drawFrame(canvas) {
    const crop = digitalZoomCrop(getCropRect());
    if (!crop.w) return false;
    canvas.width = Math.round(crop.w);
    canvas.height = Math.round(crop.h);
    const ctx = canvas.getContext("2d");
    ctx.filter = filterCss();
    const mirror = isFront() && state.mirrorSave;
    ctx.save();
    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(el.video, crop.x, crop.y, crop.w, crop.h, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    return true;
  }

  function blobFromCanvas(canvas, type, quality) {
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
  }

  async function waitForVideo() {
    if (el.video.readyState >= 2 && el.video.videoWidth) return;
    await new Promise((res) => {
      const t = setTimeout(res, 1500);
      el.video.addEventListener("loadeddata", () => { clearTimeout(t); res(); }, { once: true });
    });
  }

  function stamp(ext) {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `美光-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.${ext}`;
  }

  const dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open("meiguang", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("items", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  async function dbPut(item) {
    const db = await dbp;
    await new Promise((res, rej) => {
      const t = db.transaction("items", "readwrite");
      t.objectStore("items").put(item);
      t.oncomplete = res;
      t.onerror = () => rej(t.error);
    });
  }

  async function dbDelete(id) {
    const db = await dbp;
    await new Promise((res, rej) => {
      const t = db.transaction("items", "readwrite");
      t.objectStore("items").delete(id);
      t.oncomplete = res;
      t.onerror = () => rej(t.error);
    });
  }

  async function dbAll() {
    const db = await dbp;
    return new Promise((res, rej) => {
      const t = db.transaction("items", "readonly");
      const q = t.objectStore("items").getAll();
      q.onsuccess = () => res(q.result.sort((a, b) => b.ts - a.ts));
      q.onerror = () => rej(q.error);
    });
  }

  function revokeItem(item) {
    if (item?.url) URL.revokeObjectURL(item.url);
  }

  function hydrateItem(row) {
    const url = URL.createObjectURL(row.blob);
    return { ...row, url };
  }

  async function addItem(blob, kind) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const row = { id, kind, blob, name: stamp(kind === "video" ? (blob.type.includes("mp4") ? "mp4" : "webm") : "jpg"), ts: Date.now(), type: blob.type };
    await dbPut(row);
    const item = hydrateItem(row);
    state.items.unshift(item);
    if (state.items.length > 60) {
      const drop = state.items.pop();
      revokeItem(drop);
      await dbDelete(drop.id);
    }
    renderThumb();
    return item;
  }

  function renderThumb() {
    const item = state.items[0];
    el.thumb.classList.toggle("empty", !item);
    if (!item) { el.thumb.innerHTML = ""; return; }
    if (item.kind === "video") el.thumb.innerHTML = `<video src="${item.url}" muted></video>`;
    else el.thumb.innerHTML = `<img alt="" src="${item.url}" />`;
  }

  async function capturePhoto(opts = {}) {
    if (state.capturing || state.recording) return;
    state.capturing = true;
    try {
      if (!opts.skipTimer) {
        await runTimer();
        if (state.countdown === "cancel") return;
      }
      haptic(12);
      playClick();
      if (isFront()) await screenFlashOnce();
      else if (state.flash === "on") await pulseTorch(160);
      await waitForVideo();
      const canvas = document.createElement("canvas");
      if (!drawFrame(canvas)) { toast("相機尚未就緒"); return; }
      const blob = await blobFromCanvas(canvas, "image/jpeg", 0.95);
      if (!blob) { toast("儲存失敗"); return; }
      await addItem(blob, "photo");
    } finally {
      state.capturing = false;
    }
  }

  function pickRecorderMime() {
    const types = [
      "video/mp4;codecs=avc1,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    return types.find((t) => MediaRecorder.isTypeSupported?.(t)) || "";
  }

  function ensureAudioOnStream() {
    return !!(state.stream && state.mic && state.stream.getAudioTracks().some((t) => t.enabled !== false && t.readyState === "live"));
  }

  async function startRecording() {
    if (state.recording || !state.stream) return;
    if (typeof MediaRecorder === "undefined") { toast("呢部手機暫時唔支援拍片"); return; }
    if (state.mic && !ensureAudioOnStream()) {
      try { await startStream(); } catch {}
    }
    await runTimer();
    if (state.countdown === "cancel") return;

    const canvas = el.fx;
    const useCanvas = state.filter !== "none" || state.beauty || (!state.zoomCap.native && state.zoom > 1) || (isFront() && state.mirrorSave);
    let recStream = state.stream;
    if (useCanvas) {
      canvas.classList.remove("hidden");
      const loop = () => {
        if (!state.recording) return;
        drawFrame(canvas);
        state._raf = requestAnimationFrame(loop);
      };
      drawFrame(canvas);
      recStream = canvas.captureStream(30);
      const audio = state.stream.getAudioTracks()[0];
      if (audio && state.mic) recStream.addTrack(audio);
      state.recording = true;
      state._raf = requestAnimationFrame(loop);
    }

    const mime = pickRecorderMime();
    const opts = { videoBitsPerSecond: 8_000_000 };
    if (mime) opts.mimeType = mime;
    try {
      state.recChunks = [];
      state.recorder = new MediaRecorder(recStream, opts);
    } catch {
      state.recorder = new MediaRecorder(recStream);
    }
    state.recorder.ondataavailable = (e) => { if (e.data && e.data.size) state.recChunks.push(e.data); };
    state.recorder.onerror = () => toast("錄影出現問題");
    state.recorder.onstop = onRecordStop;
    state.recorder.start(200);
    state.recording = true;
    state.recStarted = Date.now();
    el.recBadge.classList.add("on");
    updateRecTime();
    state.recTimer = setInterval(updateRecTime, 250);
    updateTopbar();
    applyFlash();
    haptic(20);
  }

  function updateRecTime() {
    const s = Math.max(0, Math.floor((Date.now() - state.recStarted) / 1000));
    el.recTime.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  async function stopRecording() {
    if (!state.recorder || state.recorder.state === "inactive") {
      state.recording = false;
      updateTopbar();
      return;
    }
    haptic(15);
    state.recorder.stop();
  }

  async function onRecordStop() {
    clearInterval(state.recTimer);
    el.recBadge.classList.remove("on");
    cancelAnimationFrame(state._raf);
    el.fx.classList.add("hidden");
    const type = state.recorder?.mimeType || "video/webm";
    const blob = new Blob(state.recChunks, { type });
    state.recording = false;
    state.recorder = null;
    state.recChunks = [];
    updateTopbar();
    applyFlash();
    if (blob.size < 1000) { toast("錄影失敗"); return; }
    await addItem(blob, "video");
  }

  function runTimer() {
    state.countdown = null;
    if (!state.timer) return Promise.resolve();
    return new Promise((resolve) => {
      let n = state.timer;
      const tick = () => {
        if (state.countdown === "cancel") { el.countdown.classList.remove("show"); el.countdown.textContent = ""; resolve(); return; }
        if (n <= 0) { el.countdown.classList.remove("show"); el.countdown.textContent = ""; resolve(); return; }
        el.countdown.textContent = String(n);
        el.countdown.classList.add("show");
        haptic(8);
        n -= 1;
        state._countId = setTimeout(tick, 1000);
      };
      tick();
    });
  }

  function cancelTimer() {
    state.countdown = "cancel";
    clearTimeout(state._countId);
    el.countdown.classList.remove("show");
    el.countdown.textContent = "";
  }

  async function onShutter() {
    if (state.countdown && state.countdown !== "cancel") { cancelTimer(); return; }
    if (state.mode === "video") {
      if (state.recording) await stopRecording();
      else await startRecording();
      return;
    }
    await capturePhoto();
  }

  async function flipCamera() {
    if (state.recording) { toast("請先停止錄影"); return; }
    state.facing = isFront() ? "environment" : "user";
    state.deviceId = null;
    try { await startStream(); } catch (e) { toast("轉鏡頭失敗"); console.warn(e); }
    saveSettings();
    updateTopbar();
  }

  async function selectDevice(id) {
    if (state.recording) { toast("請先停止錄影"); return; }
    state.deviceId = id;
    const d = state.devices.find((x) => x.deviceId === id);
    if (d) {
      const label = cameraLabel(d, 0);
      state.facing = label === "前置" || /front|user|前置/i.test(d.label) ? "user" : "environment";
    }
    el.camMenu.classList.add("hidden");
    try { await startStream(); } catch (e) { toast("切換鏡頭失敗"); }
    updateTopbar();
  }

  function renderCamMenu() {
    if (!state.devices.length) return;
    el.camMenu.innerHTML = state.devices
      .map((d, i) => `<button data-id="${d.deviceId}" class="${d.deviceId === state.deviceId ? "on" : ""}">${cameraLabel(d, i)}</button>`)
      .join("");
    el.camMenu.classList.toggle("hidden");
  }

  function renderPresets() {
    el.presets.innerHTML = PRESETS.map((p) => {
      const color = p.id === "custom" ? state.light.custom : p.color || rgbCss(kelvinToRgb(p.kelvin));
      const custom = p.id === "custom"
        ? `<input type="color" id="custom-color" value="${state.light.custom}" aria-label="自訂顏色" />`
        : "";
      return `<button data-id="${p.id}" class="${p.id === "custom" ? "custom-wrap" : ""}"><span class="swatch" style="background:${color}"></span>${p.name}${custom}</button>`;
    }).join("");
  }

  function rgbCss([r, g, b]) { return `rgb(${r}, ${g}, ${b})`; }

  function choosePreset(id, ev) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    state.light.preset = id;
    if (p.id === "custom") {
      if (ev && ev.target.id === "custom-color") state.light.custom = ev.target.value;
      state.light.color = state.light.custom;
    } else if (p.color) {
      state.light.color = p.color;
    } else {
      state.light.color = null;
      state.light.kelvin = p.kelvin;
    }
    if (!state.lightOn) state.lightOn = true;
    if (state.light.brightness === 0) state.light.brightness = 80;
    renderPresets();
    applyLight();
  }

  function renderFilters() {
    el.filters.innerHTML = FILTERS.map((f) => `<button data-id="${f.id}" class="${state.filter === f.id ? "on" : ""}">${f.name}</button>`).join("");
  }

  function openReview(item) {
    if (!item) return;
    state.currentItem = item;
    el.reviewStage.innerHTML = item.kind === "video"
      ? `<video src="${item.url}" controls playsinline></video>`
      : `<img alt="" src="${item.url}" />`;
    el.review.classList.remove("hidden");
  }

  function closeReview() {
    el.review.classList.add("hidden");
    el.reviewStage.innerHTML = "";
    state.currentItem = null;
  }

  async function shareItem(item) {
    const file = new File([item.blob], item.name, { type: item.type || item.blob.type });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "美光" });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    downloadItem(item);
  }

  function downloadItem(item) {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.name;
    a.click();
  }

  async function deleteCurrent() {
    const item = state.currentItem;
    if (!item) return;
    await dbDelete(item.id);
    state.items = state.items.filter((x) => x.id !== item.id);
    revokeItem(item);
    closeReview();
    renderThumb();
  }

  function setSwitch(btn, on) { btn.classList.toggle("on", on); }

  function bindSettings() {
    const map = [
      ["sw-beauty", "beauty"],
      ["sw-mirror", "mirrorSave"],
      ["sw-screenflash", "screenFlash"],
      ["sw-mic", "mic"],
    ];
    for (const [id, key] of map) setSwitch($("#" + id), state[key]);
  }

  async function toggleSetting(key, btn) {
    state[key] = !state[key];
    setSwitch(btn, state[key]);
    saveSettings();
    if (key === "beauty") applyFilterPreview();
    if (key === "mirrorSave") applyMirrorClass();
    if (key === "mic" && !state.recording) {
      try { await startStream(); } catch {}
    }
  }

  function openSheet(open) {
    el.sheet.classList.toggle("hidden", !open);
    el.sheetBg.classList.toggle("hidden", !open);
  }

  function showGateError(msg) {
    el.gate.classList.add("err");
    $("p", el.gate).innerHTML = msg;
    el.startBtn.textContent = "再試一次";
    el.gate.classList.remove("hidden");
    el.camera.classList.add("hidden");
  }

  async function enterCamera() {
    loadSettings();
    try {
      await startStream();
    } catch (err) {
      console.warn(err);
      const name = err && err.name;
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        showGateError("未授權相機。請到系統設定打開瀏覽器嘅相機同麥克風權限，再開一次。");
      } else if (location.protocol !== "https:" && location.hostname !== "localhost") {
        showGateError("相機需要喺安全連線（https）先可以用。");
      } else {
        showGateError("開唔到相機。請確認沒有其他 app 佔用鏡頭，然後再試。");
      }
      return;
    }
    el.gate.classList.add("hidden");
    el.camera.classList.remove("hidden");
    renderPresets();
    renderFilters();
    bindSettings();
    applyLight();
    updateTopbar();
    applyFilterPreview();
    await keepAwake();
    try { state.items = (await dbAll()).map(hydrateItem); } catch { state.items = []; }
    renderThumb();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  function onTapFocus(ev) {
    if (ev.target.closest("#focus")) return;
    const rect = el.finder.getBoundingClientRect();
    const x = ev.clientX ?? ev.touches?.[0]?.clientX;
    const y = ev.clientY ?? ev.touches?.[0]?.clientY;
    if (x == null) return;
    const px = (x - rect.left) / rect.width;
    const py = (y - rect.top) / rect.height;
    el.focus.style.left = `${px * 100}%`;
    el.focus.style.top = `${py * 100}%`;
    el.focus.classList.remove("show");
    void el.focus.offsetWidth;
    el.focus.classList.add("show");
    clearTimeout(onTapFocus._t);
    onTapFocus._t = setTimeout(() => el.focus.classList.remove("show"), 1400);
    const track = state.stream?.getVideoTracks()[0];
    const caps = track?.getCapabilities?.() || {};
    const poi = { x: isFront() ? 1 - px : px, y: py };
    const adv = {};
    if (caps.pointsOfInterest) adv.pointsOfInterest = [poi];
    if (caps.focusMode && caps.focusMode.includes("single-shot")) adv.focusMode = "single-shot";
    else if (caps.focusMode && caps.focusMode.includes("manual")) adv.focusMode = "continuous";
    if (Object.keys(adv).length) track.applyConstraints({ advanced: [adv] }).catch(() => {});
  }

  function bindGestures() {
    let startDist = 0;
    let startZoom = 1;
    let pointers = new Map();
    let longTimer = null;
    let burstOn = false;
    let burstId = null;

    el.finder.addEventListener("pointerdown", (ev) => {
      pointers.set(ev.pointerId, ev);
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        startDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        startZoom = state.zoom;
      }
    });
    el.finder.addEventListener("pointermove", (ev) => {
      if (!pointers.has(ev.pointerId)) return;
      pointers.set(ev.pointerId, ev);
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (startDist) applyZoom(startZoom * (dist / startDist));
      }
    });
    const endP = (ev) => { pointers.delete(ev.pointerId); if (pointers.size < 2) startDist = 0; };
    el.finder.addEventListener("pointerup", endP);
    el.finder.addEventListener("pointercancel", endP);
    el.finder.addEventListener("click", (ev) => onTapFocus(ev));

    el.shutter.addEventListener("pointerdown", () => {
      if (state.mode !== "photo" || state.recording) return;
      longTimer = setTimeout(async () => {
        burstOn = true;
        haptic(8);
        toast("連拍");
        const shoot = async () => {
          if (!burstOn) return;
          await capturePhoto({ skipTimer: true });
          if (burstOn) burstId = setTimeout(shoot, 180);
        };
        shoot();
      }, 450);
    });
    const endShutter = () => {
      clearTimeout(longTimer);
      burstOn = false;
      clearTimeout(burstId);
    };
    el.shutter.addEventListener("pointerup", endShutter);
    el.shutter.addEventListener("pointerleave", endShutter);
    el.shutter.addEventListener("pointercancel", endShutter);
  }

  function bind() {
    el.startBtn.addEventListener("click", enterCamera);
    el.shutter.addEventListener("click", onShutter);
    el.flip.addEventListener("click", flipCamera);
    el.camPick.addEventListener("click", (e) => { e.stopPropagation(); renderCamMenu(); });
    el.camMenu.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) selectDevice(b.dataset.id);
    });
    document.addEventListener("click", () => el.camMenu.classList.add("hidden"));

    el.btnFlash.addEventListener("click", async () => {
      const i = FLASH_MODES.indexOf(state.flash);
      state.flash = FLASH_MODES[(i + 1) % FLASH_MODES.length];
      if (isFront() && state.flash === "torch") {
        toast("前置鏡頭用螢幕補光，快門可開螢幕閃光");
        state.flash = "off";
      }
      updateTopbar();
      await applyFlash();
    });
    el.btnTimer.addEventListener("click", () => {
      const i = TIMERS.indexOf(state.timer);
      state.timer = TIMERS[(i + 1) % TIMERS.length];
      updateTopbar();
    });
    el.btnAspect.addEventListener("click", () => {
      const i = ASPECTS.indexOf(state.aspect);
      state.aspect = ASPECTS[(i + 1) % ASPECTS.length];
      updateTopbar();
      saveSettings();
    });
    el.btnGrid.addEventListener("click", () => {
      state.grid = !state.grid;
      updateTopbar();
      saveSettings();
    });
    el.btnFilter.addEventListener("click", () => {
      state.showFilters = !state.showFilters;
      el.filters.classList.toggle("hidden", !state.showFilters);
      el.zoomRail.classList.toggle("hidden-slot", state.showFilters);
      if (state.showFilters) el.zoomRail.style.visibility = "hidden";
      else el.zoomRail.style.visibility = "";
      updateTopbar();
    });
    el.btnLight = $("#btn-light");
    el.btnSettings.addEventListener("click", () => openSheet(true));
    el.btnLight?.addEventListener("click", () => {
      el.lightTray.classList.toggle("landscape-open");
      const off = !state.lightOn || state.light.brightness <= 0;
      if (off) {
        state.lightOn = true;
        if (state.light.brightness === 0) state.light.brightness = 80;
        applyLight();
        updateTopbar();
      }
    });
    el.sheetBg.addEventListener("click", () => openSheet(false));

    el.modes.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || state.recording) return;
      state.mode = b.dataset.mode;
      updateTopbar();
      applyFlash();
    });

    el.presets.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) choosePreset(b.dataset.id, e);
    });
    el.presets.addEventListener("input", (e) => {
      if (e.target.id === "custom-color") choosePreset("custom", e);
    });
    el.kelvin.addEventListener("input", () => {
      state.light.kelvin = Number(el.kelvin.value);
      state.light.color = null;
      state.light.preset = closestKelvinPreset(state.light.kelvin);
      state.lightOn = true;
      renderPresets();
      applyLight();
    });
    el.brightness.addEventListener("input", () => {
      state.light.brightness = Number(el.brightness.value);
      state.lightOn = state.light.brightness > 0;
      applyLight();
    });
    el.frame.addEventListener("input", () => {
      state.light.frame = Number(el.frame.value);
      applyLight();
    });
    el.btnLightOff.addEventListener("click", () => {
      if (state.lightOn && state.light.brightness > 0) {
        state.lightOn = false;
      } else {
        state.lightOn = true;
        if (state.light.brightness === 0) state.light.brightness = 80;
      }
      applyLight();
    });

    el.filters.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      state.filter = b.dataset.id;
      renderFilters();
      applyFilterPreview();
      saveSettings();
    });

    el.zoomRail.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) applyZoom(Number(b.dataset.zoom));
    });

    el.thumb.addEventListener("click", () => { if (state.items[0]) openReview(state.items[0]); });
    $("#review-close").addEventListener("click", closeReview);
    $("#review-share").addEventListener("click", () => state.currentItem && shareItem(state.currentItem));
    $("#review-save").addEventListener("click", () => state.currentItem && downloadItem(state.currentItem));
    $("#review-delete").addEventListener("click", deleteCurrent);

    $("#sw-beauty").addEventListener("click", () => toggleSetting("beauty", $("#sw-beauty")));
    $("#sw-mirror").addEventListener("click", () => toggleSetting("mirrorSave", $("#sw-mirror")));
    $("#sw-screenflash").addEventListener("click", () => toggleSetting("screenFlash", $("#sw-screenflash")));
    $("#sw-mic").addEventListener("click", () => toggleSetting("mic", $("#sw-mic")));

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        keepAwake();
        if (state.stream && state.stream.getVideoTracks().every((t) => t.readyState !== "live")) startStream().catch(() => {});
        applyFlash();
      }
    });
    matchMedia("(orientation: portrait)").addEventListener("change", () => {
      applyLight();
      updateTopbar();
    });
    window.addEventListener("resize", () => { applyLight(); syncAspectBox(); });

    bindGestures();
  }

  function closestKelvinPreset(k) {
    const whites = PRESETS.filter((p) => p.kelvin);
    return whites.reduce((a, b) => Math.abs(b.kelvin - k) < Math.abs(a.kelvin - k) ? b : a).id;
  }

  const PREVIEW = new URLSearchParams(location.search).has("preview");

  async function enterPreview() {
    document.body.classList.add("preview-mode");
    loadSettings();
    state.lightOn = true;
    if (state.light.brightness < 60) state.light.brightness = 80;
    el.gate.classList.add("hidden");
    el.camera.classList.remove("hidden");
    if (!$("#demo-preview")) {
      const d = document.createElement("div");
      d.id = "demo-preview";
      d.setAttribute("aria-hidden", "true");
      el.finder.prepend(d);
    }
    renderPresets();
    renderFilters();
    bindSettings();
    applyLight();
    updateTopbar();
    applyFilterPreview();
    renderThumb();
    syncAspectBox();
  }

  loadSettings();
  renderPresets();
  applyLight();
  bind();
  if (PREVIEW) enterPreview();
})();
