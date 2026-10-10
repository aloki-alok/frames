import { init, play } from './tick.js';

const THEMES = ['paper', 'graphite', 'phosphor', 'blueprint', 'riso', 'moss', 'signal', 'ultraviolet', 'rosewater', 'glacier'];
const root = document.documentElement;

const saved = () => {
  try { return JSON.parse(localStorage.getItem('tick') || '{}'); } catch { return {}; }
};
const save = (patch) => {
  try { localStorage.setItem('tick', JSON.stringify({ ...saved(), ...patch })); } catch {}
};

function dedent(html) {
  const lines = html.replace(/^\n+|\s+$/g, '').split('\n');
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(indent)).join('\n');
}

async function copy(text, button, idle) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'copied';
  } catch {
    button.textContent = 'press ⌘C';
  }
  button.classList.add('done');
  setTimeout(() => { button.textContent = idle; button.classList.remove('done'); }, 1400);
}

function demoBars() {
  document.querySelectorAll('.demo').forEach((demo) => {
    const html = dedent(demo.innerHTML);
    const bar = document.createElement('div');
    bar.className = 'demo-bar';

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'copy html';
    copyButton.addEventListener('click', () => copy(html, copyButton, 'copy html'));

    const replay = document.createElement('button');
    replay.type = 'button';
    replay.textContent = 'replay animation';
    replay.addEventListener('click', () => play(demo));

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'view html';
    const pre = document.createElement('pre');
    pre.className = 'code';
    pre.textContent = html;
    details.append(summary, pre);

    bar.append(copyButton, replay, details);
    demo.appendChild(bar);
  });
}

function setTheme(theme) {
  if (theme) root.dataset.tkTheme = theme;
  else delete root.dataset.tkTheme;
  save({ theme });
  document.querySelectorAll('[data-theme-pick]').forEach((el) => {
    const on = el.dataset.themePick === theme;
    el.setAttribute(el.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-current', String(on));
  });
  const dots = [...document.querySelectorAll('.dot')];
  const active = dots.find((d) => d.dataset.themePick === theme) ?? dots[0];
  dots.forEach((d) => { d.tabIndex = d === active ? 0 : -1; });
}

function themeDots() {
  const box = document.getElementById('theme-dots');
  THEMES.forEach((theme) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.setAttribute('role', 'radio');
    dot.setAttribute('aria-label', theme);
    dot.title = theme;
    dot.dataset.tkTheme = theme;
    dot.dataset.themePick = theme;
    dot.addEventListener('click', () => setTheme(root.dataset.tkTheme === theme ? null : theme));
    box.appendChild(dot);
  });
  box.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    const dots = [...box.children];
    const at = dots.indexOf(document.activeElement);
    if (!step || at < 0) return;
    e.preventDefault();
    const next = dots[(at + step + dots.length) % dots.length];
    setTheme(next.dataset.themePick);
    next.focus();
  });
}

function themeTiles() {
  const grid = document.getElementById('theme-grid');
  grid.querySelectorAll('[data-theme-pick]').forEach((tile) => {
    tile.addEventListener('click', () => setTheme(tile.dataset.themePick));
  });
}

function motionSwitch() {
  const button = document.getElementById('motion');
  const sync = () => button.setAttribute('aria-pressed', String(root.hasAttribute('data-tk-static')));
  button.addEventListener('click', () => {
    const still = !root.hasAttribute('data-tk-static');
    root.toggleAttribute('data-tk-static', still);
    save({ still });
    sync();
    if (!still) play();
  });
  sync();
}

function installLines() {
  const base = new URL('.', location.href).href;
  const css = `<link rel="stylesheet" href="${base}tick.css">`;
  const js = `<script type="module" src="${base}tick.js"></script>`;
  document.getElementById('install-line').textContent = css;
  document.getElementById('use-css').textContent = css;
  document.getElementById('use-js').textContent = js;
  document.querySelectorAll('[data-copy-from]').forEach((button) => {
    const idle = button.textContent;
    button.addEventListener('click', () => copy(document.getElementById(button.dataset.copyFrom).textContent, button, idle));
  });
}

function playOnArrival() {
  if (root.hasAttribute('data-tk-static') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const finite = (a) => a.effect?.getComputedTiming().iterations !== Infinity;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.getAnimations({ subtree: true }).filter(finite).forEach((a) => a.play());
      io.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.demo').forEach((demo) => {
    if (demo.getBoundingClientRect().top < innerHeight) return;
    demo.getAnimations({ subtree: true }).filter(finite).forEach((a) => { a.pause(); a.currentTime = 0; });
    io.observe(demo);
  });
  addEventListener('beforeprint', () => {
    document.getAnimations().filter((a) => a.playState === 'paused' && finite(a)).forEach((a) => a.finish());
  });
}

demoBars();
themeDots();
themeTiles();
setTheme(saved().theme ?? null);
motionSwitch();
installLines();
init();
playOnArrival();
