const BRAILLE_DOTS_BY_ROW = [[0x40, 0x80], [0x04, 0x20], [0x02, 0x10], [0x01, 0x08]];

const clamp01 = (v) => Math.min(1, Math.max(0, Number(v) || 0));

export function braille(series, rows = 3) {
  const v = series.map(clamp01);
  if (v.length % 2) v.push(v[v.length - 1]);
  const levels = rows * 4;
  const out = [];
  for (let r = rows - 1; r >= 0; r--) {
    let line = '';
    for (let c = 0; c < v.length / 2; c++) {
      let bits = 0;
      for (let side = 0; side < 2; side++) {
        const level = Math.round(v[c * 2 + side] * (levels - 1));
        if (Math.floor(level / 4) === r) bits |= BRAILLE_DOTS_BY_ROW[level % 4][side];
      }
      line += String.fromCharCode(0x2800 + bits);
    }
    out.push(line);
  }
  return out.join('\n');
}

export function normalize(series) {
  const lo = Math.min(...series), hi = Math.max(...series);
  if (hi === lo) return series.map(() => 0.5);
  return series.map((v) => 0.1 + ((v - lo) / (hi - lo)) * 0.8);
}

export function resample(series, n) {
  if (n <= 1) return series.slice(-1);
  if (series.length === 1) return Array(n).fill(series[0]);
  return Array.from({ length: n }, (_, i) => {
    const t = (i * (series.length - 1)) / (n - 1);
    const a = Math.floor(t), b = Math.min(series.length - 1, a + 1);
    return series[a] + (series[b] - series[a]) * (t - a);
  });
}

export function fraction(clientX, rect) {
  return clamp01((clientX - rect.left) / rect.width);
}

export function label(value, { max, unit } = {}) {
  if (max) return `${Math.round(value * max)} ${unit ?? ''}`.trimEnd();
  return `${Math.round(value * 100)}%`;
}


const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const still = (el) => reduced() || !!el.closest('[data-fr-static]');
const figureOf = (el) => el.closest('figure') ?? el.parentElement;
const emit = (el, name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
const once = (el, key) => (el.dataset[key] ? false : (el.dataset[key] = '1'));
const plainKey = (e) => !e.altKey && !e.ctrlKey && !e.metaKey;
const focusable = (host, keys) => {
  if (!host.hasAttribute('tabindex')) host.tabIndex = 0;
  host.setAttribute('aria-keyshortcuts', [host.getAttribute('aria-keyshortcuts'), keys].filter(Boolean).join(' '));
};

function plot(el) {
  if (!once(el, 'frPlot')) return;
  const cols = 'ABCD', rows = '123';
  const zones = document.createElement('div');
  zones.className = 'fr-zones';
  zones.setAttribute('aria-hidden', 'true');
  const band = 'var(--fr-band)';
  const put = (text, left, top) => {
    const s = document.createElement('span');
    s.textContent = text; s.style.left = left; s.style.top = top;
    zones.appendChild(s);
  };
  const tick = (cls, left, top) => {
    const t = document.createElement('i');
    t.className = cls; t.style.left = left; t.style.top = top;
    zones.appendChild(t);
  };
  [...cols].forEach((c, i) => {
    const x = (f) => `calc(${band} + (100% - 2 * ${band}) * ${f})`;
    put(c, x((i + 0.5) / 4), `calc(${band} / 2)`);
    put(c, x((i + 0.5) / 4), `calc(100% - ${band} / 2)`);
    if (i) { tick('fr-tick-x', x(i / 4), '0'); tick('fr-tick-x', x(i / 4), `calc(100% - ${band})`); }
  });
  [...rows].forEach((r, i) => {
    const y = (f) => `calc(${band} + (100% - 2 * ${band}) * ${f})`;
    put(r, `calc(${band} / 2)`, y((i + 0.5) / 3));
    put(r, `calc(100% - ${band} / 2)`, y((i + 0.5) / 3));
    if (i) { tick('fr-tick-y', '0', y(i / 3)); tick('fr-tick-y', `calc(100% - ${band})`, y(i / 3)); }
  });
  const xh = document.createElement('i'); xh.className = 'fr-xh';
  const yh = document.createElement('i'); yh.className = 'fr-yh';
  zones.append(xh, yh);
  el.appendChild(zones);

  const readout = el.querySelector('[data-fr-zone]');
  const idle = readout?.textContent;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const b = parseFloat(getComputedStyle(el).getPropertyValue('--fr-band')) || 15;
    const x = e.clientX - r.left, y = e.clientY - r.top;
    xh.style.top = `${y}px`; yh.style.left = `${x}px`;
    const fx = Math.min(0.999, clamp01((x - b) / (r.width - 2 * b)));
    const fy = Math.min(0.999, clamp01((y - b) / (r.height - 2 * b)));
    if (readout) readout.textContent = `zone ${cols[(fx * 4) | 0]}${rows[(fy * 3) | 0]}`;
  });
  el.addEventListener('pointerleave', () => { if (readout) readout.textContent = idle; });
}

