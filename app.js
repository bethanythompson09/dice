const MIN_DICE = 1;
const MAX_DICE = 6;

const PALETTE = [
  { name: "Purple", hex: "#6C2A93", pip: "#ffffff" },
  { name: "Yellow", hex: "#fed400", pip: "#1a1a1a" },
  { name: "Red",    hex: "#ff3737", pip: "#ffffff" },
  { name: "Blue",   hex: "#006cbf", pip: "#ffffff" },
  { name: "Green",  hex: "#3ea300", pip: "#ffffff" },
  { name: "Black",  hex: "#2b2b2b", pip: "#ffffff" },
  { name: "White",  hex: "#f5f5f5", pip: "#1a1a1a" },
];

const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
};

let dice = [];
let selectedIndex = 0;
let settingsOpen = false;

function randomFace() {
  return 1 + Math.floor(Math.random() * 6);
}

function createDie(colorIndex) {
  return { value: randomFace(), colorIndex };
}

function setDiceCount(count) {
  count = Math.max(MIN_DICE, Math.min(MAX_DICE, count));
  if (count > dice.length) {
    while (dice.length < count) {
      dice.push(createDie(dice.length % PALETTE.length));
    }
  } else {
    dice.length = count;
  }
  if (selectedIndex > count - 1) selectedIndex = count - 1;

  document.getElementById("count-value").textContent = String(count);
  document.getElementById("count-down").disabled = count <= MIN_DICE;
  document.getElementById("count-up").disabled = count >= MAX_DICE;
  renderTray();
  renderSwatchesPanel();
}

function pipSvg(value, colorIndex) {
  const color = PALETTE[colorIndex];
  const pips = PIP_LAYOUTS[value]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${color.pip}"/>`)
    .join("");
  return `
    <svg class="die-face" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="18" fill="${color.hex}" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
      ${pips}
    </svg>`;
}

function renderTray() {
  const tray = document.getElementById("dice-tray");
  tray.innerHTML = dice.map((die, index) => `
    <div class="die${index === selectedIndex ? " selected" : ""}" data-index="${index}">
      <div class="die-face-wrap">${pipSvg(die.value, die.colorIndex)}</div>
    </div>
  `).join("");
}

function renderSwatchesPanel() {
  const panel = document.getElementById("swatches-panel");
  const selectedDie = dice[selectedIndex];
  panel.innerHTML = PALETTE.map((c, i) => `
    <button class="swatch${selectedDie && i === selectedDie.colorIndex ? " selected" : ""}"
      style="background:${c.hex}"
      data-color-index="${i}"
      aria-label="${c.name}"></button>
  `).join("");
}

function rollAll() {
  const dieEls = document.querySelectorAll(".die");
  dieEls.forEach((el) => el.classList.add("rolling"));

  const flickerMs = 110;
  const durationMs = 1000;
  const flickerInterval = setInterval(() => {
    dice.forEach((die) => { die.value = randomFace(); });
    dieEls.forEach((el, i) => {
      el.querySelector(".die-face-wrap").innerHTML = pipSvg(dice[i].value, dice[i].colorIndex);
    });
  }, flickerMs);

  setTimeout(() => {
    clearInterval(flickerInterval);
    dice.forEach((die) => { die.value = randomFace(); });
    renderTray();
  }, durationMs);
}

function setSettingsOpen(open) {
  settingsOpen = open;
  document.getElementById("settings-panel").classList.toggle("open", open);
  document.getElementById("settings-panel").setAttribute("aria-hidden", String(!open));
  document.getElementById("settings-toggle").setAttribute("aria-expanded", String(open));
}

document.getElementById("settings-toggle").addEventListener("click", () => setSettingsOpen(!settingsOpen));
document.getElementById("count-up").addEventListener("click", () => setDiceCount(dice.length + 1));
document.getElementById("count-down").addEventListener("click", () => setDiceCount(dice.length - 1));
document.getElementById("roll-btn").addEventListener("click", rollAll);

document.getElementById("dice-tray").addEventListener("click", (e) => {
  const die = e.target.closest(".die");
  if (!die) return;
  selectedIndex = Number(die.dataset.index);
  renderTray();
  renderSwatchesPanel();
});

document.getElementById("swatches-panel").addEventListener("click", (e) => {
  const swatch = e.target.closest(".swatch");
  if (!swatch) return;
  dice[selectedIndex].colorIndex = Number(swatch.dataset.colorIndex);
  renderTray();
  renderSwatchesPanel();
});

setDiceCount(2);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
