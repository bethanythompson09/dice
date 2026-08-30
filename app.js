const MIN_DICE = 1;
const MAX_DICE = 6;

const PALETTE = [
  { name: "White",  hex: "#f5f5f5", pip: "#1a1a1a" },
  { name: "Black",  hex: "#000000", pip: "#ffffff" },
  { name: "Red",    hex: "#ff3737", pip: "#ffffff" },
  { name: "Yellow", hex: "#fed400", pip: "#1a1a1a" },
  { name: "Green",  hex: "#3ea300", pip: "#ffffff" },
  { name: "Blue",   hex: "#006cbf", pip: "#ffffff" },
  { name: "Purple", hex: "#6C2A93", pip: "#ffffff" },
];

const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
};

const CUSTOM_SETS = [
  { id: "my-city", name: "My City", diceCount: 3 },
  { id: "lost-cities", name: "Lost Cities", diceCount: 6 },
  { id: "extra", name: "Extra", diceCount: 5, colors: [0, 0, 0, 0, 0] },
  { id: "quixx", name: "Quixx", diceCount: 6, colors: [0, 0, 2, 3, 4, 5] },
];

const LOST_CITIES_SYMBOLS = {
  1: { color: "#006cbf", shape: (c) => `<rect x="26" y="42" width="48" height="16" rx="4" fill="${c}"/><rect x="42" y="26" width="16" height="48" rx="4" fill="${c}"/>` },
  2: { color: "#3ea300", shape: (c) => `<path d="M50,22 L78,74 L22,74 Z" fill="${c}"/>` },
  3: { color: "#ff6a00", shape: (c) => `<circle cx="50" cy="50" r="27" fill="${c}"/>` },
  4: { color: "#fed400", shape: (c) => `<rect x="25" y="25" width="50" height="50" rx="4" fill="${c}"/>` },
  5: { color: "#6C2A93", shape: (c) => `<path d="M50,18 L79,68 L21,68 Z M50,82 L21,32 L79,32 Z" fill="${c}"/>` },
  6: { color: "#ff3737", shape: (c) => `<path d="M50,78 C20,55 8,35 22,22 C32,12 46,16 50,28 C54,16 68,12 78,22 C92,35 80,55 50,78 Z" fill="${c}"/>` },
};

const DIE_TYPES = [
  { sides: 6, name: "D6" },
  { sides: 10, name: "D10" },
];

function cityFacePaths(dieNum) {
  return [1, 2, 3, 4, 5, 6].map((face) => `icons/custom/my-city/${dieNum}-${face}.png`);
}

const CUSTOM_FACES = {
  "my-city": {
    0: cityFacePaths(1),
    1: cityFacePaths(2),
    2: cityFacePaths(3),
  },
};

const CUSTOM_FACE_ROTATION = {
  "my-city": { 0: "cw", 1: "ccw" },
};

function rotationClassFor(die) {
  const rot = die.custom && CUSTOM_FACE_ROTATION[die.setId] && CUSTOM_FACE_ROTATION[die.setId][die.dieIndexInSet];
  return rot ? ` rotate-${rot}` : "";
}

let dice = [];
let selectedIndex = 0;
let settingsOpen = false;
let activeCustomSet = null;
let savedStandardDice = null;
let savedStandardSelectedIndex = 0;
let savedDiceSides = 6;
let diceSides = 6;

function randomFace(sides = diceSides) {
  return 1 + Math.floor(Math.random() * sides);
}

function createDie(colorIndex) {
  return { value: randomFace(), colorIndex };
}

function customDieSides(setId, dieIndexInSet) {
  if (setId === "lost-cities") return dieIndexInSet < 3 ? 10 : 6;
  return 6;
}

function sidesForDie(die) {
  return die.custom ? customDieSides(die.setId, die.dieIndexInSet) : diceSides;
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

  renderTray();
  renderSwatchesPanel();
  refreshCountControls();
  layoutDice();
}

function refreshCountControls() {
  const customActive = activeCustomSet !== null;
  document.getElementById("count-value").textContent = String(dice.length);
  document.getElementById("count-down").disabled = customActive || dice.length <= MIN_DICE;
  document.getElementById("count-up").disabled = customActive || dice.length >= MAX_DICE;
}

function numeralLabel(value, sides) {
  return sides === 10 && value === 10 ? "0" : String(value);
}