function slider(el) {
  if (!once(el, 'frSlider')) return;
  const opts = { max: Number(el.dataset.frMax) || 0, unit: el.dataset.frUnit };
  const step = Number(el.dataset.frStep) || 0.025;
  if (!el.hasAttribute('role')) el.setAttribute('role', 'slider');
  if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
  el.setAttribute('aria-valuemin', '0');
  el.setAttribute('aria-valuemax', String(opts.max || 100));
  const set = (v, input = true) => {
    const value = clamp01(v);
    el.style.setProperty('--fr-value', String(value));
    el.setAttribute('aria-valuenow', String(Math.round(value * (opts.max || 100))));
    el.setAttribute('aria-valuetext', label(value, opts));
    el.parentElement.querySelectorAll('[data-fr-label]').forEach((l) => { l.textContent = label(value, opts); });
    if (input) emit(el, 'fr-input', { value });
  };
  const current = () => clamp01(getComputedStyle(el).getPropertyValue('--fr-value'));
  set(current(), false);
  el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); set(fraction(e.clientX, el.getBoundingClientRect())); });
  el.addEventListener('pointermove', (e) => { if (el.hasPointerCapture(e.pointerId)) set(fraction(e.clientX, el.getBoundingClientRect())); });
  el.addEventListener('keydown', (e) => {
    const d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, Home: -1, End: 1 }[e.key];
    if (d === undefined || !plainKey(e)) return;
    e.preventDefault(); set(current() + d);
  });
}

function holes(list) {
  if (!once(list, 'frHoles')) return;
  const count = () => {
    const all = list.querySelectorAll('button[aria-pressed]');
    const on = list.querySelectorAll('button[aria-pressed="true"]');
    figureOf(list).querySelectorAll('[data-fr-count]').forEach((c) => { c.textContent = `${on.length} of ${all.length} punched`; });
  };
  list.addEventListener('click', (e) => {
    const b = e.target.closest('button[aria-pressed]');
    if (!b) return;
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    if (!still(b)) { b.classList.remove('fr-pop'); void b.offsetWidth; b.classList.add('fr-pop'); }
    count();
    emit(b, 'fr-toggle', { pressed: b.getAttribute('aria-pressed') === 'true' });
  });
  count();
}

function stub(side) {
  if (!once(side, 'frStub')) return;
  side.addEventListener('click', () => {
    const torn = side.closest('.fr-stub').classList.toggle('fr-torn');
    side.setAttribute('aria-pressed', String(torn));
  });
  if (side.tagName === 'BUTTON') side.setAttribute('aria-pressed', 'false');
}

function procs(table) {
  if (!once(table, 'frProcs')) return;
  const rows = () => [...table.tBodies[0]?.rows ?? []];
  const select = (i) => {
    const all = rows(); if (!all.length) return;
    const at = Math.min(all.length - 1, Math.max(0, i));
    all.forEach((r, n) => r.setAttribute('aria-current', String(n === at)));
    emit(table, 'fr-select', { index: at, row: all[at] });
  };
  const at = () => rows().findIndex((r) => r.getAttribute('aria-current') === 'true');
  table.addEventListener('click', (e) => { const r = e.target.closest('tbody tr'); if (r) select(rows().indexOf(r)); });
  const host = figureOf(table);
  focusable(host, 'j k ArrowDown ArrowUp');
  host.addEventListener('keydown', (e) => {
    const d = { j: 1, ArrowDown: 1, k: -1, ArrowUp: -1 }[e.key];
    if (d === undefined || e.target !== host || !plainKey(e)) return;
    e.preventDefault(); select(Math.max(0, at()) + d);
  });
}

const visible = new WeakMap();
const io = typeof IntersectionObserver === 'function'
  ? new IntersectionObserver((es) => es.forEach((e) => visible.set(e.target, e.isIntersecting)))
  : null;

function graph(pre) {
  if (!once(pre, 'frGraph')) return;
  const rows = Number(pre.dataset.frRows) || 3;
  let series = (pre.dataset.frSeries || '').split(',').map(Number).filter((n) => !Number.isNaN(n));
  if (!series.length) return;
  const max = Number(pre.dataset.frMax) || 0;
  const now = figureOf(pre).querySelector('[data-fr-now]');
  let cols = 0;
  const draw = () => {
    if (cols) pre.textContent = braille(normalize(resample(series, cols * 2)), rows);
    if (now) now.textContent = label(series[series.length - 1], { max, unit: pre.dataset.frUnit });
  };
  const fit = () => {
    const probe = document.createElement('span');
    probe.textContent = '⣿';
    pre.appendChild(probe);
    const cell = probe.getBoundingClientRect().width || 8;
    probe.remove();
    cols = Math.max(4, Math.floor(pre.clientWidth / cell));
    draw();
  };
  fit();
  document.fonts?.ready.then(fit);
  if (typeof ResizeObserver === 'function') new ResizeObserver(fit).observe(pre);
  if (!pre.hasAttribute('data-fr-live')) return;
  let paused = false;
  const host = figureOf(pre);
  focusable(host, 'Space');
  host.addEventListener('keydown', (e) => {
    if (e.key !== ' ' || e.target !== host || !plainKey(e)) return;
    e.preventDefault(); paused = !paused;
    emit(pre, 'fr-pause', { paused });
  });
  io?.observe(pre);
  const timer = setInterval(() => {
    if (!pre.isConnected) { clearInterval(timer); io?.unobserve(pre); return; }
    if (paused || still(pre) || document.hidden || visible.get(pre) === false) return;
    const last = series[series.length - 1];
    series = series.slice(1).concat(Math.min(0.95, Math.max(0.05, last + (Math.random() - 0.5) * 0.06)));
    draw();
  }, 700);
}

export function init(root = document) {
  root.querySelectorAll('.fr-plot').forEach(plot);
  root.querySelectorAll('[data-fr-input]').forEach(slider);
  root.querySelectorAll('.fr-holes').forEach(holes);
  root.querySelectorAll('.fr-stub-side').forEach(stub);
  root.querySelectorAll('.fr-procs').forEach(procs);
  root.querySelectorAll('.fr-braille').forEach(graph);
}

export function play(root = document) {
  if (reduced()) return;
  root.querySelectorAll('.fr-plot, .fr-stub, .fr-tui').forEach((el) => {
    if (el.closest('[data-fr-static]')) return;
    el.getAnimations({ subtree: true }).forEach((a) => {
      if (a.effect?.getComputedTiming().iterations === Infinity) return;
      a.cancel(); a.play();
    });
  });
}

if (typeof document !== 'undefined' && !document.documentElement.hasAttribute('data-fr-manual')) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
}