function pipSvg(value, colorIndex) {
  const color = PALETTE[colorIndex];
  const face = diceSides === 6
    ? PIP_LAYOUTS[value].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${color.pip}"/>`).join("")
    : `<text x="50" y="66" text-anchor="middle" font-size="46" font-weight="700" font-family="sans-serif" fill="${color.pip}">${numeralLabel(value, diceSides)}</text>`;
  return `
    <svg class="die-face" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="18" fill="${color.hex}" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
      ${face}
    </svg>`;
}

function customPlaceholderSvg() {
  return `
    <svg class="die-face" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="18" fill="#4a4a4a" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-dasharray="7 6"/>
      <text x="50" y="64" text-anchor="middle" font-size="42" font-family="sans-serif" fill="rgba(255,255,255,0.4)">?</text>
    </svg>`;
}

function whiteNumeralSvg(value) {
  return `
    <svg class="die-face" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="18" fill="#f5f5f5" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
      <text x="50" y="66" text-anchor="middle" font-size="46" font-weight="700" font-family="sans-serif" fill="#1a1a1a">${numeralLabel(value, 10)}</text>
    </svg>`;
}

function symbolDieSvg(value) {
  const symbol = LOST_CITIES_SYMBOLS[value];
  return `
    <svg class="die-face" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="18" fill="#f5f5f5" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
      ${symbol.shape(symbol.color)}
    </svg>`;
}

function faceSvgFor(die) {
  if (die.custom) {
    if (die.setId === "lost-cities") {
      return die.dieIndexInSet < 3 ? whiteNumeralSvg(die.value) : symbolDieSvg(die.value);
    }
    const dieFaces = CUSTOM_FACES[die.setId] && CUSTOM_FACES[die.setId][die.dieIndexInSet];
    return dieFaces
      ? `<img class="die-face" src="${dieFaces[die.value - 1]}" alt="" draggable="false">`
      : customPlaceholderSvg();
  }
  return pipSvg(die.value, die.colorIndex);
}

function layoutChrome() {
  const header = document.querySelector(".header");
  const rollBtn = document.getElementById("roll-btn");
  const headerHeight = header.getBoundingClientRect().height;
  const footerVisible = getComputedStyle(rollBtn).display !== "none";
  const footerHeight = footerVisible ? rollBtn.getBoundingClientRect().height + 16 : 12;
  document.documentElement.style.setProperty("--header-h", `${headerHeight}px`);
  document.documentElement.style.setProperty("--footer-h", `${footerHeight}px`);
}

function layoutDice() {
  layoutChrome();
  const tray = document.getElementById("dice-tray");
  const count = dice.length;
  const maxCols = activeCustomSet === "lost-cities" ? 3 : (settingsOpen ? 4 : 2);
  const cols = Math.max(1, Math.min(count, maxCols));
  const rows = Math.ceil(count / cols);
  const gap = 14;

  const availableWidth = tray.clientWidth;
  const availableHeight = tray.clientHeight;

  const sizeFromWidth = (availableWidth - (cols - 1) * gap) / cols;
  const sizeFromHeight = (availableHeight - (rows - 1) * gap) / rows;
  const size = Math.max(40, Math.min(240, Math.floor(Math.min(sizeFromWidth, sizeFromHeight))));

  document.documentElement.style.setProperty("--die-size", `${size}px`);
  tray.style.gap = `${gap}px`;
}

function renderTray() {
  const tray = document.getElementById("dice-tray");
  tray.innerHTML = dice.map((die, index) => `
    <div class="die${settingsOpen && !activeCustomSet && index === selectedIndex ? " selected" : ""}" data-index="${index}">
      <div class="die-face-wrap${rotationClassFor(die)}">${faceSvgFor(die)}</div>
    </div>
  `).join("");
}

function renderSwatchesPanel() {
  const panel = document.getElementById("swatches-panel");
  const customActive = activeCustomSet !== null;
  const selectedDie = dice[selectedIndex];
  panel.innerHTML = PALETTE.map((c, i) => `
    <button class="swatch${!customActive && selectedDie && i === selectedDie.colorIndex ? " selected" : ""}"
      style="background:${c.hex}"
      data-color-index="${i}"
      aria-label="${c.name}"></button>
  `).join("");
}

function renderCustomSection() {
  const container = document.getElementById("custom-options");
  container.innerHTML = CUSTOM_SETS.map((set) => `
    <button class="custom-btn${activeCustomSet === set.id ? " selected" : ""}"
      data-set-id="${set.id}">${set.name}</button>
  `).join("");
}

function renderTypeSection() {
  const container = document.getElementById("type-options");
  container.innerHTML = DIE_TYPES.map((t) => `
    <button class="custom-btn${diceSides === t.sides ? " selected" : ""}"
      data-sides="${t.sides}">${t.name}</button>
  `).join("");
}

function exitCustomSet(colorIndex) {
  activeCustomSet = null;
  dice = [createDie(colorIndex)];
  selectedIndex = 0;
  renderCustomSection();
}

function setDiceSides(sides) {
  diceSides = sides;
  if (activeCustomSet) {
    exitCustomSet(0);
  } else {
    dice.forEach((die) => { die.value = randomFace(); });
  }
  renderTray();
  renderSwatchesPanel();
  renderTypeSection();
  refreshCountControls();
  layoutDice();
}

function toggleCustomSet(setId) {
  if (activeCustomSet === setId) {
    activeCustomSet = null;
    dice = savedStandardDice;
    selectedIndex = Math.min(savedStandardSelectedIndex, dice.length - 1);
    diceSides = savedDiceSides;
  } else {
    const set = CUSTOM_SETS.find((s) => s.id === setId);
    if (activeCustomSet === null) {
      savedStandardDice = dice;
      savedStandardSelectedIndex = selectedIndex;
      savedDiceSides = diceSides;
    }
    activeCustomSet = setId;
    if (set.colors) {
      diceSides = 6;
      dice = set.colors.map((colorIndex) => createDie(colorIndex));
    } else {
      dice = Array.from({ length: set.diceCount }, (_, i) => ({
        custom: true,
        setId,
        dieIndexInSet: i,
        value: randomFace(customDieSides(setId, i)),
      }));
    }
    selectedIndex = 0;
  }
  renderTray();
  renderSwatchesPanel();
  renderCustomSection();
  renderTypeSection();
  refreshCountControls();
  layoutDice();
}

function rollAll() {
  const dieEls = document.querySelectorAll(".die");
  dieEls.forEach((el) => el.classList.add("rolling"));

  const flickerMs = 110;
  const durationMs = 1000;
  const flickerInterval = setInterval(() => {
    dice.forEach((die) => { die.value = randomFace(sidesForDie(die)); });
    dieEls.forEach((el, i) => {
      el.querySelector(".die-face-wrap").innerHTML = faceSvgFor(dice[i]);
    });
  }, flickerMs);

  setTimeout(() => {
    clearInterval(flickerInterval);
    dice.forEach((die) => { die.value = randomFace(sidesForDie(die)); });
    renderTray();
  }, durationMs);
}

function setSettingsOpen(open) {
  settingsOpen = open;
  document.getElementById("settings-panel").classList.toggle("open", open);
  document.getElementById("settings-panel").setAttribute("aria-hidden", String(!open));
  document.getElementById("settings-toggle").setAttribute("aria-expanded", String(open));
  document.getElementById("roll-btn").style.display = open ? "none" : "";
  renderTray();
  layoutDice();
}

document.getElementById("settings-toggle").addEventListener("click", () => setSettingsOpen(!settingsOpen));

document.getElementById("settings-panel").addEventListener("transitionend", (e) => {
  if (e.propertyName === "grid-template-rows") layoutDice();
});

document.addEventListener("click", (e) => {
  if (!settingsOpen) return;
  if (e.target.closest("#settings-panel")) return;
  if (e.target.closest("#settings-toggle")) return;
  if (e.target.closest(".die")) return;
  setSettingsOpen(false);
}, true);
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
  const colorIndex = Number(swatch.dataset.colorIndex);
  if (activeCustomSet) {
    exitCustomSet(colorIndex);
  } else {
    dice[selectedIndex].colorIndex = colorIndex;
  }
  renderTray();
  renderSwatchesPanel();
  refreshCountControls();
  layoutDice();
});

document.getElementById("custom-options").addEventListener("click", (e) => {
  const btn = e.target.closest(".custom-btn");
  if (!btn) return;
  toggleCustomSet(btn.dataset.setId);
});

document.getElementById("type-options").addEventListener("click", (e) => {
  const btn = e.target.closest(".custom-btn");
  if (!btn) return;
  setDiceSides(Number(btn.dataset.sides));
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layoutDice, 100);
});

renderCustomSection();
renderTypeSection();
setDiceCount(2);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
